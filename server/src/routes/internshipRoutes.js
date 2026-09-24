import { Router } from 'express';
import * as internshipController from '../controllers/internshipController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleGuard.js';

const router = Router();

// Middleware to attach user if token present, but allow anonymous access
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return verifyToken(req, res, next);
  }
  next();
};

router.get('/', internshipController.getPublishedInternships);
router.get('/employer/my-postings', verifyToken, requireRoles('EMPLOYER', 'ADMIN'), internshipController.getEmployerPostings);
router.get('/:id', optionalAuth, internshipController.getInternshipById);
router.post('/', verifyToken, requireRoles('EMPLOYER', 'ADMIN'), internshipController.createInternship);
router.put('/:id', verifyToken, requireRoles('EMPLOYER', 'ADMIN'), internshipController.updateInternship);
router.delete('/:id', verifyToken, requireRoles('EMPLOYER', 'ADMIN'), internshipController.deleteInternship);

export default router;
