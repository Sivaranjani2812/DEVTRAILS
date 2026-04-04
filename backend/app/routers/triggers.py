from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter(prefix="/triggers", tags=["triggers"])

# Live mock trigger data — reflects what the trigger engine would produce
LIVE_MOCK_TRIGGERS = [
    {"name": "Rainfall Sensor", "value": "4.2mm/hr", "threshold": "20mm/hr", "status": "normal"},
    {"name": "Heat Index", "value": "33°C", "threshold": "45°C", "status": "normal"},
    {"name": "Air Quality (AQI)", "value": "87", "threshold": "300 AQI", "status": "normal"},
    {"name": "Flood Alert (NDMA)", "value": "No alerts", "threshold": "Level-2 alert", "status": "normal"},
    {"name": "Zepto App", "value": "Operational", "threshold": "Full outage", "status": "normal"},
    {"name": "Blinkit App", "value": "Operational", "threshold": "Full outage", "status": "normal"},
]

@router.get("/live")
def get_live_triggers():
    """
    Returns real-time parametric trigger status for the dashboard monitor.
    In production this would poll Open-Meteo, NDMA RSS, and platform status APIs.
    """
    now = datetime.now(timezone.utc).isoformat()
    return [
        {**t, "lastChecked": now}
        for t in LIVE_MOCK_TRIGGERS
    ]
