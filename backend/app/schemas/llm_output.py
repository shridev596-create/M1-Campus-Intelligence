from typing import Optional
from pydantic import BaseModel, Field

class LLMExtractionResult(BaseModel):
    detected_language: str = Field(description="Language: Hinglish, Hindi, or English", default="Hinglish")
    department: str = Field(description="Department: Plumbing, Electrical, Wi-Fi, Mess, Academic, or Other", default="Other")
    building: Optional[str] = Field(description="Extracted campus building/hostel", default=None)
    floor: Optional[str] = Field(description="Extracted floor e.g. 1st Floor, Ground Floor", default=None)
    specific_location: Optional[str] = Field(description="Specific room, wing, or spot details", default=None)
    duration: Optional[str] = Field(description="Duration mentioned, e.g. 2 days, since morning, 1 week", default=None)
    urgency: str = Field(description="Urgency level: Low, Medium, High, or Critical", default="Medium")
    english_summary: str = Field(description="Clean, normalized English summary of the issue", default="")
    confidence_score: float = Field(description="Confidence between 0.0 and 1.0", default=0.85)
    confidence_reason: Optional[str] = Field(description="Explanation for classification and confidence", default=None)
    needs_human_review: bool = Field(description="Whether confidence < 0.75 or ambiguous", default=False)
