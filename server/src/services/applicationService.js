import prisma from '../config/db.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { createNotification } from '../utils/notificationHelper.js';

export const applyToInternship = async (studentProfileId, data, actorUser, ipAddress = null) => {
  const { internshipId, coverLetter, resumeFile } = data;

  if (!internshipId) {
    throw new AppError('Internship ID is required.', 400);
  }

  // 1. Verify student profile
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    include: { user: true, facultyAdvisor: { include: { user: true } } },
  });

  if (!student) {
    throw new AppError('Student profile not found.', 404);
  }

  // 2. Verify internship exists and is published
  const internship = await prisma.internshipPosting.findUnique({
    where: { id: internshipId },
    include: { employer: { include: { user: true } } },
  });

  if (!internship) {
    throw new AppError('Internship posting not found.', 404);
  }

  if (internship.status !== 'PUBLISHED') {
    throw new AppError('This internship is not currently accepting applications.', 400);
  }

  // 3. Verify deadline
  const now = new Date();
  if (new Date(internship.applicationDeadline) < now) {
    throw new AppError('The application deadline for this internship has passed.', 400);
  }

  // 4. Check duplicate application
  const existingApp = await prisma.application.findUnique({
    where: {
      studentId_internshipId: {
        studentId: studentProfileId,
        internshipId,
      },
    },
  });

  if (existingApp) {
    throw new AppError('You have already applied for this internship.', 409);
  }

  // Resume resolution: either explicitly provided in submission, or uses profile resume
  const resumeSnapshot = resumeFile || student.resumeFile;
  if (!resumeSnapshot) {
    throw new AppError('Please upload a resume before applying.', 400);
  }

  // Update profile resume if a new one was uploaded during application
  if (resumeFile && resumeFile !== student.resumeFile) {
    await prisma.studentProfile.update({
      where: { id: studentProfileId },
      data: { resumeFile },
    });
  }

  // 5. Create Application (Default: FACULTY_PENDING for academic review)
  const application = await prisma.application.create({
    data: {
      studentId: studentProfileId,
      internshipId,
      resumeSnapshot,
      coverLetter: coverLetter || '',
      status: 'FACULTY_PENDING',
    },
    include: {
      internship: true,
      student: { include: { user: true } },
    },
  });

  // Audit log
  await logAuditEvent({
    actorUserId: actorUser.id,
    action: 'APPLICATION_SUBMITTED',
    resourceType: 'Application',
    resourceId: application.id,
    ipAddress,
    metadata: { internshipTitle: internship.title, studentName: student.user.name },
  });

  // Notify student
  await createNotification({
    userId: actorUser.id,
    message: `Your application for "${internship.title}" at ${internship.employer.companyName} has been submitted and is pending faculty review.`,
    notificationType: 'APPLICATION',
    referenceId: application.id,
  });

  // Notify faculty advisor if assigned
  if (student.facultyAdvisor && student.facultyAdvisor.user) {
    await createNotification({
      userId: student.facultyAdvisor.user.id,
      message: `${student.user.name} submitted an internship application for "${internship.title}". Academic approval requested.`,
      notificationType: 'APPLICATION',
      referenceId: application.id,
    });
  }

  return application;
};

export const getStudentApplications = async (studentProfileId) => {
  return await prisma.application.findMany({
    where: { studentId: studentProfileId },
    include: {
      internship: {
        include: {
          employer: {
            select: { companyName: true, industry: true, logoFile: true },
          },
        },
      },
      interview: true,
      internshipRecord: {
        include: {
          evaluationGrades: true,
        },
      },
    },
    orderBy: { appliedAt: 'desc' },
  });
};

