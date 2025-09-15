/**
 * Example Tools Implementation
 */

import { Tool } from '../types/index.js';

export const exampleTools: Tool[] = [
  {
    name: "file_list",
    description: "List files in a directory",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Directory path to list"
        }
      },
      required: ["path"]
    }
  },
  {
    name: "weather",
    description: "Get weather information for a location",
    inputSchema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "Location to get weather for"
        },
        units: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description: "Temperature units"
        }
      },
      required: ["location"]
    }
  },
  {
    name: "base64_encode",
    description: "Encode text to base64",
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "Text to encode"
        }
      },
      required: ["text"]
    }
  },
  {
    name: "base64_decode",
    description: "Decode base64 text",
    inputSchema: {
      type: "object",
      properties: {
        encoded: {
          type: "string",
          description: "Base64 encoded text to decode"
        }
      },
      required: ["encoded"]
    }
  }
];

export class ToolExecutor {
  static async execute(toolName: string, args: Record<string, unknown>): Promise<string> {
    switch (toolName) {
      case 'file_list':
        return this.executeFileList(args);
      case 'weather':
        return this.executeWeather(args);
      case 'base64_encode':
        return this.executeBase64Encode(args);
      case 'base64_decode':
        return this.executeBase64Decode(args);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  private static async executeFileList(args: Record<string, unknown>): Promise<string> {
    const path = args.path as string;
    try {
      const fs = await import('fs/promises');
      const files = await fs.readdir(path);
      return `Files in ${path}:\n${files.map(f => `- ${f}`).join('\n')}`;
    } catch (error) {
      return `Error listing files: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private static async executeWeather(args: Record<string, unknown>): Promise<string> {
    const location = args.location as string;
    const units = (args.units as string) || 'celsius';
    
    // Mock weather data
    const temp = units === 'celsius' ? '22°C' : '72°F';
    return `Weather in ${location}: Sunny, ${temp}, Light breeze`;
  }

  private static async executeBase64Encode(args: Record<string, unknown>): Promise<string> {
    const text = args.text as string;
    const encoded = Buffer.from(text, 'utf8').toString('base64');
    return `Base64 encoded: ${encoded}`;
  }

  private static async executeBase64Decode(args: Record<string, unknown>): Promise<string> {
    const encoded = args.encoded as string;
    try {
      const decoded = Buffer.from(encoded, 'base64').toString('utf8');
      return `Decoded text: ${decoded}`;
    } catch (error) {
      return `Error decoding base64: Invalid input`;
    }
  }
}