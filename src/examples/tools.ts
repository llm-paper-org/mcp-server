/**
 * Example tools that can be executed by the MCP server
 */

import { v4 as uuidv4 } from 'uuid';

export interface ExampleTool {
  name: string;
  description: string;
  inputSchema: object;
  handler: (args: Record<string, any>) => Promise<any>;
}

export const exampleTools: ExampleTool[] = [
  {
    name: 'echo',
    description: 'Echo back the provided text with optional transformations',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to echo back',
        },
        uppercase: {
          type: 'boolean',
          description: 'Whether to convert text to uppercase',
          default: false,
        },
        reverse: {
          type: 'boolean',
          description: 'Whether to reverse the text',
          default: false,
        },
      },
      required: ['text'],
    },
    handler: async (args) => {
      let text = args.text || '';
      
      if (args.uppercase) {
        text = text.toUpperCase();
      }
      
      if (args.reverse) {
        text = text.split('').reverse().join('');
      }
      
      return {
        content: [
          {
            type: 'text',
            text: text,
          },
        ],
      };
    },
  },
  
  {
    name: 'uuid',
    description: 'Generate a new UUID (v4)',
    inputSchema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of UUIDs to generate',
          default: 1,
          minimum: 1,
          maximum: 10,
        },
      },
    },
    handler: async (args) => {
      const count = Math.min(Math.max(args.count || 1, 1), 10);
      const uuids = Array.from({ length: count }, () => uuidv4());
      
      return {
        content: [
          {
            type: 'text',
            text: uuids.join('\\n'),
          },
        ],
      };
    },
  },
  
  {
    name: 'timestamp',
    description: 'Get current timestamp in various formats',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['iso', 'unix', 'readable'],
          description: 'Timestamp format',
          default: 'iso',
        },
        timezone: {
          type: 'string',
          description: 'Timezone (for readable format)',
          default: 'UTC',
        },
      },
    },
    handler: async (args) => {
      const now = new Date();
      const format = args.format || 'iso';
      
      let timestamp: string;
      
      switch (format) {
        case 'unix':
          timestamp = Math.floor(now.getTime() / 1000).toString();
          break;
        case 'readable':
          timestamp = now.toLocaleString('en-US', { 
            timeZone: args.timezone || 'UTC',
            timeZoneName: 'short',
          });
          break;
        case 'iso':
        default:
          timestamp = now.toISOString();
          break;
      }
      
      return {
        content: [
          {
            type: 'text',
            text: timestamp,
          },
        ],
      };
    },
  },
  
  {
    name: 'calculate',
    description: 'Perform mathematical calculations',
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
    handler: async (args) => {
      const expression = args.expression || '';
      
      try {
        // Simple and safe expression evaluation
        const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
        if (!sanitized || sanitized !== expression) {
          throw new Error('Invalid characters in expression');
        }
        
        const result = new Function(`"use strict"; return (${sanitized})`)();
        if (typeof result !== 'number' || !isFinite(result)) {
          throw new Error('Result is not a valid number');
        }
        
        return {
          content: [
            {
              type: 'text',
              text: `${expression} = ${result}`,
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
    },
  },
];

export function getToolByName(name: string): ExampleTool | undefined {
  return exampleTools.find(tool => tool.name === name);
}

export function getAllTools(): ExampleTool[] {
  return exampleTools;
}