import { Request, Response, NextFunction } from 'express';
import { decodeJwtToken } from '../utils/auth';

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
            const decoded = decodeJwtToken(accessToken);
            req.userId = decoded.userId;
            next();
        } catch {
            res.status(401).json({
                message: 'Access token expired',
                error: 'access-token-expired'
            });
        }
    };
}
