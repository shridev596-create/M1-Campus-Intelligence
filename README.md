# M1 – Campus Intelligence 🎓🏛️
### AI-Powered Hinglish Complaint Router for College Campuses

> **M1 – Campus Intelligence** is a complete, production-ready campus grievance triage and spatial analytics platform. It automatically processes student complaints written in **Hinglish, Hindi, or English**, extracts operational entities (Department, Location, Floor, Duration, and Urgency), detects duplicate issues, groups related complaints into Master Clusters, and visualizes hotspots on an interactive campus problem heatmap.

---

## 🌟 Core Features

1. **Multilingual Ingestion**: Accepts informal code-mixed **Hinglish** (*"Hostel 3 me paani nahi aa raha 2 din se"*), pure **Hindi** (*"मेस का खाना बहुत खराब है"*), and **English**.
2. **AI Department Classification**: Automatically categorizes complaints into:
   - 🚰 **Plumbing & Water Supply**
   - ⚡ **Electrical & Power**
   - 📶 **Wi-Fi & IT Infrastructure**
   - 🍛 **Mess & Dining Affairs**
   - 🎓 **Academic & Classroom Facilities**
   - 🛡️ **Other / Administration**
3. **Structured Entity Extraction**: Parses building (*Hostel 1-4, Central Library, Academic Blocks, Mess 1 & 2*), floor (*Ground, 1st, 2nd, etc.*), duration (*"2 din se", "since morning"*), and urgency (*Low, Medium, High, Critical*).
4. **Unique Ticket Generation**: Collision-resistant, trackable IDs (`M1-YYYY-XXXX`).
5. **Duplicate Detection & Incident Clustering**: Groups similar complaints into **Master Clusters** (e.g. 5 students reporting the same water supply failure) using token similarity.
6. **Interactive Campus Problem Heatmap**: Visual geospatial coordinates across campus zones with real-time severity scoring (Normal $\rightarrow$ Medium $\rightarrow$ Critical).
7. **Repeat Complaint Analytics**: Highlights top recurring problem areas, department workload queues, and language breakdowns.
8. **Human-in-the-Loop Triage Queue**: Flags low-confidence predictions ($< 75\%$) or ambiguous complaints for administrative manual review before routing.
9. **Zero-API-Key Demo Engine**: Out-of-the-box rule-based NLP classifier that works offline without any external API keys, plus seamless one-click integration with Google Gemini or OpenAI.

---

## 🏗️ System Architecture

```text
Student Portal (React + Vite + Tailwind CSS)
   │
   ├── [POST] /api/complaints/preview  (Real-time extraction preview)
   ├── [POST] /api/complaints/submit   (AI Routing + Ticket Generation)
   └── [GET]  /api/complaints/track/{id} (Status & Audit Timeline)
   │
FastAPI Processing Gateway (Python)
   ├── Heuristic Demo NLP Engine / Google Gemini API (Configurable)
   ├── Similarity & Clustering Engine (Cosine token matching)
   └── SQLite Database (Persistent Storage via SQLAlchemy ORM)
   │
Admin & Operations Layer
   ├── Department Queues (/api/admin/complaints)
   ├── Human Triage Override (/api/admin/complaints/{id}/triage)
   ├── Master Cluster Actions (/api/admin/clusters)
   └── Geospatial Heatmap & Repeat Analytics (/api/analytics)
```

---

## 🚀 Beginner-Friendly Setup Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**

---

### Step 1: Backend Setup (FastAPI & SQLite)

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows**:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   # Copy the sample environment file
   cp .env.example .env
   ```
   *Note: By default, `LLM_PROVIDER="demo"`, which runs 100% offline without needing any API key! To use Google Gemini, set `LLM_PROVIDER="gemini"` and provide your `GEMINI_API_KEY`.*

5. Seed sample campus locations, departments, and fictional complaints:
   ```bash
   python seeds/seed_data.py
   ```

6. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend API will be live at `http://localhost:8000`. You can test endpoints via the interactive Swagger docs at `http://localhost:8000/docs`.

---

### Step 2: Frontend Setup (React + Tailwind CSS)

1. Open a new terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

Run the complete backend test suite (unit tests, language extraction, API validation, and clustering):

```bash
cd backend
pytest tests/ -v
```

All 19 test cases verify:
- Ticket format (`M1-YYYY-XXXX`) and collision-free generation
- Hinglish, Hindi, and English parsing across all 6 departments
- Urgency and hazard detection
- Human-in-the-loop triage triggers for vague inputs
- Ticket submission, preview, and status updates
- Campus heatmap severity calculations

---

## 📝 Example Complaints for Testing

You can paste any of these directly into the student portal to test the AI router:

| Type | Complaint Text | Expected Classification |
| :--- | :--- | :--- |
| **Hinglish Plumbing** | *"Hostel 3 2nd floor washroom me paani nahi aa raha 2 din se, taps are dry please fix urgently."* | **Plumbing** (High Urgency, Hostel 3) |
| **Hinglish Hazard** | *"Hostel 1 room 14 mein switchboard me current aa raha hai shock laga danger emergency!"* | **Electrical** (Critical Urgency, Hostel 1) |
| **Hindi Mess** | *"मेस 2 में रात का खाना बहुत ही ठंडा और बासी था, कई छात्रों का पेट खराब हुआ है।"* | **Mess** (Central Mess 2) |
| **English Wi-Fi** | *"Girls Hostel 4 Wi-Fi router red light is blinking and not connecting since morning."* | **Wi-Fi** (Hostel 4) |
| **English Academic** | *"Academic Block A room 102 projector is dead since morning, lecture is disrupted."* | **Academic** (Academic Block A) |
| **Vague (Needs Review)**| *"College me sab kharab hai kuch samajh nahi aa raha"* | **Other** (Low Confidence $\rightarrow$ Human Triage Queue) |

---

## 🔒 Security & Best Practices
- **No API keys in frontend code**: All LLM queries and configurations are isolated inside the backend `LLMService`.
- **Database safety**: Uses SQLAlchemy ORM to protect against SQL injection.
- **Input Validation**: Strict Pydantic schemas validate all payloads with descriptive HTTP 422 error messaging.
