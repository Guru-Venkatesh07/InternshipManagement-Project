import prisma from '../config/db.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getStudentDashboard = async (req, res, next) => {
  try {
    const studentProfile = req.user.studentProfile;
    if (!studentProfile) {
      throw new AppError('Student profile not found.', 404);
    }

    const [
      totalApplications,
      underReview,
      shortlisted,
      interviews,
      selected,
      activePlacement,
      completedPlacements,
    ] = await Promise.all([
      prisma.application.count({ where: { studentId: studentProfile.id } }),
      prisma.application.count({ where: { studentId: studentProfile.id, status: 'UNDER_REVIEW' } }),
      prisma.application.count({ where: { studentId: studentProfile.id, status: 'SHORTLISTED' } }),
      prisma.application.count({ where: { studentId: studentProfile.id, status: 'INTERVIEW_SCHEDULED' } }),
      prisma.application.count({ where: { studentId: studentProfile.id, status: { in: ['SELECTED', 'ACCEPTED'] } } }),
      prisma.internshipRecord.findFirst({
        where: { studentId: studentProfile.id, status: 'ONGOING' },
        include: {
          application: { include: { internship: { include: { employer: true } } } },
          progressLogs: true,
          evaluationGrades: true,
        },
      }),
      prisma.internshipRecord.count({ where: { studentId: studentProfile.id, status: 'COMPLETED' } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalApplications,
        underReview,
        shortlisted,
        interviews,
        selected,
        activeInternship: activePlacement,
        completedInternshipCount: completedPlacements,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudentProfile = async (req, res, next) => {
  try {
    const studentProfile = req.user.studentProfile;
    if (!studentProfile) {
      throw new AppError('Student profile not found.', 404);
    }

    const { department, year, cgpa, skills, phone, name } = req.body;

    // Update User name if provided
    if (name) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { name },
      });
    }

    const updated = await prisma.studentProfile.update({
      where: { id: studentProfile.id },
      data: {
        ...(department && { department }),
        ...(year && { year: parseInt(year) }),
        ...(cgpa && { cgpa: parseFloat(cgpa) }),
        ...(skills !== undefined && { skills }),
        ...(phone !== undefined && { phone }),
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        facultyAdvisor: { include: { user: { select: { name: true, email: true } } } },
      },
    });

    await logAuditEvent({
      actorUserId: req.user.id,
      action: 'UPDATE_STUDENT_PROFILE',
      resourceType: 'StudentProfile',
      resourceId: studentProfile.id,
      ipAddress: req.ip || req.connection.remoteAddress,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadResumeFile = async (req, res, next) => {
  try {
    const studentProfile = req.user.studentProfile;
    if (!studentProfile) {
      throw new AppError('Student profile not found.', 404);
    }

    if (!req.file) {
      throw new AppError('No resume file uploaded.', 400);
    }

    const filename = req.file.filename;

    const updated = await prisma.studentProfile.update({
      where: { id: studentProfile.id },
      data: { resumeFile: filename },
    });

    await logAuditEvent({
      actorUserId: req.user.id,
      action: 'RESUME_UPLOADED',
      resourceType: 'StudentProfile',
      resourceId: studentProfile.id,
      ipAddress: req.ip || req.connection.remoteAddress,
      metadata: { filename },
    });

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully.',
      data: { resumeFile: filename },
    });
  } catch (error) {
    next(error);
  }
};
