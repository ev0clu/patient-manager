import request from 'supertest';
import server from '../app';
import prisma from '../../prisma/prisma';
import { DOCTORS } from '../constants/doctors';

const email = 'john@example.com';
const password = '1234';
const phone = '+36502305986';

async function seedDB() {
    // Create doctors
    await prisma.doctor.createMany({
        data: DOCTORS.map((doctor) => ({
            name: doctor.name,
            image: doctor.image
        }))
    });

    const doctors = await prisma.doctor.findMany();

    // Create slots
    const dates: Date[] = [];

    for (let i = 0; i <= 3; i++) {
        const date = new Date();
        date.setDate(new Date().getDate() + 5 + i); // new date after 5 + i days from today
        date.setHours(8 + i, 0, 0, 0); // set hour to 8am + i

        dates.push(date);
    }

    for (const doctor of doctors) {
        await prisma.slot.createMany({
            data: dates.map((date) => ({
                date: date,
                booked: false,
                doctorId: doctor.id
            }))
        });
    }
}

beforeAll(async () => {
    await prisma.$connect();
    await request(server)
        .post('/api/v1/auth/register')
        .send({ username: 'john', email: email, password: password, phone: phone });
    await request(server);

    await seedDB();
});

afterEach(async () => {
    await prisma.$transaction([
        prisma.appointment.deleteMany(),
        prisma.slot.deleteMany(),
        prisma.doctor.deleteMany()
    ]);
    await seedDB();
    await server.close();
});

afterAll(async () => {
    await prisma.$transaction([
        prisma.appointment.deleteMany(),
        prisma.slot.deleteMany(),
        prisma.doctor.deleteMany(),
        prisma.user.deleteMany()
    ]);
    await prisma.$disconnect();
});

