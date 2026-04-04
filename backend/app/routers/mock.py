from fastapi import APIRouter
from app.services.trigger_engine import MOCK_APP_OUTAGE_STATE

router = APIRouter(prefix="/mock", tags=["mock"])

@router.get("/platform-status")
def get_platform_status():
    return MOCK_APP_OUTAGE_STATE
