import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleGuard.js';

const router = Router();

// All admin routes strictly require ADMIN role
router.use(verifyToken, requireRoles('ADMIN'));

router.get('/metrics', adminController.getMetrics);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.post('/users/faculty', adminController.createFaculty);
router.get('/companies', adminController.getCompanies);
router.put('/companies/:id/verification', adminController.updateCompanyVerification);
router.get('/internships', adminController.getAllInternships);
router.get('/applications', adminController.getAllApplications);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/reports/:type/export', adminController.exportReportCSV);

export default router;
