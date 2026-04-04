from fastapi import APIRouter

router = APIRouter(prefix="/zones", tags=["zones"])

@router.get("/weather-history")
def get_weather_history(zone: str):
    # Mock return 2yr history. In a real system, you'd fetch this from open-meteo archive.
    return {
        "rain_frequency_2yr": 0.15,
        "flood_events": 1,
        "heat_days": 10,
        "avg_aqi": 150.0
    }
