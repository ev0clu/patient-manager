import { z } from 'zod';
import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envFile });

const envSchema = z.object({
    NODE_ENV: z.enum(['test', 'development']),
    PORT: z
        .string()
        .trim()
        .min(1)
        .refine((port) => parseInt(port) > 0 && parseInt(port) < 65536, 'Invalid port number'),
    BASE_URL: z
        .string()
        .trim()
        .min(1)
        .refine((url) => url.startsWith('http') || url.startsWith('https'), 'Invalid URL format'),
    SALT_ROUNDS: z
        .string()
        .trim()
        .min(1)
        .refine(
            (rounds) => parseInt(rounds) >= 10 && parseInt(rounds) <= 12,
            'Invalid salt rounds number'
        ),
    JWT_SECRET: z.string().trim().min(10),
    ADMIN_USERNAME: z
        .string()
        .trim()
        .min(4, 'Username is required to be min 4 characters')
        .max(10, "Username shall be max 10 characters'"),
    ADMIN_EMAIL: z.string().trim().email({ message: 'Email is invalid.' }),
    ADMIN_PASSWORD: z.string().trim().min(4),
    TEST_USERNAME: z
        .string()
        .trim()
        .min(4, 'Username is required to be min 4 characters')
        .max(10, "Username shall be max 10 characters'"),
    TEST_USER_EMAIL: z.string().trim().email({ message: 'Email is invalid.' }),
    TEST_USER_PASSWORD: z.string().trim().min(4),
    FRONTEND_BASE_URL: z
        .string()
        .trim()
        .min(1)
        .refine((url) => url.startsWith('http') || url.startsWith('https'), 'Invalid URL format')
});

type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
