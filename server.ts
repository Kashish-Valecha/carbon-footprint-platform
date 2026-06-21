import express from "express";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import bcrypt from "bcryptjs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { db } from "./server/db";
import { generateToken, requireAuth, AuthRequest } from "./server/auth";

import { body, validationResult } from "express-validator";

const requiredEnv = ['ANTHROPIC_API_KEY'];
requiredEnv.forEach(key => {
  if (process.env.NODE_ENV !== 'test' && !process.env[key]) {
    console.warn(`Missing required environment variable: ${key}`);
    // Not safely exiting to keep applet running if purely testing
  }
});

let anthropic: Anthropic | null = null;
if (process.env.ANTHROPIC_API_KEY) {
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// Calculation constants
export const EMISSION_FACTORS = {
  transport: { flight: 0.255, car: 0.21, bus: 0.089, train: 0.041 },
  food: {
    "Chicken biryani": 3.1, "Mutton curry": 5.4, "Egg curry": 1.2, 
    "Paneer curry": 1.0, "Veg biryani": 0.8, "Dal": 0.4, 
    "Pizza (cheese)": 2.1, "Veg pizza": 1.1, "Burger (chicken)": 2.8, "Veg burger": 0.9,
  }
};

export const CITY_DISTANCES: Record<string, number> = {
  "Delhi-Mumbai": 1414, "Delhi-Bangalore": 2150, "Mumbai-Chennai": 1333, "Delhi-Chennai": 2184,
  "Mumbai-Bangalore": 984, "Bangalore-Chennai": 346, "Delhi-Kolkata": 1490, "Mumbai-Kolkata": 2050,
  "Bangalore-Hyderabad": 569, "Delhi-Hyderabad": 1566,
  "Mumbai-Delhi": 1414, "Bangalore-Delhi": 2150, "Chennai-Mumbai": 1333, "Chennai-Delhi": 2184,
  "Bangalore-Mumbai": 984, "Chennai-Bangalore": 346, "Kolkata-Delhi": 1490, "Kolkata-Mumbai": 2050,
  "Hyderabad-Bangalore": 569, "Hyderabad-Delhi": 1566,
};

export async function getClaudeInsight(prompt: string): Promise<string> {
  if (!anthropic) return "AI insight disabled. Please configure Anthropic API Key.";
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 150,
      system: "You are EcoSense, a friendly carbon footprint advisor. You give short, conversational, non-preachy insights about carbon impact. Always suggest one specific actionable alternative. Use relatable comparisons. Max 3 sentences. Never use bullet points in responses.",
      messages: [{ role: "user", content: prompt }],
    });
    // @ts-ignore
    return response.content[0].text;
  } catch (error: any) {
    console.error("Error calling Anthropic API:", error.message);
    return "Couldn't fetch insight at the moment. (API error)";
  }
}

export function getEquivalents(co2Kg: number) {
  return {
    cookingDays: (co2Kg / 0.5).toFixed(1),
    phoneCharges: Math.round(co2Kg / 0.008),
    treesAbsorbed: (co2Kg / 21).toFixed(2),
  };
}

// Logic for Achievements
export function checkAchievements(userId: number, currentPoints: number, streak: number) {
  const evaluate = (name: string, condition: boolean) => {
    if (condition) {
      try {
        db.prepare("INSERT OR IGNORE INTO achievements (user_id, achievement_name) VALUES (?, ?)").run(userId, name);
      } catch(e) {} // unique constraint fails safely
    }
  };

  evaluate("First Log", true);
  evaluate("3 Day Streak", streak >= 3);
  evaluate("7 Day Streak", streak >= 7);
  evaluate("30 Day Streak", streak >= 30);
  evaluate("100 Green Points", currentPoints >= 100);
  evaluate("500 Green Points", currentPoints >= 500);
  evaluate("Earth Hero", currentPoints >= 1000);
}

const validateInput = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: "Validation failed", details: errors.array() });
  }
  next();
};

