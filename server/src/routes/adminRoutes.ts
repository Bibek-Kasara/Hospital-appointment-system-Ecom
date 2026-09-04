import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/stats', authenticate, authorize('admin'), userController.getStats);
router.get('/reports', authenticate, authorize('admin'), userController.getReports);

export default router;
