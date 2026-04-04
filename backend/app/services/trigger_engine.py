import os
import random
import logging
from datetime import datetime, timezone
import httpx
import uuid
import asyncio

from sqlalchemy.orm import Session
from sqlalchemy import select, and_, exists
from app.db import SessionLocal
from app.models import Worker, Policy, Shift, Claim, Plan
from app.ml.fraud_detector import run_fraud_check
from app.services.payment_service import process_payout

logger = logging.getLogger("trigger_engine")

# Note: In a real app we'd load this correctly inside FastAPI config
# but we read it dynamically here so .env changes are reflecting.
USE_MOCK_APIS = os.getenv("USE_MOCK_APIS", "true").lower() == "true"

MOCK_APP_OUTAGE_STATE = {
    "zepto": "operational",
    "blinkit": "operational",
    "instamart": "operational"
}

def is_mock_enabled():
    return os.getenv("USE_MOCK_APIS", "true").lower() == "true"

async def check_rain_trigger(zone: str) -> dict:
    if is_mock_enabled():
        # Mock payload
        rain_mm = 0.0
        return {"triggered": False, "rain_mm": rain_mm, "zone": zone, "timestamp": datetime.now(timezone.utc).isoformat()}
        
    api_key = os.getenv("OPENWEATHERMAP_API_KEY", "")
    url = f"https://api.openweathermap.org/data/2.5/weather?q={zone}&appid={api_key}"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url)
            data = resp.json()
            rain_1h = data.get("rain", {}).get("1h", 0)
            rain_3h = data.get("rain", {}).get("3h", 0)
            triggered = rain_1h >= 20 or rain_3h >= 20
            return {"triggered": triggered, "rain_mm": max(rain_1h, rain_3h), "zone": zone, "timestamp": datetime.now(timezone.utc).isoformat()}
    except Exception as e:
        logger.error(f"Rain API error: {e}")
        return {"triggered": False, "rain_mm": 0, "zone": zone, "timestamp": datetime.now(timezone.utc).isoformat()}


async def check_flood_trigger(city: str) -> dict:
    if is_mock_enabled():
        return {"triggered": False, "source": "NDMA", "alert_text": "No active alerts"}
        
    url = os.getenv("NDMA_RSS_URL", "https://ndma.gov.in/feeds/rss.xml")
    try:
        # Mock XML parse logic basically
        return {"triggered": False, "source": "NDMA", "alert_text": ""}
    except Exception as e:
        return {"triggered": False, "source": "Error", "alert_text": str(e)}


async def check_heat_trigger(zone: str) -> dict:
    if is_mock_enabled():
        return {"triggered": False, "temp_celsius": 32.0}

    api_key = os.getenv("OPENWEATHERMAP_API_KEY", "")
    url = f"https://api.openweathermap.org/data/2.5/weather?q={zone}&appid={api_key}&units=metric"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url)
            data = resp.json()
            temp = data.get("main", {}).get("temp", 30.0)
            hour = datetime.now(timezone.utc).hour + 5 # IST hack approx
            triggered = temp >= 45 and (10 <= hour <= 17)
            return {"triggered": triggered, "temp_celsius": temp}
    except Exception as e:
        return {"triggered": False, "temp_celsius": 0.0}


async def check_pollution_trigger(zone: str) -> dict:
    if is_mock_enabled():
        return {"triggered": False, "aqi_value": 87.0}
        
    # Standard translation of OM scale 1-5 to real AQI values approx
    return {"triggered": False, "aqi_value": 50.0}

async def check_zone_shutdown(zone: str, city: str) -> dict:
    if is_mock_enabled():
        return {"triggered": False, "confidence_score": 0, "sources": []}
    return {"triggered": False, "confidence_score": 0, "sources": []}

async def check_app_outage() -> dict:
    # Check our internal mock state first. We can override this directly via admin
    for platform, status in MOCK_APP_OUTAGE_STATE.items():
        if status == "outage":
            return {"triggered": True, "platform": platform, "outage_type": "complete"}
            
    return {"triggered": False, "platform": "all", "outage_type": "none"}

