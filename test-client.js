#!/usr/bin/env node

/**
 * MCP Server Test Client
 * 
 * This script tests all the functionality of the MCP server.
 * Run with: node test-client.js
 */

import { spawn } from 'child_process';

class MCPTestClient {
  constructor() {
    this.serverProcess = null;
    this.requestId = 1;
  }

  async start() {
    console.log('🚀 Starting MCP Server test client...\n');

    this.serverProcess = spawn('node', ['dist/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.serverProcess.stderr.on('data', (data) => {
      console.log('📝 Server:', data.toString().trim());
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.runAllTests();
    this.serverProcess.kill();
    console.log('\n✅ All tests completed successfully!');
  }

  async runAllTests() {
    const tests = [
      { name: 'Initialize Server', test: () => this.testInitialize() },
      { name: 'List Tools', test: () => this.testListTools() },
      { name: 'Echo Tool', test: () => this.testEchoTool() },
      { name: 'Calculate Tool', test: () => this.testCalculateTool() },
      { name: 'List Resources', test: () => this.testListResources() },
      { name: 'Read Resource', test: () => this.testReadResource() },
      { name: 'List Prompts', test: () => this.testListPrompts() },
      { name: 'Get Prompt', test: () => this.testGetPrompt() }
    ];

    for (const { name, test } of tests) {
      try {
        console.log(`\n🧪 Test: ${name}`);
        const result = await test();
        console.log(`✅ ${name}: PASSED`);
        if (result.summary) {
          console.log(`   ${result.summary}`);
        }
      } catch (error) {
        console.error(`❌ ${name}: FAILED - ${error.message}`);
        throw error;
      }
    }
  }

  async testInitialize() {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" }
      }
    });
    
    if (!response.result || !response.result.serverInfo) {
      throw new Error('Invalid initialize response');
    }
    
    return { summary: `Server: ${response.result.serverInfo.name} v${response.result.serverInfo.version}` };
  }

  async testListTools() {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "tools/list"
    });
    
    const tools = response.result?.tools || [];
    if (tools.length === 0) {
      throw new Error('No tools found');
    }
    
    return { summary: `Found ${tools.length} tools: ${tools.map(t => t.name).join(', ')}` };
  }

  async testEchoTool() {
    const message = "Hello from MCP test client!";
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "tools/call",
      params: {
        name: "echo",
        arguments: { message }
      }
    });
    
    const result = response.result?.content?.[0]?.text;
    if (!result || !result.includes(message)) {
      throw new Error('Echo tool did not return expected message');
    }
    
    return { summary: `Echo returned: "${result}"` };
  }

  async testCalculateTool() {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "tools/call",
      params: {
        name: "calculate",
        arguments: { operation: "multiply", a: 8, b: 9 }
      }
    });
    
    const result = response.result?.content?.[0]?.text;
    if (!result || !result.includes('72')) {
      throw new Error('Calculate tool did not return expected result');
    }
    
    return { summary: `Calculation result: ${result}` };
  }

  async testListResources() {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "resources/list"
    });
    
    const resources = response.result?.resources || [];
    if (resources.length === 0) {
      throw new Error('No resources found');
    }
    
    return { summary: `Found ${resources.length} resources` };
  }

  async testReadResource() {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "resources/read",
      params: { uri: "file://example.txt" }
    });
    
    const content = response.result?.contents?.[0]?.text;
    if (!content) {
      throw new Error('No content returned from resource');
    }
    
    return { summary: 'Resource content retrieved successfully' };
  }

  async testListPrompts() {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "prompts/list"
    });
    
    const prompts = response.result?.prompts || [];
    if (prompts.length === 0) {
      throw new Error('No prompts found');
    }
    
    return { summary: `Found ${prompts.length} prompts: ${prompts.map(p => p.name).join(', ')}` };
  }

  async testGetPrompt() {
    const response = await this.sendRequest({
      jsonrpc: "2.0",
      id: this.requestId++,
      method: "prompts/get",
      params: {
        name: "summarize",
        arguments: { content: "Test content", length: "short" }
      }
    });
    
    const messages = response.result?.messages;
    if (!messages || messages.length === 0) {
      throw new Error('No prompt messages returned');
    }
    
    return { summary: 'Prompt generated successfully' };
  }

  async sendRequest(request) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 5000);

      const handleResponse = (data) => {
        try {
          const response = JSON.parse(data.toString().trim());
          if (response.id === request.id) {
            clearTimeout(timeout);
            this.serverProcess.stdout.off('data', handleResponse);
            if (response.error) {
              reject(new Error(`Server error: ${response.error.message}`));
            } else {
              resolve(response);
            }
          }
        } catch (error) {
          // Ignore parse errors, might be partial data
        }
      };

      this.serverProcess.stdout.on('data', handleResponse);
      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }
}

// Run the test client
const client = new MCPTestClient();
client.start().catch(console.error);