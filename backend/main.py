from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.init_db import init_db
from app.routers import auth, workers, zones, plans, policies, shifts, premium, claims, admin, mock, triggers
from app.services.trigger_engine import check_all_triggers
from app.ml.risk_scorer import train_model
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("insuregig-backend")

app = FastAPI(title="Insuregig Backend", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scheduler = AsyncIOScheduler(timezone="Asia/Kolkata")

@app.on_event("startup")
def on_startup() -> None:
    # Initialize Database (Drop and Recreate for Hackathon)
    init_db()
    
    # Train ML Model (Creates model.pkl)
    train_model()
    
    # Start Scheduler
    if not scheduler.running:
        # Schedule the trigger engine to run every 30 minutes
        scheduler.add_job(check_all_triggers, "interval", minutes=30, id="check_all_triggers_job")
        scheduler.start()
        
    logger.info("Insuregig backend started successfully.")

@app.on_event("shutdown")
def on_shutdown() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)

# Register Routers
app.include_router(auth.router)
app.include_router(workers.router)
app.include_router(zones.router)
app.include_router(plans.router)
app.include_router(policies.router)
app.include_router(shifts.router)
app.include_router(premium.router)
app.include_router(claims.router)
app.include_router(admin.router)
app.include_router(mock.router)
app.include_router(triggers.router)

@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
