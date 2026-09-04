import { Router } from 'express';
import * as slotController from '../controllers/slotController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.put('/:id', authenticate, authorize('admin', 'doctor'), slotController.update);
router.delete('/:id', authenticate, authorize('admin', 'doctor'), slotController.remove);

export default router;
