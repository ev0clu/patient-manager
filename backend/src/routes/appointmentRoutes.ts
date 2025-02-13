import { Router } from 'express';
import {
    createAppointment,
    deleteAppointment,
    getAllAppointments,
    getAppointment,
    updateAppointment
} from '../controllers/appointmentController';
import { validateData } from '../middlewares/validationMiddleware';
import { createAppointmentSchema, updateAppointmentSchema } from '../schemas/appointmentSchema';

const appointmentRouter = Router();

appointmentRouter.post('/', validateData(createAppointmentSchema), createAppointment);
appointmentRouter.get('/:id', getAppointment);
appointmentRouter.get('/', getAllAppointments);
appointmentRouter.put('/:id', validateData(updateAppointmentSchema), updateAppointment);
appointmentRouter.delete('/:id', deleteAppointment);

export default appointmentRouter;
