import { NextFunction, Request, Response } from 'express';
import prisma from '../../prisma/prisma';
import bcrypt from 'bcrypt';
import { env } from '../utils/env';
import { decodeJwtToken, generateJwtAccessToken, generateJwtRefreshToken } from '../utils/auth';
import { userLoginSchema, userRegistrationSchema } from '../schemas/authSchema';

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const body = userRegistrationSchema.parse(req.body);

    const { username, email, password, phone } = body;

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
            data: { username, email, password: hashedPassword, phone }
        });

        res.status(201).json({
            message: 'User created successfully'
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

        res.status(200)
            .header('Authorization', accessToken)
            .header('X-Refresh-Token', refreshToken)
            .json({ message: 'Authentication succeed' });
    } catch (err) {
        next(err);
    }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.headers['x-refresh-token'] as string;

    if (!refreshToken) {
        res.status(401).json({
            message: 'Access Denied. No refresh token provided.',
            error: 'refresh-token-missing'
        });
    }

    try {
        const currentTime = Math.floor(Date.now() / 1000);

        const decodedRefreshToken = decodeJwtToken(refreshToken);

        if (currentTime > decodedRefreshToken.exp) {
            res.status(401).json({
                message: 'Access Denied. Refresh  token has expired.',
                error: 'refresh-token-expired'
            });
        }

        const accessToken = generateJwtAccessToken(decodedRefreshToken.userId);

        res.status(200)
            .header('X-Refresh-Token', refreshToken)
            .header('Authorization', accessToken)
            .json({ message: 'Access token refreshed successfully' });
    } catch (error) {
        next(error);
    }
};
