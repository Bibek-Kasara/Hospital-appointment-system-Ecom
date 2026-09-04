import { Request, Response, NextFunction } from 'express';
import * as appointmentService from '../services/appointmentService.js';
import { sendSuccess } from '../utils/response.js';
import { AppointmentStatus } from '../types/index.js';
import { paramId } from '../utils/params.js';

export const book = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await appointmentService.bookAppointment(req.user!.id, req.body);
    sendSuccess(res, data, 'Appointment booked successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getMyAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await appointmentService.getPatientAppointments(
      req.user!.id,
      req.query as Parameters<typeof appointmentService.getPatientAppointments>[1],
    );
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getDoctorAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorId = paramId(req.params.id) || req.user!.id;
    const data = await appointmentService.getDoctorAppointments(
      doctorId,
      req.query as Parameters<typeof appointmentService.getDoctorAppointments>[1],
    );
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await appointmentService.getAllAppointments(
      req.query as Parameters<typeof appointmentService.getAllAppointments>[0],
    );
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await appointmentService.getAppointmentById(paramId(req.params.id), req.user!.id, req.user!.role);
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const cancel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await appointmentService.cancelAppointment(
      paramId(req.params.id),
      req.user!.id,
      req.user!.role,
    );
    sendSuccess(res, data, 'Appointment cancelled');
  } catch (error) {
    next(error);
  }
};

export const reschedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await appointmentService.rescheduleAppointment(
      paramId(req.params.id),
      req.user!.id,
      req.body.slot_id,
    );
    sendSuccess(res, data, 'Appointment rescheduled');
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await appointmentService.updateAppointmentStatus(
      paramId(req.params.id),
      req.user!.id,
      req.body.status as AppointmentStatus,
    );
    sendSuccess(res, data, 'Status updated');
  } catch (error) {
    next(error);
  }
};
