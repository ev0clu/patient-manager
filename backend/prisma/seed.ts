import bcrypt from 'bcrypt';
import prisma from './prisma';
import { env } from '../src/utils/env';

async function main() {
    const adminHashedPassword = await bcrypt.hash(env.ADMIN_PASSWORD, Number(env.SALT_ROUNDS));
    const userHashedPassword = await bcrypt.hash(env.TEST_USER_PASSWORD, Number(env.SALT_ROUNDS));

    const admin = await prisma.user.create({
        data: {
            username: env.ADMIN_USERNAME,
            email: env.ADMIN_EMAIL,
            password: adminHashedPassword,
            phone: '+36501234567',
            role: 'ADMIN'
        }
    });

    const user = await prisma.user.create({
        data: {
            username: env.TEST_USERNAME,
            email: env.TEST_USER_EMAIL,
            password: userHashedPassword,
            phone: '+36500123456'
        }
    });

    console.log({ admin, user });
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
