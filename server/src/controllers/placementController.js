import * as placementService from '../services/placementService.js';
import { AppError } from '../middlewares/errorHandler.js';

export const getStudentActivePlacement = async (req, res, next) => {
  try {
    const studentProfile = req.user.studentProfile;
    if (!studentProfile) {
      throw new AppError('Student profile required.', 403);
    }
    const record = await placementService.getStudentActivePlacement(studentProfile.id);
    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlacementById = async (req, res, next) => {
  try {
    const record = await placementService.getPlacementById(req.params.id, req.user);
    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

export const submitProgressLog = async (req, res, next) => {
  try {
    const studentProfile = req.user.studentProfile;
    if (!studentProfile) {
      throw new AppError('Only students can submit weekly progress logs.', 403);
    }
    const ipAddress = req.ip || req.connection.remoteAddress;
    const log = await placementService.submitProgressLog(
      studentProfile.id,
      req.body,
      req.user.id,
      ipAddress
    );
    res.status(201).json({
      success: true,
      message: 'Weekly progress log submitted successfully.',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewProgressLog = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const { feedback } = req.body;
    const updated = await placementService.reviewProgressLog(
      req.params.logId,
      feedback,
      req.user.id,
      ipAddress
    );
    res.status(200).json({
      success: true,
      message: 'Progress log feedback recorded.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const submitEvaluation = async (req, res, next) => {
  try {
    const facultyProfile = req.user.facultyProfile;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const evaluation = await placementService.submitEvaluation(
      req.body,
      req.user.id,
      facultyProfile?.id,
      ipAddress
    );
    res.status(201).json({
      success: true,
      message: 'Official academic evaluation and grade submitted successfully.',
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};
