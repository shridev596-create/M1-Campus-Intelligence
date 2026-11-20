import pytest
from app.database import SessionLocal, Base, engine
from app.schemas.complaint import ComplaintCreate, ComplaintStatusUpdate, HumanTriageUpdate
from app.routes.complaints import submit_complaint
from app.routes.admin import (
    get_complaints,
    get_complaint_detail,
    update_complaint_status,
    human_triage_complaint,
    list_clusters,
    update_cluster_status,
    list_departments
)
from app.routes.analytics import get_campus_heatmap, get_analytics_overview

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_admin_list_complaints(db):
    complaints = get_complaints(db=db)
    assert isinstance(complaints, list)
    assert len(complaints) > 0

def test_admin_filter_by_department(db):
    items = get_complaints(department="Plumbing", db=db)
    assert isinstance(items, list)
    for item in items:
        assert item.department == "Plumbing"

def test_admin_update_status(db):
    # Fetch first complaint
    all_complaints = get_complaints(db=db)
    target = all_complaints[0]

    updated = update_complaint_status(
        ticket_id=target.ticket_id,
        payload=ComplaintStatusUpdate(status="In Progress", admin_notes="Plumbing staff assigned."),
        db=db
    )
    assert updated.status == "In Progress"
    assert "Plumbing staff" in (updated.admin_notes or "")

def test_admin_human_triage_override(db):
    # Submit an ambiguous complaint
    created = submit_complaint(
        payload=ComplaintCreate(raw_text="Kuch toh problem hai ground floor corridor me dekh lo"),
        db=db
    )

    # Human administrator reviews and overrides
    triage_payload = HumanTriageUpdate(
        department="Electrical",
        urgency="High",
        building="Hostel 1 (Boys)",
        floor="Ground Floor",
        specific_location="Corridor light fixture",
        notes="Verified by staff: loose wiring."
    )
    triaged = human_triage_complaint(ticket_id=created.ticket_id, payload=triage_payload, db=db)
    assert triaged.department == "Electrical"
    assert triaged.urgency == "High"
    assert triaged.needs_human_review is False

def test_analytics_heatmap(db):
    heatmap = get_campus_heatmap(db=db)
    assert len(heatmap.points) > 0
    assert hasattr(heatmap, "total_active_complaints")

def test_analytics_overview(db):
    overview = get_analytics_overview(db=db)
    assert overview.total_complaints > 0
    assert len(overview.department_stats) >= 6
    assert isinstance(overview.top_repeat_issues, list)
