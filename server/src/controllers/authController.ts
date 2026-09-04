import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService.js';
import { sendSuccess } from '../utils/response.js';
import { REFRESH_COOKIE_NAME, refreshCookieOptions } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.registerPatient(req.body);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);
    sendSuccess(
      res,
      { user: result.user, accessToken: result.accessToken },
      'Registration successful',
      201,
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);
    sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies[REFRESH_COOKIE_NAME];
    if (!token) {
      throw new AppError('Refresh token required', 401);
    }
    const result = await authService.refreshTokens(token);
    res.cookie(REFRESH_COOKIE_NAME, result.refreshToken, refreshCookieOptions);
    sendSuccess(res, { accessToken: result.accessToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  sendSuccess(res, null, 'Logged out successfully');
};
