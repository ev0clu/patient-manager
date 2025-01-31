import { z } from 'zod';

const StatusValues = ['PENDING', 'SCHEDULED', 'CANCELLED'] as const;

export const appointmentSchema = z.object({
    doctor: z.string().trim().min(4, 'Doctor name is required to be min 4 characters'),
    description: z.optional(z.string().trim()),
    status: z.optional(z.enum(StatusValues)),
    appointmentDate: z.string().datetime()
});
