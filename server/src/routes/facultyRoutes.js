import { Router } from 'express';
import * as facultyController from '../controllers/facultyController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleGuard.js';

const router = Router();

router.use(verifyToken, requireRoles('FACULTY', 'ADMIN'));

router.get('/dashboard', facultyController.getFacultyDashboard);
router.get('/students', facultyController.getAssignedStudents);
router.get('/pending-applications', facultyController.getPendingApplications);
router.get('/placements', facultyController.getSupervisedPlacements);

export default router;
