import { Router } from 'express';
import {
    createAppointment,
    deleteAppointment,
    getAllAppointments,
    getAppointment,
    updateAppointment
} from '../controllers/appointmentController';
import { validateData } from '../middlewares/validationMiddleware';
import { appointmentSchema } from '../schemas/appointmentSchema';

const appointmentRouter = Router();

appointmentRouter.post('/', validateData(appointmentSchema), createAppointment);
appointmentRouter.get('/:id', getAppointment);
appointmentRouter.get('/', getAllAppointments);
appointmentRouter.put('/:id', validateData(appointmentSchema), updateAppointment);
appointmentRouter.delete('/:id', deleteAppointment);

export default appointmentRouter;
