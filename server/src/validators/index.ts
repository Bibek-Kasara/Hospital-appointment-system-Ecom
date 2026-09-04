import { body } from 'express-validator';

export const registerValidation = [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('address').optional().trim(),
  body('date_of_birth').optional().isISO8601().withMessage('Invalid date of birth'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const departmentValidation = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('description').optional().trim(),
];

export const doctorValidation = [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('department_id').notEmpty().withMessage('Department is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('phone').optional().trim(),
  body('specialization').optional().trim(),
  body('qualification').optional().trim(),
  body('experience_years').optional().isInt({ min: 0 }).withMessage('Invalid experience years'),
  body('is_active').optional().isBoolean(),
];

export const slotValidation = [
  body('slot_date').isISO8601().withMessage('Valid slot date is required'),
  body('start_time').matches(/^\d{2}:\d{2}$/).withMessage('Start time must be HH:MM format'),
  body('end_time').matches(/^\d{2}:\d{2}$/).withMessage('End time must be HH:MM format'),
];

export const appointmentValidation = [
  body('doctor_id').notEmpty().withMessage('Doctor is required'),
  body('slot_id').notEmpty().withMessage('Slot is required'),
  body('reason').optional().trim(),
];

export const rescheduleValidation = [
  body('slot_id').notEmpty().withMessage('New slot is required'),
];

export const statusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status'),
];

export const profileValidation = [
  body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('address').optional().trim(),
  body('date_of_birth').optional().isISO8601(),
  body('gender').optional().isIn(['male', 'female', 'other']),
];
