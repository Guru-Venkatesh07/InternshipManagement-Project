import prisma from '../config/db.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getPublishedInternships = async (filters = {}) => {
  const { search, department, location, isRemote, minStipend, company } = filters;

  const where = {
    status: 'PUBLISHED',
    applicationDeadline: {
      gte: new Date(), // Only active deadlines
    },
  };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { skillsRequired: { contains: search } },
      { employer: { companyName: { contains: search } } },
    ];
  }

  if (department && department !== 'ALL') {
    where.departmentRequired = { contains: department };
  }

  if (location) {
    where.location = { contains: location };
  }

  if (isRemote !== undefined && isRemote !== '') {
    where.isRemote = isRemote === 'true' || isRemote === true;
  }

  if (minStipend) {
    where.stipend = { gte: parseFloat(minStipend) };
  }

  if (company) {
    where.employer = { companyName: { contains: company } };
  }

  const internships = await prisma.internshipPosting.findMany({
    where,
    include: {
      employer: {
        select: {
          id: true,
          companyName: true,
          industry: true,
          address: true,
          website: true,
          logoFile: true,
          verificationStatus: true,
        },
      },
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return internships;
};

export const getInternshipById = async (id, currentUser = null) => {
  const internship = await prisma.internshipPosting.findUnique({
    where: { id },
    include: {
      employer: {
        include: {
          user: { select: { email: true, name: true } },
        },
      },
      _count: {
        select: { applications: true },
      },
    },
  });

  if (!internship) {
    throw new AppError('Internship posting not found.', 404);
  }

  // If user is a student, check if they have already applied
  let hasApplied = false;
  let userApplication = null;

  if (currentUser && currentUser.role === 'STUDENT' && currentUser.studentProfile) {
    userApplication = await prisma.application.findUnique({
      where: {
        studentId_internshipId: {
          studentId: currentUser.studentProfile.id,
          internshipId: id,
        },
      },
      include: {
        interview: true,
      },
    });
    hasApplied = !!userApplication;
  }

  return {
    ...internship,
    hasApplied,
    userApplication,
  };
};

export const createInternship = async (employerProfileId, data, actorUserId, ipAddress = null) => {
  const {
    title,
    description,
    departmentRequired,
    skillsRequired,
    eligibility,
    location,
    isRemote,
    stipend,
    openings,
    startDate,
    endDate,
    applicationDeadline,
    status = 'PUBLISHED',
  } = data;

  if (!title || !description || !departmentRequired || !applicationDeadline) {
    throw new AppError('Title, description, department, and application deadline are required.', 400);
  }

  const deadline = new Date(applicationDeadline);
  if (isNaN(deadline.getTime())) {
    throw new AppError('Invalid application deadline date format.', 400);
  }

  const posting = await prisma.internshipPosting.create({
    data: {
      employerId: employerProfileId,
      title,
      description,
      departmentRequired,
      skillsRequired: skillsRequired || 'Basic Programming',
      eligibility: eligibility || 'Enrolled undergraduate or postgraduate student',
      location: location || 'On-site / Hybrid',
      isRemote: isRemote === true || isRemote === 'true',
      stipend: parseFloat(stipend) || 0,
      openings: parseInt(openings) || 1,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      applicationDeadline: deadline,
      status: ['DRAFT', 'PUBLISHED'].includes(status) ? status : 'PUBLISHED',
    },
  });

  await logAuditEvent({
    actorUserId,
    action: 'INTERNSHIP_CREATE',
    resourceType: 'InternshipPosting',
    resourceId: posting.id,
    ipAddress,
    metadata: { title, status: posting.status },
  });

  return posting;
};

export const updateInternship = async (id, employerProfileId, data, actorUserId, isAdmin = false, ipAddress = null) => {
  const posting = await prisma.internshipPosting.findUnique({ where: { id } });

  if (!posting) {
    throw new AppError('Internship posting not found.', 404);
  }

  // Ownership check: must belong to employer unless admin
  if (!isAdmin && posting.employerId !== employerProfileId) {
    throw new AppError('Forbidden: You can only edit your own internship postings.', 403);
  }

  const updated = await prisma.internshipPosting.update({
    where: { id },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description && { description: data.description }),
      ...(data.departmentRequired && { departmentRequired: data.departmentRequired }),
      ...(data.skillsRequired && { skillsRequired: data.skillsRequired }),
      ...(data.eligibility && { eligibility: data.eligibility }),
      ...(data.location && { location: data.location }),
      ...(data.isRemote !== undefined && { isRemote: data.isRemote === true || data.isRemote === 'true' }),
      ...(data.stipend !== undefined && { stipend: parseFloat(data.stipend) }),
      ...(data.openings !== undefined && { openings: parseInt(data.openings) }),
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
      ...(data.applicationDeadline && { applicationDeadline: new Date(data.applicationDeadline) }),
      ...(data.status && { status: data.status }),
    },
  });

  await logAuditEvent({
    actorUserId,
    action: 'INTERNSHIP_UPDATE',
    resourceType: 'InternshipPosting',
    resourceId: id,
    ipAddress,
    metadata: { status: updated.status, title: updated.title },
  });

  return updated;
};

export const deleteInternship = async (id, employerProfileId, actorUserId, isAdmin = false, ipAddress = null) => {
  const posting = await prisma.internshipPosting.findUnique({
    where: { id },
    include: { _count: { select: { applications: true } } },
  });

  if (!posting) {
    throw new AppError('Internship posting not found.', 404);
  }

  if (!isAdmin && posting.employerId !== employerProfileId) {
    throw new AppError('Forbidden: You can only delete your own internship postings.', 403);
  }

  // If there are existing applications, archive/close instead of hard delete
  if (posting._count.applications > 0) {
    const closed = await prisma.internshipPosting.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
    return { message: 'Internship has active applications and was moved to CLOSED status.', posting: closed };
  }

  await prisma.internshipPosting.delete({ where: { id } });

  await logAuditEvent({
    actorUserId,
    action: 'INTERNSHIP_DELETE',
    resourceType: 'InternshipPosting',
    resourceId: id,
    ipAddress,
  });

  return { message: 'Internship posting deleted successfully.' };
};

export const getEmployerPostings = async (employerProfileId) => {
  return await prisma.internshipPosting.findMany({
    where: { employerId: employerProfileId },
    include: {
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};
