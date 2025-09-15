# MCP Server (ExpressJS)

A complete implementation of the Model Context Protocol (MCP) server using ExpressJS. This server provides a robust, production-ready implementation of the MCP specification with JSON-RPC 2.0 over HTTP.

## Features

- 🚀 **ExpressJS-based**: Built on the popular Express.js framework
- 🔒 **Security**: Includes security headers, CORS support, and input validation
- 📝 **MCP Protocol**: Full implementation of MCP specification with JSON-RPC 2.0
- 🛠️ **Tools**: Execute server-side tools with input validation
- 📚 **Resources**: Serve various types of resources (files, data, APIs)
- 💬 **Prompts**: Provide prompt templates for AI interactions
- 📊 **Logging**: Comprehensive logging with configurable levels
- 🧪 **Testing**: Full test suite with Jest
- 📖 **TypeScript**: Written in TypeScript for type safety

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Start the server
npm start
```

### Development

```bash
# Start in development mode with hot reload
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `LOG_LEVEL`: Logging level (debug/info/warning/error)
- `CORS_ORIGIN`: CORS origin configuration

## API Endpoints

### Health Check
```
GET /health
```

Returns server health status and configuration.

### MCP Protocol
```
POST /mcp
```

Main MCP endpoint for JSON-RPC 2.0 requests.

### Server Information
```
GET /
```

Returns server information and available endpoints.

## MCP Protocol Usage

The server implements the full MCP specification. Here are some example requests:

### Initialize the Connection

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {
      "name": "example-client",
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

### Execute a Tool

```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "echo",
    "arguments": {
      "text": "Hello, World!"
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
    "uri": "file:///example.txt"
  }
}
```

## Built-in Tools

The server comes with several built-in tools:

- **echo**: Echo back text with optional transformations
- **calculate**: Perform basic mathematical calculations
- **uuid**: Generate UUID v4 identifiers
- **timestamp**: Get current timestamp in various formats

## Built-in Resources

Example resources included:

- Project documentation
- Server configuration
- Sample data files

## Architecture

```
src/
├── types/          # TypeScript type definitions
├── utils/          # Utility functions (JSON-RPC, logging)
├── handlers/       # MCP protocol handlers
├── examples/       # Example resources and tools
├── server.ts       # Express server setup
└── index.ts        # Main entry point
```

## Testing

The project includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm test server.test.ts
```

## Development

### Adding Custom Tools

Create a new tool by extending the `McpServer` class:

```typescript
mcpServer.registerMethod('tools/call', async (params) => {
  if (params.name === 'my-custom-tool') {
    // Your tool implementation
    return {
      content: [
        {
          type: 'text',
          text: 'Tool result'
        }
      ]
    };
  }
});
```

### Adding Custom Resources

Extend the resource handlers to serve your own data:

```typescript
mcpServer.registerMethod('resources/read', async (params) => {
  if (params.uri === 'my://custom-resource') {
    return {
      contents: [
        {
          uri: params.uri,
          mimeType: 'text/plain',
          text: 'Custom resource content'
        }
      ]
    };
  }
});
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  mcp-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Run the test suite
6. Submit a pull request

## Support

For issues and questions, please open an issue on the GitHub repository.