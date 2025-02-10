import type { NextFunction, Request, Response } from 'express';
import prisma from '../../prisma/prisma';

export const getDoctor = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: { slots: true, appointments: true }
        });

        if (!doctor) {
            res.status(404).json({
                error: `Doctor does not exist`
            });
        } else {
            res.status(200).json({
                doctor
            });
        }
    } catch (err) {
        next(err);
    }
};

export const getAllDoctors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const doctors = await prisma.doctor.findMany({
            include: { slots: true, appointments: true }
        });
        res.status(200).json({
            doctors
        });
    } catch (err) {
        next(err);
    }
};
