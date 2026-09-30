import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/error.middleware.js';
import { linkRoutes } from './modules/links/link.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { redirect } from './modules/links/link.controller.js';
import { swaggerSpec } from './docs/openapi.js';

export const app = express();

app.use(express.static('public'));

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'URLcita API',
    customfavIcon: '/favicon.png',
    swaggerOptions: {
      defaultModelsExpandDepth: -1,
    },
  })
);

app.use(express.json());

app.use('/', authRoutes);
app.use('/', linkRoutes);

app.get('/:shortCode', redirect);

app.use(errorHandler);