export const getApplicationById = async (id, currentUser) => {
  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          user: { select: { id: true, name: true, email: true } },
          facultyAdvisor: { include: { user: { select: { name: true, email: true } } } },
        },
      },
      internship: {
        include: {
          employer: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
      interview: true,
      internshipRecord: {
        include: {
          progressLogs: true,
          evaluationGrades: true,
        },
      },
    },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  // Authorization checks
  if (currentUser.role === 'STUDENT' && application.studentId !== currentUser.studentProfile?.id) {
    throw new AppError('Forbidden: You can only view your own applications.', 403);
  }

  if (currentUser.role === 'EMPLOYER' && application.internship.employerId !== currentUser.employerProfile?.id) {
    throw new AppError('Forbidden: You can only view applicants for your own postings.', 403);
  }

  return application;
};

export const getEmployerApplications = async (employerProfileId, filters = {}) => {
  const { internshipId, status, department, search } = filters;

  const where = {
    internship: {
      employerId: employerProfileId,
    },
  };

  if (internshipId) {
    where.internshipId = internshipId;
  }

  if (status && status !== 'ALL') {
    where.status = status;
  }

  if (department && department !== 'ALL') {
    where.student = { department: { contains: department } };
  }

  if (search) {
    where.student = {
      ...where.student,
      user: {
        name: { contains: search },
      },
    };
  }

  return await prisma.application.findMany({
    where,
    include: {
      student: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      internship: {
        select: { id: true, title: true, location: true, stipend: true },
      },
      interview: true,
    },
    orderBy: { appliedAt: 'desc' },
  });
};

export const facultyReviewApplication = async (applicationId, facultyProfileId, decision, remarks, actorUserId, ipAddress = null) => {
  if (!['APPROVE', 'REJECT'].includes(decision)) {
    throw new AppError("Decision must be either 'APPROVE' or 'REJECT'.", 400);
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      student: { include: { user: true } },
      internship: { include: { employer: { include: { user: true } } } },
    },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  if (application.status !== 'FACULTY_PENDING') {
    throw new AppError(`Cannot review application with status ${application.status}. Must be in FACULTY_PENDING status.`, 400);
  }

  const newStatus = decision === 'APPROVE' ? 'UNDER_REVIEW' : 'REJECTED';
  const facultyRemarks = remarks || (decision === 'APPROVE' ? 'Approved for academic credit.' : 'Rejected by faculty advisor.');

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: newStatus,
      facultyRemarks,
    },
    include: {
      student: { include: { user: true } },
      internship: { include: { employer: { include: { user: true } } } },
    },
  });

  // Audit log
  await logAuditEvent({
    actorUserId,
    action: `FACULTY_${decision}_APPLICATION`,
    resourceType: 'Application',
    resourceId: applicationId,
    ipAddress,
    metadata: { decision, remarks: facultyRemarks },
  });

  // Notify student
  await createNotification({
    userId: application.student.user.id,
    message: decision === 'APPROVE'
      ? `Your application for "${application.internship.title}" was approved by your faculty advisor and is now under employer review.`
      : `Your application for "${application.internship.title}" was declined by your faculty advisor. Remarks: ${facultyRemarks}`,
    notificationType: 'APPLICATION',
    referenceId: applicationId,
  });

  // If approved, notify employer
  if (decision === 'APPROVE' && application.internship.employer?.user) {
    await createNotification({
      userId: application.internship.employer.user.id,
      message: `A new candidate (${application.student.user.name}) has received faculty clearance for "${application.internship.title}".`,
      notificationType: 'APPLICATION',
      referenceId: applicationId,
    });
  }

  return updated;
};

