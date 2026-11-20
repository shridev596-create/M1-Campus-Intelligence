import sys
from pathlib import Path
from datetime import datetime, timedelta

# Add backend to python path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal, engine, Base
from app.models.department import Department
from app.models.location import CampusLocation
from app.models.complaint import Complaint, ComplaintLog
from app.models.cluster import ComplaintCluster
from app.utils.constants import DEFAULT_DEPARTMENTS, DEFAULT_CAMPUS_LOCATIONS
from app.services.llm_service import llm_service
from app.services.ticket_service import generate_ticket_id

SAMPLE_COMPLAINTS = [
    {
        "text": "Hostel 3 2nd floor washroom me paani nahi aa raha 2 din se, taps are completely dry please fix urgently.",
        "student_name": "Aarav Sharma",
        "student_email": "aarav.s@campus.edu",
        "days_ago": 2,
        "status": "In Progress"
    },
    {
        "text": "BH-3 2nd floor wing B taps se bilkul paani nahi aa raha, subah se brush bhi nahi kar paye.",
        "student_name": "Rohan Verma",
        "student_email": "rohan.v@campus.edu",
        "days_ago": 1,
        "status": "In Progress"
    },
    {
        "text": "Library 2nd floor pe AC cooling nahi kar raha aur continuous ajeeb buzzing sound aa rahi hai.",
        "student_name": "Priya Nair",
        "student_email": "priya.n@campus.edu",
        "days_ago": 3,
        "status": "Submitted"
    },
    {
        "text": "Hostel 1 room 14 mein switchboard me current aa raha hai haath lagane par shock laga danger emergency!",
        "student_name": "Kabir Mehta",
        "student_email": "kabir.m@campus.edu",
        "days_ago": 0,
        "status": "Submitted"
    },
    {
        "text": "Central Mess 1 me aaj lunch daal me kida nikla aur roti bilkul kachi thi hygiene is very bad.",
        "student_name": "Ananya Joshi",
        "student_email": "ananya.j@campus.edu",
        "days_ago": 1,
        "status": "In Review"
    },
    {
        "text": "Academic Block A room 102 projector lamp is dead, professor slides nahi dikha pa rahe lecture cancel hone wala hai.",
        "student_name": "Devansh Gupta",
        "student_email": "devansh.g@campus.edu",
        "days_ago": 0,
        "status": "Submitted"
    },
    {
        "text": "Girls Hostel 4 Wi-Fi router red light blink kar raha hai connect hi nahi ho raha since morning.",
        "student_name": "Simran Kaur",
        "student_email": "simran.k@campus.edu",
        "days_ago": 1,
        "status": "Submitted"
    },
    {
        "text": "मेस 2 में रात का खाना बहुत ही ठंडा और बासी था, कई छात्रों का पेट खराब हुआ है।",
        "student_name": "Vikas Patel",
        "student_email": "vikas.p@campus.edu",
        "days_ago": 4,
        "status": "Resolved"
    },
    {
        "text": "Campus main gate ke paas stray dogs are chasing students at night, light bhi nahi hai waha.",
        "student_name": "Sneha Roy",
        "student_email": "sneha.r@campus.edu",
        "days_ago": 2,
        "status": "Submitted"
    },
    {
        "text": "Kuch samajh nahi aa raha college me sab kharab hai bas",
        "student_name": "Anonymous",
        "student_email": None,
        "days_ago": 0,
        "status": "In Review"
    }
]

def seed_database():
    """Initializes tables and seeds initial campus data."""
    print("Creating database tables if not exist...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Departments
        for dept_data in DEFAULT_DEPARTMENTS:
            existing = db.query(Department).filter(Department.code == dept_data["code"]).first()
            if not existing:
                dept = Department(
                    code=dept_data["code"],
                    name=dept_data["name"],
                    description=dept_data["description"],
                    contact_email=dept_data["contact_email"]
                )
                db.add(dept)
        db.commit()
        print("Default departments seeded.")

        # 2. Seed Campus Locations
        location_map = {}
        for loc_data in DEFAULT_CAMPUS_LOCATIONS:
            existing = db.query(CampusLocation).filter(CampusLocation.name == loc_data["name"]).first()
            if not existing:
                loc = CampusLocation(
                    name=loc_data["name"],
                    building_code=loc_data["building_code"],
                    zone=loc_data["zone"],
                    coord_x=loc_data["coord_x"],
                    coord_y=loc_data["coord_y"],
                    type=loc_data["type"]
                )
                db.add(loc)
                db.flush()
                location_map[loc.name] = loc.id
            else:
                location_map[existing.name] = existing.id
        db.commit()
        print("Campus locations seeded.")

        # 3. Sample complaint seeding DISABLED — only real student submissions shown
        # complaint_count = db.query(Complaint).count()
        # if complaint_count == 0:
        if False:
            
            # Create a sample cluster for Hostel 3 water issue
            sample_cluster = ComplaintCluster(
                cluster_title="Plumbing Issue: Hostel 3 (Girls)",
                department_code="Plumbing",
                building_name="Hostel 3 (Girls)",
                status="Investigating",
                summary="Multiple students reporting water supply disruption on 2nd floor of Hostel 3."
            )
            db.add(sample_cluster)
            db.flush()

            for i, item in enumerate(SAMPLE_COMPLAINTS):
                analysis = llm_service.analyze_complaint(item["text"])
                ticket_id = generate_ticket_id(db)
                created_time = datetime.utcnow() - timedelta(days=item["days_ago"], hours=i*2)

                # Match location_id
                loc_id = None
                if analysis.building and analysis.building in location_map:
                    loc_id = location_map[analysis.building]

                # Check if this complaint belongs to the sample cluster
                cluster_id = None
                sim_score = None
                if "Hostel 3" in (analysis.building or "") or "BH-3" in item["text"]:
                    cluster_id = sample_cluster.id
                    sim_score = 0.88

                resolved_time = created_time + timedelta(hours=18) if item["status"] == "Resolved" else None

                complaint = Complaint(
                    ticket_id=ticket_id,
                    raw_text=item["text"],
                    detected_language=analysis.detected_language,
                    english_translation=analysis.english_summary,
                    department=analysis.department,
                    building=analysis.building,
                    floor=analysis.floor,
                    specific_location=analysis.specific_location,
                    duration=analysis.duration,
                    urgency=analysis.urgency,
                    confidence_score=analysis.confidence_score,
                    confidence_reason=analysis.confidence_reason,
                    needs_human_review=analysis.needs_human_review,
                    status=item["status"],
                    location_id=loc_id,
                    cluster_id=cluster_id,
                    similarity_score_to_cluster=sim_score,
                    student_name=item["student_name"],
                    student_email=item["student_email"],
                    created_at=created_time,
                    updated_at=created_time,
                    resolved_at=resolved_time
                )
                db.add(complaint)
                db.flush()

                # Add audit log
                db.add(ComplaintLog(
                    complaint_id=complaint.id,
                    action="Ticket Created",
                    performed_by="Student Portal",
                    note="Initial complaint submitted and classified by AI router.",
                    timestamp=created_time
                ))

                if cluster_id:
                    db.add(ComplaintLog(
                        complaint_id=complaint.id,
                        action="Cluster Grouping",
                        performed_by="AI Similarity Engine",
                        note=f"Linked to Cluster #{cluster_id} due to high similarity with ongoing issue.",
                        timestamp=created_time + timedelta(minutes=1)
                    ))

            db.commit()
            print("10 Sample complaints and initial cluster successfully created.")

        print("Database seeding completed successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
