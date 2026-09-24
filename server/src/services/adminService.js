import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getAdminMetrics = async () => {
  const [
    totalUsers,
    totalStudents,
    totalEmployers,
    totalFaculty,
    totalInternships,
    activeInternships,
    totalApplications,
    shortlistedApplications,
    selectedApplications,
    ongoingPlacements,
    completedPlacements,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'EMPLOYER' } }),
    prisma.user.count({ where: { role: 'FACULTY' } }),
    prisma.internshipPosting.count(),
    prisma.internshipPosting.count({ where: { status: 'PUBLISHED' } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: 'SHORTLISTED' } }),
    prisma.application.count({ where: { status: 'SELECTED' } }),
    prisma.internshipRecord.count({ where: { status: 'ONGOING' } }),
    prisma.internshipRecord.count({ where: { status: 'COMPLETED' } }),
  ]);

  return {
    totalUsers,
    totalStudents,
    totalEmployers,
    totalFaculty,
    totalInternships,
    activeInternships,
    totalApplications,
    shortlistedApplications,
    selectedApplications,
    ongoingPlacements,
    completedPlacements,
  };
};

export const getUsers = async (query = {}) => {
  const { role, search, status } = query;

  const where = {};

  if (role && role !== 'ALL') {
    where.role = role;
  }

  if (status !== undefined && status !== 'ALL') {
    where.isActive = status === 'active' || status === 'true';
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      studentProfile: {
        select: { rollNumber: true, department: true, cgpa: true, year: true },
      },
      employerProfile: {
        select: { companyName: true, industry: true, verificationStatus: true },
      },
      facultyProfile: {
        select: { facultyId: true, department: true, designation: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
};

export const toggleUserStatus = async (userId, actorUserId, ipAddress = null) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (user.id === actorUserId) {
    throw new AppError('You cannot deactivate your own administrative account.', 400);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  await logAuditEvent({
    actorUserId,
    action: updated.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
    resourceType: 'User',
    resourceId: userId,
    ipAddress,
    metadata: { email: user.email, newActiveState: updated.isActive },
  });

  return updated;
};

export const createFacultyAccount = async (data, actorUserId, ipAddress = null) => {
  const { name, email, password, facultyId, department, designation, phone } = data;

  if (!name || !email || !password || !facultyId || !department) {
    throw new AppError('Name, email, password, faculty ID, and department are required.', 400);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const existingId = await prisma.facultyProfile.findUnique({ where: { facultyId } });
  if (existingId) {
    throw new AppError('A faculty profile with this faculty ID already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'FACULTY',
      isActive: true,
      facultyProfile: {
        create: {
          facultyId,
          department,
          designation: designation || 'Assistant Professor',
          phone: phone || null,
        },
      },
    },
    include: {
      facultyProfile: true,
    },
  });

  await logAuditEvent({
    actorUserId,
    action: 'FACULTY_ACCOUNT_CREATED',
    resourceType: 'User',
    resourceId: user.id,
    ipAddress,
    metadata: { email, facultyId, department },
  });

  return user;
};

export const getCompanies = async () => {
  return await prisma.employerProfile.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true, isActive: true, createdAt: true },
      },
      _count: {
        select: { internships: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const updateCompanyVerification = async (employerProfileId, verificationStatus, actorUserId, ipAddress = null) => {
  if (!['PENDING', 'VERIFIED', 'REJECTED'].includes(verificationStatus)) {
    throw new AppError("Status must be 'PENDING', 'VERIFIED', or 'REJECTED'.", 400);
  }

  const updated = await prisma.employerProfile.update({
    where: { id: employerProfileId },
    data: { verificationStatus },
    include: { user: true },
  });

  await logAuditEvent({
    actorUserId,
    action: `COMPANY_VERIFICATION_${verificationStatus}`,
    resourceType: 'EmployerProfile',
    resourceId: employerProfileId,
    ipAddress,
    metadata: { companyName: updated.companyName, verificationStatus },
  });

  return updated;
};

export const getAllInternshipsAdmin = async (query = {}) => {
  const { status, search } = query;

  const where = {};
  if (status && status !== 'ALL') {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { employer: { companyName: { contains: search } } },
    ];
  }

  return await prisma.internshipPosting.findMany({
    where,
    include: {
      employer: true,
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAllApplicationsAdmin = async (query = {}) => {
  const { status, search } = query;

  const where = {};
  if (status && status !== 'ALL') {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { student: { user: { name: { contains: search } } } },
      { internship: { title: { contains: search } } },
      { internship: { employer: { companyName: { contains: search } } } },
    ];
  }

  return await prisma.application.findMany({
    where,
    include: {
      student: { include: { user: { select: { name: true, email: true } } } },
      internship: { include: { employer: { select: { companyName: true } } } },
      interview: true,
      internshipRecord: true,
    },
    orderBy: { appliedAt: 'desc' },
  });
};

export const getAuditLogs = async (query = {}) => {
  const { action, search } = query;

  const where = {};
  if (action && action !== 'ALL') {
    where.action = { contains: action };
  }
  if (search) {
    where.OR = [
      { action: { contains: search } },
      { resourceType: { contains: search } },
      { actor: { name: { contains: search } } },
      { actor: { email: { contains: search } } },
    ];
  }

  return await prisma.auditLog.findMany({
    where,
    include: {
      actor: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100, // Top 100 recent events
  });
};

export const generateReportData = async (type) => {
  if (type === 'users') {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    const header = 'ID,Name,Email,Role,IsActive,CreatedAt\n';
    const rows = users
      .map((u) => `"${u.id}","${u.name}","${u.email}","${u.role}",${u.isActive},"${u.createdAt.toISOString()}"`)
      .join('\n');
    return header + rows;
  }

  if (type === 'internships') {
    const postings = await prisma.internshipPosting.findMany({
      include: { employer: true, _count: { select: { applications: true } } },
    });
    const header = 'ID,Title,Company,Department,Location,Stipend,Openings,Status,ApplicationsCount,Deadline\n';
    const rows = postings
      .map(
        (p) =>
          `"${p.id}","${p.title}","${p.employer.companyName}","${p.departmentRequired}","${p.location}",${p.stipend},${p.openings},"${p.status}",${p._count.applications},"${p.applicationDeadline.toISOString()}"`
      )
      .join('\n');
    return header + rows;
  }

  if (type === 'applications') {
    const apps = await prisma.application.findMany({
      include: {
        student: { include: { user: true } },
        internship: { include: { employer: true } },
      },
    });
    const header = 'ApplicationID,StudentName,StudentEmail,Department,InternshipTitle,Company,Status,AppliedAt\n';
    const rows = apps
      .map(
        (a) =>
          `"${a.id}","${a.student.user.name}","${a.student.user.email}","${a.student.department}","${a.internship.title}","${a.internship.employer.companyName}","${a.status}","${a.appliedAt.toISOString()}"`
      )
      .join('\n');
    return header + rows;
  }

  if (type === 'placements') {
    const placements = await prisma.internshipRecord.findMany({
      include: {
        student: { include: { user: true } },
        application: { include: { internship: { include: { employer: true } } } },
        evaluationGrades: true,
      },
    });
    const header = 'PlacementID,StudentName,Company,Supervisor,StartDate,EndDate,Status,FinalGrade\n';
    const rows = placements
      .map((pl) => {
        const grade = pl.evaluationGrades[0]?.grade || 'PENDING';
        return `"${pl.id}","${pl.student.user.name}","${pl.application.internship.employer.companyName}","${pl.industrySupervisorName}","${pl.startDate.toISOString()}","${pl.endDate.toISOString()}","${pl.status}","${grade}"`;
      })
      .join('\n');
    return header + rows;
  }

  throw new AppError("Invalid report type. Allowed: 'users', 'internships', 'applications', 'placements'.", 400);
};
