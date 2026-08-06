import express from 'express';
import { errorHandler } from './middleware/error.middleware.js';
import { linkRoutes } from './modules/links/link.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { redirect } from './modules/links/link.controller.js';

export const app = express();

app.use(express.json());

app.use('/', authRoutes);
app.use('/', linkRoutes);

app.get('/:shortCode', redirect);

app.use(errorHandler);