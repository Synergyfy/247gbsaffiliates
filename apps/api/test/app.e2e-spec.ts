import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  }, 30000);

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
    role: 'account_manager',
    sectorId: '550e8400-e29b-41d4-a716-446655440000',
    categoryId: '550e8400-e29b-41d4-a716-446655440001',
    subCategoryId: '550e8400-e29b-41d4-a716-446655440002',
  };

  it('/api/v1/auth/register (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body.email).toBe(testUser.email);
      });
  });

  it('/api/v1/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(201)
      .expect((res) => {
        expect(res.body.access_token).toBeDefined();
        accessToken = res.body.access_token;
      });
  });

  it('/api/v1/tasks (POST) - Fail without auth', () => {
    return request(app.getHttpServer())
      .post('/api/v1/tasks')
      .send({ title: 'New Task', description: 'Desc', budget: 50 })
      .expect(401);
  });

  it('/api/v1/tasks (POST) - Success with auth', () => {
    return request(app.getHttpServer())
      .post('/api/v1/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'E2E Task',
        description: 'Created via E2E test',
        budget: 100,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.title).toBe('E2E Task');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});

