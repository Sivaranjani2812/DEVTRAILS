from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Claim
from app.schemas import ClaimResponse, AppealRequest

router = APIRouter(prefix="/claims", tags=["claims"])

@router.get("/{worker_id}", response_model=list[ClaimResponse])
def get_claims(worker_id: int, db: Session = Depends(get_db)):
    claims = db.query(Claim).filter(Claim.worker_id == worker_id).order_by(Claim.created_at.desc()).all()
    return claims

@router.get("/status/{claim_id}", response_model=ClaimResponse)
def get_claim_status(claim_id: str, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@router.post("/{claim_id}/appeal")
def file_appeal(claim_id: str, req: AppealRequest, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim.status = "manual_review"
    db.commit()
    return {"status": "appeal_filed"}
