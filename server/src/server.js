import app from './app.js';
import { env } from './config/env.js';

const server = app.listen(env.port, () => {
  console.log(`🚀 Que-CRM API server running on port ${env.port} (${env.nodeEnv})`);
  console.log(`📡 Health check available at: http://localhost:${env.port}/api/health`);
});

// Handle graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

