const request = require('supertest');
const app = require('../server');
const { connectDB, disconnectDB, clearDB } = require('./setup');
const User = require('../models/User');

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await clearDB();
});

const createUserAndToken = async (name, email, isAdmin = false) => {
  const res = await request(app).post('/api/auth/register').send({
    name,
    email,
    password: 'password123'
  });
  
  if (isAdmin) {
    await User.updateOne({ email }, { isAdmin: true });
  }
  
  const loginRes = await request(app).post('/api/auth/login').send({
    email,
    password: 'password123'
  });
  return loginRes.body.token;
};

describe('Authorization & Security Tests', () => {
  it('should redirect/reject non-logged-in users attempting to access dashboard APIs', async () => {
    const res = await request(app).get('/api/courses');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Not authorized, no token');
  });

  it('should ensure User A cannot see or edit Courses created by User B', async () => {
    const tokenA = await createUserAndToken('User A', 'usera@example.com');
    const tokenB = await createUserAndToken('User B', 'userb@example.com');

    // User A creates a course
    const createRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Math', code: 'MATH101' });
    
    const courseId = createRes.body._id;

    // User B tries to fetch it (should not see it)
    const getResB = await request(app)
      .get('/api/courses')
      .set('Authorization', `Bearer ${tokenB}`);
    
    expect(getResB.body).toHaveLength(0);

    // User B tries to update it (should fail)
    const updateRes = await request(app)
      .put(`/api/courses/${courseId}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: 'Hacked Math' });
    
    expect(updateRes.statusCode).toBe(404);
    expect(updateRes.body.message).toBe('Course not found or unauthorized');
  });

  it('should ensure standard user cannot access /api/admin routes', async () => {
    const token = await createUserAndToken('Standard User', 'standard@example.com');
    
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Not authorized as an admin');
  });

  it('should allow admin user to access /api/admin routes', async () => {
    const adminToken = await createUserAndToken('Admin User', 'admin@example.com', true);
    
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
