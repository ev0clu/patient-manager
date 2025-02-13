import { z } from 'zod';

const StatusValues = ['PENDING', 'SCHEDULED', 'CANCELLED'] as const;

export const createAppointmentSchema = z.object({
    doctorId: z.string().trim().nonempty('Doctor Id is required'),
    description: z.optional(z.string().trim()),
    status: z.optional(z.enum(StatusValues)),
    slotId: z.string().trim().nonempty('Slot Id is required')
});

export const updateAppointmentSchema = z.object({
    description: z.optional(z.string().trim()),
    status: z.optional(z.enum(StatusValues))
});
