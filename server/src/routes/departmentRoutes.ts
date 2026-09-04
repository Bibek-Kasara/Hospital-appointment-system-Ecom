import { Router } from 'express';
import * as departmentController from '../controllers/departmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/errorHandler.js';
import { departmentValidation } from '../validators/index.js';

const router = Router();

router.get('/', departmentController.list);
router.post('/', authenticate, authorize('admin'), departmentValidation, validate, departmentController.create);
router.get('/:id', departmentController.getById);
router.put('/:id', authenticate, authorize('admin'), departmentValidation, validate, departmentController.update);
router.delete('/:id', authenticate, authorize('admin'), departmentController.remove);

export default router;
