import { JsonRpcRequest, JsonRpcResponse, JsonRpcError, McpErrorCode } from '../types/mcp.js';

/**
 * Utility functions for JSON-RPC 2.0 protocol handling
 */

export function createJsonRpcResponse(
  id: string | number | null,
  result?: any,
  error?: JsonRpcError
): JsonRpcResponse {
  const response: JsonRpcResponse = {
    jsonrpc: '2.0',
    id,
  };

  if (error) {
    response.error = error;
  } else {
    response.result = result;
  }

  return response;
}

export function createJsonRpcError(
  code: number,
  message: string,
  data?: any
): JsonRpcError {
  return {
    code,
    message,
    data,
  };
}

export function createParseError(data?: any): JsonRpcError {
  return createJsonRpcError(
    McpErrorCode.ParseError,
    'Parse error',
    data
  );
}

export function createInvalidRequestError(data?: any): JsonRpcError {
  return createJsonRpcError(
    McpErrorCode.InvalidRequest,
    'Invalid Request',
    data
  );
}

export function createMethodNotFoundError(method: string): JsonRpcError {
  return createJsonRpcError(
    McpErrorCode.MethodNotFound,
    'Method not found',
    { method }
  );
}

export function createInvalidParamsError(data?: any): JsonRpcError {
  return createJsonRpcError(
    McpErrorCode.InvalidParams,
    'Invalid params',
    data
  );
}

export function createInternalError(data?: any): JsonRpcError {
  return createJsonRpcError(
    McpErrorCode.InternalError,
    'Internal error',
    data
  );
}

export function isValidJsonRpcRequest(obj: any): obj is JsonRpcRequest {
  return (
    obj &&
    typeof obj === 'object' &&
    obj.jsonrpc === '2.0' &&
    typeof obj.method === 'string' &&
    (obj.id === undefined || 
     obj.id === null || 
     typeof obj.id === 'string' || 
     typeof obj.id === 'number')
  );
}

export function validateJsonRpcRequest(obj: any): JsonRpcRequest | JsonRpcError {
  if (!isValidJsonRpcRequest(obj)) {
    return createInvalidRequestError('Invalid JSON-RPC 2.0 request format');
  }
  return obj;
}

export function isNotification(request: JsonRpcRequest): boolean {
  return request.id === undefined;
}

export function formatErrorResponse(id: string | number | null, error: JsonRpcError): JsonRpcResponse {
  return createJsonRpcResponse(id, undefined, error);
}

export function formatSuccessResponse(id: string | number | null, result: any): JsonRpcResponse {
  return createJsonRpcResponse(id, result);
}