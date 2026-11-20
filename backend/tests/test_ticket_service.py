import re
import pytest
from app.database import SessionLocal, Base, engine
from app.services.ticket_service import generate_ticket_id

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()

def test_ticket_id_format(db):
    ticket_id = generate_ticket_id(db)
    # Must match M1-YYYY-XXXX
    assert re.match(r"^M1-\d{4}-[A-Z0-9]{4}$", ticket_id), f"Invalid ticket format: {ticket_id}"

def test_ticket_id_uniqueness(db):
    generated = set()
    for _ in range(50):
        t_id = generate_ticket_id(db)
        assert t_id not in generated, f"Duplicate ticket generated: {t_id}"
        generated.add(t_id)
