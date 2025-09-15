import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { McpServer } from './handlers/mcpHandler.js';
import { 
  validateJsonRpcRequest, 
  createParseError, 
  createInvalidRequestError,
  formatErrorResponse,
  isValidJsonRpcRequest 
} from './utils/jsonrpc.js';
import { logger, getLogger } from './utils/logger.js';

export class ExpressMcpServer {
  private app: Application;
  private mcpServer: McpServer;
  private serverLogger = getLogger('express');

  constructor() {
    this.app = express();
    this.mcpServer = new McpServer();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
        },
      },
    }));

    // CORS middleware
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Request logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => {
          this.serverLogger.info(message.trim());
        },
      },
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: this.mcpServer.getServerInfo(),
        capabilities: this.mcpServer.getCapabilities(),
        initialized: this.mcpServer.isInitialized(),
      });
    });

    // MCP endpoint - main JSON-RPC 2.0 handler
    this.app.post('/mcp', async (req: Request, res: Response) => {
      await this.handleMcpRequest(req, res);
    });

    // Root endpoint with server information
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'MCP Server (ExpressJS)',
        description: 'Model Context Protocol server implementation using ExpressJS',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          mcp: '/mcp (POST)',
        },
        server: this.mcpServer.getServerInfo(),
        capabilities: this.mcpServer.getCapabilities(),
      });
    });

    // 404 handler for all unmatched routes
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Endpoint ${req.originalUrl} not found`,
        availableEndpoints: ['/', '/health', '/mcp'],
      });
    });
  }

  private async handleMcpRequest(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      
      // Handle both single requests and batch requests
      const isBatch = Array.isArray(body);
      const requests = isBatch ? body : [body];
      
      this.serverLogger.debug('Received MCP request', { 
        isBatch, 
        requestCount: requests.length,
        methods: requests.map((r: any) => r?.method).filter(Boolean)
      });

      const responses = [];

      for (const requestData of requests) {
        try {
          // Validate JSON-RPC format
          const validationResult = validateJsonRpcRequest(requestData);
          
          if ('code' in validationResult) {
            // Validation error
            responses.push(formatErrorResponse(requestData?.id || null, validationResult));
            continue;
          }

          // Handle valid request
          const response = await this.mcpServer.handleRequest(validationResult);
          if (response) {
            responses.push(response);
          }
        } catch (error) {
          this.serverLogger.error('Error processing individual request', { 
            error: error instanceof Error ? error.message : error,
            request: requestData 
          });
          
          const errorResponse = formatErrorResponse(
            requestData?.id || null,
            createInvalidRequestError(error instanceof Error ? error.message : 'Unknown error')
          );
          responses.push(errorResponse);
        }
      }

      // Return appropriate response format
      if (isBatch) {
        res.json(responses);
      } else {
        if (responses.length > 0) {
          res.json(responses[0]);
        } else {
          // No response for notifications
          res.status(204).send();
        }
      }
    } catch (error) {
      this.serverLogger.error('Error parsing MCP request', { 
        error: error instanceof Error ? error.message : error 
      });
      
      const errorResponse = formatErrorResponse(null, createParseError());
      res.status(400).json(errorResponse);
    }
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      this.serverLogger.error('Unhandled error', { 
        error: error.message, 
        stack: error.stack,
        url: req.url,
        method: req.method 
      });

      if (res.headersSent) {
        return next(error);
      }

      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred',
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.serverLogger.error('Unhandled promise rejection', { reason, promise });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.serverLogger.error('Uncaught exception', { error: error.message, stack: error.stack });
      process.exit(1);
    });
  }

  start(port: number = 3000): Promise<void> {
    return new Promise((resolve) => {
      const server = this.app.listen(port, () => {
        logger.info(`MCP Server started on port ${port}`);
        logger.info(`Health check: http://localhost:${port}/health`);
        logger.info(`MCP endpoint: http://localhost:${port}/mcp`);
        resolve();
      });

      // Graceful shutdown
      const shutdown = () => {
        logger.info('Shutting down server...');
        server.close(() => {
          logger.info('Server shut down successfully');
          process.exit(0);
        });
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
    });
  }

  getApp(): Application {
    return this.app;
  }

  getMcpServer(): McpServer {
    return this.mcpServer;
  }
}