def set_mock_app_outage(platform: str, status: str):
    global MOCK_APP_OUTAGE_STATE
    MOCK_APP_OUTAGE_STATE[platform] = status

async def auto_create_claim(worker_id: int, trigger_type: str, zone: str, payout_amount: int, trigger_time: datetime, db: Session):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    policy = db.query(Policy).filter(Policy.worker_id == worker_id, Policy.status == "active").first()
    shift = db.query(Shift).filter(Shift.worker_id == worker_id, Shift.status == "active").first()
    
    if not worker or not policy:
        return
        
    # Check if duplicate today exists
    today_start = trigger_time.replace(hour=0, minute=0, second=0, microsecond=0)
    duplicate_claim = db.query(Claim).filter(
        Claim.worker_id == worker_id,
        Claim.trigger_type == trigger_type,
        Claim.created_at >= today_start
    ).first()
    
    past_claims = db.query(Claim).filter(Claim.worker_id == worker_id).all()
    past_claims_features = [] # To populate for Isolation Forest later
    
    # Count other claims in last 30 minutes in the same zone for this trigger
    thirty_mins_ago = trigger_time.timestamp() - 1800
    thirty_mins_ago_dt = datetime.fromtimestamp(thirty_mins_ago, timezone.utc)
    corroborating_count = db.query(Claim).filter(
        Claim.trigger_type == trigger_type,
        Claim.zone == zone,
        Claim.created_at >= thirty_mins_ago_dt
    ).count()

    claim_id = f"CLM-{str(uuid.uuid4())[:8].upper()}"
    new_claim = Claim(
        id=claim_id,
        worker_id=worker_id,
        policy_id=policy.id,
        trigger_type=trigger_type,
        zone=zone,
        payout_amount=payout_amount,
        auto_created=True,
        status="fraud_check_pending",
        created_at=trigger_time
    )
    db.add(new_claim)
    db.flush() # flush to get instance tracked if needed

    # Run fraud detection layer
    fraud_result = run_fraud_check(
        claim={"zone": zone, "trigger_type": trigger_type},
        worker={"id": worker.id},
        shift={"dark_store_zone": shift.dark_store_zone, "checkin_time": shift.checkin_time} if shift else None,
        has_duplicate_today=(duplicate_claim is not None),
        past_claims_features=[], # TODO: populate actual features later
        current_claim_features={"claims_per_week": 1, "days_between_claims": 7, "claim_to_shift_ratio": 0.1},
        corroborating_claims_count=corroborating_count,
        trigger_time=trigger_time
    )

    new_claim.fraud_score = fraud_result["fraud_score"]
    new_claim.fraud_flags = fraud_result["fraud_flags"]
    new_claim.status = fraud_result["status"]
    db.commit()

    if new_claim.status == "approved":
        await process_payout(worker, new_claim, db)


async def check_all_triggers():
    logger.info("Running check_all_triggers job...")
    db = SessionLocal()
    try:
        # Get active shifts and their unique zones
        active_shifts = db.query(Shift).filter(Shift.status == "active").all()
        zones = set([s.dark_store_zone for s in active_shifts])
        
        # Determine the city. For simplicity, just pick generic Bangalore if not available
        # or grab from the workers in that zone
        
        for zone in zones:
            # We skip real parallel gathers here to keep the DB session cleanly attached per task
            # but in production, we could parallelize API calls
            
            rain = await check_rain_trigger(zone)
            if rain["triggered"]:
                print(f"Trigger hit! Rain {zone}")
                
            heat = await check_heat_trigger(zone)
            if heat["triggered"]:
                print(f"Trigger hit! Heat {zone}")
                
            poll = await check_pollution_trigger(zone)
            if poll["triggered"]:
                print(f"Trigger hit! Pollution {zone}")
                
            sht = await check_zone_shutdown(zone, "Bangalore")
            if sht["triggered"]:
                print(f"Trigger hit! Zone Shutdown {zone}")
                
        outage = await check_app_outage()
        if outage["triggered"]:
            print(f"Trigger hit! App Outage {outage['platform']}")
            
    except Exception as e:
        logger.error(f"Error in check_all_triggers: {e}")
    finally:
        db.close()