export async function createServerApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false })); // Disabled CSP to allow Vite Dev scripts
  app.use(cors());
  app.use(express.json());

  const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: "Too many requests" } });
  const aiLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: 'Too many AI requests, slow down' } });

  app.use(generalLimiter);
  app.use('/api/trip', aiLimiter);
  app.use('/api/food', aiLimiter);
  app.use('/api/dashboard', aiLimiter);

  // --- Auth Routes ---
  app.post("/api/auth/register", 
    [
      body('fullName').isString().notEmpty().trim(),
      body('email').isEmail().normalizeEmail(),
      body('phone_number').optional().isString(),
      body('password').isString().isLength({ min: 6 }),
      body('city').isString().notEmpty().trim(),
      body('country').isString().notEmpty().trim()
    ],
    async (req: any, res: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { fullName, email, phone_number, password, city, country } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertUser = db.prepare(`
        INSERT INTO users (full_name, email, phone_number, hashed_password, city, country)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const info = insertUser.run(fullName, email, phone_number || null, hashedPassword, city, country);
      const userId = Number(info.lastInsertRowid);

      // Create streak record
      db.prepare("INSERT INTO streaks_v2 (user_id) VALUES (?)").run(userId);

      // Create OTP (Mock implementation sending a fixed 123456 code)
      const otpCode = "123456";
      const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();
      db.prepare("INSERT INTO otp_verification (user_id, otp_code, expires_at) VALUES (?, ?, ?)").run(userId, otpCode, expiresAt);
      
      // MOCK Email send
      console.log(`Sending OTP ${otpCode} to ${email}`);

      res.status(201).json({ message: "Registration successful. Please verify OTP.", userId });
    } catch (e: any) {
      if (e.message.includes('UNIQUE constraint failed')) {
        res.status(400).json({ error: "Email already registered" });
      } else {
        res.status(400).json({ error: e.message });
      }
    }
  });

  app.post("/api/auth/verify-otp", 
    [
      body('userId').isInt(),
      body('code').isString().notEmpty().trim()
    ],
    (req: any, res: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { userId, code } = req.body;
      const otpRec = db.prepare("SELECT * FROM otp_verification WHERE user_id = ? AND otp_code = ? ORDER BY created_at DESC LIMIT 1").get(userId, code) as any;
      
      if (!otpRec) return res.status(400).json({ error: "Invalid OTP" });
      if (new Date(otpRec.expires_at) < new Date()) return res.status(400).json({ error: "OTP expired" });

      db.prepare("UPDATE users SET is_verified = 1 WHERE id = ?").run(userId);
      db.prepare("DELETE FROM otp_verification WHERE user_id = ?").run(userId);

      const token = generateToken(userId);
      res.json({ token, message: "Verified successfully!" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/login", 
    [
      body('email').isEmail().normalizeEmail(),
      body('password').isString().notEmpty()
    ],
    async (req: any, res: any) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
      if (!user) return res.status(400).json({ error: "Invalid credentials" });

      const match = await bcrypt.compare(password, user.hashed_password);
      if (!match) return res.status(400).json({ error: "Invalid credentials" });

      if (user.is_verified === 0) return res.status(403).json({ error: "Please verify your account first", userId: user.id });

      const token = generateToken(user.id);
      res.json({ token, user: { id: user.id, name: user.full_name, email: user.email } });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  
  app.get("/api/profile", requireAuth, (req: AuthRequest, res) => {
    try {
      const user = db.prepare("SELECT id, full_name, email, city, country, profile_picture, green_points FROM users WHERE id = ?").get(req.user!.id);
      const streak = db.prepare("SELECT current_streak, longest_streak FROM streaks_v2 WHERE user_id = ?").get(req.user!.id);
      const achievements = db.prepare("SELECT achievement_name, earned_at FROM achievements WHERE user_id = ?").all(req.user!.id);
      
      res.json({ ...user, streak, achievements });
    } catch(e:any) {
       res.status(500).json({error: e.message});
    }
  });

  // --- Core API Routes ---

  app.post("/api/trip", requireAuth,
    [
      body('origin').isString().notEmpty().isLength({ max: 100 }),
      body('destination').isString().notEmpty().isLength({ max: 100 }).custom((value, { req }) => {
        if (value === req.body.origin) throw new Error("origin and destination must not be equal");
        return true;
      }),
      body('mode').isString().notEmpty(),
    ],
    validateInput as any,
    async (req: AuthRequest, res: express.Response) => {
    try {
      const { origin, destination, mode } = req.body;
      const key = `${origin}-${destination}`;
      const distance = CITY_DISTANCES[key] || 1000;
      
      const modes = ["flight", "car", "bus", "train"];
      const comparisons = modes.map(m => {
        const factor = EMISSION_FACTORS.transport[m as keyof typeof EMISSION_FACTORS.transport];
        return { mode: m, co2: parseFloat((distance * factor).toFixed(2)) };
      });

      const selectedCo2 = comparisons.find(m => m.mode === mode)?.co2 || 0;
      const equivalents = getEquivalents(selectedCo2);
      const greenestOption = comparisons.reduce((prev, current) => (prev.co2 < current.co2) ? prev : current);

      const prompt = `A user is traveling ${distance}km from ${origin} to ${destination} by ${mode}. CO2: ${selectedCo2}kg. Insight?`;
      const insight = await getClaudeInsight(prompt);

      res.json({ distance, selectedCo2, comparisons, equivalents, greenestOption, insight });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/food", requireAuth,
    [
      body('items').isArray({ min: 1, max: 20 }),
      body('items.*').isString(),
    ],
    validateInput as any,
    async (req: any, res: express.Response) => {
    try {
      const { items } = req.body;
      let totalCo2 = 0;
      let worstItem = { name: "", co2: 0 };
      for (const item of items) {
        const factor = (EMISSION_FACTORS.food as any)[item] || 0;
        totalCo2 += factor;
        if (factor > worstItem.co2) worstItem = { name: item, co2: factor };
      }
      
      totalCo2 = parseFloat(totalCo2.toFixed(2));
      let swapSuggestion = "";
      if (worstItem.name === "Chicken biryani") swapSuggestion = "Switch to Veg biryani, saves 2.3kg CO2";
      else if (worstItem.name === "Mutton curry") swapSuggestion = "Switch to Paneer curry, saves 4.4kg CO2";
      else if (worstItem.name === "Burger (chicken)") swapSuggestion = "Switch to Veg burger, saves 1.9kg CO2";
      else if (worstItem.name === "Pizza (cheese)") swapSuggestion = "Switch to Veg pizza, saves 1.0kg CO2";

      const insight = await getClaudeInsight(`User ordered ${items.join(", ")}. CO2 is ${totalCo2}kg. Insight?`);
      res.json({ totalCo2, swapSuggestion, worstItem, items, insight });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.post("/api/log", requireAuth,
    [
      body('transport_mode').optional({ nullable: true }).isIn(['car', 'bus', 'train', 'bike', 'flight']),
      body('distance_km').optional({ nullable: true }).isFloat({ min: 0, max: 10000 }),
      body('veg_meals').optional({ nullable: true }).isInt({ min: 0, max: 20 }),
      body('non_veg_meals').optional({ nullable: true }).isInt({ min: 0, max: 20 }),
      body('electricity_kwh').optional({ nullable: true }).isFloat({ min: 0, max: 1000 })
    ],
    validateInput as any,
    async (req: AuthRequest, res: express.Response) => {
    try {
      const { date, transport_mode, distance_km, meals_json, electricity_kwh } = req.body;
      let totalCo2 = 0; let points = 0;

      if (transport_mode && distance_km) {
        const tf = (EMISSION_FACTORS.transport as any)[transport_mode] || 0.2;
        totalCo2 += tf * distance_km;
        if (transport_mode === 'train' || transport_mode === 'bus') points += 10;
        else if (transport_mode === 'car' || transport_mode === 'flight') points -= 5;
      }

      let meals = [];
      try { meals = JSON.parse(meals_json); } catch (e) {}
      if (Array.isArray(meals)) {
        for (const item of meals) {
          const fv = (EMISSION_FACTORS.food as any)[item] || 0.5;
          totalCo2 += fv;
          if (fv < 1.0) points += 5; else if (fv > 2.0) points -= 5;
        }
      }

      if (electricity_kwh > 0) {
        totalCo2 += electricity_kwh * 0.82;
        if (electricity_kwh < 3) points += 5; else if (electricity_kwh > 10) points -= 10;
      }

      totalCo2 = parseFloat(totalCo2.toFixed(2));

      db.prepare(`
        INSERT INTO daily_logs_v2 (user_id, date, transport_mode, distance_km, meals_json, electricity_kwh, total_co2_kg, green_points)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(req.user!.id, date, transport_mode, distance_km, meals_json, electricity_kwh, totalCo2, points);

      db.prepare("UPDATE users SET green_points = green_points + ? WHERE id = ?").run(points, req.user!.id);
      
      const streakRow = db.prepare("SELECT current_streak, longest_streak, last_log_date FROM streaks_v2 WHERE user_id = ?").get(req.user!.id) as any;
      let newCurrent = streakRow ? streakRow.current_streak : 0;
      let newLongest = streakRow ? streakRow.longest_streak : 0;
      
      if (streakRow && streakRow.last_log_date) {
        const lastDate = new Date(streakRow.last_log_date);
        const currentDate = new Date(date);
        const diffDays = Math.ceil(Math.abs(currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)); 
        if (diffDays === 1) newCurrent += 1;
        else if (diffDays > 1) newCurrent = 1;
      } else { newCurrent = 1; }

      if (newCurrent > newLongest) newLongest = newCurrent;

      db.prepare("UPDATE streaks_v2 SET current_streak = ?, longest_streak = ?, last_log_date = ? WHERE user_id = ?")
        .run(newCurrent, newLongest, date, req.user!.id);

      // Achievements Check
      const updatedUser = db.prepare("SELECT green_points FROM users WHERE id = ?").get(req.user!.id) as any;
      checkAchievements(req.user!.id, updatedUser.green_points, newCurrent);

      res.json({ success: true, totalCo2, points, newCurrent });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/dashboard", requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = db.prepare("SELECT green_points FROM users WHERE id = ?").get(req.user!.id) as any;
      const streakRow = db.prepare("SELECT * FROM streaks_v2 WHERE user_id = ?").get(req.user!.id) as any;
      
      const last7Logs = db.prepare("SELECT total_co2_kg FROM daily_logs_v2 WHERE user_id = ? ORDER BY date DESC LIMIT 7").all(req.user!.id) as any[];
      let weeklyCo2 = 0;
      last7Logs.forEach(l => weeklyCo2 += l.total_co2_kg);
      
      const indianAvgWeekly = 36.4;
      const earthMeterPercent = Math.round((weeklyCo2 / indianAvgWeekly) * 100);
      
      let weeklyGrade = earthMeterPercent > 100 ? "D" : earthMeterPercent >= 70 ? "C" : earthMeterPercent >= 40 ? "B" : "A";

      let prompt = `User weekly carbon: ${weeklyCo2.toFixed(2)}kg (Avg ${indianAvgWeekly}kg), grade ${weeklyGrade}, earth meter ${earthMeterPercent}%. Short report card message.`;
      if (last7Logs.length === 0) prompt = "New user joined. Greet and encourage first log.";
      
      const insight = await getClaudeInsight(prompt);

      res.json({
        streak: streakRow?.current_streak || 0,
        longestStreak: streakRow?.longest_streak || 0,
        totalPoints: user.green_points || 0,
        earthMeterPercent, weeklyGrade, weeklyCo2: parseFloat(weeklyCo2.toFixed(2)), insight
      });
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/history", requireAuth, (req: AuthRequest, res) => {
    try {
       const logs = db.prepare("SELECT * FROM daily_logs_v2 WHERE user_id = ? ORDER BY date DESC LIMIT 30").all(req.user!.id);
       res.json(logs);
    } catch(e:any) { res.status(500).json({error:e.message}); }
  });

  app.get("/api/stats", requireAuth, (req: AuthRequest, res) => {
    try {
      const logs = db.prepare("SELECT date, total_co2_kg FROM daily_logs_v2 WHERE user_id = ? ORDER BY date ASC LIMIT 30").all(req.user!.id) as any[];
      const formatted = logs.map(l => ({ name: l.date, emissions: Math.round(l.total_co2_kg) }));
      res.json(formatted);
    } catch (e:any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/leaderboard", (req, res) => {
    try {
      // Global Leaderboard
      const rows = db.prepare(`
        SELECT u.id, u.full_name, u.city, u.profile_picture, u.green_points, s.current_streak
        FROM users u 
        LEFT JOIN streaks_v2 s ON u.id = s.user_id
        ORDER BY u.green_points DESC LIMIT 50
      `).all();
      res.json(rows);
    } catch(e:any) { res.status(500).json({error: e.message}); }
  });

  app.get("/api/food-options", (req, res) => res.json(Object.keys(EMISSION_FACTORS.food)));
  app.get("/api/city-pairs", (req, res) => res.json(Object.keys(CITY_DISTANCES)));

  const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
  if (!isTest && process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV === "production" && !isTest) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  if (!isTest) {
    const PORT = process.env.PORT || 3000;
    // @ts-ignore
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }

  return app;
}

const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;
if (!isTestEnv) {
  createServerApp();
}
