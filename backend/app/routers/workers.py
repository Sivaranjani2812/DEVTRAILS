from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Worker, Plan
from app.schemas import WorkerCreate
from app.ml.risk_scorer import calculate_risk

router = APIRouter(prefix="/workers", tags=["workers"])

@router.post("/register")
def register_worker(worker_data: WorkerCreate, db: Session = Depends(get_db)):
    # Prepare features for ML Model
    shift_map = {"morning": 0, "evening": 1, "night": 2}
    savings_map = {"low": 0, "medium": 1, "high": 2}
    freq_map = {"rarely": 0, "sometimes": 1, "often": 2}
    
    # Normally we query /zones/weather-history?zone={} but for simplicity we mock feature extraction here
    # Since these are new workers, let's inject realistic mock features for their chosen zones.
    # In a real setup, we would fetch 2yr open-meteo history and calculate averages.
    
    worker_features = {
        "zone_rain_frequency_2yr": 0.15,
        "zone_flood_events_2yr": 1,
        "zone_heat_days_2yr": 10,
        "zone_avg_aqi": 150.0,
        "platforms_count": worker_data.platforms_count,
        "days_per_week": worker_data.days_per_week,
        "shift_timing_encoded": shift_map.get(worker_data.shift_timing.lower(), 0),
        "weekly_income": worker_data.weekly_income,
        "savings_encoded": savings_map.get(worker_data.savings_level.lower(), 1),
        "disruption_frequency_encoded": freq_map.get(worker_data.disruption_frequency.lower(), 1)
    }
    
    ml_result = calculate_risk(worker_features)
    
    new_worker = Worker(
        **worker_data.dict(),
        risk_score=ml_result["risk_score"],
        recommended_plan=ml_result["recommended_plan"]
    )
    
    db.add(new_worker)
    db.commit()
    db.refresh(new_worker)
    
    # Try to find best budget plan
    all_plans = db.query(Plan).all()
    budget_plan = "basic"
    for p in sorted(all_plans, key=lambda x: x.weekly_premium, reverse=True):
        if p.weekly_premium <= worker_data.weekly_budget:
            budget_plan = p.id
            break
            
    return {
        "worker": new_worker,
        "risk_score": ml_result["risk_score"],
        "recommended_plan": ml_result["recommended_plan"],
        "premium_amount": ml_result["premium_amount"],
        "budget_plan": budget_plan
    }
