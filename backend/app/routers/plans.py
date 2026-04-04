from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Plan
from app.schemas import PlanResponse

router = APIRouter(prefix="/plans", tags=["plans"])

@router.get("", response_model=list[PlanResponse])
def get_plans(db: Session = Depends(get_db)):
    return db.query(Plan).all()
