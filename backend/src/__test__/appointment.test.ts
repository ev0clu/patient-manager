import request from 'supertest';
import server from '../app';
import prisma from '../../prisma/prisma';

const email = 'john@example.com';
const password = '1234';
const phone = '+36502305986';

beforeAll(async () => {
    await prisma.$connect();
    await request(server)
        .post('/api/v1/auth/register')
        .send({ username: 'john', email: email, password: password, phone: phone });
});

afterEach(async () => {
    await prisma.appointment.deleteMany({});
    await server.close();
});

afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
});

describe('POST /', () => {
    test('should return error because of missing doctor', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                description: 'test description',
                status: 'PENDING',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because of less than 4 characters of doctor', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctor: 'doc',
                description: 'test description',
                status: 'PENDING',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because of missing appointment date', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({ docker: 'test doctor', description: 'test description' })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because of wrong status value', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({ doctor: 'test doctor', description: 'test description', status: 'UNKNOWN' })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should create appointment with default PENDING status instead of SCHEDULED', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctor: 'test doctor',
                description: 'test description',
                status: 'SCHEDULED',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(201);
        expect(res.body.appointment).toHaveProperty('id');
        expect(res.body.appointment).toHaveProperty('doctor');
        expect(res.body.appointment).toHaveProperty('description');
        expect(res.body.appointment).toHaveProperty('status');
        expect(res.body.appointment.status).toBe('PENDING');
        expect(res.body.appointment).toHaveProperty('appointmentDate');
        expect(res.body.appointment.appointmentDate).toBe('2025-01-31T09:25:00.000Z');
        expect(res.body.appointment).toHaveProperty('createdAt');
        expect(res.body.appointment).toHaveProperty('updatedAt');
    });

    test('should create appointment with default PENDING status', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctor: 'test doctor',
                description: 'test description',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(201);
        expect(res.body.appointment).toHaveProperty('id');
        expect(res.body.appointment).toHaveProperty('doctor');
        expect(res.body.appointment).toHaveProperty('description');
        expect(res.body.appointment).toHaveProperty('status');
        expect(res.body.appointment.status).toBe('PENDING');
        expect(res.body.appointment).toHaveProperty('appointmentDate');
        expect(res.body.appointment.appointmentDate).toBe('2025-01-31T09:25:00.000Z');
        expect(res.body.appointment).toHaveProperty('createdAt');
        expect(res.body.appointment).toHaveProperty('updatedAt');
    });

    test('should create appointment without description', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctor: 'test doctor',
                status: 'PENDING',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(201);
        expect(res.body.appointment).toHaveProperty('id');
        expect(res.body.appointment).toHaveProperty('doctor');
        expect(res.body.appointment).toHaveProperty('description');
        expect(res.body.appointment.description).toBeNull();
        expect(res.body.appointment).toHaveProperty('status');
        expect(res.body.appointment.status).toBe('PENDING');
        expect(res.body.appointment).toHaveProperty('appointmentDate');
        expect(res.body.appointment.appointmentDate).toBe('2025-01-31T09:25:00.000Z');
        expect(res.body.appointment).toHaveProperty('createdAt');
        expect(res.body.appointment).toHaveProperty('updatedAt');
    });
});

