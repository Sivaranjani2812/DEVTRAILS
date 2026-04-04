from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Plan
from app.schemas import PremiumCalculateRequest, PremiumCalculateResponse
from app.ml.risk_scorer import calculate_risk
from app.services.trigger_engine import is_mock_enabled

router = APIRouter(prefix="/premium", tags=["premium"])

@router.post("/calculate", response_model=PremiumCalculateResponse)
def calculate_premium(req: PremiumCalculateRequest, db: Session = Depends(get_db)):
    result = calculate_risk(req.dict())
    
    all_plans = db.query(Plan).all()
    budget_plan = "basic"
    budget_premium = 49
    for p in sorted(all_plans, key=lambda x: x.weekly_premium, reverse=True):
        if p.weekly_premium <= req.weekly_budget if hasattr(req, 'weekly_budget') else 1000:
            budget_plan = p.id
            budget_premium = p.weekly_premium
            break
            
    # Weekly forecast risk based on weather APIs
    weekly_forecast_risk = "LOW"
    if not is_mock_enabled():
        # Typically make call to OWM 7-day forecast here
        pass
        
    return {
        **result,
        "budget_plan": budget_plan,
        "budget_premium": budget_premium,
        "weekly_forecast_risk": weekly_forecast_risk
    }
