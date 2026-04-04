from __future__ import annotations

from app.ml.isolation_forest import check_anomaly
from datetime import datetime, timezone

def run_fraud_check(
    claim: dict, 
    worker: dict,
    shift: dict | None,
    has_duplicate_today: bool,
    past_claims_features: list[dict],
    current_claim_features: dict,
    corroborating_claims_count: int,
    trigger_time: datetime
) -> dict:
    
    fraud_score = 0
    fraud_flags = []
    
    # L1: Zone Verification (20 pts)
    # Check if worker has an active shift and if the zone matches
    if not shift or (shift.get("dark_store_zone") != claim.get("zone")):
        fraud_score += 20
        fraud_flags.append("zone_mismatch")
        
    # L2: Shift Timing Check (25 pts)
    # Did worker check in before the trigger fired?
    if shift and shift.get("checkin_time"):
        if shift.get("checkin_time") > trigger_time:
            fraud_score += 25
            fraud_flags.append("late_checkin_suspicious")
    else:
        fraud_score += 25
        fraud_flags.append("no_active_checkin_found")
            
    # L3: Duplicate Claim Check (30 pts)
    if has_duplicate_today:
        fraud_score += 30
        fraud_flags.append("duplicate_claim_today")
        # Spec says to block immediately
        return {
            "fraud_score": fraud_score,
            "fraud_flags": fraud_flags,
            "status": "rejected",
            "decision_reason": "Blocked: Duplicate claim on the same day for this trigger type."
        }
        
    # L4: Isolation Forest Anomaly Detection (15 pts)
    is_anomalous = check_anomaly(past_claims_features, current_claim_features)
    if is_anomalous:
        fraud_score += 15
        fraud_flags.append("anomalous_claim_frequency")
        
    # L5: Multi-Worker Corroboration
    if corroborating_claims_count >= 5:
        fraud_score -= 20
        fraud_flags.append(f"corroborated_by_{corroborating_claims_count}_workers")
    elif corroborating_claims_count == 1:
        # Check if weather trigger
        trigger_type = claim.get("trigger_type", "").lower()
        if trigger_type in ["rain", "flood", "heat", "pollution"]:
            fraud_score += 10
            fraud_flags.append("sole_claimer_weather_suspicious")
            
    # Ensure score bounds
    fraud_score = max(0, fraud_score)
    
    # Final Decision Output
    if fraud_score < 30:
        status = "approved"
        decision_reason = "Passed all automated checks"
    elif fraud_score <= 60:
        if fraud_score <= 50:
            status = "silent_hold"
            decision_reason = "Minor anomalies detected. Holding for automated re-check."
        else:
            status = "manual_review"
            decision_reason = "Moderate risk. Requires human admin review."
    else:
        status = "rejected"
        decision_reason = "High fraud probability. Rejected by automated risk engine."
        
    return {
        "fraud_score": fraud_score,
        "fraud_flags": fraud_flags,
        "status": status,
        "decision_reason": decision_reason
    }
