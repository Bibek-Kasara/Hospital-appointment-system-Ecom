import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { validate } from '../middleware/errorHandler.js';
import { loginValidation, registerValidation } from '../validators/index.js';

const router = Router();

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

export default router;
