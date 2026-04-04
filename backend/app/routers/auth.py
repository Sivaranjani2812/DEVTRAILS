from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Worker
from app.schemas import VerifyOTPRequest, AuthTokenResponse

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/verify-otp", response_model=AuthTokenResponse)
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    # Mock OTP verification
    if req.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    worker = db.query(Worker).filter(Worker.phone == req.phone).first()
    
    if not worker:
        return AuthTokenResponse(
            access_token="mock_token_new_user",
            token_type="bearer",
            is_new_user=True
        )
        
    # Standard logic: if existing, update device_fingerprint maybe
    worker.device_fingerprint = req.device_fingerprint
    db.commit()
    
    return AuthTokenResponse(
        access_token="mock_token_existing",
        token_type="bearer",
        user_id=worker.id,
        is_new_user=False
    )
