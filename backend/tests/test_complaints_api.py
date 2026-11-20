import pytest
from fastapi import HTTPException
from app.database import SessionLocal, Base, engine
from app.schemas.complaint import ComplaintCreate
from app.routes.complaints import submit_complaint, track_complaint, preview_complaint_analysis

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_preview_analysis():
    payload = ComplaintCreate(raw_text="Library 2nd floor air conditioner is making loud noise and not cooling")
    result = preview_complaint_analysis(payload)
    assert result.department == "Electrical"
    assert result.building == "Central Library"
    assert result.floor == "2nd Floor"

def test_submit_complaint_success(db):
    payload = ComplaintCreate(
        raw_text="Hostel 2 washroom me nal se paani continuously tapak raha hai kal se",
        student_name="Test Student",
        student_email="test@campus.edu"
    )
    result = submit_complaint(payload, db=db)

    assert result.ticket_id.startswith("M1-")
    assert result.department == "Plumbing"
    assert result.building == "Hostel 2 (Boys)"
    assert result.status in ("Submitted", "In Review")
    assert len(result.logs) >= 1

def test_submit_complaint_empty_or_short_raises_error():
    with pytest.raises(Exception):
        ComplaintCreate(raw_text="hi")

def test_track_complaint_success(db):
    # Submit first
    payload = ComplaintCreate(
        raw_text="Academic Block B room 201 projector is broken please replace",
        student_name="Karan Singhania"
    )
    created = submit_complaint(payload, db=db)
    ticket_id = created.ticket_id

    # Track
    tracked = track_complaint(ticket_id, db=db)
    assert tracked.ticket_id == ticket_id
    assert tracked.department == "Academic"

def test_track_complaint_not_found(db):
    with pytest.raises(HTTPException) as exc_info:
        track_complaint("M1-9999-XXXX", db=db)
    assert exc_info.value.status_code == 404
