import express, { Express, NextFunction, Request, Response } from 'express';
import { env } from './utils/env';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import createHttpError from 'http-errors';
import cors from 'cors';
import { Prisma } from '@prisma/client';
import { JsonWebTokenError } from 'jsonwebtoken';
import { verifyJwtTokens } from './middlewares/authMiddleware';
import authRouter from './routes/authRoutes';
import appointmentRouter from './routes/appointmentRoutes';

const PORT = Number(env.PORT) || 4000;
const BASE_URL = env.BASE_URL || 'http://localhost';

// Init Express App
const app: Express = express();

// Express Dependencies
app.use(helmet());
app.use(
    cors({
        origin: [`${env.FRONTEND_BASE_URL}:8081`, 'http://localhost:8081'], // Need to use direct IP address instead of localhost
        credentials: true, // Allow cookies to be sent with requests
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allowed HTTP methods
        allowedHeaders: [
            'Content-Type',
            'Content-Length',
            'Authorization',
            'Accept',
            'Access-Control-Allow-Headers',
            'Access-Control-Expose-Headers',
            'X-Requested-With',
            'Origin'
        ],
        exposedHeaders: ['Authorization', 'Set-Cookie']
    })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/appointments', verifyJwtTokens(), appointmentRouter);

// Catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
    next(createHttpError(404));
});

// Error handler
app.use(function (err: Error, req: Request, res: Response) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        res.status(500).json({
            error: `Prisma error code: ${err.code}`
        });
    }
    if (err instanceof JsonWebTokenError) {
        res.status(500).json({
            error: err.name
        });
    }

    res.status(500).json({
        error: err.message
    });
});

const server = app.listen(PORT, () => {
    console.log(`Server running at ${BASE_URL}:${PORT}`);
});

export default server;
