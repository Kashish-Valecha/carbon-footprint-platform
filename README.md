# EcoSense

**"Know before you go"**

EcoSense is a full-stack Carbon Footprint Awareness Platform designed to help users understand the environmental cost of their decisions before they make them. 

## Features
- **Dashboard & Gamification**: A visual dashboard showcasing your Weekly Earth Impact Meter, daily streaks like Duolingo, and an overall impact grade. Earning "green points" incentivizes eco-friendly choices.
- **Trip Impact Checker**: Helps you evaluate transportation carbon costs between major Indian cities before you travel. Includes visual equivalents (phones charged, gas used, trees needed).
- **Food Carbon Checker**: Calculates the footprint of your meals and suggests actionable 'Smart Swaps' based on the highest CO2 items in your order.
- **Daily Activity Log**: A unified place to record transport, meals, and electricity usage, instantly reflecting in your impact dashboard.
- **AI Insights**: Every action provides contextual, conversational, and non-preachy carbon insights powered by Anthropic's Claude.

## AI Studio Adaptation
*Note:* The initial prompt requested a Next.js frontend with a Python FastAPI backend. However, due to the Google AI Studio containerized constraints requiring a single externally-accessible port (Port 3000) and preferring unified configurations, the application was adapted into a Full-Stack TypeScript architecture using **React + Vite** and **Express.js + SQLite**. It retains all requested behaviors, calculations, and endpoints identically.

## How Calculations Work
Calculations follow standard per-unit estimates:
- **Transport**: Distance between city origins is approximated.
  - Flight: 0.255 kg/km
  - Car: 0.21 kg/km
  - Bus: 0.089 kg/km
  - Train: 0.041 kg/km
- **Food**: Hardcoded estimates per serving. E.g. Chicken biryani is 3.1kg, whereas Veg biryani is 0.8kg.
- **Electricity**: Assumed grid emission factor of ~0.82 kg/hWh.

## Environment Variables
Create a file named \`.env\` in the root directory and add the following:
\`\`\`env
ANTHROPIC_API_KEY="your_key_here"
\`\`\`

## Running Locally outside AI Studio
1. Clone the project.
2. Ensure you have Node.js 18+ installed.
3. Install dependencies: \`npm install\`
4. Run the development server: \`npm run dev\`
5. Browse to \`http://localhost:3000\`

## API Endpoints
- \`POST /api/trip\` - Acccepts { origin, destination, mode }, returns detailed comparison & Claude insight.
- \`POST /api/food\` - Accepts { items: string[] }, returns total CO2, swap suggestion & insight.
- \`POST /api/log\` - Records { date, transport_mode, distance_km, meals_json, electricity_kwh }.
- \`GET /api/dashboard\` - Returns aggregated user stats such as streak, earth meter, and weekly grade.
- \`GET /api/history\` - Returns the last 30 daily logs.

## Screenshots
*(Add screenshots of your application here)*
