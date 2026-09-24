import { Router } from 'express';
import * as placementController from '../controllers/placementController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleGuard.js';

const router = Router();

router.get('/my-placement', verifyToken, requireRoles('STUDENT'), placementController.getStudentActivePlacement);
router.post('/progress-logs', verifyToken, requireRoles('STUDENT'), placementController.submitProgressLog);
router.put('/progress-logs/:logId/review', verifyToken, requireRoles('FACULTY', 'ADMIN'), placementController.reviewProgressLog);
router.post('/evaluations', verifyToken, requireRoles('FACULTY', 'ADMIN'), placementController.submitEvaluation);
router.get('/:id', verifyToken, placementController.getPlacementById);

export default router;
