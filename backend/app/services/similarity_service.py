import re
import math
from collections import Counter
from typing import Optional, Tuple, List
from sqlalchemy.orm import Session
from app.models.complaint import Complaint
from app.models.cluster import ComplaintCluster
from app.models.complaint import ComplaintLog
from app.config import settings

# Stopwords in English and Hinglish to ignore during similarity calculation
STOPWORDS = {
    "hai", "h", "bhi", "ki", "ka", "ke", "ko", "me", "mein", "pe", "se", "aur", "or",
    "par", "tha", "thi", "the", "ho", "raha", "rahi", "rahe", "gaya", "gayi", "karo",
    "karein", "theek", "hua", "please", "plz", "sir", "madam", "the", "a", "an", "is",
    "in", "at", "on", "to", "for", "of", "and", "or", "it", "this", "that", "very", "bhai"
}

def tokenize(text: str) -> List[str]:
    """Tokenize and remove common stopwords."""
    words = re.findall(r"\b\w+\b", text.lower())
    return [w for w in words if w not in STOPWORDS and len(w) > 2]

def compute_cosine_similarity(text1: str, text2: str) -> float:
    """Computes cosine similarity between two texts based on word frequency."""
    tokens1 = tokenize(text1)
    tokens2 = tokenize(text2)

    if not tokens1 or not tokens2:
        return 0.0

    vec1 = Counter(tokens1)
    vec2 = Counter(tokens2)

    intersection = set(vec1.keys()) & set(vec2.keys())
    numerator = sum(vec1[x] * vec2[x] for x in intersection)

    sum1 = sum(x**2 for x in vec1.values())
    sum2 = sum(x**2 for x in vec2.values())
    denominator = math.sqrt(sum1) * math.sqrt(sum2)

    if not denominator:
        return 0.0

    return round(float(numerator) / denominator, 3)


class SimilarityService:
    def __init__(self):
        self.threshold = settings.SIMILARITY_THRESHOLD

    def find_or_create_cluster(self, db: Session, new_complaint: Complaint) -> Tuple[Optional[int], Optional[float]]:
        """
        Scans open complaints in the same department (and building if present).
        If similarity > threshold, groups them into a cluster.
        Returns (cluster_id, similarity_score).
        """
        # Look for open complaints in the same department
        query = db.query(Complaint).filter(
            Complaint.id != new_complaint.id,
            Complaint.department == new_complaint.department,
            Complaint.status.in_(["Submitted", "In Review", "In Progress"])
        )

        # If building is known, prioritize matching the same building
        if new_complaint.building:
            building_matches = query.filter(Complaint.building == new_complaint.building).all()
            candidates = building_matches if building_matches else query.all()
        else:
            candidates = query.all()

        best_match: Optional[Complaint] = None
        highest_score: float = 0.0

        for candidate in candidates:
            score = compute_cosine_similarity(new_complaint.raw_text, candidate.raw_text)
            
            # Boost score if both specify the exact same building/floor
            if new_complaint.building and candidate.building == new_complaint.building:
                score += 0.15
            if new_complaint.floor and candidate.floor == new_complaint.floor:
                score += 0.10

            score = min(1.0, score)

            if score > highest_score:
                highest_score = score
                best_match = candidate

        # Check against threshold
        if highest_score >= self.threshold and best_match:
            # If the matching complaint is already clustered, join it
            if best_match.cluster_id:
                cluster_id = best_match.cluster_id
            else:
                # Create a new master cluster
                title = f"{new_complaint.department} Issue: {new_complaint.building or 'Campus'}"
                new_cluster = ComplaintCluster(
                    cluster_title=title,
                    department_code=new_complaint.department,
                    building_name=new_complaint.building,
                    status="Open",
                    summary=f"Group of similar reports regarding {new_complaint.department} at {new_complaint.building or 'Campus'}."
                )
                db.add(new_cluster)
                db.flush()

                # Attach the existing best match to this new cluster
                best_match.cluster_id = new_cluster.id
                best_match.similarity_score_to_cluster = highest_score
                db.add(ComplaintLog(
                    complaint_id=best_match.id,
                    action="Cluster Grouping",
                    performed_by="AI Similarity Engine",
                    note=f"Grouped into Cluster #{new_cluster.id} with similar complaint {new_complaint.ticket_id}"
                ))
                cluster_id = new_cluster.id

            return cluster_id, highest_score

        return None, None

similarity_service = SimilarityService()
