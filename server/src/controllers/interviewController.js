import * as interviewService from '../services/interviewService.js';
import { AppError } from '../middlewares/errorHandler.js';

export const scheduleInterview = async (req, res, next) => {
  try {
    const employerProfile = req.user.employerProfile;
    if (!employerProfile && req.user.role !== 'ADMIN') {
      throw new AppError('Only employers can schedule interviews.', 403);
    }
    const ipAddress = req.ip || req.connection.remoteAddress;
    const interview = await interviewService.scheduleInterview(
      employerProfile?.id,
      req.body,
      req.user.id,
      ipAddress
    );
    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully. Candidate has been notified.',
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInterviewResult = async (req, res, next) => {
  try {
    const employerProfile = req.user.employerProfile;
    if (!employerProfile && req.user.role !== 'ADMIN') {
      throw new AppError('Only employers can record interview results.', 403);
    }
    const ipAddress = req.ip || req.connection.remoteAddress;
    const interview = await interviewService.updateInterviewResult(
      req.params.id,
      employerProfile?.id,
      req.body,
      req.user.id,
      ipAddress
    );
    res.status(200).json({
      success: true,
      message: 'Interview result updated successfully.',
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

export const getInterviewByApplicationId = async (req, res, next) => {
  try {
    const interview = await interviewService.getInterviewByApplicationId(req.params.applicationId, req.user);
    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};
