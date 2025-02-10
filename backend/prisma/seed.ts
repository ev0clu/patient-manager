import bcrypt from 'bcrypt';
import prisma from './prisma';
import { env } from '../src/utils/env';
import { DOCTORS } from '../src/constants/doctors';

async function main() {
    const adminHashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, Number(env.SALT_ROUNDS));
    const userHashedPassword = await bcrypt.hash(env.TEST_USER_PASSWORD, Number(env.SALT_ROUNDS));

    // Create test user
    const admin = await prisma.user.create({
        data: {
            username: env.ADMIN_USERNAME,
            email: env.ADMIN_EMAIL,
            password: adminHashedPassword,
            phone: '+36501234567',
            role: 'ADMIN'
        }
    });

    // Create admin user
    const user = await prisma.user.create({
        data: {
            username: env.TEST_USERNAME,
            email: env.TEST_USER_EMAIL,
            password: userHashedPassword,
            phone: '+36500123456'
        }
    });

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

    const slots = await prisma.slot.findMany();

    console.log({ admin, user, doctors, slots });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