describe('GET /:id', () => {
    test('should return error because appointment does not exist', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const mockAppointmentId = crypto.randomUUID();

        const resGetAppointment = await request(server)
            .get(`/api/v1/appointments/${mockAppointmentId}`)
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(resGetAppointment.headers['content-type']).toMatch(/json/);
        expect(resGetAppointment.status).toEqual(500);
        expect(resGetAppointment.body.error).toEqual(`Appointment does not exist`);
    });

    test('should return existing appointment', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctor: 'test doctor',
                description: 'test description',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const resGetAppointment = await request(server)
            .get(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(resGetAppointment.headers['content-type']).toMatch(/json/);
        expect(resGetAppointment.status).toEqual(200);
        expect(resGetAppointment.body.appointment).toHaveProperty('id');
        expect(resGetAppointment.body.appointment).toHaveProperty('doctor');
        expect(resGetAppointment.body.appointment).toHaveProperty('description');
        expect(resGetAppointment.body.appointment).toHaveProperty('status');
        expect(resGetAppointment.body.appointment).toHaveProperty('appointmentDate');
        expect(resGetAppointment.body.appointment.status).toBe('PENDING');
        expect(resGetAppointment.body.appointment).toHaveProperty('createdAt');
        expect(resGetAppointment.body.appointment).toHaveProperty('updatedAt');
    });

    test('should return appointment is created by the given user', async () => {
        const doctorUser1 = 'doctor-1';
        const doctorUser2 = 'doctor-2';
        const appointmentDateUser1 = '2025-01-31T09:25:00.000Z';
        const appointmentDateUser2 = '2025-02-01T09:25:00.000Z';

        // User 1 preparation
        const resLoginUser1 = await request(server)
            .post('/api/v1/auth/login')
            .send({ email, password });

        const accessTokenUser1 = resLoginUser1.headers['authorization'];
        const refreshTokenUser1 = resLoginUser1.headers['x-refresh-token'];

        const resCreateAppointmentUser1 = await request(server)
            .post('/api/v1/appointments')
            .send({ doctor: doctorUser1, appointmentDate: appointmentDateUser1 })
            .set('Authorization', accessTokenUser1)
            .set('X-Refresh-Token', refreshTokenUser1);

        const resGetAppointmentUser1 = await request(server)
            .get(`/api/v1/appointments/${resCreateAppointmentUser1.body.appointment.id}`)
            .set('Authorization', accessTokenUser1)
            .set('X-Refresh-Token', refreshTokenUser1);

        // User 2 preparation
        await request(server).post('/api/v1/auth/register').send({
            username: 'john2',
            email: 'john2@example.com',
            password: '4321',
            phone: '+36503211211'
        });

        const resLoginUser2 = await request(server)
            .post('/api/v1/auth/login')
            .send({ email: 'john2@example.com', password: '4321' });

        const accessTokenUser2 = resLoginUser2.headers['authorization'];
        const refreshTokenUser2 = resLoginUser2.headers['x-refresh-token'];

        const resCreateAppointmentUser2 = await request(server)
            .post('/api/v1/appointments')
            .send({ doctor: doctorUser2, appointmentDate: appointmentDateUser2 })
            .set('Authorization', accessTokenUser2)
            .set('X-Refresh-Token', refreshTokenUser2);

        const resGetAppointmentUser2 = await request(server)
            .get(`/api/v1/appointments/${resCreateAppointmentUser2.body.appointment.id}`)
            .set('Authorization', accessTokenUser2)
            .set('X-Refresh-Token', refreshTokenUser2);

        // User 1 expectation
        expect(resGetAppointmentUser1.headers['content-type']).toMatch(/json/);
        expect(resGetAppointmentUser1.status).toEqual(200);
        expect(resGetAppointmentUser1.body.appointment).toHaveProperty('doctor');
        expect(resGetAppointmentUser1.body.appointment.doctor).toBe(doctorUser1);
        expect(resGetAppointmentUser1.body.appointment.doctor).not.toBe(doctorUser2);
        expect(resGetAppointmentUser1.body.appointment.description).toBeNull();
        expect(resGetAppointmentUser1.body.appointment).toHaveProperty('status');
        expect(resGetAppointmentUser1.body.appointment.status).toBe('PENDING');
        expect(resGetAppointmentUser1.body.appointment).toHaveProperty('appointmentDate');
        expect(resGetAppointmentUser1.body.appointment.appointmentDate).toBe(appointmentDateUser1);
        expect(resGetAppointmentUser1.body.appointment).toHaveProperty('createdAt');
        expect(resGetAppointmentUser1.body.appointment).toHaveProperty('updatedAt');

        // User 2 expectation
        expect(resGetAppointmentUser2.headers['content-type']).toMatch(/json/);
        expect(resGetAppointmentUser2.status).toEqual(200);
        expect(resGetAppointmentUser2.body.appointment).toHaveProperty('doctor');
        expect(resGetAppointmentUser2.body.appointment.doctor).toBe(doctorUser2);
        expect(resGetAppointmentUser2.body.appointment.doctor).not.toBe(doctorUser1);
        expect(resGetAppointmentUser2.body.appointment.description).toBeNull();
        expect(resGetAppointmentUser2.body.appointment).toHaveProperty('status');
        expect(resGetAppointmentUser2.body.appointment.status).toBe('PENDING');
        expect(resGetAppointmentUser2.body.appointment).toHaveProperty('appointmentDate');
        expect(resGetAppointmentUser2.body.appointment.appointmentDate).toBe(appointmentDateUser2);
        expect(resGetAppointmentUser2.body.appointment).toHaveProperty('createdAt');
        expect(resGetAppointmentUser2.body.appointment).toHaveProperty('updatedAt');
    });
});

