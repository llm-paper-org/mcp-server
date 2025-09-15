#!/usr/bin/env node

import { ExpressMcpServer } from './server.js';
import { logger, setLogLevel } from './utils/logger.js';

async function main() {
  try {
    // Set log level from environment variable
    const logLevel = process.env.LOG_LEVEL as any || 'info';
    setLogLevel(logLevel);

    logger.info('Starting MCP Server with ExpressJS');
    logger.info('Environment configuration', {
      nodeEnv: process.env.NODE_ENV || 'development',
      logLevel,
      port: process.env.PORT || 3000,
    });

    // Create and start the server
    const server = new ExpressMcpServer();
    const port = parseInt(process.env.PORT || '3000', 10);
    
    await server.start(port);
  } catch (error) {
    logger.error('Failed to start server', { 
      error: error instanceof Error ? error.message : error 
    });
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Unhandled error in main:', error);
    process.exit(1);
  });
}