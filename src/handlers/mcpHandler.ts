import {
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcError,
  McpInitializeParams,
  McpInitializeResult,
  McpCapabilities,
  McpImplementation,
  McpListResourcesParams,
  McpListResourcesResult,
  McpReadResourceParams,
  McpReadResourceResult,
  McpListToolsParams,
  McpListToolsResult,
  McpCallToolParams,
  McpCallToolResult,
  McpListPromptsParams,
  McpListPromptsResult,
  McpGetPromptParams,
  McpGetPromptResult,
  McpSetLevelParams,
} from '../types/mcp.js';
import {
  createJsonRpcResponse,
  createMethodNotFoundError,
  createInternalError,
  createInvalidParamsError,
  isNotification,
} from '../utils/jsonrpc.js';
import { logger, setLogLevel } from '../utils/logger.js';

export type MethodHandler = (params?: any) => Promise<any>;

export class McpServer {
  private methodHandlers: Map<string, MethodHandler> = new Map();
  private capabilities: McpCapabilities;
  private serverInfo: McpImplementation;
  private initialized = false;

  constructor() {
    this.serverInfo = {
      name: 'mcp-server-express',
      version: '1.0.0',
    };

    this.capabilities = {
      logging: {},
      resources: {
        subscribe: false,
        listChanged: false,
      },
      tools: {
        listChanged: false,
      },
      prompts: {
        listChanged: false,
      },
    };

    this.setupDefaultHandlers();
  }

  private setupDefaultHandlers(): void {
    // Core MCP methods
    this.registerMethod('initialize', this.handleInitialize.bind(this));
    this.registerMethod('initialized', this.handleInitialized.bind(this));
    
    // Resource methods
    this.registerMethod('resources/list', this.handleListResources.bind(this));
    this.registerMethod('resources/read', this.handleReadResource.bind(this));
    
    // Tool methods
    this.registerMethod('tools/list', this.handleListTools.bind(this));
    this.registerMethod('tools/call', this.handleCallTool.bind(this));
    
    // Prompt methods
    this.registerMethod('prompts/list', this.handleListPrompts.bind(this));
    this.registerMethod('prompts/get', this.handleGetPrompt.bind(this));
    
    // Logging methods
    this.registerMethod('logging/setLevel', this.handleSetLevel.bind(this));
  }

  registerMethod(method: string, handler: MethodHandler): void {
    this.methodHandlers.set(method, handler);
    logger.debug(`Registered method handler: ${method}`);
  }

  async handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse | null> {
    const startTime = Date.now();
    logger.debug('Handling request', { method: request.method, id: request.id });

    try {
      const handler = this.methodHandlers.get(request.method);
      
      if (!handler) {
        const error = createMethodNotFoundError(request.method);
        if (!isNotification(request)) {
          return createJsonRpcResponse(request.id!, undefined, error);
        }
        return null;
      }

      const result = await handler(request.params);
      
      if (!isNotification(request)) {
        const response = createJsonRpcResponse(request.id!, result);
        logger.debug('Request handled successfully', { 
          method: request.method, 
          id: request.id,
          duration: Date.now() - startTime 
        });
        return response;
      }
      
      return null;
    } catch (error) {
      logger.error('Error handling request', { 
        method: request.method, 
        id: request.id, 
        error: error instanceof Error ? error.message : error 
      });
      
      if (!isNotification(request)) {
        const jsonRpcError = createInternalError(
          error instanceof Error ? error.message : 'Unknown error'
        );
        return createJsonRpcResponse(request.id!, undefined, jsonRpcError);
      }
      
      return null;
    }
  }

  // Core MCP method handlers
  private async handleInitialize(params: McpInitializeParams): Promise<McpInitializeResult> {
    logger.info('Initializing MCP server', params);
    
    this.initialized = true;
    
    return {
      protocolVersion: '2024-11-05',
      capabilities: this.capabilities,
      serverInfo: this.serverInfo,
    };
  }

  private async handleInitialized(): Promise<void> {
    logger.info('MCP server initialization completed');
  }