describe('GET /', () => {
    test('should return empty appointment array', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const resGetAllAppointments = await request(server)
            .get(`/api/v1/appointments`)
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(resGetAllAppointments.headers['content-type']).toMatch(/json/);
        expect(resGetAllAppointments.status).toEqual(200);
        expect(Array.isArray(resGetAllAppointments.body.appointments)).toBe(true);
        expect(resGetAllAppointments.body.appointments.length).toBe(0);
    });

    test('should return appointments array with 1 item', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        await request(server)
            .post('/api/v1/appointments')
            .send({
                doctor: 'test doctor',
                description: 'test description',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const resGetAllAppointments = await request(server)
            .get(`/api/v1/appointments`)
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(resGetAllAppointments.headers['content-type']).toMatch(/json/);
        expect(resGetAllAppointments.status).toEqual(200);
        expect(Array.isArray(resGetAllAppointments.body.appointments)).toBe(true);
        expect(resGetAllAppointments.body.appointments.length).toBe(1);
        expect(resGetAllAppointments.body.appointments[0]).toHaveProperty('id');
        expect(resGetAllAppointments.body.appointments[0]).toHaveProperty('doctor');
        expect(resGetAllAppointments.body.appointments[0]).toHaveProperty('description');
        expect(resGetAllAppointments.body.appointments[0]).toHaveProperty('status');
        expect(resGetAllAppointments.body.appointments[0]).toHaveProperty('appointmentDate');
        expect(resGetAllAppointments.body.appointments[0].appointmentDate).toBe(
            '2025-01-31T09:25:00.000Z'
        );
        expect(resGetAllAppointments.body.appointments[0]).toHaveProperty('createdAt');
        expect(resGetAllAppointments.body.appointments[0]).toHaveProperty('updatedAt');
    });

    test('should return appointments array with 2 items, ids are different and sort in desc order based on creation date', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        for (let i = 0; i < 2; i++) {
            await request(server)
                .post('/api/v1/appointments')
                .send({
                    doctor: 'test doctor',
                    description: 'test description',
                    appointmentDate: '2025-01-31T09:25:00.000Z'
                })
                .set('Authorization', accessToken)
                .set('X-Refresh-Token', refreshToken);
        }

        const resGetAllAppointments = await request(server)
            .get(`/api/v1/appointments`)
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(resGetAllAppointments.headers['content-type']).toMatch(/json/);
        expect(resGetAllAppointments.status).toEqual(200);
        expect(Array.isArray(resGetAllAppointments.body.appointments)).toBe(true);
        expect(resGetAllAppointments.body.appointments.length).toBe(2);
        expect(
            resGetAllAppointments.body.appointments[0].id !==
                resGetAllAppointments.body.appointments[1].id
        ).toBeTruthy();
        expect(
            new Date(resGetAllAppointments.body.appointments[0].createdAt) >
                new Date(resGetAllAppointments.body.appointments[1].createdAt)
        ).toBeTruthy();
    });

    test('should return appointments array with 5 items', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        for (let i = 0; i < 5; i++) {
            await request(server)
                .post('/api/v1/appointments')
                .send({
                    doctor: 'test doctor',
                    description: 'test description',
                    appointmentDate: '2025-01-31T09:25:00.000Z'
                })
                .set('Authorization', accessToken)
                .set('X-Refresh-Token', refreshToken);
        }

        const resGetAllAppointments = await request(server)
            .get(`/api/v1/appointments`)
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(resGetAllAppointments.headers['content-type']).toMatch(/json/);
        expect(resGetAllAppointments.status).toEqual(200);
        expect(Array.isArray(resGetAllAppointments.body.appointments)).toBe(true);
        expect(resGetAllAppointments.body.appointments.length).toBe(5);

        for (const appointment of resGetAllAppointments.body.appointments) {
            expect(appointment).toHaveProperty('id');
            expect(appointment).toHaveProperty('doctor');
            expect(appointment).toHaveProperty('description');
            expect(appointment).toHaveProperty('status');
            expect(appointment).toHaveProperty('appointmentDate');
            expect(appointment.appointmentDate).toBe('2025-01-31T09:25:00.000Z');
            expect(appointment).toHaveProperty('createdAt');
            expect(appointment).toHaveProperty('updatedAt');
        }
    });

    test('should return appointments are created by the given user', async () => {
        const doctorUser1 = 'doctor-1';
        const doctorUser2 = 'doctor-2';
        const appointmentDateUser1 = '2025-01-31T09:25:00.000Z';
        const appointmentDateUser2 = '2025-02-01T10:25:00.000Z';

        // User 1 preparation
        const resLoginUser1 = await request(server)
            .post('/api/v1/auth/login')
            .send({ email, password });

        const accessTokenUser1 = resLoginUser1.headers['authorization'];
        const refreshTokenUser1 = resLoginUser1.headers['x-refresh-token'];

        await request(server)
            .post('/api/v1/appointments')
            .send({ doctor: doctorUser1, appointmentDate: appointmentDateUser1 })
            .set('Authorization', accessTokenUser1)
            .set('X-Refresh-Token', refreshTokenUser1);

        const resGetAppointmentUser1 = await request(server)
            .get(`/api/v1/appointments`)
            .set('Authorization', accessTokenUser1)
            .set('X-Refresh-Token', refreshTokenUser1);

        // User 2 preparation
        await request(server).post('/api/v1/auth/register').send({
            username: 'john2',
            email: 'john2@example.com',
            password: '4321',
            phone: '+36404323445'
        });

        const resLoginUser2 = await request(server)
            .post('/api/v1/auth/login')
            .send({ email: 'john2@example.com', password: '4321' });

        const accessTokenUser2 = resLoginUser2.headers['authorization'];
        const refreshTokenUser2 = resLoginUser2.headers['x-refresh-token'];

        await request(server)
            .post('/api/v1/appointments')
            .send({ doctor: doctorUser2, appointmentDate: appointmentDateUser2 })
            .set('Authorization', accessTokenUser2)
            .set('X-Refresh-Token', refreshTokenUser2);

        const resGetAppointmentUser2 = await request(server)
            .get(`/api/v1/appointments`)
            .set('Authorization', accessTokenUser2)
            .set('X-Refresh-Token', refreshTokenUser2);

        // User 1 expectation
        expect(resGetAppointmentUser1.headers['content-type']).toMatch(/json/);
        expect(resGetAppointmentUser1.status).toEqual(200);
        expect(Array.isArray(resGetAppointmentUser1.body.appointments)).toBe(true);
        expect(resGetAppointmentUser1.body.appointments.length).toBe(1);
        expect(resGetAppointmentUser1.body.appointments[0]).toHaveProperty('doctor');
        expect(resGetAppointmentUser1.body.appointments[0].doctor).toBe(doctorUser1);
        expect(resGetAppointmentUser1.body.appointments[0].doctor).not.toBe(doctorUser2);
        expect(resGetAppointmentUser1.body.appointments[0].description).toBeNull();
        expect(resGetAppointmentUser1.body.appointments[0]).toHaveProperty('status');
        expect(resGetAppointmentUser1.body.appointments[0].status).toBe('PENDING');
        expect(resGetAppointmentUser1.body.appointments[0]).toHaveProperty('appointmentDate');
        expect(resGetAppointmentUser1.body.appointments[0].appointmentDate).toBe(
            appointmentDateUser1
        );
        expect(resGetAppointmentUser1.body.appointments[0]).toHaveProperty('createdAt');
        expect(resGetAppointmentUser1.body.appointments[0]).toHaveProperty('updatedAt');

        //User 2 expectation
        expect(resGetAppointmentUser2.headers['content-type']).toMatch(/json/);
        expect(resGetAppointmentUser2.status).toEqual(200);
        expect(Array.isArray(resGetAppointmentUser2.body.appointments)).toBe(true);
        expect(resGetAppointmentUser2.body.appointments.length).toBe(1);
        expect(resGetAppointmentUser2.body.appointments[0]).toHaveProperty('doctor');
        expect(resGetAppointmentUser2.body.appointments[0].doctor).toBe(doctorUser2);
        expect(resGetAppointmentUser2.body.appointments[0].doctor).not.toBe(doctorUser1);
        expect(resGetAppointmentUser2.body.appointments[0].description).toBeNull();
        expect(resGetAppointmentUser2.body.appointments[0]).toHaveProperty('status');
        expect(resGetAppointmentUser2.body.appointments[0].status).toBe('PENDING');
        expect(resGetAppointmentUser2.body.appointments[0]).toHaveProperty('appointmentDate');
        expect(resGetAppointmentUser2.body.appointments[0].appointmentDate).toBe(
            appointmentDateUser2
        );
        expect(resGetAppointmentUser2.body.appointments[0]).toHaveProperty('createdAt');
        expect(resGetAppointmentUser2.body.appointments[0]).toHaveProperty('updatedAt');
    });

    test('should return any users all appointments with admin account', async () => {
        const doctorUser1 = 'doctor-1';
        const doctorUser2 = 'doctor-2';
        const appointmentDateUser1 = '2025-01-31T09:25:00.000Z';
        const appointmentDateUser2 = '2025-02-01T10:25:00.000Z';

        // User 1 preparation
        const resLoginUser1 = await request(server)
            .post('/api/v1/auth/login')
            .send({ email, password });

        const accessTokenUser1 = resLoginUser1.headers['authorization'];
        const refreshTokenUser1 = resLoginUser1.headers['x-refresh-token'];

        await request(server)
            .post('/api/v1/appointments')
            .send({ doctor: doctorUser1, appointmentDate: appointmentDateUser1 })
            .set('Authorization', accessTokenUser1)
            .set('X-Refresh-Token', refreshTokenUser1);

        await request(server)
            .post('/api/v1/appointments')
            .send({ doctor: doctorUser2, appointmentDate: appointmentDateUser2 })
            .set('Authorization', accessTokenUser1)
            .set('X-Refresh-Token', refreshTokenUser1);

        // Admin preparation
        await request(server).post('/api/v1/auth/register').send({
            username: 'admin',
            email: 'admin@patient.com',
            password: '4321',
            phone: '+36504323445'
        });

        const resLoginAdmin = await request(server)
            .post('/api/v1/auth/login')
            .send({ email: 'admin@patient.com', password: '4321' });

        const accessTokenAdmin = resLoginAdmin.headers['authorization'];
        const refreshTokenAdmin = resLoginAdmin.headers['x-refresh-token'];

        const resGetAppointments = await request(server)
            .get(`/api/v1/appointments`)
            .set('Authorization', accessTokenAdmin)
            .set('X-Refresh-Token', refreshTokenAdmin);

        // Admin expectation
        expect(resGetAppointments.headers['content-type']).toMatch(/json/);
        expect(resGetAppointments.status).toEqual(200);
        expect(Array.isArray(resGetAppointments.body.appointments)).toBe(true);
        expect(resGetAppointments.body.appointments.length).toBe(2);
        expect(resGetAppointments.body.appointments[0]).toHaveProperty('doctor');
        expect(resGetAppointments.body.appointments[1]).toHaveProperty('doctor');
        expect(resGetAppointments.body.appointments[0].doctor).toBe(doctorUser2);
        expect(resGetAppointments.body.appointments[1].doctor).toBe(doctorUser1);
        expect(resGetAppointments.body.appointments[0].description).toBeNull();
        expect(resGetAppointments.body.appointments[1].description).toBeNull();
        expect(resGetAppointments.body.appointments[0]).toHaveProperty('status');
        expect(resGetAppointments.body.appointments[1]).toHaveProperty('status');
        expect(resGetAppointments.body.appointments[0].status).toBe('PENDING');
        expect(resGetAppointments.body.appointments[0].status).toBe('PENDING');
        expect(resGetAppointments.body.appointments[1]).toHaveProperty('appointmentDate');
        expect(resGetAppointments.body.appointments[0].appointmentDate).toBe(appointmentDateUser2);
        expect(resGetAppointments.body.appointments[1].appointmentDate).toBe(appointmentDateUser1);
        expect(resGetAppointments.body.appointments[0]).toHaveProperty('createdAt');
        expect(resGetAppointments.body.appointments[0]).toHaveProperty('updatedAt');
        expect(resGetAppointments.body.appointments[1]).toHaveProperty('createdAt');
        expect(resGetAppointments.body.appointments[1]).toHaveProperty('updatedAt');
    });
});

