const request = require('supertest');
const app = require('../server');
const { connectDB, disconnectDB, clearDB } = require('./setup');

let token;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

beforeEach(async () => {
  await clearDB();
  
  // Register and login to get a fresh token for CRUD tests
  await request(app).post('/api/auth/register').send({
    name: 'CRUD User',
    email: 'crud@example.com',
    password: 'password123'
  });
  
  const loginRes = await request(app).post('/api/auth/login').send({
    email: 'crud@example.com',
    password: 'password123'
  });
  
  token = loginRes.body.token;
});

describe('CRUD Operations Tests', () => {
  
  let courseId;
  let assignmentId;
  let studyTaskId;

  it('should create a new Course', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Web Dev', code: 'COMP4650' });

    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe('Web Dev');
    courseId = res.body._id;
  });

  it('should edit an existing Course', async () => {
    // Create first
    const createRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Math', code: 'MATH101' });
    
    const id = createRes.body._id;

    // Update
    const updateRes = await request(app)
      .put(`/api/courses/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Advanced Math' });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.name).toBe('Advanced Math');
  });

  it('should delete a Course', async () => {
    const createRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'History', code: 'HIST101' });
    
    const id = createRes.body._id;

    const deleteRes = await request(app)
      .delete(`/api/courses/${id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe('Course removed');
  });

  it('should create an Assignment linked to a Course', async () => {
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Physics', code: 'PHYS101' });
    
    courseId = courseRes.body._id;

    const res = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Lab Report',
        course: courseId,
        dueDate: '2026-12-01',
        status: 'Pending',
        priority: 'High'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Lab Report');
    expect(res.body.course).toBe(courseId);
    assignmentId = res.body._id;
  });

  it('should update Assignment status', async () => {
    // Relying on previous test if it ran sequentially, but we clear DB in beforeEach
    // So recreate for this isolated test
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Physics', code: 'PHYS101' });
    
    const cId = courseRes.body._id;

    const assignRes = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Lab Report',
        course: cId,
        dueDate: '2026-12-01',
        status: 'Pending'
      });

    const aId = assignRes.body._id;

    const updateRes = await request(app)
      .put(`/api/assignments/${aId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Completed' });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.status).toBe('Completed');
  });

  it('should delete an Assignment', async () => {
    const courseRes = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Physics', code: 'PHYS101' });

    const assignRes = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Lab Report',
        course: courseRes.body._id,
        dueDate: '2026-12-01'
      });

    const deleteRes = await request(app)
      .delete(`/api/assignments/${assignRes.body._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe('Assignment removed');
  });

  it('should create and mark a Study Task as completed', async () => {
    const createRes = await request(app)
      .post('/api/studytasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Read Chapter 5',
        date: '2026-10-15',
        durationMinutes: 45,
        isCompleted: false
      });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.isCompleted).toBe(false);

    const updateRes = await request(app)
      .put(`/api/studytasks/${createRes.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isCompleted: true });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.isCompleted).toBe(true);
  });
});
