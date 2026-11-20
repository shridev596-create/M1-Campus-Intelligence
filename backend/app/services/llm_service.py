import re
import json
import logging
from typing import Optional, Tuple
from app.config import settings
from app.schemas.llm_output import LLMExtractionResult
from app.utils.constants import DepartmentCode, UrgencyLevel, LanguageDetected

logger = logging.getLogger(__name__)

# Heuristic vocabulary mapping for Hinglish/Hindi/English
DEPARTMENT_KEYWORDS = {
    DepartmentCode.PLUMBING.value: [
        "paani", "pani", "water", "tap", "nal", "leak", "leaking", "drain", "flush", "pipeline",
        "washroom", "toilet", "geyser leak", "sewage", "basin", "pipe", "tonti", "motor", "tanki",
        "टोंटी", "पानी", "नल", "लीक", "पाइप", "टॉयलेट"
    ],
    DepartmentCode.ELECTRICAL.value: [
        "light", "bijli", "fan", "pankha", "ac", "air conditioner", "switch", "switchboard",
        "current", "spark", "sparking", "short circuit", "socket", "power cut", "tube light",
        "bulb", "geyser", "wire", "voltage", "पंखा", "बिजली", "लाइट", "करंट", "स्पार्क"
    ],
    DepartmentCode.WIFI.value: [
        "wifi", "wi-fi", "internet", "net", "network", "router", "lan", "speed", "slow net",
        "login", "portal", "signal", "connect", "disconnection", "वाईफाई", "इंटरनेट", "नेटवर्क"
    ],
    DepartmentCode.MESS.value: [
        "mess", "khana", "food", "dinner", "lunch", "breakfast", "daal", "roti", "stale", "baasi",
        "hygiene", "insect", "cockroach", "caterpillar", "taste", "smell", "raw", "plate", "kitchen",
        "खाना", "मेस", "दाल", "रोटी", "सड़ा", "बासी"
    ],
    DepartmentCode.ACADEMIC.value: [
        "projector", "mic", "microphone", "speaker", "podium", "bench", "desk", "board", "marker",
        "classroom", "lecture hall", "audi", "auditorium", "lab", "computer lab", "ac block",
        "क्लासरूम", "प्रोजेक्टर", "माइक", "बेंच"
    ]
}

CAMPUS_BUILDING_PATTERNS = [
    (r"(hostel\s*1|bh\s*1|h\s*1|boys\s*hostel\s*1|हॉस्टल\s*1|होस्टल\s*1)", "Hostel 1 (Boys)"),
    (r"(hostel\s*2|bh\s*2|h\s*2|boys\s*hostel\s*2|हॉस्टल\s*2|होस्टल\s*2)", "Hostel 2 (Boys)"),
    (r"(hostel\s*3|gh\s*1|gh\s*3|h\s*3|girls\s*hostel\s*3|girls\s*hostel\s*1|हॉस्टल\s*3|होस्टल\s*3)", "Hostel 3 (Girls)"),
    (r"(hostel\s*4|gh\s*2|gh\s*4|h\s*4|girls\s*hostel\s*4|girls\s*hostel\s*2|हॉस्टल\s*4|होस्टल\s*4)", "Hostel 4 (Girls)"),
    (r"(library|central\s*library|reading\s*room|लाइब्रेरी|पुस्तकालय)", "Central Library"),
    (r"(academic\s*block\s*a|ab\s*a|block\s*a|एकेडमिक\s*ब्लॉक\s*ए|ब्लॉक\s*ए)", "Academic Block A"),
    (r"(academic\s*block\s*b|ab\s*b|block\s*b|एकेडमिक\s*ब्लॉक\s*बी|ब्लॉक\s*बी)", "Academic Block B"),
    (r"(mess\s*1|central\s*mess\s*1|north\s*mess|मेस\s*1|मैस\s*1)", "Central Mess 1"),
    (r"(mess\s*2|central\s*mess\s*2|south\s*mess|east\s*mess|मेस\s*2|मैस\s*2)", "Central Mess 2"),
    (r"(computer\s*centre|cc\s*lab|it\s*centre|कंप्यूटर)", "Computer Centre"),
    (r"(sports\s*complex|gym|ground|court|स्पोर्ट्स)", "Sports Complex"),
]

FLOOR_PATTERNS = [
    (r"(ground\s*floor|gf|floor\s*0)", "Ground Floor"),
    (r"(1st\s*floor|first\s*floor|floor\s*1)", "1st Floor"),
    (r"(2nd\s*floor|second\s*floor|floor\s*2)", "2nd Floor"),
    (r"(3rd\s*floor|third\s*floor|floor\s*3)", "3rd Floor"),
    (r"(4th\s*floor|fourth\s*floor|floor\s*4)", "4th Floor"),
]

