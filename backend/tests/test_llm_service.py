import pytest
from app.services.llm_service import llm_service
from app.utils.constants import DepartmentCode, UrgencyLevel, LanguageDetected

def test_hinglish_plumbing_extraction():
    complaint = "Hostel 3 2nd floor washroom me paani nahi aa raha 2 din se, taps are dry please fix urgently."
    result = llm_service.analyze_complaint(complaint)

    assert result.detected_language == LanguageDetected.HINGLISH.value
    assert result.department == DepartmentCode.PLUMBING.value
    assert result.building == "Hostel 3 (Girls)"
    assert result.floor == "2nd Floor"
    assert result.urgency in (UrgencyLevel.HIGH.value, UrgencyLevel.CRITICAL.value)
    assert result.confidence_score >= 0.70
    assert result.needs_human_review is False

def test_hindi_mess_extraction():
    complaint = "मेस 2 में रात का खाना बहुत ही ठंडा और बासी था, दाल में बदबू आ रही थी।"
    result = llm_service.analyze_complaint(complaint)

    assert result.detected_language == LanguageDetected.HINDI.value
    assert result.department == DepartmentCode.MESS.value
    assert result.building == "Central Mess 2"

def test_english_academic_extraction():
    complaint = "Academic Block A room 102 projector is dead since morning, lecture is disrupted."
    result = llm_service.analyze_complaint(complaint)

    assert result.detected_language == LanguageDetected.ENGLISH.value
    assert result.department == DepartmentCode.ACADEMIC.value
    assert result.building == "Academic Block A"
    assert "room 102" in (result.specific_location or "").lower()

def test_critical_electrical_hazard():
    complaint = "Hostel 1 room 14 mein switchboard me current aa raha hai shock laga danger emergency!"
    result = llm_service.analyze_complaint(complaint)

    assert result.department == DepartmentCode.ELECTRICAL.value
    assert result.urgency == UrgencyLevel.CRITICAL.value
    assert result.building == "Hostel 1 (Boys)"

def test_wifi_issue():
    complaint = "Girls Hostel 4 Wi-Fi router red light blink kar raha hai slow net not connecting."
    result = llm_service.analyze_complaint(complaint)

    assert result.department == DepartmentCode.WIFI.value
    assert result.building == "Hostel 4 (Girls)"

def test_vague_complaint_triggers_human_review():
    complaint = "College me sab kharab hai kuch samajh nahi aa raha"
    result = llm_service.analyze_complaint(complaint)

    # Low confidence or Other should flag human review
    assert result.needs_human_review is True
    assert result.confidence_score < 0.75
