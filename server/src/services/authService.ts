import { User, Doctor, Admin } from '../models/index.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  createTokenPayload,
} from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { UserRole } from '../types/index.js';

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

const findUserByEmail = async (email: string): Promise<(AuthUser & { password_hash: string }) | null> => {
  const normalizedEmail = email.toLowerCase().trim();

  const patient = await User.findOne({ email: normalizedEmail });
  if (patient) {
    return {
      id: patient._id.toString(),
      email: patient.email,
      full_name: patient.full_name,
      role: 'patient',
      password_hash: patient.password_hash,
    };
  }

  const doctor = await Doctor.findOne({ email: normalizedEmail });
  if (doctor) {
    return {
      id: doctor._id.toString(),
      email: doctor.email,
      full_name: doctor.full_name,
      role: 'doctor',
      password_hash: doctor.password_hash,
    };
  }

  const admin = await Admin.findOne({ email: normalizedEmail });
  if (admin) {
    return {
      id: admin._id.toString(),
      email: admin.email,
      full_name: admin.full_name,
      role: 'admin',
      password_hash: admin.password_hash,
    };
  }

  return null;
};

export const registerPatient = async (data: {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  date_of_birth?: Date;
  gender?: string;
}) => {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const password_hash = await hashPassword(data.password);
  const user = await User.create({
    ...data,
    email: data.email.toLowerCase(),
    password_hash,
    role: 'patient',
  });

  const tokens = generateTokens(user._id.toString(), user.email, 'patient');

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

export const login = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.role === 'doctor') {
    const doctor = await Doctor.findById(user.id);
    if (doctor && !doctor.is_active) {
      throw new AppError('Doctor account is deactivated', 403);
    }
  }

  const tokens = generateTokens(user.id, user.email, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
    ...tokens,
  };
};

export const refreshTokens = async (refreshToken: string) => {
  const { verifyRefreshToken } = await import('../utils/jwt.js');
  const decoded = verifyRefreshToken(refreshToken);
  const tokens = generateTokens(decoded.id, decoded.email, decoded.role);
  return tokens;
};

const generateTokens = (id: string, email: string, role: UserRole) => {
  const payload = createTokenPayload(id, email, role);
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

const sanitizeUser = (user: InstanceType<typeof User>) => ({
  id: user._id.toString(),
  full_name: user.full_name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  date_of_birth: user.date_of_birth,
  gender: user.gender,
  role: user.role,
  created_at: user.created_at,
});

export { findUserByEmail };
