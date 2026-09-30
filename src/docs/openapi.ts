import swaggerJSDoc from 'swagger-jsdoc';
import { API_URL } from '../config/env.js';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'URLcita API',
      version: '1.0.0'
    },
    servers: [
      { url: API_URL },
    ],
    tags: [
      { name: 'Authentication' },
      { name: 'Links' },
    ],
  },
  apis: [
    './src/docs/**/*.yaml',
  ],
});