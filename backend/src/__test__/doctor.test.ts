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

describe('GET /:id', () => {
    test('should return error because doctor does not exist', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const mockDoctorId = crypto.randomUUID();

        const resGetAppointment = await request(server)
            .get(`/api/v1/doctors/${mockDoctorId}`)
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(resGetAppointment.headers['content-type']).toMatch(/json/);
        expect(resGetAppointment.status).toEqual(404);
        expect(resGetAppointment.body.error).toEqual(`Doctor does not exist`);
    });

    test('should return existing doctor', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const doctors = await prisma.doctor.findMany({
            include: { slots: true, appointments: true }
        });

        for (const doctor of doctors) {
            const resGetAppointment = await request(server)
                .get(`/api/v1/doctors/${doctor.id}`)
                .set('Authorization', accessToken)
                .set('X-Refresh-Token', refreshToken);

            expect(resGetAppointment.headers['content-type']).toMatch(/json/);
            expect(resGetAppointment.status).toEqual(200);
            expect(resGetAppointment.body.doctor).toHaveProperty('id');
            expect(resGetAppointment.body.doctor).toHaveProperty('name');
            expect(resGetAppointment.body.doctor).toHaveProperty('image');
            expect(resGetAppointment.body.doctor).toHaveProperty('slots');
            expect(resGetAppointment.body.doctor).toHaveProperty('appointments');
            expect(resGetAppointment.body.doctor).toHaveProperty('createdAt');
            expect(resGetAppointment.body.doctor).toHaveProperty('updatedAt');
        }
    });
});

describe('GET /', () => {
    test('should return array with 5 doctors', async () => {
        const resLogin = await request(server).post('/api/v1/auth/login').send({ email, password });

        const accessToken = resLogin.headers['authorization'];
        const refreshToken = resLogin.headers['x-refresh-token'];

        const resGetAllAppointments = await request(server)
            .get(`/api/v1/doctors`)
            .set('Authorization', accessToken)
            .set('X-Refresh-Token', refreshToken);

        expect(resGetAllAppointments.headers['content-type']).toMatch(/json/);
        expect(resGetAllAppointments.status).toEqual(200);
        expect(Array.isArray(resGetAllAppointments.body.doctors)).toBe(true);
        expect(resGetAllAppointments.body.doctors.length).toBe(5);
    });
});
