import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService.js';
import { sendSuccess } from '../utils/response.js';

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.getProfile(req.user!.id, req.user!.role);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.updateProfile(req.user!.id, req.user!.role, req.body);
    sendSuccess(res, data, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

export const getPatients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.getPatients(req.query as Parameters<typeof userService.getPatients>[0]);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.getAdminStats();
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.getReports(req.query as Parameters<typeof userService.getReports>[0]);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await userService.getPatientNotifications(req.user!.id);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};