describe('PUT /', () => {
    test('should return error because of missing doctor', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctor: 'test doctor',
                description: 'test description',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const res = await request(server)
            .put(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .send({ description: 'test description', appointmentDate: '2025-01-31T09:25:00.000Z' })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because of missing appointment date', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctor: 'test doctor',
                description: 'test description',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const res = await request(server)
            .put(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .send({ doctor: 'test doctor', description: 'test description' })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because of wrong status value', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctor: 'test',
                description: 'test description',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const res = await request(server)
            .put(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .send({
                doctor: 'test doctor',
                description: 'test description',
                status: 'ONGOING',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should update task with SCHEDULED status', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctor: 'test',
                description: 'test description',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const res = await request(server)
            .put(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .send({
                doctor: 'test doctor',
                description: 'test description',
                status: 'SCHEDULED',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.body.appointment).toHaveProperty('id');
        expect(res.body.appointment).toHaveProperty('doctor');
        expect(res.body.appointment).toHaveProperty('description');
        expect(res.body.appointment).toHaveProperty('status');
        expect(res.body.appointment.status).toBe('SCHEDULED');
        expect(res.body.appointment).toHaveProperty('createdAt');
        expect(res.body.appointment).toHaveProperty('updatedAt');
    });

    test('should update task with CANCELLED status', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctor: 'test doctor',
                description: 'test description',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const res = await request(server)
            .put(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .send({
                doctor: 'test',
                description: 'test description',
                status: 'CANCELLED',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.body.appointment).toHaveProperty('id');
        expect(res.body.appointment).toHaveProperty('doctor');
        expect(res.body.appointment).toHaveProperty('description');
        expect(res.body.appointment).toHaveProperty('status');
        expect(res.body.appointment.status).toBe('CANCELLED');
        expect(res.body.appointment).toHaveProperty('createdAt');
        expect(res.body.appointment).toHaveProperty('updatedAt');
    });

    test('should update task without description', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctor: 'test doctor',
                description: 'test description',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const res = await request(server)
            .put(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .send({
                doctor: 'test',
                status: 'CANCELLED',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.body.appointment).toHaveProperty('id');
        expect(res.body.appointment).toHaveProperty('doctor');
        expect(res.body.appointment.description).toBe('test description');
        expect(res.body.appointment).toHaveProperty('status');
        expect(res.body.appointment).toHaveProperty('createdAt');
        expect(res.body.appointment).toHaveProperty('updatedAt');
    });
});

describe('DELETE /', () => {
    test('should return error because appointment does not exist', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const mockAppointmentId = crypto.randomUUID();

        const resGetAppointment = await request(server)
            .delete(`/api/v1/appointments/${mockAppointmentId}`)
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(resGetAppointment.headers['content-type']).toMatch(/json/);
        expect(resGetAppointment.status).toEqual(500);
        expect(resGetAppointment.body.error).toEqual(`Appointment does not exist`);
    });

    test('should delete existing appointment', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctor: 'test doctor',
                description: 'test description',
                appointmentDate: '2025-01-31T09:25:00.000Z'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const resDeleteAppointment = await request(server)
            .delete(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const resGetAppointment = await request(server)
            .get(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(resDeleteAppointment.headers['content-type']).toMatch(/json/);
        expect(resDeleteAppointment.status).toEqual(200);
        expect(resDeleteAppointment.body.message).toEqual('Appointment deleted successfully');
        expect(resGetAppointment.status).toEqual(500);
        expect(resGetAppointment.body.error).toEqual(`Appointment does not exist`);
    });
});
