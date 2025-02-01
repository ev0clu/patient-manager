import type { Request, Response, NextFunction } from 'express';
import { decodeJwtToken } from '../utils/auth';
import type { JwtPayload } from 'jsonwebtoken';

export function verifyJwtTokens() {
    return (req: Request, res: Response, next: NextFunction) => {
        const accessToken = req.headers['authorization'];
        const refreshToken = req.headers['x-refresh-token'];

        if (!accessToken) {
            res.status(401).json({
                message: 'Access Denied. No access token provided.',
                error: 'access-token-missing'
            });
        }

        if (!refreshToken) {
            res.status(401).json({
                message: 'Access Denied. No refresh token provided.',
                error: 'refresh-token-missing'
            });
        }

        try {
            const decoded = decodeJwtToken(accessToken) as JwtPayload & { userId: string };
            req.userId = decoded.userId;
            next();
        } catch {
            next(new Error('access-token-expired'));
        }
    };
}
