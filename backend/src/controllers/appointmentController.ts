import type { NextFunction, Request, Response } from 'express';
import prisma from '../../prisma/prisma';
import { ROLE } from '../constants/role';
import { createAppointmentSchema, updateAppointmentSchema } from '../schemas/appointmentSchema';

export const getAppointment = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { doctor: true, user: true, slot: true }
        });

        if (user.role === ROLE.admin || appointment.userId === userId) {
            res.status(200).json({
                appointment
            });
        }
        res.status(403).json({
            error: `Access denied`
        });
    } catch {
        next(new Error('Appointment does not exist'));
    }
};

export const getAllAppointments = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.userId;

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (user.role === ROLE.admin) {
            const appointments = await prisma.appointment.findMany({
                orderBy: {
                    createdAt: 'desc'
                },
                include: { doctor: true, user: true, slot: true }
            });
            res.status(200).json({
                appointments
            });
        }

        const appointments = await prisma.appointment.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc'
            },
            include: { doctor: true, user: true, slot: true }
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

    const body = createAppointmentSchema.parse(req.body);
    const { doctorId, description, slotId } = body;

    try {
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId }
        });

        if (!doctor) {
            res.status(500).json({
                error: `Doctor does not exist`
            });
        }

        const slot = await prisma.slot.findUnique({
            where: { id: slotId }
        });

        if (!slot) {
            res.status(500).json({
                error: `Slot does not exist`
            });
        }

        if (slot.booked || slot.doctorId !== doctorId) {
            res.status(500).json({
                error: `Appointment cannot be booked to this doctor in that slot`
            });
        } else {
            const [, appointment] = await prisma.$transaction([
                prisma.slot.update({
                    where: { id: slotId },
                    data: { booked: true }
                }),

                prisma.appointment.create({
                    data: {
                        doctor: { connect: { id: doctorId } },
                        description,
                        user: { connect: { id: userId } },
                        slot: { connect: { id: slotId } }
                    },
                    include: { doctor: true, user: true, slot: true }
                })
            ]);

            res.status(201).json({
                appointment
            });
        }
    } catch (err) {
        next(err);
    }
};

export const updateAppointment = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.userId;

    const body = updateAppointmentSchema.parse(req.body);
    const { description, status } = body;

    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id, userId }
        });

        if (!appointment) {
            res.status(500).json({
                error: `Appointment does not exist`
            });
        } else {
            const updatedAppointment = await prisma.appointment.update({
                where: { id },
                data: {
                    description,
                    status
                },
                include: { doctor: true, user: true, slot: true }
            });

            res.status(200).json({
                appointment: updatedAppointment
            });
        }
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
        } else {
            await prisma.appointment.delete({
                where: { id }
            });
            res.status(200).json({
                message: 'Appointment deleted successfully'
            });
        }
    } catch (err) {
        next(err);
    }
};
