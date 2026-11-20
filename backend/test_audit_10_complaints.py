import json
import httpx

BASE_URL = "http://127.0.0.1:8000"

TEST_COMPLAINTS = [
    {
        "id": 1,
        "name": "C1_Hinglish_Plumbing",
        "raw_text": "Hostel 2 ground floor washroom me geyser leak kar raha hai continuously paani beh raha hai floor pe",
        "student_name": "Karan Malhotra",
        "student_email": "karan.m@campus.edu",
        "expected_dept": "Plumbing",
        "expected_building": "Hostel 2 (Boys)",
        "expected_floor": "Ground Floor",
        "expected_urgency": "Medium"
    },
    {
        "id": 2,
        "name": "C2_Hinglish_Plumbing_Duplicate",
        "raw_text": "Hostel 2 ground floor washroom me geyser pipe se paani beh raha hai leak bahut tez hai",
        "student_name": "Siddharth Jain",
        "student_email": "sid.j@campus.edu",
        "expected_dept": "Plumbing",
        "expected_building": "Hostel 2 (Boys)",
        "expected_floor": "Ground Floor",
        "should_cluster_with": 1
    },
    {
        "id": 3,
        "name": "C3_Hindi_Mess",
        "raw_text": "मेस 1 में आज दोपहर की दाल में कीड़ा निकला और रोटी बहुत जली हुई थी सफाई का बिल्कुल ध्यान नहीं है",
        "student_name": "Aman Tiwari",
        "student_email": "aman.t@campus.edu",
        "expected_dept": "Mess",
        "expected_building": "Central Mess 1",
        "expected_lang": "Hindi"
    },
    {
        "id": 4,
        "name": "C4_English_Electrical_Critical",
        "raw_text": "Hostel 1 room 24 switchboard is throwing sparks with burning smell danger emergency shock hazard",
        "student_name": "Vikram Singh",
        "student_email": "vikram.s@campus.edu",
        "expected_dept": "Electrical",
        "expected_building": "Hostel 1 (Boys)",
        "expected_urgency": "Critical",
        "expected_lang": "English"
    },
    {
        "id": 5,
        "name": "C5_Hinglish_Wifi",
        "raw_text": "Computer Centre lab me slow net hai login portal open nahi ho raha subah se exam submission atki hai",
        "student_name": "Ritika Das",
        "student_email": "ritika.d@campus.edu",
        "expected_dept": "Wi-Fi",
        "expected_building": "Computer Centre",
        "expected_duration": "subah se"
    },
    {
        "id": 6,
        "name": "C6_English_Academic",
        "raw_text": "Academic Block B room 305 projector remote is missing and display is flickering for 2 days",
        "student_name": "Neha Sharma",
        "student_email": "neha.s@campus.edu",
        "expected_dept": "Academic",
        "expected_building": "Academic Block B",
        "expected_floor": "3rd Floor",
        "expected_duration": "2 days"
    },
    {
        "id": 7,
        "name": "C7_Hinglish_Electrical",
        "raw_text": "Central Library reading room me AC bilkul cooling nahi kar raha 3 ghante se pasine me baith ke padh rahe hain",
        "student_name": "Arjun Rao",
        "student_email": "arjun.r@campus.edu",
        "expected_dept": "Electrical",
        "expected_building": "Central Library",
        "expected_duration": "3 ghante se"
    },
    {
        "id": 8,
        "name": "C8_Hindi_Academic",
        "raw_text": "एकेडमिक ब्लॉक ए क्लासरूम में बेंच टूटी हुई है बैठने की जगह नहीं है",
        "student_name": "Suresh Yadav",
        "student_email": "suresh.y@campus.edu",
        "expected_dept": "Academic",
        "expected_building": "Academic Block A",
        "expected_lang": "Hindi"
    },
    {
        "id": 9,
        "name": "C9_Hinglish_Other_Security",
        "raw_text": "Sports complex ground ke paas raat me light band rehti hai aur street dogs ghoom rahe hain safety risk",
        "student_name": "Tanvi Joshi",
        "student_email": "tanvi.j@campus.edu",
        "expected_building": "Sports Complex"
    },
    {
        "id": 10,
        "name": "C10_Vague_Hinglish_Triage",
        "raw_text": "College me sab bekaar chal raha hai administration sunta hi nahi kuch theek karo",
        "student_name": "Anonymous",
        "student_email": None,
        "expected_needs_triage": True
    }
]

