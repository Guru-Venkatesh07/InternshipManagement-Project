import * as applicationService from '../services/applicationService.js';
import { AppError } from '../middlewares/errorHandler.js';

export const applyToInternship = async (req, res, next) => {
  try {
    const studentProfile = req.user.studentProfile;
    if (!studentProfile) {
      throw new AppError('Only students can apply to internships.', 403);
    }
    const ipAddress = req.ip || req.connection.remoteAddress;
    const resumeFile = req.file ? req.file.filename : req.body.resumeFile;
    const application = await applicationService.applyToInternship(
      studentProfile.id,
      { ...req.body, resumeFile },
      req.user,
      ipAddress
    );
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully. Awaiting faculty review.',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentApplications = async (req, res, next) => {
  try {
    const studentProfile = req.user.studentProfile;
    if (!studentProfile) {
      throw new AppError('Student profile required.', 403);
    }
    const applications = await applicationService.getStudentApplications(studentProfile.id);
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req, res, next) => {
  try {
    const application = await applicationService.getApplicationById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployerApplications = async (req, res, next) => {
  try {
    const employerProfile = req.user.employerProfile;
    if (!employerProfile) {
      throw new AppError('Employer profile required.', 403);
    }
    const applications = await applicationService.getEmployerApplications(employerProfile.id, req.query);
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const facultyReviewApplication = async (req, res, next) => {
  try {
    const facultyProfile = req.user.facultyProfile;
    if (!facultyProfile && req.user.role !== 'ADMIN') {
      throw new AppError('Only faculty advisors or administrators can perform academic review.', 403);
    }
    const ipAddress = req.ip || req.connection.remoteAddress;
    const { decision, remarks } = req.body;
    const updated = await applicationService.facultyReviewApplication(
      req.params.id,
      facultyProfile?.id,
      decision,
      remarks,
      req.user.id,
      ipAddress
    );
    res.status(200).json({
      success: true,
      message: `Application ${decision === 'APPROVE' ? 'approved' : 'rejected'} by faculty.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const employerProfile = req.user.employerProfile;
    const isAdmin = req.user.role === 'ADMIN';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const { status, remarks } = req.body;
    const updated = await applicationService.updateApplicationStatus(
      req.params.id,
      employerProfile ? employerProfile.id : null,
      status,
      remarks,
      req.user.id,
      isAdmin,
      ipAddress
    );
    res.status(200).json({
      success: true,
      message: `Application moved to ${status}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInternshipOffer = async (req, res, next) => {
  try {
    const studentProfile = req.user.studentProfile;
    if (!studentProfile) {
      throw new AppError('Only students can accept internship offers.', 403);
    }
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await applicationService.acceptInternshipOffer(
      req.params.id,
      studentProfile.id,
      req.user.id,
      ipAddress
    );
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.record,
    });
  } catch (error) {
    next(error);
  }
};
