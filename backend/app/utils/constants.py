from enum import Enum

class DepartmentCode(str, Enum):
    PLUMBING = "Plumbing"
    ELECTRICAL = "Electrical"
    WIFI = "Wi-Fi"
    MESS = "Mess"
    ACADEMIC = "Academic"
    OTHER = "Other"

class UrgencyLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class ComplaintStatus(str, Enum):
    SUBMITTED = "Submitted"
    IN_REVIEW = "In Review"  # Needs human triage or currently being inspected
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"
    REJECTED = "Rejected"

class LanguageDetected(str, Enum):
    HINGLISH = "Hinglish"
    HINDI = "Hindi"
    ENGLISH = "English"
    UNKNOWN = "Unknown"

# Standard Campus Zones and Buildings for mapping
DEFAULT_DEPARTMENTS = [
    {
        "code": DepartmentCode.PLUMBING.value,
        "name": "Plumbing & Water Supply",
        "description": "Issues with taps, pipelines, flush, water coolers, washrooms, leakage",
        "contact_email": "plumbing@campus.edu"
    },
    {
        "code": DepartmentCode.ELECTRICAL.value,
        "name": "Electrical & Power",
        "description": "Lights, fans, switchboards, AC, power cuts, spark hazards, geysers",
        "contact_email": "electrical@campus.edu"
    },
    {
        "code": DepartmentCode.WIFI.value,
        "name": "Wi-Fi & IT Infrastructure",
        "description": "Campus Wi-Fi login, network speed, router down, LAN port, portal issues",
        "contact_email": "cc-wifi@campus.edu"
    },
    {
        "code": DepartmentCode.MESS.value,
        "name": "Mess & Dining Affairs",
        "description": "Food quality, hygiene, raw/spoiled items, dining hall cleanliness, mess staff",
        "contact_email": "mess@campus.edu"
    },
    {
        "code": DepartmentCode.ACADEMIC.value,
        "name": "Academic & Classroom Facilities",
        "description": "Projectors, lecture hall mics, broken benches, lab equipment, podiums",
        "contact_email": "academics@campus.edu"
    },
    {
        "code": DepartmentCode.OTHER.value,
        "name": "General Administration & Security",
        "description": "Security, lost & found, sports facilities, hostel curfew, other issues",
        "contact_email": "admin@campus.edu"
    }
]

DEFAULT_CAMPUS_LOCATIONS = [
    {"name": "Hostel 1 (Boys)", "building_code": "H1", "zone": "North Campus", "coord_x": 18.5, "coord_y": 25.0, "type": "Hostel"},
    {"name": "Hostel 2 (Boys)", "building_code": "H2", "zone": "North Campus", "coord_x": 32.0, "coord_y": 22.0, "type": "Hostel"},
    {"name": "Hostel 3 (Girls)", "building_code": "H3", "zone": "East Campus", "coord_x": 80.0, "coord_y": 30.0, "type": "Hostel"},
    {"name": "Hostel 4 (Girls)", "building_code": "H4", "zone": "East Campus", "coord_x": 85.0, "coord_y": 48.0, "type": "Hostel"},
    {"name": "Central Library", "building_code": "LIB", "zone": "Central Core", "coord_x": 50.0, "coord_y": 45.0, "type": "Academic"},
    {"name": "Academic Block A", "building_code": "AB-A", "zone": "West Campus", "coord_x": 25.0, "coord_y": 60.0, "type": "Academic"},
    {"name": "Academic Block B", "building_code": "AB-B", "zone": "West Campus", "coord_x": 38.0, "coord_y": 68.0, "type": "Academic"},
    {"name": "Central Mess 1", "building_code": "MESS-1", "zone": "North Campus", "coord_x": 26.0, "coord_y": 36.0, "type": "Mess"},
    {"name": "Central Mess 2", "building_code": "MESS-2", "zone": "East Campus", "coord_x": 75.0, "coord_y": 42.0, "type": "Mess"},
    {"name": "Computer Centre", "building_code": "CC", "zone": "Central Core", "coord_x": 58.0, "coord_y": 55.0, "type": "Academic"},
    {"name": "Sports Complex", "building_code": "SPORTS", "zone": "South Campus", "coord_x": 62.0, "coord_y": 80.0, "type": "Sports"}
]