describe('POST /', () => {
    test('should return error because of missing doctorId', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const mockSlotId = '123';

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                description: 'test description',
                status: 'PENDING',
                slotId: mockSlotId
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because of missing slodId', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const mockDoctorId = '123';

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: mockDoctorId,
                description: 'test description',
                status: 'PENDING'
            })
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

        const mockDoctorId = '123';
        const mockSlotId = '456';

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: mockDoctorId,
                description: 'test description',
                status: 'UNKNOWN',
                slotId: mockSlotId
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(400);
        expect(res.body.error).toEqual(`Invalid data`);
    });

    test('should return error because of booked slot', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                description: 'test description',
                slotId: doctors[0].slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const resSecondAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                description: 'test description',
                slotId: doctors[0].slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(resSecondAppointment.headers['content-type']).toMatch(/json/);
        expect(resSecondAppointment.status).toEqual(500);
        expect(resSecondAppointment.body.error).toEqual(
            `Appointment cannot be booked to this doctor in that slot`
        );
    });

    test('should return error because slotId does not belong to the doctorId', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        const slots = await prisma.slot.findMany({
            where: {
                NOT: { doctorId: doctors[0].id }
            }
        });

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                description: 'test description',
                slotId: slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(500);
        expect(res.body.error).toEqual(`Appointment cannot be booked to this doctor in that slot`);
    });

    test('should create appointment with default PENDING status instead of SCHEDULED', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                description: 'test description',
                status: 'SCHEDULED',
                slotId: doctors[0].slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(201);
        expect(res.body.appointment).toHaveProperty('id');
        expect(res.body.appointment).toHaveProperty('doctorId');
        expect(res.body.appointment).toHaveProperty('description');
        expect(res.body.appointment).toHaveProperty('status');
        expect(res.body.appointment.status).toBe('PENDING');
        expect(res.body.appointment).toHaveProperty('slotId');
        expect(res.body.appointment.slotId).toBe(doctors[0].slots[0].id);
        expect(res.body.appointment).toHaveProperty('createdAt');
        expect(res.body.appointment).toHaveProperty('updatedAt');
    });

    test('should create appointment with default PENDING status', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                description: 'test description',
                slotId: doctors[0].slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(201);
        expect(res.body.appointment).toHaveProperty('id');
        expect(res.body.appointment).toHaveProperty('doctorId');
        expect(res.body.appointment).toHaveProperty('description');
        expect(res.body.appointment).toHaveProperty('status');
        expect(res.body.appointment.status).toBe('PENDING');
        expect(res.body.appointment).toHaveProperty('slotId');
        expect(res.body.appointment.slotId).toBe(doctors[0].slots[0].id);
        expect(res.body.appointment).toHaveProperty('createdAt');
        expect(res.body.appointment).toHaveProperty('updatedAt');
    });

    test('should create appointment without description', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                slotId: doctors[0].slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(201);
        expect(res.body.appointment).toHaveProperty('id');
        expect(res.body.appointment).toHaveProperty('doctorId');
        expect(res.body.appointment).toHaveProperty('description');
        expect(res.body.appointment.description).toBeNull();
        expect(res.body.appointment).toHaveProperty('status');
        expect(res.body.appointment.status).toBe('PENDING');
        expect(res.body.appointment).toHaveProperty('slotId');
        expect(res.body.appointment.slotId).toBe(doctors[0].slots[0].id);
        expect(res.body.appointment).toHaveProperty('createdAt');
        expect(res.body.appointment).toHaveProperty('updatedAt');
    });

    test('should return error because slotId already booked', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                description: 'test description',
                status: 'PENDING',
                slotId: doctors[0].slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                description: 'test description',
                status: 'PENDING',
                slotId: doctors[0].slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(500);
        expect(res.body.error).toEqual(`Appointment cannot be booked to this doctor in that slot`);
    });

    test('should return error because slotId does not exist', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        const mockSlotId = '123';

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                description: 'test description',
                status: 'PENDING',
                slotId: mockSlotId
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(500);
        expect(res.body.error).toEqual(`Slot does not exist`);
    });

    test('should return error because doctorId does not exist', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        const mockDoctorId = '123';

        const res = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: mockDoctorId,
                description: 'test description',
                status: 'PENDING',
                slotId: doctors[0].slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(500);
        expect(res.body.error).toEqual(`Doctor does not exist`);
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

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                slotId: doctors[0].slots[0].id
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
        expect(resGetAppointment.body.appointment).toHaveProperty('doctorId');
        expect(resGetAppointment.body.appointment).toHaveProperty('description');
        expect(resGetAppointment.body.appointment).toHaveProperty('status');
        expect(resGetAppointment.body.appointment).toHaveProperty('slotId');
        expect(resGetAppointment.body.appointment.status).toBe('PENDING');
        expect(resGetAppointment.body.appointment).toHaveProperty('createdAt');
        expect(resGetAppointment.body.appointment).toHaveProperty('updatedAt');
    });

    test('should return appointment is created by the given user', async () => {
        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        // User 1 preparation
        const resLoginUser1 = await request(server)
            .post('/api/v1/auth/login')
            .send({ email, password });

        const accessTokenUser1 = resLoginUser1.headers['authorization'];
        const refreshTokenUser1 = resLoginUser1.headers['x-refresh-token'];

        const resCreateAppointmentUser1 = await request(server)
            .post('/api/v1/appointments')
            .send({ doctorId: doctors[0].id, slotId: doctors[0].slots[0].id })
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
            .send({ doctorId: doctors[1].id, slotId: doctors[1].slots[0].id })
            .set('Authorization', accessTokenUser2)
            .set('X-Refresh-Token', refreshTokenUser2);

        const resGetAppointmentUser2 = await request(server)
            .get(`/api/v1/appointments/${resCreateAppointmentUser2.body.appointment.id}`)
            .set('Authorization', accessTokenUser2)
            .set('X-Refresh-Token', refreshTokenUser2);

        // User 1 expectation
        expect(resGetAppointmentUser1.headers['content-type']).toMatch(/json/);
        expect(resGetAppointmentUser1.status).toEqual(200);
        expect(resGetAppointmentUser1.body.appointment).toHaveProperty('doctorId');
        expect(resGetAppointmentUser1.body.appointment.doctorId).toBe(doctors[0].id);
        expect(resGetAppointmentUser1.body.appointment.doctorId).not.toBe(doctors[1].id);
        expect(resGetAppointmentUser1.body.appointment.description).toBeNull();
        expect(resGetAppointmentUser1.body.appointment).toHaveProperty('status');
        expect(resGetAppointmentUser1.body.appointment.status).toBe('PENDING');
        expect(resGetAppointmentUser1.body.appointment).toHaveProperty('slotId');
        expect(resGetAppointmentUser1.body.appointment.slotId).toBe(doctors[0].slots[0].id);
        expect(resGetAppointmentUser1.body.appointment).toHaveProperty('createdAt');
        expect(resGetAppointmentUser1.body.appointment).toHaveProperty('updatedAt');

        // User 2 expectation
        expect(resGetAppointmentUser2.headers['content-type']).toMatch(/json/);
        expect(resGetAppointmentUser2.status).toEqual(200);
        expect(resGetAppointmentUser2.body.appointment).toHaveProperty('doctorId');
        expect(resGetAppointmentUser2.body.appointment.doctorId).toBe(doctors[1].id);
        expect(resGetAppointmentUser2.body.appointment.doctorId).not.toBe(doctors[0].id);
        expect(resGetAppointmentUser2.body.appointment.description).toBeNull();
        expect(resGetAppointmentUser2.body.appointment).toHaveProperty('status');
        expect(resGetAppointmentUser2.body.appointment.status).toBe('PENDING');
        expect(resGetAppointmentUser2.body.appointment).toHaveProperty('slotId');
        expect(resGetAppointmentUser2.body.appointment.slotId).toBe(doctors[1].slots[0].id);
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

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                slotId: doctors[0].slots[0].id
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
        expect(resGetAllAppointments.body.appointments[0]).toHaveProperty('doctorId');
        expect(resGetAllAppointments.body.appointments[0]).toHaveProperty('description');
        expect(resGetAllAppointments.body.appointments[0]).toHaveProperty('status');
        expect(resGetAllAppointments.body.appointments[0]).toHaveProperty('slotId');
        expect(resGetAllAppointments.body.appointments[0].slotId).toBe(doctors[0].slots[0].id);
        expect(resGetAllAppointments.body.appointments[0]).toHaveProperty('createdAt');
        expect(resGetAllAppointments.body.appointments[0]).toHaveProperty('updatedAt');
    });

    test('should return appointments array with 2 items, ids are different and sort in desc order based on creation date', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        for (let i = 0; i < 2; i++) {
            await request(server)
                .post('/api/v1/appointments')
                .send({
                    doctorId: doctors[i].id,
                    slotId: doctors[i].slots[0].id
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

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        for (let i = 0; i < 5; i++) {
            await request(server)
                .post('/api/v1/appointments')
                .send({
                    doctorId: doctors[i].id,
                    slotId: doctors[i].slots[0].id
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

        for (let i = 0; i < resGetAllAppointments.body.appointments.length; i++) {
            expect(resGetAllAppointments.body.appointments[i]).toHaveProperty('id');
            expect(resGetAllAppointments.body.appointments[i]).toHaveProperty('doctorId');
            expect(resGetAllAppointments.body.appointments[i]).toHaveProperty('description');
            expect(resGetAllAppointments.body.appointments[i]).toHaveProperty('status');
            expect(resGetAllAppointments.body.appointments[i]).toHaveProperty('slotId');
            expect(resGetAllAppointments.body.appointments[i]).toHaveProperty('createdAt');
            expect(resGetAllAppointments.body.appointments[i]).toHaveProperty('updatedAt');
        }
    });

    test('should return appointments are created by the given user', async () => {
        // User 1 preparation
        const resLoginUser1 = await request(server)
            .post('/api/v1/auth/login')
            .send({ email, password });

        const accessTokenUser1 = resLoginUser1.headers['authorization'];
        const refreshTokenUser1 = resLoginUser1.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        await request(server)
            .post('/api/v1/appointments')
            .send({ doctorId: doctors[0].id, slotId: doctors[0].slots[0].id })
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
            .send({ doctorId: doctors[1].id, slotId: doctors[1].slots[0].id })
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
        expect(resGetAppointmentUser1.body.appointments[0]).toHaveProperty('doctorId');
        expect(resGetAppointmentUser1.body.appointments[0].doctorId).not.toBe(
            resGetAppointmentUser2.body.appointments[0].doctorId
        );
        expect(resGetAppointmentUser1.body.appointments[0].description).toBeNull();
        expect(resGetAppointmentUser1.body.appointments[0]).toHaveProperty('status');
        expect(resGetAppointmentUser1.body.appointments[0].status).toBe('PENDING');
        expect(resGetAppointmentUser1.body.appointments[0]).toHaveProperty('slotId');
        expect(resGetAppointmentUser1.body.appointments[0].slotId).not.toBe(
            resGetAppointmentUser2.body.appointments[0].slotId
        );
        expect(resGetAppointmentUser1.body.appointments[0]).toHaveProperty('createdAt');
        expect(resGetAppointmentUser1.body.appointments[0]).toHaveProperty('updatedAt');

        //User 2 expectation
        expect(resGetAppointmentUser2.headers['content-type']).toMatch(/json/);
        expect(resGetAppointmentUser2.status).toEqual(200);
        expect(Array.isArray(resGetAppointmentUser2.body.appointments)).toBe(true);
        expect(resGetAppointmentUser2.body.appointments.length).toBe(1);
        expect(resGetAppointmentUser2.body.appointments[0]).toHaveProperty('doctorId');
        expect(resGetAppointmentUser2.body.appointments[0].doctorId).not.toBe(
            resGetAppointmentUser1.body.appointments[0].doctorId
        );
        expect(resGetAppointmentUser2.body.appointments[0].description).toBeNull();
        expect(resGetAppointmentUser2.body.appointments[0]).toHaveProperty('status');
        expect(resGetAppointmentUser2.body.appointments[0].status).toBe('PENDING');
        expect(resGetAppointmentUser2.body.appointments[0]).toHaveProperty('slotId');
        expect(resGetAppointmentUser2.body.appointments[0].slotId).not.toBe(
            resGetAppointmentUser1.body.appointments[0].slotId
        );
        expect(resGetAppointmentUser2.body.appointments[0]).toHaveProperty('createdAt');
        expect(resGetAppointmentUser2.body.appointments[0]).toHaveProperty('updatedAt');
    });

    test('should return any users all appointments with admin account', async () => {
        // User 1 preparation
        const resLoginUser1 = await request(server)
            .post('/api/v1/auth/login')
            .send({ email, password });

        const accessTokenUser1 = resLoginUser1.headers['authorization'];
        const refreshTokenUser1 = resLoginUser1.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        await request(server)
            .post('/api/v1/appointments')
            .send({ doctorId: doctors[0].id, slotId: doctors[0].slots[0].id })
            .set('Authorization', accessTokenUser1)
            .set('X-Refresh-Token', refreshTokenUser1);

        await request(server)
            .post('/api/v1/appointments')
            .send({ doctorId: doctors[0].id, slotId: doctors[0].slots[1].id })
            .set('Authorization', accessTokenUser1)
            .set('X-Refresh-Token', refreshTokenUser1);

        // Admin preparation
        await request(server).post('/api/v1/auth/register').send({
            username: 'admin2',
            email: 'admin2@patient.com',
            password: '4321',
            phone: '+36504323445',
            role: 'ADMIN'
        });

        const resLoginAdmin = await request(server)
            .post('/api/v1/auth/login')
            .send({ email: 'admin2@patient.com', password: '4321' });

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
        expect(resGetAppointments.body.appointments[0]).toHaveProperty('doctorId');
        expect(resGetAppointments.body.appointments[1]).toHaveProperty('doctorId');
        expect(resGetAppointments.body.appointments[0].description).toBeNull();
        expect(resGetAppointments.body.appointments[1].description).toBeNull();
        expect(resGetAppointments.body.appointments[0]).toHaveProperty('status');
        expect(resGetAppointments.body.appointments[1]).toHaveProperty('status');
        expect(resGetAppointments.body.appointments[0].status).toBe('PENDING');
        expect(resGetAppointments.body.appointments[0].status).toBe('PENDING');
        expect(resGetAppointments.body.appointments[1]).toHaveProperty('slotId');
        expect(resGetAppointments.body.appointments[0]).toHaveProperty('createdAt');
        expect(resGetAppointments.body.appointments[0]).toHaveProperty('updatedAt');
        expect(resGetAppointments.body.appointments[1]).toHaveProperty('createdAt');
        expect(resGetAppointments.body.appointments[1]).toHaveProperty('updatedAt');
    });
});

describe('PUT /', () => {
    test('should return error because of wrong status value', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                description: 'test description',
                status: 'PENDING',
                slotId: doctors[0].slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const res = await request(server)
            .put(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .send({
                description: 'test description',
                status: 'ONGOING'
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

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                description: 'test description',
                slotId: doctors[0].slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const res = await request(server)
            .put(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .send({
                description: 'test description',
                status: 'SCHEDULED'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.body.appointment).toHaveProperty('id');
        expect(res.body.appointment).toHaveProperty('doctorId');
        expect(res.body.appointment).toHaveProperty('description');
        expect(res.body.appointment).toHaveProperty('status');
        expect(res.body.appointment.status).toBe('SCHEDULED');
        expect(res.body.appointment).toHaveProperty('slotId');
        expect(res.body.appointment.slot.booked).toBeTruthy();
        expect(res.body.appointment).toHaveProperty('createdAt');
        expect(res.body.appointment).toHaveProperty('updatedAt');
    });

    test('should update task with CANCELLED status', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                description: 'test description',
                status: 'PENDING',
                slotId: doctors[0].slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const res = await request(server)
            .put(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .send({
                description: 'test description',
                status: 'CANCELLED'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.body.appointment).toHaveProperty('id');
        expect(res.body.appointment).toHaveProperty('doctorId');
        expect(res.body.appointment).toHaveProperty('description');
        expect(res.body.appointment).toHaveProperty('status');
        expect(res.body.appointment.status).toBe('CANCELLED');
        expect(res.body.appointment).toHaveProperty('slotId');
        expect(res.body.appointment.slot.booked).toBeTruthy();
        expect(res.body.appointment).toHaveProperty('createdAt');
        expect(res.body.appointment).toHaveProperty('updatedAt');
    });

    test('should update task with Admin account from PENDING to CANCELLED status', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                description: 'test description',
                status: 'PENDING',
                slotId: doctors[0].slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        // Admin preparation
        await request(server).post('/api/v1/auth/register').send({
            username: 'admin2',
            email: 'admin2@patient.com',
            password: '4321',
            phone: '+36504323445',
            role: 'ADMIN'
        });

        const resLoginAdmin = await request(server)
            .post('/api/v1/auth/login')
            .send({ email: 'admin2@patient.com', password: '4321' });

        const accessTokenAdmin = resLoginAdmin.headers['authorization'];
        const refreshTokenAdmin = resLoginAdmin.headers['x-refresh-token'];

        await request(server)
            .put(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .send({ description: 'test description', status: 'CANCELLED' })
            .set('Authorization', accessTokenAdmin)
            .set('X-Refresh-Token', refreshTokenAdmin);

        const resGetAppointment = await request(server)
            .get(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .set('Authorization', accessTokenAdmin)
            .set('X-Refresh-Token', refreshTokenAdmin);

        // Admin expectation
        expect(resGetAppointment.headers['content-type']).toMatch(/json/);
        expect(resGetAppointment.status).toEqual(200);
        expect(resGetAppointment.body.appointment).toHaveProperty('id');
        expect(resGetAppointment.body.appointment).toHaveProperty('doctorId');
        expect(resGetAppointment.body.appointment).toHaveProperty('description');
        expect(resGetAppointment.body.appointment).toHaveProperty('status');
        expect(resGetAppointment.body.appointment.status).toBe('CANCELLED');
        expect(resGetAppointment.body.appointment).toHaveProperty('slotId');
        expect(resGetAppointment.body.appointment.slot.booked).toBeTruthy();
        expect(resGetAppointment.body.appointment).toHaveProperty('createdAt');
        expect(resGetAppointment.body.appointment).toHaveProperty('updatedAt');
    });

    test('should update task without description', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                description: 'test description',
                status: 'PENDING',
                slotId: doctors[0].slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const res = await request(server)
            .put(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .send({
                status: 'SCHEDULED'
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.status).toEqual(200);
        expect(res.body.appointment).toHaveProperty('id');
        expect(res.body.appointment).toHaveProperty('doctorId');
        expect(res.body.appointment.description).toBe('test description');
        expect(res.body.appointment).toHaveProperty('status');
        expect(res.body.appointment).toHaveProperty('slotId');
        expect(res.body.appointment.slot.booked).toBeTruthy();
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

        const doctors = await prisma.doctor.findMany({
            include: { slots: true }
        });

        const resCreateAppointment = await request(server)
            .post('/api/v1/appointments')
            .send({
                doctorId: doctors[0].id,
                slotId: doctors[0].slots[0].id
            })
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const slotId = resCreateAppointment.body.appointment.slotId;

        const resDeleteAppointment = await request(server)
            .delete(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const resGetAppointment = await request(server)
            .get(`/api/v1/appointments/${resCreateAppointment.body.appointment.id}`)
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        const resGetSlot = await prisma.slot.findUnique({
            where: { id: slotId }
        });

        expect(resDeleteAppointment.headers['content-type']).toMatch(/json/);
        expect(resDeleteAppointment.status).toEqual(200);
        expect(resDeleteAppointment.body.message).toEqual('Appointment deleted successfully');
        expect(resGetAppointment.status).toEqual(500);
        expect(resGetAppointment.body.error).toEqual(`Appointment does not exist`);
        expect(resGetSlot.booked).toBeFalsy();
    });
});
