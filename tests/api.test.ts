import request from 'supertest';
import { createServerApp } from '../server';
import { db } from '../server/db';
import { generateToken } from '../server/auth';

let app;
let token;

beforeAll(async () => {
  app = await createServerApp();
  
  // Register a mock user for tests
  const info = db.prepare(`
    INSERT INTO users (full_name, email, hashed_password)
    VALUES (?, ?, ?)
  `).run("Test User", "test@test.com", "mock_hash");
  
  const userId = Number(info.lastInsertRowid);
  db.prepare("INSERT INTO streaks_v2 (user_id) VALUES (?)").run(userId);
  db.prepare("UPDATE users SET is_verified = 1 WHERE id = ?").run(userId);
  
  token = generateToken(userId);
});

afterAll(() => {
  db.prepare("DELETE FROM users WHERE email = 'test@test.com'").run();
});

describe('API Routes', () => {
  it('POST /api/trip with valid city pairs returns correct structure', async () => {
    const res = await request(app)
      .post('/api/trip')
      .set('Authorization', `Bearer ${token}`)
      .send({ origin: 'Delhi', destination: 'Mumbai', mode: 'flight' });
      
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('distance');
    expect(res.body).toHaveProperty('selectedCo2');
    expect(res.body).toHaveProperty('comparisons');
  });

  it('POST /api/trip with same origin and destination returns error', async () => {
    const res = await request(app)
      .post('/api/trip')
      .set('Authorization', `Bearer ${token}`)
      .send({ origin: 'Delhi', destination: 'Delhi', mode: 'flight' });
      
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation failed');
  });

  it('POST /api/food with valid items returns total_co2, swap_suggestion, items array', async () => {
    const res = await request(app)
      .post('/api/food')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: ['Chicken biryani'] });
      
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalCo2');
    expect(res.body).toHaveProperty('swapSuggestion');
    expect(res.body).toHaveProperty('items');
  });

  it('POST /api/food with empty items returns error', async () => {
    const res = await request(app)
      .post('/api/food')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [] });
      
    expect(res.status).toBe(400);
  });

  it('POST /api/log saves correctly', async () => {
    const res = await request(app)
      .post('/api/log')
      .set('Authorization', `Bearer ${token}`)
      .send({
         date: new Date().toISOString(),
         transport_mode: 'car',
         distance_km: 10,
         meals_json: JSON.stringify(['Dal']),
         electricity_kwh: 5
      });
      
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalCo2');
    expect(res.body).toHaveProperty('points');
  });

  it('GET /api/dashboard returns all required fields', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`);
      
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('streak');
    expect(res.body).toHaveProperty('totalPoints');
    expect(res.body).toHaveProperty('earthMeterPercent');
    expect(res.body).toHaveProperty('weeklyGrade');
  });

  it('GET /api/history returns array of max 30 items', async () => {
    const res = await request(app)
      .get('/api/history')
      .set('Authorization', `Bearer ${token}`);
      
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeLessThanOrEqual(30);
  });
});
