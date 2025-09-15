/**
 * Example resources that can be served by the MCP server
 */

export interface ExampleResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  content: string;
}

export const exampleResources: ExampleResource[] = [
  {
    uri: 'file:///documents/readme.md',
    name: 'Project README',
    description: 'Main project documentation',
    mimeType: 'text/markdown',
    content: `# MCP Server Example

This is an example resource that demonstrates how the MCP server can serve documents and other content.

## Features
- JSON-RPC 2.0 protocol implementation
- ExpressJS-based HTTP server
- Resource management
- Tool execution
- Prompt templates

## Usage
Send JSON-RPC requests to the /mcp endpoint to interact with the server.
`,
  },
  {
    uri: 'data://config/server-info.json',
    name: 'Server Configuration',
    description: 'Server configuration and metadata',
    mimeType: 'application/json',
    content: JSON.stringify({
      server: {
        name: 'mcp-server-express',
        version: '1.0.0',
        description: 'Model Context Protocol server using ExpressJS',
      },
      features: [
        'Resource serving',
        'Tool execution',
        'Prompt templates',
        'Logging',
      ],
      endpoints: {
        health: '/health',
        mcp: '/mcp',
      },
    }, null, 2),
  },
  {
    uri: 'mem://examples/sample-data.txt',
    name: 'Sample Data',
    description: 'Sample text data for demonstration',
    mimeType: 'text/plain',
    content: 'This is sample text content that can be read through the MCP resources API. It demonstrates how text resources can be served to clients.',
  },
];

export function getResourceByUri(uri: string): ExampleResource | undefined {
  return exampleResources.find(resource => resource.uri === uri);
}

export function getAllResources(): ExampleResource[] {
  return exampleResources;
}