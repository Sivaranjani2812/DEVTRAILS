import os
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

def train_isolation_forest(worker_claims: list[dict]):
    if not worker_claims or len(worker_claims) < 3:
        # Not enough data to find an anomaly, safely return a dummy model or skip
        return None
        
    features = []
    for c in worker_claims:
        features.append([
            c.get('claims_per_week', 0),
            c.get('days_between_claims', 14),
            c.get('claim_to_shift_ratio', 0.1)
        ])
        
    X = np.array(features)
    iso = IsolationForest(n_estimators=50, contamination=0.1, random_state=42)
    iso.fit(X)
    return iso

def check_anomaly(worker_claims: list[dict], current_claim_features: dict) -> bool:
    iso = train_isolation_forest(worker_claims)
    if not iso:
        return False
        
    X_new = np.array([[
        current_claim_features.get('claims_per_week', 0),
        current_claim_features.get('days_between_claims', 14),
        current_claim_features.get('claim_to_shift_ratio', 0.1)
    ]])
    
    # predict returns -1 for anomaly, 1 for normal
    pred = iso.predict(X_new)
    return pred[0] == -1
