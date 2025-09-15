/**
 * Model Context Protocol (MCP) TypeScript types
 * Based on the MCP specification for JSON-RPC 2.0 protocol
 */

// Base JSON-RPC 2.0 types
export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: any;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: any;
  error?: JsonRpcError;
}

export interface JsonRpcError {
  code: number;
  message: string;
  data?: any;
}

export interface JsonRpcNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

// MCP-specific types
export interface McpCapabilities {
  experimental?: Record<string, any>;
  logging?: object;
  prompts?: {
    listChanged?: boolean;
  };
  resources?: {
    subscribe?: boolean;
    listChanged?: boolean;
  };
  tools?: {
    listChanged?: boolean;
  };
}

export interface McpImplementation {
  name: string;
  version: string;
}

export interface McpInitializeParams {
  protocolVersion: string;
  capabilities: McpCapabilities;
  clientInfo: McpImplementation;
}

export interface McpInitializeResult {
  protocolVersion: string;
  capabilities: McpCapabilities;
  serverInfo: McpImplementation;
}

// Resource types
export interface McpResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface McpResourceContent {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}

export interface McpListResourcesParams {
  cursor?: string;
}

export interface McpListResourcesResult {
  resources: McpResource[];
  nextCursor?: string;
}

export interface McpReadResourceParams {
  uri: string;
}

export interface McpReadResourceResult {
  contents: McpResourceContent[];
}

// Tool types
export interface McpTool {
  name: string;
  description?: string;
  inputSchema: object;
}

export interface McpListToolsParams {
  cursor?: string;
}

export interface McpListToolsResult {
  tools: McpTool[];
  nextCursor?: string;
}

export interface McpCallToolParams {
  name: string;
  arguments?: Record<string, any>;
}

export interface McpCallToolResult {
  content: McpToolContent[];
  isError?: boolean;
}

export interface McpToolContent {
  type: 'text' | 'image' | 'resource';
  text?: string;
  data?: string;
  mimeType?: string;
  uri?: string;
}

// Prompt types
export interface McpPrompt {
  name: string;
  description?: string;
  arguments?: McpPromptArgument[];
}

export interface McpPromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface McpListPromptsParams {
  cursor?: string;
}

export interface McpListPromptsResult {
  prompts: McpPrompt[];
  nextCursor?: string;
}

export interface McpGetPromptParams {
  name: string;
  arguments?: Record<string, any>;
}

export interface McpGetPromptResult {
  description?: string;
  messages: McpPromptMessage[];
}

export interface McpPromptMessage {
  role: 'user' | 'assistant' | 'system';
  content: McpPromptContent;
}

export interface McpPromptContent {
  type: 'text' | 'image' | 'resource';
  text?: string;
  data?: string;
  mimeType?: string;
  uri?: string;
}

// Logging types
export interface McpSetLevelParams {
  level: 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'alert' | 'emergency';
}

// Notification types
export interface McpLogParams {
  level: 'debug' | 'info' | 'notice' | 'warning' | 'error' | 'critical' | 'alert' | 'emergency';
  data?: any;
  logger?: string;
}

// Error codes
export enum McpErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  ServerError = -32000,
  ApplicationError = -32500,
}