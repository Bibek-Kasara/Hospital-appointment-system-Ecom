import { Request, Response, NextFunction } from 'express';
import * as departmentService from '../services/departmentService.js';
import { sendSuccess } from '../utils/response.js';
import { paramId } from '../utils/params.js';

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await departmentService.getDepartments(req.query as { page?: string; limit?: string; search?: string });
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await departmentService.getDepartmentById(paramId(req.params.id));
    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await departmentService.createDepartment(req.body);
    sendSuccess(res, data, 'Department created', 201);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await departmentService.updateDepartment(paramId(req.params.id), req.body);
    sendSuccess(res, data, 'Department updated');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await departmentService.deleteDepartment(paramId(req.params.id));
    sendSuccess(res, null, 'Department deleted');
  } catch (error) {
    next(error);
  }
};
