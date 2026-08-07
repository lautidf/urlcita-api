import { Router } from 'express';
import { create, getAllForUser, getOne, getStatistics, remove } from './link.controller.js';
import { authenticateJWT } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/links', authenticateJWT, create);
router.get('/links', authenticateJWT, getAllForUser);
router.get('/links/:id', authenticateJWT, getOne);
router.delete('/links/:id', authenticateJWT, remove);
router.get('/links/:id/stats', authenticateJWT, getStatistics);

export const linkRoutes = router;