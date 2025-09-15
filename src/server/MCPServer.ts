/**
 * Core MCP Server Implementation
 */

import { EventEmitter } from 'events';
import {
  JSONRPCRequest,
  JSONRPCResponse,
  JSONRPCError,
  JSONRPCNotification,
  ServerCapabilities,
  InitializeParams,
  InitializeResult,
  Resource,
  Tool,
  Prompt,
  ToolCallResult,
  Content
} from '../types/index.js';

export class MCPServer extends EventEmitter {
  private initialized = false;
  private capabilities: ServerCapabilities;
  private serverInfo = {
    name: "mcp-server",
    version: "1.0.0"
  };

  private resources: Map<string, Resource> = new Map();
  private tools: Map<string, Tool> = new Map();
  private prompts: Map<string, Prompt> = new Map();

  constructor() {
    super();
    this.capabilities = {
      prompts: {
        listChanged: true
      },
      resources: {
        subscribe: true,
        listChanged: true
      },
      tools: {
        listChanged: true
      },
      logging: {}
    };
  }

  /**
   * Initialize the server with client capabilities
   */
  async initialize(params: InitializeParams): Promise<InitializeResult> {
    if (this.initialized) {
      throw this.createError(-32600, "Already initialized");
    }

    // Validate protocol version
    if (params.protocolVersion !== "2024-11-05") {
      throw this.createError(-32602, `Unsupported protocol version: ${params.protocolVersion}`);
    }

    this.initialized = true;
    
    return {
      protocolVersion: "2024-11-05",
      capabilities: this.capabilities,
      serverInfo: this.serverInfo
    };
  }

  /**
   * Handle incoming JSON-RPC requests
   */
  async handleRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    try {
      let result: unknown;

      switch (request.method) {
        case 'initialize':
          result = await this.initialize(request.params as InitializeParams);
          break;
        case 'notifications/initialized':
          // No response needed for notifications
          return { jsonrpc: "2.0", id: request.id, result: null };
        case 'prompts/list':
          result = await this.listPrompts();
          break;
        case 'prompts/get':
          result = await this.getPrompt(request.params as { name: string; arguments?: Record<string, string> });
          break;
        case 'resources/list':
          result = await this.listResources();
          break;
        case 'resources/read':
          result = await this.readResource(request.params as { uri: string });
          break;
        case 'tools/list':
          result = await this.listTools();
          break;
        case 'tools/call':
          result = await this.callTool(request.params as { name: string; arguments?: Record<string, unknown> });
          break;
        default:
          throw this.createError(-32601, `Method not found: ${request.method}`);
      }

      return {
        jsonrpc: "2.0",
        id: request.id,
        result
      };
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: error instanceof Error && 'code' in error ? error as JSONRPCError : this.createError(-32603, error instanceof Error ? error.message : 'Internal error')
      };
    }
  }

  /**
   * List available prompts
   */
  async listPrompts(): Promise<{ prompts: Prompt[] }> {
    return {
      prompts: Array.from(this.prompts.values())
    };
  }

  /**
   * Get a specific prompt
   */
  async getPrompt(params: { name: string; arguments?: Record<string, string> }): Promise<{ description?: string; messages: Array<{ role: string; content: Content }> }> {
    const prompt = this.prompts.get(params.name);
    if (!prompt) {
      throw this.createError(-32602, `Prompt not found: ${params.name}`);
    }

    // Generate prompt content based on arguments
    const content: Content = {
      type: "text",
      text: `This is the ${params.name} prompt with arguments: ${JSON.stringify(params.arguments || {})}`
    };

    return {
      description: prompt.description,
      messages: [
        {
          role: "user",
          content
        }
      ]
    };
  }

  /**
   * List available resources
   */
  async listResources(): Promise<{ resources: Resource[] }> {
    return {
      resources: Array.from(this.resources.values())
    };
  }

  /**
   * Read a specific resource
   */
  async readResource(params: { uri: string }): Promise<{ contents: Content[] }> {
    const resource = this.resources.get(params.uri);
    if (!resource) {
      throw this.createError(-32602, `Resource not found: ${params.uri}`);
    }

    const content: Content = {
      type: "text",
      text: `Content of resource: ${resource.name}\nURI: ${resource.uri}\nDescription: ${resource.description || 'No description'}`
    };

    return {
      contents: [content]
    };
  }

  /**
   * List available tools
   */
  async listTools(): Promise<{ tools: Tool[] }> {
    return {
      tools: Array.from(this.tools.values())
    };
  }

  /**
   * Call a specific tool
   */
  async callTool(params: { name: string; arguments?: Record<string, unknown> }): Promise<ToolCallResult> {
    const tool = this.tools.get(params.name);
    if (!tool) {
      throw this.createError(-32602, `Tool not found: ${params.name}`);
    }

    // Execute tool logic based on tool name
    const result = await this.executeTool(params.name, params.arguments || {});
    
    return {
      content: [
        {
          type: "text",
          text: result
        }
      ]
    };
  }

  /**
   * Execute tool implementation
   */
  private async executeTool(toolName: string, args: Record<string, unknown>): Promise<string> {
    switch (toolName) {
      case 'echo':
        return `Echo: ${args.message || 'No message provided'}`;
      case 'calculate': {
        const { operation, a, b } = args;
        const numA = Number(a);
        const numB = Number(b);
        switch (operation) {
          case 'add':
            return `${numA} + ${numB} = ${numA + numB}`;
          case 'subtract':
            return `${numA} - ${numB} = ${numA - numB}`;
          case 'multiply':
            return `${numA} * ${numB} = ${numA * numB}`;
          case 'divide':
            return numB !== 0 ? `${numA} / ${numB} = ${numA / numB}` : 'Error: Division by zero';
          default:
            return 'Error: Unknown operation';
        }
      }
      case 'timestamp':
        return `Current timestamp: ${new Date().toISOString()}`;
      default:
        return `Tool ${toolName} executed with arguments: ${JSON.stringify(args)}`;
    }
  }

  /**
   * Register a new resource
   */
  registerResource(resource: Resource): void {
    this.resources.set(resource.uri, resource);
    this.emit('resources/list_changed');
  }

  /**
   * Register a new tool
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
    this.emit('tools/list_changed');
  }

  /**
   * Register a new prompt
   */
  registerPrompt(prompt: Prompt): void {
    this.prompts.set(prompt.name, prompt);
    this.emit('prompts/list_changed');
  }

  /**
   * Send a notification
   */
  sendNotification(method: string, params?: unknown): JSONRPCNotification {
    return {
      jsonrpc: "2.0",
      method,
      params
    };
  }

  /**
   * Create a JSON-RPC error
   */
  private createError(code: number, message: string, data?: unknown): JSONRPCError {
    return { code, message, data };
  }

  /**
   * Check if server is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}