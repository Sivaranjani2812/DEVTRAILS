import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

def get_base_score(row):
    return (
        (row['zone_rain_frequency_2yr'] * 35) +
        (row['zone_flood_events_2yr'] * 5) +
        (row['zone_heat_days_2yr'] * 0.5) +
        (row['zone_avg_aqi'] * 0.05) +
        (row['platforms_count'] * 8) +
        (row['days_per_week'] * 2) +
        (row['shift_timing_encoded'] * 6) +
        ((2 - row['savings_encoded']) * 10) +
        (row['disruption_frequency_encoded'] * 8)
    )

def train_model():
    print("Training ML Risk Scorer...")
    np.random.seed(42)
    n_samples = 500

    data = {
        'zone_rain_frequency_2yr': np.random.uniform(0.0, 1.0, n_samples),
        'zone_flood_events_2yr': np.random.randint(0, 6, n_samples),
        'zone_heat_days_2yr': np.random.randint(0, 41, n_samples),
        'zone_avg_aqi': np.random.uniform(50, 350, n_samples),
        'platforms_count': np.random.randint(1, 4, n_samples),
        'days_per_week': np.random.randint(1, 8, n_samples),
        'shift_timing_encoded': np.random.randint(0, 3, n_samples),
        'weekly_income': np.random.uniform(2000, 8000, n_samples),
        'savings_encoded': np.random.randint(0, 3, n_samples),
        'disruption_frequency_encoded': np.random.randint(0, 3, n_samples)
    }
    df = pd.DataFrame(data)

    bases = df.apply(get_base_score, axis=1)

    # 0=LOW, 1=MEDIUM, 2=HIGH
    labels = []
    for b in bases:
        if b < 35:
            labels.append(0)
        elif b <= 65:
            labels.append(1)
        else:
            labels.append(2)

    df['label'] = labels

    X = df.drop(columns=['label'])
    y = df['label']

    clf = RandomForestClassifier(n_estimators=50, random_state=42)
    clf.fit(X, y)

    joblib.dump(clf, MODEL_PATH)
    print("ML Risk Scorer trained and saved to", MODEL_PATH)

def calculate_risk(worker_features: dict) -> dict:
    if not os.path.exists(MODEL_PATH):
        train_model()

    clf = joblib.load(MODEL_PATH)
    
    # Ensure correct order
    feature_names = [
        'zone_rain_frequency_2yr', 'zone_flood_events_2yr', 'zone_heat_days_2yr',
        'zone_avg_aqi', 'platforms_count', 'days_per_week', 'shift_timing_encoded',
        'weekly_income', 'savings_encoded', 'disruption_frequency_encoded'
    ]
    
    input_data = {k: [worker_features.get(k, 0)] for k in feature_names}
    df_input = pd.DataFrame(input_data)
    
    label = clf.predict(df_input)[0]
    
    row = input_data
    base = (
        (row['zone_rain_frequency_2yr'][0] * 35) +
        (row['zone_flood_events_2yr'][0] * 5) +
        (row['zone_heat_days_2yr'][0] * 0.5) +
        (row['zone_avg_aqi'][0] * 0.05) +
        (row['platforms_count'][0] * 8) +
        (row['days_per_week'][0] * 2) +
        (row['shift_timing_encoded'][0] * 6) +
        ((2 - row['savings_encoded'][0]) * 10) +
        (row['disruption_frequency_encoded'][0] * 8)
    )

    # Convert base score into roughly a 0-100 scale for UI gauge
    risk_score = min(max(int((base / 90.0) * 100), 0), 100)

    # Breakdown based on point contributions
    total_pts_pos = (
        min(row['zone_rain_frequency_2yr'][0] * 35, 100) +
        row['zone_flood_events_2yr'][0] * 5 +
        row['zone_heat_days_2yr'][0] * 0.5 +
        row['zone_avg_aqi'][0] * 0.05 +
        row['platforms_count'][0] * 8 +
        row['days_per_week'][0] * 2 +
        row['shift_timing_encoded'][0] * 6 +
        row['disruption_frequency_encoded'][0] * 8
    )
    
    savings_pts = ((2 - row['savings_encoded'][0]) * 10)
    
    score_breakdown = {
        "Zone Rain History": {"points": int(row['zone_rain_frequency_2yr'][0] * 35), "direction": "up"},
        "Flood Events": {"points": int(row['zone_flood_events_2yr'][0] * 5), "direction": "up"},
        "Heat Exposure": {"points": int(row['zone_heat_days_2yr'][0] * 0.5), "direction": "up"},
        "Air Quality Focus": {"points": int(row['zone_avg_aqi'][0] * 0.05), "direction": "up"},
        "Platform Multiplier": {"points": int(row['platforms_count'][0] * 8), "direction": "up"},
        "Shift Intensity": {"points": int(row['days_per_week'][0] * 2), "direction": "up"},
        "Late Hour Exposure": {"points": int(row['shift_timing_encoded'][0] * 6), "direction": "up"},
        "Savings Vulnerability": {"points": int(savings_pts), "direction": "up"},
        "Past Disruption Propensity": {"points": int(row['disruption_frequency_encoded'][0] * 8), "direction": "up"}
    }
    
    if label == 0:
        risk_label = "LOW"
        recommended_plan = "basic"
        premium_amount = 49
    elif label == 1:
        risk_label = "MEDIUM"
        recommended_plan = "standard"
        premium_amount = 89
    else:
        risk_label = "HIGH"
        recommended_plan = "premium"
        premium_amount = 149
        
    return {
        "risk_score": risk_score,
        "risk_label": risk_label,
        "recommended_plan": recommended_plan,
        "premium_amount": premium_amount,
        "score_breakdown": score_breakdown
    }
