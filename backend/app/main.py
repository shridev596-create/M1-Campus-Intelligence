from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import complaints, admin, analytics
from seeds.seed_data import seed_database

logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("m1_campus_intelligence")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing database and seeding campus tables...")
    try:
        Base.metadata.create_all(bind=engine)
        seed_database()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Startup initialization error: {e}")
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered Hinglish Complaint Router for College Campuses",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(complaints.router)
app.include_router(admin.router)
app.include_router(analytics.router)

@app.get("/", tags=["Health"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "status": "online",
        "llm_provider": settings.LLM_PROVIDER,
        "docs": "/docs"
    }

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_connected",
        "llm_mode": settings.LLM_PROVIDER
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
