#!/usr/bin/env node

/**
 * MCP Server Entry Point
 * Handles stdio communication with MCP clients
 */

import { MCPServer } from './server/MCPServer.js';
import { JSONRPCRequest } from './types/index.js';
import * as readline from 'readline';

class StdioTransport {
  private server: MCPServer;
  private rl: readline.Interface;

  constructor() {
    this.server = new MCPServer();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    this.setupServer();
    this.setupTransport();
  }

  private setupServer(): void {
    // Register example resources
    this.server.registerResource({
      uri: "file://example.txt",
      name: "Example Text File",
      description: "A sample text resource",
      mimeType: "text/plain"
    });

    this.server.registerResource({
      uri: "config://server-info",
      name: "Server Information",
      description: "Information about this MCP server",
      mimeType: "application/json"
    });

    // Register example tools
    this.server.registerTool({
      name: "echo",
      description: "Echo back the provided message",
      inputSchema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "The message to echo back"
          }
        },
        required: ["message"]
      }
    });

    this.server.registerTool({
      name: "calculate",
      description: "Perform basic mathematical operations",
      inputSchema: {
        type: "object",
        properties: {
          operation: {
            type: "string",
            enum: ["add", "subtract", "multiply", "divide"],
            description: "The mathematical operation to perform"
          },
          a: {
            type: "number",
            description: "First operand"
          },
          b: {
            type: "number",
            description: "Second operand"
          }
        },
        required: ["operation", "a", "b"]
      }
    });

    this.server.registerTool({
      name: "timestamp",
      description: "Get the current timestamp",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    });

    // Register example prompts
    this.server.registerPrompt({
      name: "summarize",
      description: "Generate a summary of the provided content",
      arguments: [
        {
          name: "content",
          description: "The content to summarize",
          required: true
        },
        {
          name: "length",
          description: "Desired summary length (short, medium, long)",
          required: false
        }
      ]
    });

    this.server.registerPrompt({
      name: "analyze",
      description: "Perform analysis on the provided data",
      arguments: [
        {
          name: "data",
          description: "The data to analyze",
          required: true
        },
        {
          name: "type",
          description: "Type of analysis to perform",
          required: false
        }
      ]
    });
  }

  private setupTransport(): void {
    this.rl.on('line', async (line) => {
      try {
        const trimmed = line.trim();
        if (!trimmed) return;

        const request: JSONRPCRequest = JSON.parse(trimmed);
        const response = await this.server.handleRequest(request);
        
        // Only send response for requests with IDs (not notifications)
        if (request.id !== undefined) {
          process.stdout.write(JSON.stringify(response) + '\n');
        }
      } catch (error) {
        // Send error response for malformed requests
        const errorResponse = {
          jsonrpc: "2.0" as const,
          id: null,
          error: {
            code: -32700,
            message: "Parse error",
            data: error instanceof Error ? error.message : 'Unknown error'
          }
        };
        process.stdout.write(JSON.stringify(errorResponse) + '\n');
      }
    });

    this.rl.on('close', () => {
      process.exit(0);
    });

    // Handle process signals
    process.on('SIGINT', () => {
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      process.exit(0);
    });
  }

  start(): void {
    // Server is ready to receive requests via stdin
    process.stderr.write('MCP Server started and listening on stdin/stdout\n');
  }
}

// Start the server
const transport = new StdioTransport();
transport.start();