  // Resource method handlers
  private async handleListResources(params?: McpListResourcesParams): Promise<McpListResourcesResult> {
    logger.debug('Listing resources', params);
    
    // Example resources - in a real implementation, these would come from your data source
    return {
      resources: [
        {
          uri: 'file:///example.txt',
          name: 'Example Text File',
          description: 'An example text resource',
          mimeType: 'text/plain',
        },
        {
          uri: 'http://example.com/api/data',
          name: 'Example API Data',
          description: 'Example data from an API endpoint',
          mimeType: 'application/json',
        },
      ],
    };
  }

  private async handleReadResource(params: McpReadResourceParams): Promise<McpReadResourceResult> {
    logger.debug('Reading resource', params);
    
    // Example resource content - in a real implementation, this would fetch actual content
    const { uri } = params;
    
    if (uri === 'file:///example.txt') {
      return {
        contents: [
          {
            uri,
            mimeType: 'text/plain',
            text: 'This is example content from a text file.',
          },
        ],
      };
    }
    
    if (uri === 'http://example.com/api/data') {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify({ message: 'Example API data', timestamp: new Date().toISOString() }),
          },
        ],
      };
    }
    
    throw new Error(`Resource not found: ${uri}`);
  }

  // Tool method handlers
  private async handleListTools(params?: McpListToolsParams): Promise<McpListToolsResult> {
    logger.debug('Listing tools', params);
    
    return {
      tools: [
        {
          name: 'echo',
          description: 'Echo back the provided text',
          inputSchema: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: 'The text to echo back',
              },
            },
            required: ['text'],
          },
        },
        {
          name: 'calculate',
          description: 'Perform basic arithmetic calculations',
          inputSchema: {
            type: 'object',
            properties: {
              expression: {
                type: 'string',
                description: 'Mathematical expression to evaluate (e.g., "2 + 3 * 4")',
              },
            },
            required: ['expression'],
          },
        },
      ],
    };
  }

  private async handleCallTool(params: McpCallToolParams): Promise<McpCallToolResult> {
    logger.debug('Calling tool', params);
    
    const { name, arguments: args } = params;
    
    switch (name) {
      case 'echo':
        return {
          content: [
            {
              type: 'text',
              text: args?.text || 'No text provided',
            },
          ],
        };
        
      case 'calculate':
        try {
          const expression = args?.expression || '';
          // Simple and safe expression evaluation (limited to basic arithmetic)
          const result = this.evaluateExpression(expression);
          return {
            content: [
              {
                type: 'text',
                text: `Result: ${result}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${error instanceof Error ? error.message : 'Invalid expression'}`,
              },
            ],
            isError: true,
          };
        }
        
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  // Prompt method handlers
  private async handleListPrompts(params?: McpListPromptsParams): Promise<McpListPromptsResult> {
    logger.debug('Listing prompts', params);
    
    return {
      prompts: [
        {
          name: 'summarize',
          description: 'Generate a summary of the provided text',
          arguments: [
            {
              name: 'text',
              description: 'The text to summarize',
              required: true,
            },
            {
              name: 'max_words',
              description: 'Maximum number of words in the summary',
              required: false,
            },
          ],
        },
      ],
    };
  }

  private async handleGetPrompt(params: McpGetPromptParams): Promise<McpGetPromptResult> {
    logger.debug('Getting prompt', params);
    
    const { name, arguments: args } = params;
    
    switch (name) {
      case 'summarize':
        const text = args?.text || '';
        const maxWords = args?.max_words || 100;
        
        return {
          description: 'Prompt for text summarization',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: `Please summarize the following text in no more than ${maxWords} words:\n\n${text}`,
              },
            },
          ],
        };
        
      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  }

  // Logging method handlers
  private async handleSetLevel(params: McpSetLevelParams): Promise<void> {
    logger.debug('Setting log level', params);
    setLogLevel(params.level);
    logger.info(`Log level set to: ${params.level}`);
  }

  // Utility methods
  private evaluateExpression(expression: string): number {
    // Simple arithmetic expression evaluator (safe for basic operations)
    const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
    if (!sanitized || sanitized !== expression) {
      throw new Error('Invalid characters in expression');
    }
    
    try {
      // Use Function constructor for safe evaluation of arithmetic expressions
      const result = new Function(`"use strict"; return (${sanitized})`)();
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Result is not a valid number');
      }
      return result;
    } catch (error) {
      throw new Error('Invalid mathematical expression');
    }
  }

  getCapabilities(): McpCapabilities {
    return this.capabilities;
  }

  getServerInfo(): McpImplementation {
    return this.serverInfo;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}