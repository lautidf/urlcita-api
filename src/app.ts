import express from 'express';
import { errorHandler } from './middleware/error.middleware.js';
import { linkRoutes } from './modules/links/link.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';

export const app = express();

app.use(express.json());

app.use('/', authRoutes);
app.use('/', linkRoutes);

app.use(errorHandler);