DURATION_PATTERNS = [
    r"(\d+\s*(?:din|days?|ghante|hours?|weeks?|hafte|mahine|months?)\s*(?:se|ago)?)",
    r"(since\s*(?:yesterday|morning|last\s*night|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday))",
    r"(kal\s*se|subah\s*se|raat\s*se|aaj\s*se|parso\s*se)",
    r"(just\s*now|abhi\s*abhi|recently)"
]

URGENCY_KEYWORDS = {
    UrgencyLevel.CRITICAL.value: [
        "current", "spark", "sparking", "short circuit", "fire", "danger", "emergency", "aag",
        "khatra", "shock", "burst", "flood", "poison", "hospital"
    ],
    UrgencyLevel.HIGH.value: [
        "urgent", "urgently", "jaldi", "turant", "immediately", "asap", "not working at all",
        "completely broken", "unable to study", "exams", "2 days", "3 days", "severe"
    ],
    UrgencyLevel.LOW.value: [
        "minor", "thoda", "slow", "noise", "creaking", "whenever possible", "not urgent", "flicker"
    ]
}


class LLMService:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.confidence_threshold = settings.CONFIDENCE_THRESHOLD

    def analyze_complaint(self, text: str) -> LLMExtractionResult:
        """
        Analyzes a complaint using the configured provider (demo, gemini, or openai).
        Falls back smoothly to demo heuristic mode if external API is unreachable or unconfigured.
        """
        if self.provider == "gemini" and settings.GEMINI_API_KEY:
            try:
                return self._analyze_with_gemini(text)
            except Exception as e:
                logger.warning(f"Gemini API analysis failed: {e}. Falling back to demo mode.")

        if self.provider == "openai" and settings.OPENAI_API_KEY:
            try:
                return self._analyze_with_openai(text)
            except Exception as e:
                logger.warning(f"OpenAI API analysis failed: {e}. Falling back to demo mode.")

        # Default: high-precision rule-based Demo Engine
        return self._analyze_with_demo_engine(text)

    def _detect_language(self, text: str) -> str:
        # Check Devanagari Unicode range
        devanagari_count = len(re.findall(r"[\u0900-\u097F]", text))
        if devanagari_count > len(text) * 0.25:
            return LanguageDetected.HINDI.value

        hinglish_markers = [
            "hai", "ho", "raha", "rahi", "nahi", "nhi", "kaam", "bhai", "karo", "pe",
            "mein", "me", "se", "aur", "bahut", "bohot", "jaldi", "subah", "kal", "din",
            "karein", "theek", "hua", "gaya", "aaya", "paani", "khana", "dekh"
        ]
        tokens = re.findall(r"\b[a-zA-Z]+\b", text.lower())
        hinglish_matches = sum(1 for t in tokens if t in hinglish_markers)

        if hinglish_matches >= 1:
            return LanguageDetected.HINGLISH.value

        return LanguageDetected.ENGLISH.value

    def _analyze_with_demo_engine(self, text: str) -> LLMExtractionResult:
        """
        Pure Python, zero-API-key heuristic NLP classifier and extractor.
        Tuned specifically for campus complaints in Hinglish, Hindi, and English.
        """
        lower = text.lower()
        detected_lang = self._detect_language(text)

        # 1. Department scoring
        dept_scores = {dept: 0 for dept in DEPARTMENT_KEYWORDS.keys()}
        for dept, keywords in DEPARTMENT_KEYWORDS.items():
            for kw in keywords:
                if kw in lower:
                    dept_scores[dept] += 1

        top_dept = DepartmentCode.OTHER.value
        max_score = 0
        tie_count = 0

        for dept, score in dept_scores.items():
            if score > max_score:
                max_score = score
                top_dept = dept
                tie_count = 1
            elif score == max_score and score > 0:
                tie_count += 1

        # 2. Extract Building
        matched_building = None
        for pattern, b_name in CAMPUS_BUILDING_PATTERNS:
            if re.search(pattern, lower):
                matched_building = b_name
                break

        # 3. Extract Floor
        matched_floor = None
        for pattern, f_name in FLOOR_PATTERNS:
            if re.search(pattern, lower):
                matched_floor = f_name
                break

        # 4. Extract Specific Location (e.g. Room 204, Washroom 3)
        specific_loc_match = re.search(r"\b(room\s*(?:no\.?|number)?\s*\d+|washroom|corridor|wing\s*[a-zA-Z]|lab\s*\d+)\b", lower)
        specific_location = specific_loc_match.group(0).title() if specific_loc_match else None

        # 5. Extract Duration
        matched_duration = None
        for pattern in DURATION_PATTERNS:
            dur_match = re.search(pattern, lower)
            if dur_match:
                matched_duration = dur_match.group(0).strip()
                break

        # 6. Extract Urgency
        urgency = UrgencyLevel.MEDIUM.value
        for kw in URGENCY_KEYWORDS[UrgencyLevel.CRITICAL.value]:
            if kw in lower:
                urgency = UrgencyLevel.CRITICAL.value
                break
        if urgency != UrgencyLevel.CRITICAL.value:
            for kw in URGENCY_KEYWORDS[UrgencyLevel.HIGH.value]:
                if kw in lower:
                    urgency = UrgencyLevel.HIGH.value
                    break
        if urgency == UrgencyLevel.MEDIUM.value:
            for kw in URGENCY_KEYWORDS[UrgencyLevel.LOW.value]:
                if kw in lower:
                    urgency = UrgencyLevel.LOW.value
                    break

        # 7. Calculate Confidence & Triage Flag
        confidence = 0.50
        reason_parts = []

        if max_score >= 2:
            confidence += 0.35
            reason_parts.append(f"Strong department keyword match for {top_dept}")
        elif max_score == 1:
            confidence += 0.20
            reason_parts.append(f"Single keyword match for {top_dept}")
        else:
            confidence = 0.40
            reason_parts.append("No definitive department keywords detected")

        if matched_building:
            confidence += 0.10
            reason_parts.append(f"Identified campus location ({matched_building})")

        if tie_count > 1:
            confidence -= 0.15
            reason_parts.append("Multiple overlapping department categories detected")

        confidence = round(min(0.98, max(0.20, confidence)), 2)
        needs_review = (confidence < self.confidence_threshold) or (top_dept == DepartmentCode.OTHER.value)

        # 8. Synthesize English Summary
        loc_str = matched_building or specific_location or "Campus area"
        dur_str = f" for {matched_duration}" if matched_duration else ""
        english_summary = f"{top_dept} issue reported at {loc_str}{dur_str}. Complaint: {text[:90]}..."

        return LLMExtractionResult(
            detected_language=detected_lang,
            department=top_dept,
            building=matched_building,
            floor=matched_floor,
            specific_location=specific_location,
            duration=matched_duration,
            urgency=urgency,
            english_summary=english_summary,
            confidence_score=confidence,
            confidence_reason="; ".join(reason_parts),
            needs_human_review=needs_review
        )

    def _analyze_with_gemini(self, text: str) -> LLMExtractionResult:
        """Call Google Gemini API with JSON schema."""
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)

        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={"response_mime_type": "application/json"}
        )

        prompt = f"""
You are the AI triage engine for M1 Campus Intelligence.
Analyze the following student complaint (which may be in Hinglish, Hindi, or English).
Classify it strictly into one of these departments: Plumbing, Electrical, Wi-Fi, Mess, Academic, Other.
Extract building, floor, specific location, duration, and urgency (Low, Medium, High, Critical).
Calculate confidence_score (0.0 to 1.0). If confidence < 0.75, set needs_human_review to true.
Provide a clean, concise English summary of the issue.

Output JSON matching this exact structure:
{{
  "detected_language": "Hinglish" | "Hindi" | "English",
  "department": "Plumbing" | "Electrical" | "Wi-Fi" | "Mess" | "Academic" | "Other",
  "building": "string or null",
  "floor": "string or null",
  "specific_location": "string or null",
  "duration": "string or null",
  "urgency": "Low" | "Medium" | "High" | "Critical",
  "english_summary": "clean English summary",
  "confidence_score": 0.95,
  "confidence_reason": "explanation of score",
  "needs_human_review": false
}}

Complaint text:
\"\"\"{text}\"\"\"
"""
        response = model.generate_content(prompt)
        data = json.loads(response.text)
        return LLMExtractionResult(**data)

    def _analyze_with_openai(self, text: str) -> LLMExtractionResult:
        """Call OpenAI chat completions API with JSON mode."""
        import httpx
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-3.5-turbo",
            "response_format": {"type": "json_object"},
            "messages": [
                {
                    "role": "system",
                    "content": "You are the AI triage engine for M1 Campus Intelligence. Extract department (Plumbing, Electrical, Wi-Fi, Mess, Academic, Other), building, floor, location, duration, urgency, and confidence from student complaints in Hinglish/Hindi/English as JSON."
                },
                {"role": "user", "content": text}
            ]
        }
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            data = json.loads(content)
            return LLMExtractionResult(**data)

llm_service = LLMService()
