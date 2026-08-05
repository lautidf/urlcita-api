import express from 'express';
import { errorHandler } from './middleware/error.middleware.js';
import { linkRoutes } from './modules/links/link.routes.js';

export const app = express();

app.use(express.json());

app.use('/links', linkRoutes);

app.use(errorHandler);