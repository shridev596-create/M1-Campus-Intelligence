from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.complaint import Complaint, ComplaintLog
from app.models.location import CampusLocation
from app.schemas.complaint import ComplaintCreate, ComplaintResponse
from app.schemas.llm_output import LLMExtractionResult
from app.services.llm_service import llm_service
from app.services.ticket_service import generate_ticket_id
from app.services.similarity_service import similarity_service

router = APIRouter(prefix="/api/complaints", tags=["Complaints"])

@router.post("/preview", response_model=LLMExtractionResult)
def preview_complaint_analysis(payload: ComplaintCreate):
    """
    Real-time preview of AI classification & entity extraction
    before the student finalizes submission.
    """
    if len(payload.raw_text.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint description must be at least 5 characters long."
        )
    return llm_service.analyze_complaint(payload.raw_text)


@router.post("/submit", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
def submit_complaint(payload: ComplaintCreate, db: Session = Depends(get_db)):
    """
    Submits a student complaint in Hinglish, Hindi, or English.
    Extracts entities, assigns department, clusters duplicates, and generates a unique ticket.
    """
    raw_text = payload.raw_text.strip()
    if len(raw_text) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complaint description is too short. Please provide more details."
        )

    # 1. AI Analysis & Extraction
    ai_result = llm_service.analyze_complaint(raw_text)

    # 2. Match Location entity
    location_id = None
    if ai_result.building:
        loc = db.query(CampusLocation).filter(
            CampusLocation.name.ilike(f"%{ai_result.building}%")
        ).first()
        if loc:
            location_id = loc.id

    # 3. Generate unique ticket ID
    ticket_id = generate_ticket_id(db)

    # 4. Create Complaint record
    complaint = Complaint(
        ticket_id=ticket_id,
        raw_text=raw_text,
        detected_language=ai_result.detected_language,
        english_translation=ai_result.english_summary,
        department=ai_result.department,
        building=ai_result.building,
        floor=ai_result.floor,
        specific_location=ai_result.specific_location,
        duration=ai_result.duration,
        urgency=ai_result.urgency,
        confidence_score=ai_result.confidence_score,
        confidence_reason=ai_result.confidence_reason,
        needs_human_review=ai_result.needs_human_review,
        status="In Review" if ai_result.needs_human_review else "Submitted",
        location_id=location_id,
        student_name=payload.student_name,
        student_email=payload.student_email,
        student_phone=payload.student_phone,
        preferred_time_slot=payload.preferred_time_slot
    )
    db.add(complaint)
    db.flush()

    # 5. Add initial audit log
    db.add(ComplaintLog(
        complaint_id=complaint.id,
        action="Ticket Created",
        performed_by="Student Portal",
        note=f"Submitted in {ai_result.detected_language}. Classified as {ai_result.department} (Confidence: {int(ai_result.confidence_score * 100)}%)."
    ))

    # 6. Check for Similar Complaints and Auto-grouping
    cluster_id, similarity_score = similarity_service.find_or_create_cluster(db, complaint)
    if cluster_id:
        complaint.cluster_id = cluster_id
        complaint.similarity_score_to_cluster = similarity_score
        db.add(ComplaintLog(
            complaint_id=complaint.id,
            action="Cluster Linked",
            performed_by="AI Similarity Engine",
            note=f"Automatically linked to Cluster #{cluster_id} (Similarity: {int(similarity_score * 100)}%)."
        ))

    db.commit()
    db.refresh(complaint)
    return complaint


@router.get("/track/{ticket_id}", response_model=ComplaintResponse)
def track_complaint(ticket_id: str, db: Session = Depends(get_db)):
    """
    Public ticket tracking endpoint for students.
    """
    cleaned_ticket_id = ticket_id.strip().upper()
    complaint = db.query(Complaint).filter(Complaint.ticket_id == cleaned_ticket_id).first()
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket '{cleaned_ticket_id}' not found. Please check the ticket number."
        )
    return complaint
