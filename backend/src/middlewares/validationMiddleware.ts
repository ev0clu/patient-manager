import type { Request, Response, NextFunction } from 'express';
import type { z } from 'zod';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';

export function validateData<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.errors.map((issue) => ({
                    message: `${issue.path.join('.')} is ${issue.message}`
                }));
                res.status(StatusCodes.BAD_REQUEST).json({
                    error: 'Invalid data',
                    details: errorMessages
                });
            } else {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    error: 'Internal Server Error'
                });
            }
        }
    };
}
