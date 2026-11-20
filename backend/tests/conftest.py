import sys
from pathlib import Path
import pytest

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database import Base, engine, SessionLocal
from seeds.seed_data import seed_database

@pytest.fixture(scope="session", autouse=True)
def initialize_database():
    """Initializes tables and seeds once for the entire test session."""
    Base.metadata.create_all(bind=engine)
    seed_database()
