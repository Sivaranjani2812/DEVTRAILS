# Insuregig 🛡️
### *"Rain shouldn't stop your income"*
> AI-Powered Parametric Income Insurance for India's Q-Commerce Delivery Workers

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi)
![ML](https://img.shields.io/badge/ML-RandomForest-FF6F00?logo=scikit-learn)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38BDF8?logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql)

📁 **GitHub:** https://github.com/Sivaranjani2812/DEVTRAILS.git
🎥 **Demo Video:** [https://drive.google.com/drive/folders/1lEDu6X_4MenJtY6XLY5md9m8G0bDstFd](https://drive.google.com/file/d/1Sqhzju9Q-xfezIAwXmsIdnvbMWG75Noi/view?usp=drivesdk)

---

### 🚀 Phase 2 Submission Highlights
- **Premium Light Theme**: Overhauled the entire UI for better readability under outdoor glare (real-world use case for delivery workers).
- **Mandatory Logic**: 
    - [x] **Coverage Exclusions**: Explicitly ungated on the [Policy Page](file:///frontend/src/pages/Policy/index.tsx).
    - [x] **Actuarial Modeling**: Integrated into the [Premium Calculator](file:///frontend/src/pages/PremiumCalculator/index.tsx).
    - [x] **Regulatory Compliance**: Documentation provided for IRDAI Sandbox eligibility.
- **Improved UX**: New global `Navbar` with logout and simplified onboarding.

---

## 📌 Table of Contents
1. [The Problem](#the-problem)
2. [Our Persona](#our-persona)
3. [Our Solution](#our-solution)
4. [How It Works](#how-it-works)
5. [Parametric Triggers](#parametric-triggers)
6. [Weekly Premium Model](#weekly-premium-model)
7. [AI/ML Integration Plan](#aiml-integration-plan)
8. [Fraud Detection](#fraud-detection)
9. [Adversarial Defense](#adversarial-defense--anti-spoofing-strategy)
10. [Why Web App](#why-web-application)
11. [Tech Stack](#tech-stack)
12. [6-Week Plan](#6-week-development-plan)
13. [Team](#team)

---

## 🔴 The Problem

India's Q-Commerce delivery workers on **Zepto, Blinkit, and Swiggy Instamart** lose ₹400–700 every day disruptions hit — rain, floods, heat, curfews, platform outages. They have no protection. When it rains, platforms stop sending orders immediately. Workers sit and watch income disappear.

| Fact | Data |
|---|---|
| Income lost per rain day | ₹400–700 |
| Income lost per monsoon season | ₹6,000–12,000 |
| Existing payout speed (SEWA) | 6–8 weeks |
| Products built for Q-commerce workers | **Zero** |

**Why Q-commerce workers are more vulnerable than food delivery:**
- 10-minute SLA means even 20mm rain halts all orders instantly — no waiting it out
- Fixed dark store zones — cannot move to another area unlike food delivery workers
- One disruption kills Zepto + Blinkit + Instamart income simultaneously
- Platform app outages = zero orders even in perfect weather — nobody covers this

> There is no product for India's Q-commerce delivery workers. **Insuregig builds it.**

---

## 👤 Our Persona

We chose **Q-Commerce delivery partners** because they are the most financially vulnerable and most completely ignored delivery category. Their fixed dark stores, 10-minute SLAs, and multi-platform dependency make our AI more accurate, our triggers more precise, and our fraud detection more reliable than for any other persona.

### Meet Arjun

| Detail | Info |
|---|---|
| Age / City | 22 · Bangalore |
| Platforms | Zepto, Blinkit, Swiggy Instamart |
| Dark Stores | HSR Layout, Koramangala, BTM Layout |
| Weekly Earnings | ₹3,500–4,500 across all platforms |
| Savings | Less than ₹2,000 |
| Phone | Cheap Android · Kannada default language |

**Without Insuregig:** Rain hits at 3pm. All three platforms stop orders. Arjun sits outside the dark store and loses ₹600. This happens 15–20 times every monsoon. ₹12,000 gone. No safety net.

**With Insuregig:** Rain detected at 3:05pm. Claim auto-created. Fraud check runs. ₹500 credited to his UPI by 3:06pm. Arjun did nothing.

---

## 💡 Our Solution

Insuregig is a **mobile-responsive web application** providing AI-enabled parametric income insurance for Q-commerce workers. Workers pay ₹49–149/week. Our system monitors 6 disruption triggers 24/7. When a trigger fires, claims are created and paid automatically — under 60 seconds, zero worker action.

| Feature | Existing Solutions | Insuregig |
|---|---|---|
| Payout Speed | 6–8 weeks | Under 60 seconds ⚡ |
| Triggers Covered | Heat only | 6 disruption types |
| AI Pricing | None | ML-powered personalised |
| Fraud Detection | None | 5-layer AI system |
| Platform Outage Coverage | No | Yes — unique to Insuregig |
| Language Support | English only | Tamil, Hindi, Kannada, Telugu, English |
| Pricing Model | Annual flat fee | Weekly — matches gig cycle |
| Budget Awareness | No | ML respects worker budget |

---

## 🔄 How It Works

**Step 1 — Smart Onboarding (3 mins)**
Worker answers 13 questions across 5 screens. ML model pulls 2 years of dark store zone weather history, combines it with all answers, generates a risk score (0–100), and recommends a weekly plan within their budget.

**Step 2 — Shift Check-In (daily)**
Worker taps "Start Shift" and selects their dark store. Coverage activates. Insuregig monitors weather, traffic, news, and platform status every 30 minutes silently in the background.

**Step 3 — Automatic Payout**
Disruption detected → claim auto-created → 5-layer fraud check (under 5 secs) → UPI payout sent → worker notified in their language. Under 60 seconds. Worker does nothing.

**Step 4 — Weekly Renewal**
Every Sunday midnight — premium auto-deducted. Every Monday morning — personalised 7-day risk forecast sent in worker's language.

---

## ⚡ Parametric Triggers

All thresholds tuned specifically for Q-commerce. Rain threshold is 20mm not 50mm — even moderate rain kills a 10-minute SLA.

| # | Trigger | Condition | Detection | Payout |
|---|---|---|---|---|
| 1 | 🌧️ Rain | ≥ 20mm in dark store zone | OpenWeatherMap + Open-Meteo | ₹400–700 |
| 2 | 🌊 Flood | Official alert OR ≥ 80mm | NDMA RSS + IMD | ₹700 |
| 3 | 🌡️ Heat | ≥ 45°C (10am–5pm only) | OpenWeatherMap | ₹300 |
| 4 | 😷 Pollution | AQI ≥ 300 | OpenWeatherMap + IQAir | ₹250 |
| 5 | 🚫 Zone Shutdown | Confidence score > 60 | NewsAPI + TomTom Traffic | ₹500 |
| 6 | 📱 App Outage | Platform status = outage | Mock Platform API | ₹300 |

**Trigger 6 is unique to Insuregig.** No existing insurance covers platform outages. Zone shutdown uses 3-layer confidence scoring — NewsAPI (+40) + TomTom empty roads (+40) + government alert (+20). Fires only above 60.

**Not covered:** Health · accidents · vehicle repairs · life insurance · non-shift hours · outside registered zone.

---

## 💰 Weekly Premium Model

**Why weekly?** Q-commerce workers earn day by day. ₹89/week feels manageable. ₹356/month feels like a luxury. Same amount — completely different psychology.

### 13 Questions ML Uses

| # | Question | ML Uses It For |
|---|---|---|
| 1–3 | Name, phone, city | Account + dark store lookup |
| 4 | Platforms active | Multi-platform exposure scoring |
| 5 | Dark store zones | Core input — 2yr weather history per zone |
| 6 | Days worked/week | Exposure frequency |
| 7 | Shift timing | Night shift risk multiplier |
| 8 | Weekly income | Coverage calibration |
| 9 | Weekly budget | Budget constraint for recommendation |
| 10 | Savings level | Financial vulnerability score |
| 11 | Disruption frequency | Validates zone data |
| 12 | Past disruption types | Trigger relevance scoring |
| 13 | UPI ID | Instant payout destination |

### Premium Calculation
```
Zone weather (rain 35% + flood 25% + heat 15% + AQI 10% + social 15%)
+ worker answers (zone 25% · shift 15% · savings 20% · disruption 20% · other 20%)
→ Risk score 0–100
→ LOW (0–30) = ₹49 · MEDIUM (31–65) = ₹89 · HIGH (66–100) = ₹149/week
→ If recommended price > budget → show best plan within budget with explanation
```

### The 3 Plans

| | Basic 🟢 | Standard ⭐ | Premium 💎 |
|---|---|---|---|
| Weekly Premium | ₹49 | ₹89 | ₹149 |
| Max Coverage | ₹1,500 | ₹3,000 | ₹5,000 |
| Rain + Heat | ✅ | ✅ | ✅ |
| Flood + AQI | ❌ | ✅ | ✅ |
| Shutdown + Outage | ❌ | ✅ | ✅ |
| Night Shift Bonus | ❌ | ❌ | +20% payout |
| Weekly Forecast | ❌ | ✅ | ✅ |
| Family Notification | ❌ | ❌ | ✅ |

**Safe Rider Reward:** 4 claim-free weeks → 10% premium discount automatically.
**Dynamic Adjustment:** 4+ high-risk days predicted → premium +20% that week only. Worker notified in advance, can opt out.

---

## 🤖 AI/ML Integration Plan

### Component 1 — ML Risk Scorer
**Model:** Random Forest Regressor · **Libraries:** scikit-learn, pandas, numpy
**Data:** Open-Meteo Historical API (2 years, completely free, no API key)

Pulls weather history for each dark store's exact GPS coordinates. Counts disruption days. Combines with 13 onboarding answers using weighted scoring. Outputs risk score → weekly premium. Phase 1: rule-based scoring. Phase 2–3: trained Random Forest.

### Component 2 — Fraud Detector
**Model:** Rule-based scoring + Isolation Forest · **Library:** scikit-learn

| Layer | Check | Points if Failed |
|---|---|---|
| 1 | Disruption in worker's registered zone? | +40 |
| 2 | Worker on active shift at disruption time? | +25 |
| 3 | Already claimed same event today? | +20 |
| 4 | Isolation Forest — abnormal claim frequency? | +15 |
| 5 | Only 1 worker claiming from zone = suspicious | +10 |

Score < 30 → Auto Approve ✅ · Score 30–60 → Manual Review ⚠️ · Score > 60 → Auto Reject ❌

### Component 3 — Weekly Risk Forecast
**Tool:** Open-Meteo 7-day forecast API + risk classification

Every Monday 8am — forecast pulled per dark store zone. Each day classified LOW/MEDIUM/HIGH. Sent in worker's language via Firebase FCM + Google TTS audio.

### Component 4 — Dynamic Premium Adjustment
**Type:** Rule-based with forecast integration

4+ HIGH-risk days predicted → premium +20% that week only. Worker notified 7 days in advance, can opt out. Keeps Insuregig sustainable during monsoon season.

---

## 🔍 Fraud Detection

```
Claim auto-created
        ↓
L1: Disruption in worker's registered dark store zone?
        ↓
L2: Worker on active shift at disruption time?
        ↓
L3: Already claimed this event today? → block
        ↓
L4: Isolation Forest — is claim frequency abnormal?
        ↓
L5: Multi-worker check — are others in same dark store claiming?
    20 workers same zone → real disruption confirmed ✅
    Only 1 worker claiming → suspicious 🚩
        ↓
Score < 30 → Auto Approve → Payout ⚡
Score 30–60 → Manual Review
Score > 60 → Auto Reject + reason sent
```

---

## 🚨 Adversarial Defense & Anti-Spoofing Strategy

> **Threat:** 500 delivery workers organized via Telegram using GPS-spoofing apps to fake locations inside red-alert weather zones, triggering mass false payouts and draining the liquidity pool instantly.

### 1. The Differentiation
*How Insuregig tells a genuinely stranded worker from a bad actor*

A genuine stranded worker has a **history**. A fraud account has **only a claim**.

| Signal | Real Worker | Fraud Account |
|---|---|---|
| GPS movement | Realistic home → route → dark store | Teleports 1,400km in under 1 minute |
| GPS velocity | Max 40–60 km/hr (riding) | Physically impossible speed |
| Shift check-in time | Hours before rain started | Exactly when rain trigger fired |
| Account age | Weeks or months of history | Created days ago — first action is a claim |
| Platform order activity | Real orders received before disruption | Zero order history |
| Premium history | Paid weekly for multiple weeks | Paid once then immediately claimed |

**The core insight:** Real workers check in at 7am. They don't know it will rain at 3pm. Fraud accounts check in at 3:01pm — exactly when the trigger fires. That timing gap is the clearest signal in our system.

### 2. The Data
*Specific data points beyond basic GPS coordinates*

- **GPS behavioral analysis** — velocity between pings, movement trajectory, GPS accuracy score (spoofed GPS reports suspiciously perfect coordinates with zero natural drift)
- **Device intelligence** — device fingerprint ID, IP subnet. 500 accounts sharing 12 device IDs = ring confirmed. SIM binding enforced.
- **Temporal patterns** — check-in timestamp vs disruption start, account creation vs first claim, millisecond submission timestamps (500 simultaneous = bot coordinated)
- **Behavioral history** — total shifts logged, deliveries completed, login frequency, claim-to-shift ratio over account lifetime
- **Network graph** — map account relationships in a burst, identify shared device IDs, detect ring leader as network hub
- **Multi-worker corroboration** — real disruptions create zone-clustered claims. Fraud rings create city-wide simultaneous claims across unrelated zones. The geographic pattern itself is the evidence.

### 3. The UX Balance
*Handling flagged claims without penalizing honest workers*

Insuregig uses a **Hold-not-Reject** policy. We never permanently reject without human review.

| Tier | Fraud Score | Action | Worker Experience |
|---|---|---|---|
| Auto Approve | Under 30 | Paid immediately | Normal — under 60 secs |
| Silent Hold | 30–50 | Held max 2 hours · auto-verified | Sees "processing" — never told they were suspected |
| Manual Review | 50–70 | Admin reviews within 4 hours | Notified "claim under review" |
| Auto Reject | Above 70 | Rejected + account suspended | Notified with reason + appeal process |

A genuine worker with a momentary GPS signal drop has weeks of shift history and a consistent behavioral profile. Their fraud score will be near zero. We penalize the **pattern of fraud** — not the imperfection of a real worker's signal.

**Why Insuregig was already resistant before this attack:**
- Shift check-in happens before the disruption — a ring cannot retroactively fake it
- Weekly premium history — new accounts that pay once and immediately claim are auto-flagged
- Multi-worker corroboration — 500 accounts claiming city-wide simultaneously is the opposite of a real localized disruption

The syndicate defeats simple GPS checks. It does not defeat behavioral history, device fingerprinting, temporal analysis, and corroboration running simultaneously.

---

## 🌐 Why Web Application

1. **Team expertise** — React + Python FastAPI. Polished web app beats unfinished native app in 6 weeks.
2. **Dual-user** — workers on mobile, admins on desktop. One platform, one codebase.
3. **Zero friction** — no app download. Worker opens a WhatsApp link and onboards in 3 minutes.
4. **Any Android browser** — no minimum OS, no storage required.
5. **Demo-ready** — judges access instantly via any browser.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 + Vite + TailwindCSS | Mobile-responsive UI |
| Multilingual | react-i18next | Tamil, Hindi, Kannada, Telugu, English |
| Maps | Leaflet.js | Dark store zone visualization |
| Charts | Recharts | Admin analytics |
| Backend | Python FastAPI + Uvicorn | REST API |
| Scheduler | APScheduler | Trigger checks every 30 mins |
| Database | PostgreSQL (Supabase) | Workers, policies, claims, payouts |
| Cache | Redis (Upstash) | Weather API response caching |
| Auth | Firebase Auth | Phone OTP login |
| ML | scikit-learn + pandas + numpy | Risk scorer + fraud detector |
| Weather | OpenWeatherMap + Open-Meteo | Current + historical + forecast (free) |
| Alerts | NDMA RSS + IMD + NewsAPI + TomTom | Flood + shutdown detection |
| Payments | Razorpay test mode | UPI payout simulation |
| Notifications | Firebase FCM + Google TTS | Push + audio in regional language |
| Hosting | Vercel + Render + Supabase + Upstash | All free tier |

---

## 📅 6-Week Development Plan

### Phase 1 — Seed (Weeks 1–2) · March 20
React prototype · FastAPI mock endpoints · mock weather API · demo control panel · README · video

| Task | Owner | Status |
|---|---|---|
| GitHub repo + architecture | Sivaranjani | ✅ Done |
| Landing page + Onboarding UI | Rakshiga | 🔄 In Progress |
| Worker Dashboard + Policy UI | Subhiksha | ✅ Done |
| FastAPI endpoints (mock data) | Sivaranjani | 🔄 In Progress |
| Mock weather + trigger engine | Subhiksha | ⏳ Pending |
| README + Demo video | Bhavana Sai + All | ✅ Done |

### Phase 2 — Scale (Weeks 3–4) · April 4
✅ **COMPLETED**
- **Premium Light Theme**: Standardized the system on a high-contrast, professional light-mode aesthetic (#F8FAFC).
- **Consolidated Onboarding**: Unified the registration flow into a seamless, 4-step wizard.
- **Simplified Backend API**: Added `register-simple` endpoints for faster frontend-to-backend integration.
- **Judging Criteria Implementation**:
    - **Coverage Exclusions**: Explicitly listed (Force Majeure, Personal Injury, etc.).
    - **Actuarial Modeling**: Showcased the math behind the risk scores and loss-ratio sustainability.
    - **Regulatory Strategy**: Documented compliance with IRDAI Sandbox and DPDP Act.

### Phase 3 — Soar (Weeks 5–6) · April 17
⏳ **PENDING**
Isolation Forest · admin dashboard · zone map · all 5 languages · audio alerts · weekly forecast · final video + pitch deck

---

## 👥 Team

| Member | Role | Responsibilities |
|---|---|---|
| Sivaranjani | Backend Lead | FastAPI, PostgreSQL, APIs, APScheduler, Razorpay |
| Rakshiga | Frontend Lead | Landing, Onboarding, Dashboard, Policy, Video |
| Subhiksha | AI/ML + Frontend | Risk Scorer, Fraud Detector, Weather API, Admin UI |
| Bhavana Sai | Product + Frontend | Claims page, Analytics, Multilingual, README |

**University:** Shiv Nadar University, Chennai
**Hackathon:** Guidewire DEVTrails 2026 — Unicorn Chase
**Persona:** Q-Commerce Delivery Partners (Zepto, Blinkit, Swiggy Instamart)

---

## 💬 One Paragraph Summary

Insuregig is an AI-powered parametric income insurance platform built specifically for India's Q-commerce delivery workers on Zepto, Blinkit, and Swiggy Instamart. Workers complete a 13-question smart onboarding in their regional language and our ML model combines their answers with 2 years of dark store zone weather history to calculate a personalised weekly premium starting at ₹49/week, always respecting the worker's stated budget. The moment any of our 6 disruption triggers fires — heavy rain, flood, extreme heat, severe pollution, zone shutdown, or platform app outage — a claim is created automatically, passes through our 5-layer AI fraud detection system, and money is credited to the worker's UPI in under 60 seconds. The worker does nothing. Existing solutions like SEWA take 6–8 weeks to pay out and cover heat only. Insuregig delivers in 60 seconds and covers 6 disruption types — including platform outages, which no insurance product on earth currently covers.

---

*Built with ❤️ for India's Q-Commerce delivery workers | Guidewire DEVTrails 2026*
