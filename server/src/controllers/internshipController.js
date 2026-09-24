import * as internshipService from '../services/internshipService.js';
import { AppError } from '../middlewares/errorHandler.js';

export const getPublishedInternships = async (req, res, next) => {
  try {
    const internships = await internshipService.getPublishedInternships(req.query);
    res.status(200).json({
      success: true,
      count: internships.length,
      data: internships,
    });
  } catch (error) {
    next(error);
  }
};

export const getInternshipById = async (req, res, next) => {
  try {
    const internship = await internshipService.getInternshipById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: internship,
    });
  } catch (error) {
    next(error);
  }
};

export const createInternship = async (req, res, next) => {
  try {
    const employerProfile = req.user.employerProfile;
    if (!employerProfile) {
      throw new AppError('Only registered employers can post internships.', 403);
    }
    const ipAddress = req.ip || req.connection.remoteAddress;
    const posting = await internshipService.createInternship(employerProfile.id, req.body, req.user.id, ipAddress);
    res.status(201).json({
      success: true,
      message: 'Internship posting created successfully.',
      data: posting,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInternship = async (req, res, next) => {
  try {
    const employerProfile = req.user.employerProfile;
    const isAdmin = req.user.role === 'ADMIN';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const posting = await internshipService.updateInternship(
      req.params.id,
      employerProfile ? employerProfile.id : null,
      req.body,
      req.user.id,
      isAdmin,
      ipAddress
    );
    res.status(200).json({
      success: true,
      message: 'Internship posting updated successfully.',
      data: posting,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteInternship = async (req, res, next) => {
  try {
    const employerProfile = req.user.employerProfile;
    const isAdmin = req.user.role === 'ADMIN';
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await internshipService.deleteInternship(
      req.params.id,
      employerProfile ? employerProfile.id : null,
      req.user.id,
      isAdmin,
      ipAddress
    );
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployerPostings = async (req, res, next) => {
  try {
    const employerProfile = req.user.employerProfile;
    if (!employerProfile) {
      throw new AppError('Employer profile required.', 403);
    }
    const postings = await internshipService.getEmployerPostings(employerProfile.id);
    res.status(200).json({
      success: true,
      count: postings.length,
      data: postings,
    });
  } catch (error) {
    next(error);
  }
};
