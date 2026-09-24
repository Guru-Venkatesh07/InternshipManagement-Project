import { verifyTokenString } from '../utils/jwt.js';
import prisma from '../config/db.js';
import { AppError } from './errorHandler.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Access denied. No authentication token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyTokenString(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        studentProfile: true,
        employerProfile: true,
        facultyProfile: true,
      },
    });

    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact an administrator.', 403);
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentProfile: user.studentProfile,
      employerProfile: user.employerProfile,
      facultyProfile: user.facultyProfile,
    };

    next();
  } catch (error) {
    next(error);
  }
};
