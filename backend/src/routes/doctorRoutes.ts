import { Router } from 'express';
import { getAllDoctors, getDoctor } from '../controllers/doctorController';

const doctorRouter = Router();

doctorRouter.get('/:id', getDoctor);
doctorRouter.get('/', getAllDoctors);

export default doctorRouter;
