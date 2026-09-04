import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';
import { profileValidation } from '../validators/index.js';

const router = Router();

router.get('/me', authenticate, userController.getMe);
router.put('/me', authenticate, profileValidation, validate, userController.updateMe);
router.get('/notifications', authenticate, authorize('patient'), userController.getNotifications);
router.get('/patients', authenticate, authorize('admin'), userController.getPatients);

export default router;
