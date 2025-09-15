# MCP Server

A fully functional Model Context Protocol (MCP) server implementation in TypeScript.

## Overview

This project provides a complete, production-ready MCP server that demonstrates all core protocol capabilities including resources, tools, and prompts. The server is built using TypeScript and follows the official MCP specification.

## Features

- **Complete MCP Protocol Implementation**: Full support for MCP 2024-11-05 specification
- **Resources**: Access to various data sources and content
- **Tools**: Execute operations and computations
- **Prompts**: Pre-defined prompt templates for AI interactions
- **JSON-RPC 2.0**: Proper request/response handling
- **Stdio Transport**: Standard input/output communication
- **TypeScript**: Full type safety and modern JavaScript features
- **Extensible Architecture**: Easy to add new resources, tools, and prompts

## Quick Start

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Run

```bash
npm start
```

### Development

```bash
npm run dev
```

## Usage

The server communicates via stdin/stdout using JSON-RPC 2.0 messages. Here's how to interact with it:

### Initialize the Server

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "my-client",
      "version": "1.0.0"
    }
  }
}
```

### List Available Tools

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
```

### Call a Tool

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "echo",
    "arguments": {
      "message": "Hello, MCP!"
    }
  }
}
```

### List Resources

```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "resources/list"
}
```

### Read a Resource

```json
{
  "jsonrpc": "2.0",
  "id": 5,
  "method": "resources/read",
  "params": {
    "uri": "file://example.txt"
  }
}
```

### List Prompts

```json
{
  "jsonrpc": "2.0",
  "id": 6,
  "method": "prompts/list"
}
```

### Get a Prompt

```json
{
  "jsonrpc": "2.0",
  "id": 7,
  "method": "prompts/get",
  "params": {
    "name": "summarize",
    "arguments": {
      "content": "Text to summarize",
      "length": "short"
    }
  }
}
```

## Built-in Capabilities

### Tools

- **echo**: Echo back a message
- **calculate**: Perform basic math operations (add, subtract, multiply, divide)
- **timestamp**: Get current timestamp

### Resources

- **file://example.txt**: Example text file
- **config://server-info**: Server information and status

### Prompts

- **summarize**: Generate content summaries
- **analyze**: Perform data analysis

## Testing

Run the included test client:

```bash
node test-client.js
```

This will test all major server functionality including initialization, tools, resources, and prompts.

## Architecture

```
src/
├── index.ts              # Main server entry point
├── server/
│   └── MCPServer.ts      # Core MCP server implementation
├── types/
│   └── index.ts          # TypeScript type definitions
├── tools/
│   └── index.ts          # Tool implementations
├── resources/
│   └── index.ts          # Resource providers
└── prompts/
    └── index.ts          # Prompt templates
```

## Extending the Server

### Adding a New Tool

```typescript
server.registerTool({
  name: "my_tool",
  description: "Description of my tool",
  inputSchema: {
    type: "object",
    properties: {
      param1: {
        type: "string",
        description: "First parameter"
      }
    },
    required: ["param1"]
  }
});
```

### Adding a New Resource

```typescript
server.registerResource({
  uri: "custom://my-resource",
  name: "My Resource",
  description: "Description of my resource",
  mimeType: "application/json"
});
```

### Adding a New Prompt

```typescript
server.registerPrompt({
  name: "my_prompt",
  description: "Description of my prompt",
  arguments: [
    {
      name: "input",
      description: "Input parameter",
      required: true
    }
  ]
});
```

## Protocol Compliance

This server implements the full MCP specification including:

- ✅ Server initialization and capability negotiation
- ✅ Resource management (list, read, subscribe)
- ✅ Tool management (list, call)
- ✅ Prompt management (list, get)
- ✅ JSON-RPC 2.0 request/response handling
- ✅ Error handling and proper error codes
- ✅ Notification support
- ✅ Stdio transport

## Requirements

- Node.js 18+ 
- TypeScript 5+

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For questions or issues, please open an issue on the GitHub repository.