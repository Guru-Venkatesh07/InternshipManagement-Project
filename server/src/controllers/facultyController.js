import prisma from '../config/db.js';
import { AppError } from '../middlewares/errorHandler.js';

export const getFacultyDashboard = async (req, res, next) => {
  try {
    const facultyProfile = req.user.facultyProfile;
    if (!facultyProfile) {
      throw new AppError('Faculty profile not found.', 404);
    }

    const [
      pendingApprovals,
      approvedApplications,
      rejectedApplications,
      ongoingInternships,
      completedInternships,
      supervisedStudents,
      pendingEvaluations,
    ] = await Promise.all([
      // Applications by advised students that are in FACULTY_PENDING
      prisma.application.count({
        where: {
          status: 'FACULTY_PENDING',
          student: { facultyAdvisorId: facultyProfile.id },
        },
      }),
      prisma.application.count({
        where: {
          status: { in: ['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'ACCEPTED'] },
          student: { facultyAdvisorId: facultyProfile.id },
          facultyRemarks: { not: null },
        },
      }),
      prisma.application.count({
        where: {
          status: 'REJECTED',
          student: { facultyAdvisorId: facultyProfile.id },
          facultyRemarks: { not: null },
        },
      }),
      prisma.internshipRecord.count({
        where: {
          status: 'ONGOING',
          student: { facultyAdvisorId: facultyProfile.id },
        },
      }),
      prisma.internshipRecord.count({
        where: {
          status: 'COMPLETED',
          student: { facultyAdvisorId: facultyProfile.id },
        },
      }),
      prisma.studentProfile.count({
        where: { facultyAdvisorId: facultyProfile.id },
      }),
      // Ongoing records that do not have a FINAL evaluation yet
      prisma.internshipRecord.count({
        where: {
          status: 'ONGOING',
          student: { facultyAdvisorId: facultyProfile.id },
          evaluationGrades: {
            none: { evaluationType: 'FINAL' },
          },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        pendingApprovals,
        approvedApplications,
        rejectedApplications,
        ongoingInternships,
        completedInternships,
        supervisedStudents,
        pendingEvaluations,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignedStudents = async (req, res, next) => {
  try {
    const facultyProfile = req.user.facultyProfile;
    if (!facultyProfile) {
      throw new AppError('Faculty profile not found.', 404);
    }

    const students = await prisma.studentProfile.findMany({
      where: { facultyAdvisorId: facultyProfile.id },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        applications: {
          include: {
            internship: { select: { title: true, employer: { select: { companyName: true } } } },
          },
          orderBy: { appliedAt: 'desc' },
        },
        internshipRecords: {
          include: {
            evaluationGrades: true,
            progressLogs: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { rollNumber: 'asc' },
    });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingApplications = async (req, res, next) => {
  try {
    const facultyProfile = req.user.facultyProfile;
    if (!facultyProfile) {
      throw new AppError('Faculty profile not found.', 404);
    }

    const applications = await prisma.application.findMany({
      where: {
        status: 'FACULTY_PENDING',
        student: { facultyAdvisorId: facultyProfile.id },
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        internship: {
          include: {
            employer: { select: { companyName: true, industry: true, website: true } },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const getSupervisedPlacements = async (req, res, next) => {
  try {
    const facultyProfile = req.user.facultyProfile;
    if (!facultyProfile) {
      throw new AppError('Faculty profile not found.', 404);
    }

    const placements = await prisma.internshipRecord.findMany({
      where: {
        student: { facultyAdvisorId: facultyProfile.id },
      },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        application: {
          include: {
            internship: {
              include: { employer: { select: { companyName: true, contactPerson: true, phone: true } } },
            },
          },
        },
        progressLogs: {
          orderBy: { weekNumber: 'desc' },
        },
        evaluationGrades: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      count: placements.length,
      data: placements,
    });
  } catch (error) {
    next(error);
  }
};
