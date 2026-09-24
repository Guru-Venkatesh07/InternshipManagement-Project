import { Router } from 'express';
import * as employerController from '../controllers/employerController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleGuard.js';
import { uploadLogo } from '../middlewares/uploadMiddleware.js';

const router = Router();

router.use(verifyToken, requireRoles('EMPLOYER'));

router.get('/dashboard', employerController.getEmployerDashboard);
router.put('/profile', employerController.updateEmployerProfile);
router.post('/logo', uploadLogo.single('logo'), employerController.uploadCompanyLogo);

export default router;
