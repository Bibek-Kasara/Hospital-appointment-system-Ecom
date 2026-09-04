import { Router } from 'express';
import * as appointmentController from '../controllers/appointmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';
import { appointmentValidation, rescheduleValidation, statusValidation } from '../validators/index.js';

const router = Router();

router.post('/', authenticate, authorize('patient'), appointmentValidation, validate, appointmentController.book);
router.get('/me', authenticate, authorize('patient'), appointmentController.getMyAppointments);
router.get('/doctor/:id', authenticate, authorize('doctor', 'admin'), appointmentController.getDoctorAppointments);
router.get('/', authenticate, authorize('admin'), appointmentController.getAll);
router.get('/:id', authenticate, appointmentController.getById);
router.patch('/:id/cancel', authenticate, authorize('patient', 'admin'), appointmentController.cancel);
router.patch('/:id/reschedule', authenticate, authorize('patient'), rescheduleValidation, validate, appointmentController.reschedule);
router.patch('/:id/status', authenticate, authorize('doctor'), statusValidation, validate, appointmentController.updateStatus);

export default router;
