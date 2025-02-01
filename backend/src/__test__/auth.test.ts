import request from 'supertest';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env';
import server from '../app';
import prisma from '../../prisma/prisma';

beforeAll(async () => {
    await prisma.$connect();
});

afterEach(async () => {
    await server.close();
});

afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
});

const email = 'john@example.com';

describe('POST /register', () => {
    test('should register user ', async () => {
        const res = await request(server)
            .post('/api/v1/auth/register')
            .send({ username: 'john', email: email, password: '1234', phone: '+36502305986' });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(201);
        expect(res.body).toEqual({
            message: 'User created successfully'
        });
    });

    test('should return user already exist code', async () => {
        const res = await request(server)
            .post('/api/v1/auth/register')
            .send({ username: 'john2', email: email, password: '1235', phone: '+36502305986' });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(500);
        expect(res.body.error).toEqual(`User already exist`);
    });

    test('should return error because user password less than 4 characters', async () => {
        const res = await request(server).post('/api/v1/auth/register').send({
            username: 'john2',
            email: 'test@example.com',
            password: '123',
            phone: '+36502305986'
        });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because user password is empty', async () => {
        const res = await request(server).post('/api/v1/auth/register').send({
            username: 'john2',
            email: 'test@example.com',
            password: '',
            phone: '+36502305986'
        });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because user email is invalid', async () => {
        const res = await request(server).post('/api/v1/auth/register').send({
            username: 'john2',
            email: 'test@com',
            password: '1235',
            phone: '+36502305986'
        });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because user email is empty', async () => {
        const res = await request(server)
            .post('/api/v1/auth/register')
            .send({ username: 'john2', email: '', password: '', phone: '' });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because user phone is empty', async () => {
        const res = await request(server)
            .post('/api/v1/auth/register')
            .send({ username: 'john2', email: 'test@tester.net', password: '1234', phone: '' });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });
});

describe('POST /login', () => {
    test('should login user', async () => {
        const res = await request(server)
            .post('/api/v1/auth/login')
            .send({ email: email, password: '1234' });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.headers['authorization'][0]).toBeTruthy();
        expect(res.headers['x-refresh-token'][0]).toBeTruthy();
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
            message: 'Authentication succeed'
        });
    });

    test('should return error because user password is empty', async () => {
        const res = await request(server)
            .post('/api/v1/auth/login')
            .send({ email: email, password: '' });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.headers['authorization']).toBeFalsy();
        expect(res.headers['x-refresh-token']).toBeFalsy();
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because user password less than 4 characters', async () => {
        const res = await request(server)
            .post('/api/v1/auth/login')
            .send({ email: 'test@example.com', password: '123' });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.headers['authorization']).toBeFalsy();
        expect(res.headers['x-refresh-token']).toBeFalsy();
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because user password does not match', async () => {
        const res = await request(server)
            .post('/api/v1/auth/login')
            .send({ email: email, password: '1235' });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.headers['authorization']).toBeFalsy();
        expect(res.headers['x-refresh-token']).toBeFalsy();
        expect(res.status).toEqual(401);
        expect(res.body.error).toEqual(`Authentication failed`);
    });

    test('should return error because user email is empty', async () => {
        const res = await request(server)
            .post('/api/v1/auth/login')
            .send({ email: '', password: '1234' });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.headers['authorization']).toBeFalsy();
        expect(res.headers['x-refresh-token']).toBeFalsy();
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because user email is invalid', async () => {
        const res = await request(server)
            .post('/api/v1/auth/login')
            .send({ email: 'test@test', password: '1234' });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.headers['authorization']).toBeFalsy();
        expect(res.headers['x-refresh-token']).toBeFalsy();
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because user does not exist', async () => {
        const res = await request(server)
            .post('/api/v1/auth/login')
            .send({ email: 'test@example.com', password: '1234' });

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.headers['authorization']).toBeFalsy();
        expect(res.headers['x-refresh-token']).toBeFalsy();
        expect(res.status).toEqual(401);
        expect(res.body.error).toEqual(`User does not exist`);
    });
});

describe('Test auth middleware', () => {
    test('should return error because of missing access token', async () => {
        const res = await request(server).post('/api/v1/appointments');

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(401);
        expect(res.body.error).toEqual(`access-token-missing`);
    });

    test('should return error because of missing refresh token', async () => {
        const mockAccessToken = 'mockAcccessToken';

        const res = await request(server)
            .post('/api/v1/appointments')
            .set('Authorization', mockAccessToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(401);
        expect(res.body.error).toEqual(`refresh-token-missing`);
    });

    test('should return error because of access token expired', async () => {
        const mockAccessToken = 'mockAcccessToken';
        const mockRefreshToken = 'mockRefreshToken';

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctor: 'test doctor',
                description: '',
                appointmentDate: '2025-01-31T09:25:00Z'
            })
            .set('Authorization', mockAccessToken)
            .set('X-Refresh-Token', mockRefreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(500);
        expect(res.body.error).toEqual(`access-token-expired`);
    });
});

describe('POST /refresh', () => {
    test('should return access denied because of missing refresh token', async () => {
        const resRefresh = await request(server).post('/api/v1/auth/refresh');

        expect(resRefresh.headers['content-type']).toMatch(/json/);
        expect(resRefresh.headers['authorization']).toBeFalsy();
        expect(resRefresh.status).toEqual(403);
        expect(resRefresh.body.error).toEqual(`refresh-token-missing`);
    });

    test('should return error because of refresh token expired', async () => {
        const token = jwt.sign({ userId: 'mock-user-id-123' }, env.JWT_SECRET, {
            expiresIn: '1s'
        });

        // Add a wait time of 1 second (1000ms) before refreshing the token
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const res = await request(server)
            .post('/api/v1/auth/refresh')
            .set('X-Refresh-Token', token);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.headers['authorization']).toBeFalsy();
        expect(res.status).toEqual(403);
        expect(res.body.error).toEqual(`refresh-token-expired`);
    });

    test('should return new access token', async () => {
        const resLogin = await request(server)
            .post('/api/v1/auth/login')
            .send({ email: email, password: '1234' });

        const prevAccessToken = resLogin.header['authorization'];
        const prevRefreshToken = resLogin.headers['x-refresh-token'];

        // Add a wait time of 1 second (1000ms) before refreshing the token
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const resRefresh = await request(server)
            .post('/api/v1/auth/refresh')
            .set('Authorization', prevAccessToken)
            .set('X-Refresh-Token', prevRefreshToken);

        expect(resRefresh.headers['content-type']).toMatch(/json/);
        expect(resRefresh.headers['authorization']).toBeTruthy();
        expect(resRefresh.headers['authorization']).not.toEqual(prevAccessToken);
        expect(resRefresh.status).toEqual(200);
        expect(resRefresh.body.message).toEqual(`Access token refreshed successfully`);
    });
});
