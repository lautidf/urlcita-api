import { Router } from 'express';
import { create, redirect } from './link.controller.js';

const router = Router();

router.post('/links', create);
router.get('/:shortCode', redirect);

export const linkRoutes = router;