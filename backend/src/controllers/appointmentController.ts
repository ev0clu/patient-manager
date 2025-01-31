import type { NextFunction, Request, Response } from 'express';
import prisma from '../../prisma/prisma';
import { appointmentSchema } from '../schemas/appointmentSchema';
import { env } from '../utils/env';

export const getAppointment = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        const appointment = await prisma.appointment.findUnique({
            where: { id }
        });

        if (user.email === env.ADMIN_EMAIL || appointment.userId === userId) {
            if (!appointment) {
                res.status(500).json({
                    error: `Appointment does not exist`
                });
            }

            res.status(200).json({
                appointment
            });
        }

        res.status(403).json({
            error: `Access denied`
        });
    } catch (err) {
        next(err);
    }
};

export const getAllAppointments = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (user.email === env.ADMIN_EMAIL) {
            const appointments = await prisma.appointment.findMany({
                orderBy: {
                    createdAt: 'desc'
                }
            });
            res.status(200).json({
                appointments
            });
        }

        const appointments = await prisma.appointment.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            appointments
        });
    } catch (err) {
        next(err);
    }
};

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const body = appointmentSchema.parse(req.body);
    const { doctor, description, status, appointmentDate } = body;

    try {
        const appointment = await prisma.appointment.create({
            data: {
                doctor,
                description,
                status,
                appointmentDate,
                user: { connect: { id: userId } }
            }
        });
        res.status(201).json({
            appointment
        });
    } catch (err) {
        next(err);
    }
};

export const updateAppointment = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId;

    const body = appointmentSchema.parse(req.body);
    const { doctor, description, status, appointmentDate } = body;

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id, userId }
        });
        if (!appointment) {
            res.status(500).json({
                error: `Appointment does not exist`
            });
        }

        const updateAppointment = await prisma.appointment.update({
            where: {
                id
            },

            data: { doctor, description, status, appointmentDate }
        });
        res.status(200).json({
            appointment: updateAppointment
        });
    } catch (err) {
        next(err);
    }
};

export const deleteAppointment = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id, userId }
        });
        if (!appointment) {
            res.status(500).json({
                error: `Appointment does not exist`
            });
        }

        await prisma.appointment.delete({
            where: { id }
        });
        res.status(200).json({
            message: 'Appointment deleted successfully'
        });
    } catch (err) {
        next(err);
    }
};
