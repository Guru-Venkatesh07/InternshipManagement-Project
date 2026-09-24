import { Router } from 'express';
import * as applicationController from '../controllers/applicationController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleGuard.js';
import { uploadResume } from '../middlewares/uploadMiddleware.js';

const router = Router();

// Student routes
router.post(
  '/',
  verifyToken,
  requireRoles('STUDENT'),
  uploadResume.single('resume'),
  applicationController.applyToInternship
);
router.get(
  '/my-applications',
  verifyToken,
  requireRoles('STUDENT'),
  applicationController.getStudentApplications
);
router.put(
  '/:id/accept',
  verifyToken,
  requireRoles('STUDENT'),
  applicationController.acceptInternshipOffer
);

// Employer routes
router.get(
  '/employer/applicants',
  verifyToken,
  requireRoles('EMPLOYER', 'ADMIN'),
  applicationController.getEmployerApplications
);
router.put(
  '/:id/status',
  verifyToken,
  requireRoles('EMPLOYER', 'ADMIN'),
  applicationController.updateApplicationStatus
);

// Faculty routes
router.put(
  '/:id/faculty-review',
  verifyToken,
  requireRoles('FACULTY', 'ADMIN'),
  applicationController.facultyReviewApplication
);

// Shared authenticated detail route
router.get('/:id', verifyToken, applicationController.getApplicationById);

export default router;
