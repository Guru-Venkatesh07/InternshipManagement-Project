import * as authService from '../services/authService.js';

export const registerStudent = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await authService.registerStudent(req.body, ipAddress);
    res.status(201).json({
      success: true,
      message: 'Student registration successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const registerEmployer = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await authService.registerEmployer(req.body, ipAddress);
    res.status(201).json({
      success: true,
      message: 'Employer registration successful. Company profile created.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const result = await authService.loginUser(req.body, ipAddress);
    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changeUserPassword(req.user.id, currentPassword, newPassword, ipAddress);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