def run_audit():
    print("=== STARTING COMPLETE M1 AUDIT TEST SUITE ===")
    results = {}

    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # Step 0: Baseline checks
        base_overview = client.get("/api/analytics/overview").json()
        base_heatmap = client.get("/api/analytics/heatmap").json()
        base_total = base_overview["total_complaints"]
        base_open = base_overview["open_complaints"]
        base_clusters = base_overview["active_clusters_count"]
        print(f"[Baseline] Total Complaints: {base_total}, Open: {base_open}, Active Clusters: {base_clusters}")

        submitted_tickets = []

        # Step 1: Submit 10 complaints and test tracking
        print("\n--- Submitting 10 Fictional Complaints ---")
        for item in TEST_COMPLAINTS:
            payload = {
                "raw_text": item["raw_text"],
                "student_name": item["student_name"],
                "student_email": item["student_email"]
            }
            res = client.post("/api/complaints/submit", json=payload)
            assert res.status_code == 201, f"Failed submit: {res.text}"
            data = res.json()
            ticket_id = data["ticket_id"]
            submitted_tickets.append(data)

            # Test immediate tracking
            track_res = client.get(f"/api/complaints/track/{ticket_id}")
            assert track_res.status_code == 200, f"Tracking failed for {ticket_id}"
            track_data = track_res.json()

            print(f"[{item['name']}] Ticket: {ticket_id} | Lang: {data['detected_language']} | Dept: {data['department']} | Bldg: {data['building']} | Floor: {data['floor']} | Urgency: {data['urgency']} | Cluster: {data['cluster_id']} | Triage: {data['needs_human_review']}")

        # Step 2: Verify Duplicate Grouping
        print("\n--- Checking Duplicate Grouping ---")
        ticket1 = submitted_tickets[0]
        ticket2 = submitted_tickets[1]
        print(f"Ticket 1 (Geyser leak in Hostel 2): Cluster #{ticket1.get('cluster_id')}")
        print(f"Ticket 2 (Geyser leak duplicate): Cluster #{ticket2.get('cluster_id')}")
        duplicate_grouped = (ticket2.get("cluster_id") is not None) and (ticket2.get("cluster_id") == ticket1.get("cluster_id"))
        print(f"Duplicate grouped into same cluster: {duplicate_grouped}")

        # Step 3: Admin Status Update & Tracking Reflection
        print("\n--- Checking Admin Status Updates & Student Tracking ---")
        target_ticket = ticket1["ticket_id"]
        update_payload = {
            "status": "In Progress",
            "admin_notes": "Plumber Sharma assigned with work order #9921."
        }
        patch_res = client.patch(f"/api/admin/complaints/{target_ticket}/status", json=update_payload)
        assert patch_res.status_code == 200
        patch_data = patch_res.json()
        assert patch_data["status"] == "In Progress"

        # Re-query student tracking endpoint
        track_after = client.get(f"/api/complaints/track/{target_ticket}").json()
        assert track_after["status"] == "In Progress"
        assert "work order #9921" in track_after["admin_notes"]
        has_status_log = any(log["action"] == "Status Changed" for log in track_after["logs"])
        print(f"Admin status updated to: {track_after['status']}")
        print(f"Audit log entry present: {has_status_log}")

        # Step 4: Human Review for Uncertain Predictions
        print("\n--- Checking Human Review Queue ---")
        triage_ticket = submitted_tickets[9] # C10 vague
        assert triage_ticket["needs_human_review"] is True, "C10 was not flagged for triage!"
        print(f"Ticket {triage_ticket['ticket_id']} correctly flagged for human review (Confidence: {triage_ticket['confidence_score']})")

        # Perform Human Triage Reclassification
        triage_payload = {
            "department": "Other",
            "urgency": "Low",
            "building": "Central Library",
            "notes": "Reviewed by warden: general administrative inquiry.",
            "performed_by": "Senior Triage Officer"
        }
        triage_res = client.post(f"/api/admin/complaints/{triage_ticket['ticket_id']}/triage", json=triage_payload)
        assert triage_res.status_code == 200
        triage_data = triage_res.json()
        assert triage_data["needs_human_review"] is False
        print(f"Human triage reclassified ticket {triage_ticket['ticket_id']}: needs_human_review is now {triage_data['needs_human_review']}")

        # Step 5: Dashboard and Heatmap Counts Update
        print("\n--- Checking Post-Submission Dashboard & Heatmap Metrics ---")
        after_overview = client.get("/api/analytics/overview").json()
        after_heatmap = client.get("/api/analytics/heatmap").json()

        print(f"[New Metrics] Total Complaints: {after_overview['total_complaints']} (+{after_overview['total_complaints'] - base_total})")
        print(f"[New Metrics] Open Complaints: {after_overview['open_complaints']} (+{after_overview['open_complaints'] - base_open})")
        print(f"[New Metrics] Active Clusters: {after_overview['active_clusters_count']}")

        # Check Hostel 2 in Heatmap
        h2_point = [p for p in after_heatmap["points"] if "Hostel 2" in p["name"]][0]
        print(f"Hostel 2 Heatmap Point: Total={h2_point['total_complaints']}, Open={h2_point['open_complaints']}, Severity={h2_point['severity_score']}")

        print("\n=== AUDIT RUN COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_audit()
