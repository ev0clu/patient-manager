import type { NextFunction, Request, Response } from 'express';
import prisma from '../../prisma/prisma';
import bcrypt from 'bcrypt';
import { env } from '../utils/env';
import { decodeJwtToken, generateJwtAccessToken, generateJwtRefreshToken } from '../utils/auth';
import { userLoginSchema, userRegistrationSchema } from '../schemas/authSchema';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const body = userRegistrationSchema.parse(req.body);

    const { username, email, password, phone, role } = body;

    try {
        const hashedPassword = await bcrypt.hash(password, Number(env.SALT_ROUNDS));

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            res.status(500).json({
                error: 'User already exist'
            });
        }

        await prisma.user.create({
            data: { username, email, password: hashedPassword, phone, role }
        });

        res.status(201).json({
            message: `${role === 'ADMIN' ? 'Admin' : 'User'} created successfully`
        });
    } catch (err) {
        next(err);
    }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const body = userLoginSchema.parse(req.body);

    const { email, password } = body;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            res.status(401).json({
                error: 'User does not exist'
            });
        }

        const matchPassword = await bcrypt.compare(password, user.password);

        if (!matchPassword) {
            res.status(401).json({
                error: 'Authentication failed'
            });
        }

        const accessToken = generateJwtAccessToken(user.id);
        const refreshToken = generateJwtRefreshToken(user.id);

        const userInfo = { username: user.username, email: user.email, role: user.role };

        res.status(200)
            .header('Authorization', accessToken)
            .header('X-Refresh-Token', refreshToken)
            .json({ message: 'Authentication succeed', userInfo });
    } catch (err) {
        next(err);
    }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.headers['x-refresh-token'] as string;

    if (!refreshToken) {
        res.status(403).json({
            message: 'Access denied. No refresh token provided.',
            error: 'refresh-token-missing'
        });
    }

    try {
        const decodedRefreshToken = decodeJwtToken(refreshToken);

        if (typeof decodedRefreshToken !== 'string') {
            const accessToken = generateJwtAccessToken(decodedRefreshToken.userId);

            res.status(200)
                .header('X-Refresh-Token', refreshToken)
                .header('Authorization', accessToken)
                .json({ message: 'Access token refreshed successfully' });
        }
    } catch (err) {
        next(err);
    }
};
