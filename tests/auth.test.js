require('dotenv').config();
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../src/models/User');

const testUsername = `testuser_${Date.now()}`;

afterAll(async () => {
  await User.deleteOne({ username: testUsername });
  await mongoose.connection.close();
});

describe('POST /auth/register', () => {
  it('registers a new user and redirects to dashboard', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: testUsername, password: 'password123' });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/dashboard');
  });

  it('rejects a duplicate username', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ username: testUsername, password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.text).toContain('Username already taken');
  });
});

describe('POST /auth/login', () => {
  it('rejects invalid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'nobody', password: 'wrongpassword' });
    expect(res.status).toBe(200);
    expect(res.text).toContain('Invalid credentials');
  });

  it('logs in a valid user and redirects to dashboard', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: testUsername, password: 'password123' });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/dashboard');
  });
});

describe('Protected routes', () => {
  it('redirects unauthenticated users from /dashboard to /login', async () => {
    const res = await request(app).get('/dashboard');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });
});
