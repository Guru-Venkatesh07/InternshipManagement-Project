import * as adminService from '../services/adminService.js';

export const getMetrics = async (req, res, next) => {
  try {
    const stats = await adminService.getAdminMetrics();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getUsers(req.query);
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const updated = await adminService.toggleUserStatus(req.params.id, req.user.id, ipAddress);
    res.status(200).json({
      success: true,
      message: `User account ${updated.isActive ? 'activated' : 'deactivated'}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const createFaculty = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const faculty = await adminService.createFacultyAccount(req.body, req.user.id, ipAddress);
    res.status(201).json({
      success: true,
      message: 'Faculty account created successfully.',
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanies = async (req, res, next) => {
  try {
    const companies = await adminService.getCompanies();
    res.status(200).json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompanyVerification = async (req, res, next) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const { status } = req.body;
    const updated = await adminService.updateCompanyVerification(req.params.id, status, req.user.id, ipAddress);
    res.status(200).json({
      success: true,
      message: `Company verification status set to ${status}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllInternships = async (req, res, next) => {
  try {
    const internships = await adminService.getAllInternshipsAdmin(req.query);
    res.status(200).json({
      success: true,
      count: internships.length,
      data: internships,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllApplications = async (req, res, next) => {
  try {
    const applications = await adminService.getAllApplicationsAdmin(req.query);
    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await adminService.getAuditLogs(req.query);
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

export const exportReportCSV = async (req, res, next) => {
  try {
    const { type } = req.params;
    const csvData = await adminService.generateReportData(type);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ims-${type}-report-${Date.now()}.csv"`);
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};
