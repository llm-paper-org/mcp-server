import request from 'supertest';
import { ExpressMcpServer } from '../src/server.js';

describe('MCP Server', () => {
  let server: ExpressMcpServer;
  let app: any;

  beforeAll(() => {
    server = new ExpressMcpServer();
    app = server.getApp();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('server');
    });
  });

  describe('Root Endpoint', () => {
    it('should return server information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('MCP Initialize', () => {
    it('should handle initialize request', async () => {
      const initRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0',
          },
        },
      };

      const response = await request(app)
        .post('/mcp')
        .send(initRequest)
        .expect(200);

      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('protocolVersion');
      expect(response.body.result).toHaveProperty('capabilities');
      expect(response.body.result).toHaveProperty('serverInfo');
    });
  });

  describe('MCP Tools', () => {
    it('should list available tools', async () => {
      const listToolsRequest = {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
      };

      const response = await request(app)
        .post('/mcp')
        .send(listToolsRequest)
        .expect(200);

      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('id', 2);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('tools');
      expect(Array.isArray(response.body.result.tools)).toBe(true);
    });

    it('should execute echo tool', async () => {
      const callToolRequest = {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'echo',
          arguments: {
            text: 'Hello, World!',
          },
        },
      };

      const response = await request(app)
        .post('/mcp')
        .send(callToolRequest)
        .expect(200);

      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('id', 3);
      expect(response.body).toHaveProperty('result');
      expect(response.body.result).toHaveProperty('content');
      expect(response.body.result.content[0]).toHaveProperty('text', 'Hello, World!');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON-RPC request', async () => {
      const invalidRequest = {
        method: 'test',
        // Missing jsonrpc field
      };

      const response = await request(app)
        .post('/mcp')
        .send(invalidRequest)
        .expect(200);

      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', -32600);
    });

    it('should handle unknown method', async () => {
      const unknownMethodRequest = {
        jsonrpc: '2.0',
        id: 4,
        method: 'unknown/method',
      };

      const response = await request(app)
        .post('/mcp')
        .send(unknownMethodRequest)
        .expect(200);

      expect(response.body).toHaveProperty('jsonrpc', '2.0');
      expect(response.body).toHaveProperty('id', 4);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', -32601);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });
});