import { Router } from 'express';
import * as studentController from '../controllers/studentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleGuard.js';
import { uploadResume } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.use(verifyToken, requireRoles('STUDENT'));

router.get('/dashboard', studentController.getStudentDashboard);
router.put('/profile', studentController.updateStudentProfile);
router.post('/resume', uploadResume.single('resume'), studentController.uploadResumeFile);

export default router;
