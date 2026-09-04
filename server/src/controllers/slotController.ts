import { Request, Response, NextFunction } from 'express';
import * as slotService from '../services/slotService.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';
import { paramId } from '../utils/params.js';
import { Slot } from '../models/index.js';

export const listByDoctor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await slotService.getDoctorSlots(
      paramId(req.params.id),
      req.query as Parameters<typeof slotService.getDoctorSlots>[1],
    );
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = paramId(req.params.id);
    const user = req.user!;

    if (user.role === 'doctor' && user.id !== doctorId) {
      throw new AppError('You can only manage your own slots', 403);
    }

    const data = await slotService.createSlot(doctorId, req.body);
    sendSuccess(res, data, 'Slot created', 201);
  } catch (error) {
    next(error);
  }
};

export const createBulk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = paramId(req.params.id);
    const user = req.user!;

    if (user.role === 'doctor' && user.id !== doctorId) {
      throw new AppError('You can only manage your own slots', 403);
    }

    const slots = req.body.slots || [req.body];
    const data = await slotService.createBulkSlots(doctorId, slots);
    sendSuccess(res, data, `${data.length} slot(s) created`, 201);
  } catch (error) {
    next(error);
  }
};

export const createAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = paramId(req.params.id);
    const user = req.user!;
    if (user.role === 'doctor' && user.id !== doctorId) {
      throw new AppError('You can only manage your own slots', 403);
    }
    const data = await slotService.createAvailability(doctorId, req.body);
    sendSuccess(res, data, `${data.length} slot(s) created`, 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slot = await Slot.findById(paramId(req.params.id));
    if (!slot) throw new AppError('Slot not found', 404);
    if (req.user!.role === 'doctor' && slot.doctor_id.toString() !== req.user!.id) {
      throw new AppError('You can only manage your own slots', 403);
    }
    const data = await slotService.updateSlot(slot.id, req.body);
    sendSuccess(res, data, 'Slot updated');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const slot = await Slot.findById(paramId(req.params.id));
    if (!slot) throw new AppError('Slot not found', 404);
    if (req.user!.role === 'doctor' && slot.doctor_id.toString() !== req.user!.id) {
      throw new AppError('You can only manage your own slots', 403);
    }
    await slotService.deleteSlot(slot.id);
    sendSuccess(res, null, 'Slot deleted');
  } catch (error) {
    next(error);
  }
};
