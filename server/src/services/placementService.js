import prisma from '../config/db.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { createNotification } from '../utils/notificationHelper.js';

export const getStudentActivePlacement = async (studentProfileId) => {
  const record = await prisma.internshipRecord.findFirst({
    where: {
      studentId: studentProfileId,
    },
    include: {
      application: {
        include: {
          internship: {
            include: {
              employer: true,
            },
          },
        },
      },
      progressLogs: {
        orderBy: { weekNumber: 'asc' },
      },
      evaluationGrades: {
        include: {
          faculty: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return record;
};

export const getPlacementById = async (id, currentUser) => {
  const record = await prisma.internshipRecord.findUnique({
    where: { id },
    include: {
      student: {
        include: {
          user: { select: { name: true, email: true } },
          facultyAdvisor: { include: { user: { select: { name: true, email: true } } } },
        },
      },
      application: {
        include: {
          internship: {
            include: {
              employer: true,
            },
          },
        },
      },
      progressLogs: {
        orderBy: { weekNumber: 'asc' },
      },
      evaluationGrades: {
        include: {
          faculty: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
  });

  if (!record) {
    throw new AppError('Internship record not found.', 404);
  }

  return record;
};

export const submitProgressLog = async (studentProfileId, data, actorUserId, ipAddress = null) => {
  const { internshipRecordId, weekNumber, tasksCompleted, skillsGained, challenges, studentRemarks } = data;

  if (!internshipRecordId || !weekNumber || !tasksCompleted || !skillsGained) {
    throw new AppError('Internship record ID, week number, tasks completed, and skills gained are required.', 400);
  }

  const record = await prisma.internshipRecord.findUnique({
    where: { id: internshipRecordId },
    include: {
      student: {
        include: {
          user: true,
          facultyAdvisor: { include: { user: true } },
        },
      },
      application: {
        include: {
          internship: true,
        },
      },
    },
  });

  if (!record) {
    throw new AppError('Active internship record not found.', 404);
  }

  if (record.studentId !== studentProfileId) {
    throw new AppError('Forbidden: You can only submit progress logs for your own internship.', 403);
  }

  const log = await prisma.progressLog.create({
    data: {
      internshipRecordId,
      studentId: studentProfileId,
      weekNumber: parseInt(weekNumber),
      tasksCompleted,
      skillsGained,
      challenges: challenges || 'None encountered',
      studentRemarks: studentRemarks || null,
    },
  });

  // Audit log
  await logAuditEvent({
    actorUserId,
    action: 'PROGRESS_LOG_SUBMITTED',
    resourceType: 'ProgressLog',
    resourceId: log.id,
    ipAddress,
    metadata: { weekNumber, internshipTitle: record.application.internship.title },
  });

  // Notify faculty advisor
  if (record.student.facultyAdvisor?.user) {
    await createNotification({
      userId: record.student.facultyAdvisor.user.id,
      message: `${record.student.user.name} submitted their Week ${weekNumber} progress log for "${record.application.internship.title}". Review requested.`,
      notificationType: 'FEEDBACK',
      referenceId: record.id,
    });
  }

  return log;
};

export const reviewProgressLog = async (logId, facultyFeedback, actorUserId, ipAddress = null) => {
  if (!facultyFeedback) {
    throw new AppError('Faculty feedback is required.', 400);
  }

  const log = await prisma.progressLog.findUnique({
    where: { id: logId },
    include: {
      student: { include: { user: true } },
      internshipRecord: { include: { application: { include: { internship: true } } } },
    },
  });

  if (!log) {
    throw new AppError('Progress log not found.', 404);
  }

  const updated = await prisma.progressLog.update({
    where: { id: logId },
    data: {
      facultyFeedback,
      reviewedAt: new Date(),
    },
  });

  // Audit log
  await logAuditEvent({
    actorUserId,
    action: 'PROGRESS_LOG_REVIEWED',
    resourceType: 'ProgressLog',
    resourceId: logId,
    ipAddress,
    metadata: { weekNumber: log.weekNumber },
  });

  // Notify student
  await createNotification({
    userId: log.student.user.id,
    message: `Your faculty advisor reviewed your Week ${log.weekNumber} progress report. Feedback: "${facultyFeedback.slice(0, 80)}..."`,
    notificationType: 'FEEDBACK',
    referenceId: log.internshipRecordId,
  });

  return updated;
};

export const submitEvaluation = async (data, actorUserId, facultyProfileId = null, ipAddress = null) => {
  const {
    internshipRecordId,
    attendance,
    technicalScore,
    performanceScore,
    communicationScore,
    grade,
    feedback,
    evaluationType = 'FINAL',
  } = data;

  if (!internshipRecordId || !grade) {
    throw new AppError('Internship record ID and letter grade (A+, A, B+, B, C, D, F) are required.', 400);
  }

  const validGrades = ['A+', 'A', 'B+', 'B', 'C', 'D', 'F', 'A_PLUS', 'B_PLUS'];
  if (!validGrades.includes(grade)) {
    throw new AppError(`Invalid grade '${grade}'. Allowed grades: A+, A, B+, B, C, D, F`, 400);
  }

  const gradeEnumMap = {
    'A+': 'A_PLUS',
    'A': 'A',
    'B+': 'B_PLUS',
    'B': 'B',
    'C': 'C',
    'D': 'D',
    'F': 'F',
    'A_PLUS': 'A_PLUS',
    'B_PLUS': 'B_PLUS',
  };
  const prismaGrade = gradeEnumMap[grade] || grade;

  const record = await prisma.internshipRecord.findUnique({
    where: { id: internshipRecordId },
    include: {
      student: { include: { user: true } },
      application: { include: { internship: true } },
    },
  });

  if (!record) {
    throw new AppError('Internship record not found.', 404);
  }

  const att = parseFloat(attendance) || 100;
  const tech = parseFloat(technicalScore) || 85;
  const perf = parseFloat(performanceScore) || 85;
  const comm = parseFloat(communicationScore) || 85;
  const overall = parseFloat(((att + tech + perf + comm) / 4).toFixed(2));

  // Determine faculty profile
  let targetFacultyId = facultyProfileId;
  if (!targetFacultyId) {
    const firstFaculty = await prisma.facultyProfile.findFirst();
    targetFacultyId = firstFaculty ? firstFaculty.id : null;
  }

  if (!targetFacultyId) {
    throw new AppError('Faculty profile required to register official academic evaluation.', 400);
  }

  const evaluation = await prisma.evaluationGrade.create({
    data: {
      internshipRecordId,
      facultyId: targetFacultyId,
      attendance: att,
      technicalScore: tech,
      performanceScore: perf,
      communicationScore: comm,
      overallScore: overall,
      grade: prismaGrade,
      feedback: feedback || 'Performance verified and graded.',
      evaluationType,
    },
  });

  // If FINAL evaluation, mark record status as COMPLETED!
  if (evaluationType === 'FINAL') {
    await prisma.internshipRecord.update({
      where: { id: internshipRecordId },
      data: { status: 'COMPLETED' },
    });
  }

  // Audit log
  await logAuditEvent({
    actorUserId,
    action: `EVALUATION_${evaluationType}_SUBMITTED`,
    resourceType: 'EvaluationGrade',
    resourceId: evaluation.id,
    ipAddress,
    metadata: { grade, overallScore: overall, evaluationType },
  });

  // Notify student
  await createNotification({
    userId: record.student.user.id,
    message: `Official ${evaluationType} evaluation published for "${record.application.internship.title}". Grade: ${grade} (Score: ${overall}%). ${feedback ? 'Feedback: ' + feedback : ''}`,
    notificationType: 'FEEDBACK',
    referenceId: record.id,
  });

  return evaluation;
};