export const updateApplicationStatus = async (applicationId, employerProfileId, newStatus, remarks, actorUserId, isAdmin = false, ipAddress = null) => {
  const allowedTransitions = ['UNDER_REVIEW', 'SHORTLISTED', 'SELECTED', 'REJECTED'];
  if (!allowedTransitions.includes(newStatus)) {
    throw new AppError(`Invalid status transition to '${newStatus}'.`, 400);
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      student: { include: { user: true } },
      internship: { include: { employer: { include: { user: true } } } },
    },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  if (!isAdmin && application.internship.employerId !== employerProfileId) {
    throw new AppError('Forbidden: You can only update applications for your own postings.', 403);
  }

  // Prevent invalid status hops
  if (application.status === 'REJECTED' || application.status === 'ACCEPTED') {
    throw new AppError(`Cannot change status of an application that is already ${application.status}.`, 400);
  }

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: newStatus,
      ...(remarks && { employerRemarks: remarks }),
    },
    include: {
      student: { include: { user: true } },
      internship: true,
    },
  });

  // Audit log
  await logAuditEvent({
    actorUserId,
    action: `APPLICATION_STATUS_${newStatus}`,
    resourceType: 'Application',
    resourceId: applicationId,
    ipAddress,
    metadata: { previousStatus: application.status, newStatus, remarks },
  });

  // Notification message based on status
  let notifMsg = `Your application for "${application.internship.title}" status has changed to ${newStatus}.`;
  if (newStatus === 'SHORTLISTED') {
    notifMsg = `Great news! TechCorp has shortlisted you for "${application.internship.title}". An interview schedule will follow shortly.`;
  } else if (newStatus === 'SELECTED') {
    notifMsg = `Congratulations! You have been SELECTED for "${application.internship.title}"! Please review and accept your offer.`;
  } else if (newStatus === 'REJECTED') {
    notifMsg = `Your application for "${application.internship.title}" was not selected. Remarks: ${remarks || 'None'}`;
  }

  await createNotification({
    userId: application.student.user.id,
    message: notifMsg,
    notificationType: newStatus === 'SELECTED' ? 'OFFER' : 'APPLICATION',
    referenceId: applicationId,
  });

  return updated;
};

export const acceptInternshipOffer = async (applicationId, studentProfileId, actorUserId, ipAddress = null) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      student: { include: { user: true, facultyAdvisor: { include: { user: true } } } },
      internship: { include: { employer: { include: { user: true } } } },
      internshipRecord: true,
    },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  if (application.studentId !== studentProfileId) {
    throw new AppError('Forbidden: You can only accept offers made to yourself.', 403);
  }

  if (application.status !== 'SELECTED') {
    throw new AppError('Only applications in SELECTED status can be accepted.', 400);
  }

  if (application.internshipRecord) {
    throw new AppError('An internship record has already been created for this offer.', 400);
  }

  // 1. Update Application status to ACCEPTED
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'ACCEPTED' },
  });

  // 2. Automatically spawn active InternshipRecord
  const startDate = application.internship.startDate || new Date();
  const endDate = application.internship.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days

  const record = await prisma.internshipRecord.create({
    data: {
      applicationId: application.id,
      studentId: studentProfileId,
      startDate,
      endDate,
      industrySupervisorName: application.internship.employer.contactPerson,
      industrySupervisorEmail: application.internship.employer.user.email,
      industrySupervisorPhone: application.internship.employer.phone,
      status: 'ONGOING',
    },
  });

  // Audit log
  await logAuditEvent({
    actorUserId,
    action: 'OFFER_ACCEPTED',
    resourceType: 'InternshipRecord',
    resourceId: record.id,
    ipAddress,
    metadata: { internshipTitle: application.internship.title, company: application.internship.employer.companyName },
  });

  // Notify student
  await createNotification({
    userId: actorUserId,
    message: `You have successfully accepted the offer for "${application.internship.title}". Your active internship workspace is now open for weekly progress tracking!`,
    notificationType: 'OFFER',
    referenceId: record.id,
  });

  // Notify employer
  if (application.internship.employer?.user) {
    await createNotification({
      userId: application.internship.employer.user.id,
      message: `${application.student.user.name} accepted the internship offer for "${application.internship.title}".`,
      notificationType: 'OFFER',
      referenceId: application.id,
    });
  }

  // Notify faculty
  if (application.student.facultyAdvisor?.user) {
    await createNotification({
      userId: application.student.facultyAdvisor.user.id,
      message: `Your advisee ${application.student.user.name} has begun an active placement at ${application.internship.employer.companyName}.`,
      notificationType: 'SYSTEM',
      referenceId: record.id,
    });
  }

  return { message: 'Offer accepted successfully. Active placement initialized.', record };
};
