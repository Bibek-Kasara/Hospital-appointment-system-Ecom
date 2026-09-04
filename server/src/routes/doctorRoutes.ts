import { Router } from 'express';
import * as doctorController from '../controllers/doctorController.js';
import * as slotController from '../controllers/slotController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';
import { doctorValidation, slotValidation } from '../validators/index.js';

const router = Router();

router.get('/', doctorController.list);
router.get('/:id', doctorController.getById);
router.post('/', authenticate, authorize('admin'), doctorValidation, validate, doctorController.create);
router.put('/:id', authenticate, authorize('admin', 'doctor'), doctorValidation, validate, doctorController.update);
router.delete('/:id', authenticate, authorize('admin'), doctorController.remove);

router.get('/:id/slots', slotController.listByDoctor);
router.post('/:id/slots', authenticate, authorize('admin', 'doctor'), slotValidation, validate, slotController.create);
router.post('/:id/slots/bulk', authenticate, authorize('admin', 'doctor'), slotController.createBulk);
router.post('/:id/availability', authenticate, authorize('admin', 'doctor'), slotValidation, validate, slotController.createAvailability);

export default router;
