import prisma from '../config/db.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { createNotification } from '../utils/notificationHelper.js';

export const scheduleInterview = async (employerProfileId, data, actorUserId, ipAddress = null) => {
  const { applicationId, roundName, scheduledDate, scheduledTime, mode, meetingLink, location, remarks } = data;

  if (!applicationId || !roundName || !scheduledDate || !scheduledTime || !mode) {
    throw new AppError('Application ID, round name, scheduled date, scheduled time, and interview mode are required.', 400);
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      internship: true,
      student: { include: { user: true } },
      interview: true,
    },
  });

  if (!application) {
    throw new AppError('Application not found.', 404);
  }

  if (application.internship.employerId !== employerProfileId) {
    throw new AppError('Forbidden: You can only schedule interviews for your own postings.', 403);
  }

  let interview;
  if (application.interview) {
    // Update existing interview
    interview = await prisma.interview.update({
      where: { id: application.interview.id },
      data: {
        roundName,
        scheduledDate,
        scheduledTime,
        mode,
        meetingLink: meetingLink || null,
        location: location || null,
        remarks: remarks || null,
        result: 'SCHEDULED',
      },
    });
  } else {
    // Create new interview
    interview = await prisma.interview.create({
      data: {
        applicationId,
        roundName,
        scheduledDate,
        scheduledTime,
        mode,
        meetingLink: meetingLink || null,
        location: location || null,
        remarks: remarks || null,
        result: 'SCHEDULED',
      },
    });
  }

  // Update application status to INTERVIEW_SCHEDULED
  await prisma.application.update({
    where: { id: applicationId },
    data: { status: 'INTERVIEW_SCHEDULED' },
  });

  // Audit log
  await logAuditEvent({
    actorUserId,
    action: 'INTERVIEW_SCHEDULED',
    resourceType: 'Interview',
    resourceId: interview.id,
    ipAddress,
    metadata: { roundName, scheduledDate, scheduledTime, mode },
  });

  // Notify student
  await createNotification({
    userId: application.student.user.id,
    message: `Interview Scheduled: "${roundName}" for "${application.internship.title}" on ${scheduledDate} at ${scheduledTime} (${mode}). ${meetingLink ? 'Link: ' + meetingLink : ''}`,
    notificationType: 'INTERVIEW',
    referenceId: interview.id,
  });

  return interview;
};

export const updateInterviewResult = async (interviewId, employerProfileId, data, actorUserId, ipAddress = null) => {
  const { result, remarks } = data;

  if (!['SCHEDULED', 'PASSED', 'FAILED', 'RESCHEDULED'].includes(result)) {
    throw new AppError("Result must be 'SCHEDULED', 'PASSED', 'FAILED', or 'RESCHEDULED'.", 400);
  }

  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: {
      application: {
        include: {
          internship: true,
          student: { include: { user: true } },
        },
      },
    },
  });

  if (!interview) {
    throw new AppError('Interview record not found.', 404);
  }

  if (interview.application.internship.employerId !== employerProfileId) {
    throw new AppError('Forbidden: You can only update interviews for your own postings.', 403);
  }

  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: {
      result,
      remarks: remarks || interview.remarks,
    },
  });

  // Audit log
  await logAuditEvent({
    actorUserId,
    action: `INTERVIEW_RESULT_${result}`,
    resourceType: 'Interview',
    resourceId: interviewId,
    ipAddress,
    metadata: { result, remarks },
  });

  // Notify student if passed/failed
  if (['PASSED', 'FAILED'].includes(result)) {
    await createNotification({
      userId: interview.application.student.user.id,
      message: `Interview result for "${interview.roundName}" (${interview.application.internship.title}): ${result}. ${remarks ? 'Feedback: ' + remarks : ''}`,
      notificationType: 'INTERVIEW',
      referenceId: interview.id,
    });
  }

  return updated;
};

export const getInterviewByApplicationId = async (applicationId, currentUser) => {
  const interview = await prisma.interview.findUnique({
    where: { applicationId },
    include: {
      application: {
        include: {
          internship: { select: { title: true, location: true } },
          student: { include: { user: { select: { name: true, email: true } } } },
        },
      },
    },
  });

  if (!interview) {
    throw new AppError('Interview details not found for this application.', 404);
  }

  return interview;
};
