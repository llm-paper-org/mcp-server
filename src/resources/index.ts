/**
 * Example Resources Implementation
 */

import { Resource } from '../types/index.js';

export const exampleResources: Resource[] = [
  {
    uri: "system://status",
    name: "System Status",
    description: "Current system status and health information",
    mimeType: "application/json"
  },
  {
    uri: "docs://api",
    name: "API Documentation",
    description: "Complete API documentation for this MCP server",
    mimeType: "text/markdown"
  },
  {
    uri: "config://capabilities",
    name: "Server Capabilities",
    description: "List of server capabilities and features",
    mimeType: "application/json"
  },
  {
    uri: "data://sample.json",
    name: "Sample Data",
    description: "Sample JSON data for testing",
    mimeType: "application/json"
  }
];

export class ResourceProvider {
  static async getContent(uri: string): Promise<string> {
    switch (uri) {
      case "system://status":
        return this.getSystemStatus();
      case "docs://api":
        return this.getApiDocs();
      case "config://capabilities":
        return this.getCapabilities();
      case "data://sample.json":
        return this.getSampleData();
      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  }

  private static getSystemStatus(): string {
    const status = {
      status: "healthy",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: "1.0.0",
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(status, null, 2);
  }

  private static getApiDocs(): string {
    return `# MCP Server API Documentation

## Overview
This is a fully functional Model Context Protocol (MCP) server implementation.

## Capabilities
- **Resources**: Access to various data sources and content
- **Tools**: Execute various operations and computations
- **Prompts**: Pre-defined prompt templates for AI interactions

## Available Methods

### Resources
- \`resources/list\` - List all available resources
- \`resources/read\` - Read content from a specific resource

### Tools
- \`tools/list\` - List all available tools
- \`tools/call\` - Execute a specific tool

### Prompts
- \`prompts/list\` - List all available prompts
- \`prompts/get\` - Get a specific prompt with arguments

## Example Usage

\`\`\`json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "echo",
    "arguments": {
      "message": "Hello, MCP!"
    }
  }
}
\`\`\`
`;
  }

  private static getCapabilities(): string {
    const capabilities = {
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
    return JSON.stringify(capabilities, null, 2);
  }

  private static getSampleData(): string {
    const sampleData = {
      users: [
        { id: 1, name: "Alice", email: "alice@example.com" },
        { id: 2, name: "Bob", email: "bob@example.com" },
        { id: 3, name: "Charlie", email: "charlie@example.com" }
      ],
      products: [
        { id: 1, name: "Widget A", price: 19.99 },
        { id: 2, name: "Widget B", price: 29.99 },
        { id: 3, name: "Widget C", price: 39.99 }
      ],
      settings: {
        theme: "dark",
        language: "en",
        notifications: true
      }
    };
    return JSON.stringify(sampleData, null, 2);
  }
}