import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from app.db import Base, engine, SessionLocal
from app.models import Plan

logger = logging.getLogger("init_db")

def init_db():
    logger.info("Dropping all existing tables...")
    Base.metadata.drop_all(bind=engine)
    logger.info("Creating all new tables...")
    Base.metadata.create_all(bind=engine)

    # Seed the Plans table
    db = SessionLocal()
    try:
        basic_plan = Plan(
            id="basic",
            name="Basic",
            weekly_premium=49,
            triggers_covered=["rain"],
            max_payout_per_week=400,
            max_payout_per_event=400
        )
        standard_plan = Plan(
            id="standard",
            name="Standard",
            weekly_premium=89,
            triggers_covered=["rain", "flood", "heat", "app_outage"],
            max_payout_per_week=700,
            max_payout_per_event=500
        )
        premium_plan = Plan(
            id="premium",
            name="Premium",
            weekly_premium=149,
            triggers_covered=["rain", "flood", "heat", "pollution", "zone_shutdown", "app_outage"],
            max_payout_per_week=1000,
            max_payout_per_event=700
        )
        
        db.add_all([basic_plan, standard_plan, premium_plan])
        db.commit()
        logger.info("Seeded default plans.")
    except Exception as e:
        logger.error(f"Error seeding plans: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
