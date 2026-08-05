import { Router } from 'express';
import { create } from './link.controller.js';

const router = Router();

router.post('/', create);

export const linkRoutes = router;