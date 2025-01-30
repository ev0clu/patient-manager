import { Router } from 'express';
import { loginUser, registerUser, refreshAccessToken } from '../controllers/authControllers';
import { validateData } from '../middlewares/validationMiddleware';
import { userLoginSchema, userRegistrationSchema } from '../schemas/authSchema';

const authRouter = Router();

authRouter.post('/register', validateData(userRegistrationSchema), registerUser);
authRouter.post('/login', validateData(userLoginSchema), loginUser);
authRouter.post('/refresh', refreshAccessToken);

export default authRouter;
