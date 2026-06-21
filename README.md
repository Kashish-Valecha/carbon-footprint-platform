# 🌍 EcoSense — Know Before You Go

> A Carbon Footprint Awareness Platform that shows you the environmental cost of your decisions **before** you make them.

---

## Chosen Vertical
**Challenge 3 — Carbon Footprint Awareness Platform**

Individual carbon footprint tracker focused on **proactive awareness** — not reactive logging. The core idea: intercept decisions at the point of action (booking a trip, ordering food) rather than after the fact.

---

## Approach & Logic

Most carbon awareness tools show you what you *already did*. EcoSense is built around a different model:

**Before you book a flight** → see that it emits 6x more CO2 than the train  
**Before you order** → see that swapping chicken biryani for veg saves 2.3 kg CO2  
**Every day** → your choices accumulate into a streak and grade that make the habit stick

The gamification layer (streaks, green points, grades) is intentional — awareness alone doesn't change behavior, but a Duolingo-style streak system creates a daily return habit and makes low-carbon choices feel rewarding.

---

## How the Solution Works

**Architecture:**  
Full-Stack TypeScript — React + Vite (frontend) + Express.js + SQLite (backend), served on a single port (3000). Anthropic Claude API powers all AI insight responses.

### Features

- ** Dashboard & Gamification** — Weekly Earth Impact Meter, daily streaks, green points system, and an overall impact grade (A–D) benchmarked against the Indian average of 5.2 kg CO2/day
- ** Trip Impact Checker** — Compare carbon cost of flight vs train vs bus vs car between major Indian cities, with relatable equivalents (phones charged, trees needed, cooking gas days)
- ** Food Carbon Checker** — Calculate the footprint of your meal and get a Smart Swap suggestion that saves CO2 without sacrificing the meal
- ** Daily Activity Log** — Log transport, meals, and electricity usage in one place; instantly updates your dashboard streak and points
- ** AI Insights** — Every action triggers a contextual, conversational, non-preachy insight powered by Anthropic Claude

### Emission Calculations

| Category | Item | Factor |
|----------|------|--------|
| Transport | Flight | 0.255 kg CO2/km |
| Transport | Car | 0.21 kg CO2/km |
| Transport | Bus | 0.089 kg CO2/km |
| Transport | Train | 0.041 kg CO2/km |
| Food | Chicken biryani | 3.1 kg CO2/serving |
| Food | Mutton curry | 5.4 kg CO2/serving |
| Food | Veg biryani | 0.8 kg CO2/serving |
| Food | Dal | 0.4 kg CO2/serving |
| Electricity | India grid | 0.82 kg CO2/kWh |

### Gamification Logic

- Green points awarded based on how far below the Indian daily average (5.2 kg) your choices land
- Earth Damage Meter = (your weekly avg / Indian avg) × 100
- Grade A: <40% · Grade B: 40–70% · Grade C: 70–100% · Grade D: >100%
- Streak resets if no log is recorded for a day

### AI Layer

Each feature passes the user's actual numbers (not generic data) to Claude with a system prompt instructing it to give short, conversational, non-preachy insights with one specific actionable alternative. Max 3 sentences per response.

---

## Assumptions Made

- City-to-city distances are approximated from standard road/air route data for top Indian city pairs
- Food emission factors are per serving estimates based on published lifecycle assessment averages
- Indian electricity grid emission factor: 0.82 kg CO2/kWh (Central Electricity Authority 2022 data)
- Indian average carbon footprint: 1.9 tonnes/year ≈ 5.2 kg/day (World Bank 2022)
- No user authentication — all data is stored locally in SQLite per session

---

## Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Backend:** Express.js + SQLite
- **AI:** Anthropic Claude (claude-sonnet-4-20250514)
- **Testing:** Jest + Supertest
- **Styling:** Tailwind CSS

---

## Security

- Helmet.js for HTTP security headers
- Rate limiting on all API routes (10 AI requests/min)
- Input validation and sanitization on all endpoints
- Parameterized SQL queries throughout
- Environment variable validation on startup

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/Kashish-Valecha/carbon-footprint-platform.git
cd carbon-footprint-platform

# Install dependencies
npm install

# Add your API key
echo 'ANTHROPIC_API_KEY=your_key_here' > .env

# Start the app
npm run dev

# Open browser
http://localhost:3000
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
ANTHROPIC_API_KEY=your_key_here
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trip` | Accepts `{ origin, destination, mode }` → returns CO2 comparison for all modes + Claude insight |
| POST | `/api/food` | Accepts `{ items: string[] }` → returns total CO2, swap suggestion + Claude insight |
| POST | `/api/log` | Records `{ date, transport_mode, distance_km, meals_json, electricity_kwh }` |
| GET | `/api/dashboard` | Returns streak, earth meter %, weekly grade, green points, AI summary |
| GET | `/api/history` | Returns last 30 daily logs |

---

## Testing

The application includes a comprehensive test suite covering core business logic, API validation, and gamification rules.

```bash
# Run all tests
npm run test

# Run in watch mode during development
npm run test:watch
```

Tests included:

- **tests/calculator.test.ts** — Verifies emission factor calculations across all transport modes, food items, electricity, and edge cases
- **tests/api.test.ts** — Verifies API endpoints for trip, food, dashboard, and daily logs, including status codes and error handling
- **tests/gamification.test.ts** — Tests green points allocation, streak management (including reset rules), weekly grade logic (A/B/C/D), and Earth Damage meter calculation

---

## Note on Architecture

The initial prompt requested a Next.js frontend with a Python FastAPI backend. Due to Google AI Studio's containerized constraints requiring a single externally-accessible port (3000) and preferring unified configurations, the application was adapted into a Full-Stack TypeScript architecture using React + Vite and Express.js + SQLite. All requested behaviors, calculations, and endpoints are retained identically.
