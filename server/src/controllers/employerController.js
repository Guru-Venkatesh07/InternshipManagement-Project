import prisma from '../config/db.js';
import { AppError } from '../middlewares/errorHandler.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getEmployerDashboard = async (req, res, next) => {
  try {
    const employerProfile = req.user.employerProfile;
    if (!employerProfile) {
      throw new AppError('Employer profile not found.', 404);
    }

    const [
      totalInternships,
      activeInternships,
      closedInternships,
      totalApplications,
      shortlisted,
      selectedCandidates,
    ] = await Promise.all([
      prisma.internshipPosting.count({ where: { employerId: employerProfile.id } }),
      prisma.internshipPosting.count({ where: { employerId: employerProfile.id, status: 'PUBLISHED' } }),
      prisma.internshipPosting.count({ where: { employerId: employerProfile.id, status: 'CLOSED' } }),
      prisma.application.count({ where: { internship: { employerId: employerProfile.id } } }),
      prisma.application.count({ where: { internship: { employerId: employerProfile.id }, status: 'SHORTLISTED' } }),
      prisma.application.count({
        where: {
          internship: { employerId: employerProfile.id },
          status: { in: ['SELECTED', 'ACCEPTED'] },
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalInternships,
        activeInternships,
        closedInternships,
        totalApplications,
        shortlisted,
        selectedCandidates,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployerProfile = async (req, res, next) => {
  try {
    const employerProfile = req.user.employerProfile;
    if (!employerProfile) {
      throw new AppError('Employer profile not found.', 404);
    }

    const { companyName, industry, description, website, address, contactPerson, phone } = req.body;

    const updated = await prisma.employerProfile.update({
      where: { id: employerProfile.id },
      data: {
        ...(companyName && { companyName }),
        ...(industry && { industry }),
        ...(description !== undefined && { description }),
        ...(website !== undefined && { website }),
        ...(address !== undefined && { address }),
        ...(contactPerson && { contactPerson }),
        ...(phone && { phone }),
      },
    });

    await logAuditEvent({
      actorUserId: req.user.id,
      action: 'UPDATE_COMPANY_PROFILE',
      resourceType: 'EmployerProfile',
      resourceId: employerProfile.id,
      ipAddress: req.ip || req.connection.remoteAddress,
      metadata: { companyName },
    });

    res.status(200).json({
      success: true,
      message: 'Company profile updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadCompanyLogo = async (req, res, next) => {
  try {
    const employerProfile = req.user.employerProfile;
    if (!employerProfile) {
      throw new AppError('Employer profile not found.', 404);
    }

    if (!req.file) {
      throw new AppError('No logo image uploaded.', 400);
    }

    const filename = req.file.filename;

    const updated = await prisma.employerProfile.update({
      where: { id: employerProfile.id },
      data: { logoFile: filename },
    });

    res.status(200).json({
      success: true,
      message: 'Company logo uploaded successfully.',
      data: { logoFile: filename },
    });
  } catch (error) {
    next(error);
  }
};
