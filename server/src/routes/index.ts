import { Router } from 'express';
import authRoutes from './authRoutes.js';
import departmentRoutes from './departmentRoutes.js';
import doctorRoutes from './doctorRoutes.js';
import slotRoutes from './slotRoutes.js';
import appointmentRoutes from './appointmentRoutes.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/departments', departmentRoutes);
router.use('/doctors', doctorRoutes);
router.use('/slots', slotRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;
