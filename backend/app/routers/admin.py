from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.db import get_db
from app.models import Worker, Shift, Policy, Plan, Claim
from app.schemas import SystemStatusResponse
from app.services.trigger_engine import auto_create_claim, set_mock_app_outage, MOCK_APP_OUTAGE_STATE

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/simulate-trigger")
async def simulate_trigger(trigger_type: str, zone: str, city: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Find all active shifts in this zone
    active_shifts = db.query(Shift).filter(Shift.dark_store_zone == zone, Shift.status == "active").all()
    
    # Simulate a payout mapping
    payout_val = 500
    
    tasks_spawned = 0
    now = datetime.now(timezone.utc)
    for shift in active_shifts:
        # Check if policy covers this. Simplification: Assume yes, or pull Policy explicitly
        background_tasks.add_task(auto_create_claim, shift.worker_id, trigger_type, zone, payout_val, now, db)
        tasks_spawned += 1

    return {"status": "simulated", "workers_triggered": tasks_spawned, "zone": zone}

@router.post("/simulate-outage")
def simulate_outage(platform: str, duration_minutes: int):
    # platform: zepto / blinkit / instamart
    set_mock_app_outage(platform, "outage")
    return {"status": "outage_simulated", "platform": platform, "duration_minutes": duration_minutes}

@router.get("/system-status", response_model=SystemStatusResponse)
def get_system_status():
    # Evaluate global statuses
    app_status_summary = []
    for k, v in MOCK_APP_OUTAGE_STATE.items():
        if v == "outage":
            app_status_summary.append(f"{k}: OUTAGE")
            
    platforms = ", ".join(app_status_summary) if app_status_summary else "All OK (🟢)"
    
    return {
        "rain": "2mm (safe 🟢)",
        "flood": "No alert (🟢)",
        "heat": "32°C (safe 🟢)",
        "aqi": "87 (safe 🟢)",
        "zone_shutdown": "No alerts (🟢)",
        "platforms": platforms
    }
