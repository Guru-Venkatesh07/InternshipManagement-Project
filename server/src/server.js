import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import prisma from './config/db.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('[DATABASE] Successfully connected to database via Prisma.');

    const server = app.listen(PORT, () => {
      console.log(`[SERVER] Internship Management System API running at http://localhost:${PORT}`);
      console.log(`[SERVER] Health check endpoint: http://localhost:${PORT}/api/v1/health`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[SERVER] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('[DATABASE] Prisma disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[SERVER_BOOTSTRAP_ERROR] Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
