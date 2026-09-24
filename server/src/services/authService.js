import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const registerStudent = async (data, ipAddress = null) => {
  const { name, email, password, rollNumber, department, year, cgpa, skills, phone } = data;

  if (!name || !email || !password || !rollNumber || !department) {
    throw new AppError('Name, email, password, roll number, and department are required.', 400);
  }

  // Check if email already in use
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  // Check if roll number already registered
  const existingRoll = await prisma.studentProfile.findUnique({ where: { rollNumber } });
  if (existingRoll) {
    throw new AppError('A student profile with this roll number already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Pick default or first available faculty advisor if any exists
  const defaultFaculty = await prisma.facultyProfile.findFirst();

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'STUDENT',
      studentProfile: {
        create: {
          rollNumber,
          department,
          year: parseInt(year) || 3,
          cgpa: parseFloat(cgpa) || 0.0,
          skills: skills || '',
          phone: phone || null,
          facultyAdvisorId: defaultFaculty ? defaultFaculty.id : null,
        },
      },
    },
    include: {
      studentProfile: true,
    },
  });

  await logAuditEvent({
    actorUserId: user.id,
    action: 'REGISTER_STUDENT',
    resourceType: 'User',
    resourceId: user.id,
    ipAddress,
    metadata: { email, rollNumber, department },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.studentProfile,
    },
  };
};

export const registerEmployer = async (data, ipAddress = null) => {
  const { name, email, password, companyName, industry, description, website, address, contactPerson, phone } = data;

  if (!name || !email || !password || !companyName || !industry || !phone) {
    throw new AppError('Name, email, password, company name, industry, and phone are required.', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'EMPLOYER',
      employerProfile: {
        create: {
          companyName,
          industry,
          description: description || null,
          website: website || null,
          address: address || null,
          contactPerson: contactPerson || name,
          phone,
          verificationStatus: 'PENDING',
        },
      },
    },
    include: {
      employerProfile: true,
    },
  });

  await logAuditEvent({
    actorUserId: user.id,
    action: 'REGISTER_EMPLOYER',
    resourceType: 'User',
    resourceId: user.id,
    ipAddress,
    metadata: { email, companyName, industry },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.employerProfile,
    },
  };
};

export const loginUser = async ({ email, password }, ipAddress = null) => {
  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      studentProfile: {
        include: {
          facultyAdvisor: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      },
      employerProfile: true,
      facultyProfile: true,
    },
  });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated. Please contact an administrator.', 403);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    await logAuditEvent({
      actorUserId: user.id,
      action: 'LOGIN_FAILED',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress,
      metadata: { reason: 'Incorrect password' },
    });
    throw new AppError('Invalid email or password.', 401);
  }

  await logAuditEvent({
    actorUserId: user.id,
    action: 'LOGIN_SUCCESS',
    resourceType: 'User',
    resourceId: user.id,
    ipAddress,
    metadata: { role: user.role },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });

  const profile =
    user.role === 'STUDENT'
      ? user.studentProfile
      : user.role === 'EMPLOYER'
      ? user.employerProfile
      : user.role === 'FACULTY'
      ? user.facultyProfile
      : null;

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile,
    },
  };
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      studentProfile: {
        include: {
          facultyAdvisor: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      },
      employerProfile: true,
      facultyProfile: true,
    },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const profile =
    user.role === 'STUDENT'
      ? user.studentProfile
      : user.role === 'EMPLOYER'
      ? user.employerProfile
      : user.role === 'FACULTY'
      ? user.facultyProfile
      : null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    profile,
    createdAt: user.createdAt,
  };
};

export const changeUserPassword = async (userId, currentPassword, newPassword, ipAddress = null) => {
  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required.', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters long.', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Current password is incorrect.', 400);
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });

  await logAuditEvent({
    actorUserId: userId,
    action: 'CHANGE_PASSWORD',
    resourceType: 'User',
    resourceId: userId,
    ipAddress,
  });

  return { message: 'Password updated successfully.' };
};
