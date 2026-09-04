import { Request, Response, NextFunction } from 'express';
import * as doctorService from '../services/doctorService.js';
import { sendSuccess } from '../utils/response.js';
import { paramId } from '../utils/params.js';
import { AppError } from '../utils/AppError.js';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await doctorService.getDoctors(req.query as Parameters<typeof doctorService.getDoctors>[0]);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await doctorService.getDoctorById(paramId(req.params.id));
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.body.password) throw new AppError('Password is required', 400);
    const data = await doctorService.createDoctor(req.body);
    sendSuccess(res, data, 'Doctor created', 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const doctorId = paramId(id);
    const user = req.user!;

    if (user.role === 'doctor' && user.id !== doctorId) {
      throw new AppError('You can only update your own profile', 403);
    }

    const data = await doctorService.updateDoctor(doctorId, req.body);
    sendSuccess(res, data, 'Doctor updated');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await doctorService.deleteDoctor(paramId(req.params.id));
    sendSuccess(res, null, 'Doctor deleted');
  } catch (error) {
    next(error);
  }
};
