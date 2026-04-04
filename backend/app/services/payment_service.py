import logging
from datetime import datetime, timezone
import httpx
import uuid
import os

from sqlalchemy.orm import Session
from app.models import Worker, Claim

logger = logging.getLogger("payment_service")

async def process_payout(worker: Worker, claim: Claim, db: Session):
    logger.info(f"Processing payout for claim {claim.id} of {claim.payout_amount} INR via Razorpay")
    
    # Simulate Razorpay API call
    amount_paise = claim.payout_amount * 100
    upi_id = worker.upi_id
    
    success = True
    razorpay_payout_id = f"pout_{str(uuid.uuid4())[:12].replace('-', '')}"
    
    if success:
        claim.paid_at = datetime.now(timezone.utc)
        
        # Calculate time difference
        time_diff = claim.paid_at - claim.created_at
        claim.time_to_payout_seconds = int(time_diff.total_seconds())
        
        claim.status = "paid"
        claim.razorpay_payout_id = razorpay_payout_id
        db.commit()
        
        send_fcm_notification(
            worker.device_fingerprint, 
            f"₹{claim.payout_amount} credited to your UPI! Claim #{claim.id} · {claim.trigger_type} detected in {claim.zone}. Paid in {claim.time_to_payout_seconds}s."
        )
        logger.info(f"Payout successful. Paid in {claim.time_to_payout_seconds}s.")
    else:
        logger.error(f"Payout failed for claim {claim.id}")

def send_fcm_notification(device_token: str, message: str):
    # Mock FCM Notification
    logger.info(f"[Mock FCM] Sending to '{device_token}': {message}")
