import jwt from 'jsonwebtoken';
import { env } from './env';

export function generateJwtAccessToken(userId: string) {
    const token = jwt.sign({ userId }, env.JWT_SECRET, {
        expiresIn: '60s'
    });
    return token;
}

export function generateJwtRefreshToken(userId: string) {
    const token = jwt.sign({ userId }, env.JWT_SECRET, {
        expiresIn: '1d'
    });
    return token;
}

export function decodeJwtToken(token: string) {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & { userId: string };
    return decoded;
}
