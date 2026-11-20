import random
import string
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.complaint import Complaint

def generate_ticket_id(db: Session) -> str:
    """
    Generates a unique, collision-resistant ticket ID in the format:
    M1-YYYY-XXXX (e.g., M1-2026-K9F2)
    Checks the database to guarantee uniqueness.
    """
    current_year = datetime.utcnow().year
    alphabet = string.ascii_uppercase + string.digits
    # Remove visually ambiguous characters (0, O, 1, I)
    clean_alphabet = [c for c in alphabet if c not in ("0", "O", "1", "I")]

    for _ in range(100): # max 100 collision attempts
        suffix = "".join(random.choices(clean_alphabet, k=4))
        candidate_id = f"M1-{current_year}-{suffix}"
        exists = db.query(Complaint.id).filter(Complaint.ticket_id == candidate_id).first()
        if not exists:
            return candidate_id

    # Fallback with timestamp microsecond
    micro = datetime.utcnow().strftime("%f")[:4]
    return f"M1-{current_year}-{micro}"
