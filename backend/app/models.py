from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Boolean, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


class PolicyStatus(str, enum.Enum):
    SELECTED = "SELECTED"
    INACTIVE = "INACTIVE"
    ACTIVE = "ACTIVE"


class ClaimStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PAID = "PAID"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    platform: Mapped[str] = mapped_column(String(200), nullable=False)
    shift: Mapped[str] = mapped_column(String(100), nullable=False)
    weekly_income: Mapped[float] = mapped_column(Float, nullable=False)
    risk_score: Mapped[int] = mapped_column(Integer, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    policies: Mapped[list["Policy"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    claims: Mapped[list["Claim"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Policy(Base):
    __tablename__ = "policies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    plan_name: Mapped[str] = mapped_column(String(50), nullable=False)
    premium: Mapped[float] = mapped_column(Float, nullable=False)  # weekly premium
    coverage: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default=PolicyStatus.INACTIVE.value)
    next_billing_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    auto_renew: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped[User] = relationship(back_populates="policies")


class Claim(Base):
    __tablename__ = "claims"

    # "id" doubles as "claim_id" for the demo.
    id: Mapped[str] = mapped_column(String(40), primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    trigger_type: Mapped[str] = mapped_column(String(30), nullable=False)  # e.g. RAIN
    status: Mapped[str] = mapped_column(String(30), nullable=False, default=ClaimStatus.PENDING.value)
    payout_amount: Mapped[float | None] = mapped_column(Float, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped[User] = relationship(back_populates="claims")

