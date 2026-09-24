import { Router } from 'express';
import * as interviewController from '../controllers/interviewController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleGuard.js';

const router = Router();

router.post('/', verifyToken, requireRoles('EMPLOYER', 'ADMIN'), interviewController.scheduleInterview);
router.put('/:id/result', verifyToken, requireRoles('EMPLOYER', 'ADMIN'), interviewController.updateInterviewResult);
router.get('/application/:applicationId', verifyToken, interviewController.getInterviewByApplicationId);

export default router;
