import express from 'express';
import { config as dotenvConfig } from 'dotenv';
import { initDb } from './db.js';
import { securityHeaders } from './middleware/security.js';
import { generalLimiter, aiLimiter, webLimiter } from './middleware/rateLimiter.js';
import projectsRouter from './routes/projects.js';
import integrationsRouter from './routes/integrations.js';
import webRouter from './routes/web.js';
import aiRouter from './routes/ai.js';

dotenvConfig();
initDb();

/**
 * Creates a Vite plugin that mounts the Express API server as middleware.
 */
export const apiPlugin = () => ({
  name: 'api-plugin',
  configureServer(server: { middlewares: { use: (path: string, handler: express.Express) => void } }) {
    const apiApp = express();
    apiApp.use(express.json({ limit: '5mb' }));
    apiApp.use(securityHeaders);
    apiApp.use(generalLimiter);

    // Mount route modules with specific rate limits
    apiApp.use('/projects', projectsRouter);
    apiApp.use('/integrations', integrationsRouter);
    apiApp.use('/integrations', webLimiter, webRouter);
    apiApp.use('/ai', aiLimiter, aiRouter);

    server.middlewares.use('/api', apiApp);
  },
});
