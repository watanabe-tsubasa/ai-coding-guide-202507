import { describe, it, expect } from 'vitest';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { createMCPServer } from './mcp-server.js';

// サーバーのセットアップ関数
async function setupTestEnvironment() {
  // サーバーの作成
  const server = createMCPServer();

  // クライアントの作成
  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  // トランスポートの作成と接続
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  
  await server.connect(serverTransport);
  await client.connect(clientTransport);

  return { server, client };
}

describe('MCP File Tools Server', () => {
  describe('Tool Listing', () => {
    it('should list available tools', async () => {
      const { client } = await setupTestEnvironment();
      
      const response = await client.listTools();
      
      expect(response.tools).toHaveLength(3);
      expect(response.tools.map(t => t.name)).toContain('system_info');
      expect(response.tools.map(t => t.name)).toContain('file_stats');
      expect(response.tools.map(t => t.name)).toContain('directory_tree');
    });
  });

  describe('System Info Tool', () => {
    it('should return system information', async () => {
      const { client } = await setupTestEnvironment();
      
      const result = await client.callTool({
        name: 'system_info',
        arguments: {},
      });
      
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content).toHaveLength(1);
      expect(content[0].type).toBe('text');
      
      const data = JSON.parse(content[0].text);
      expect(data).toHaveProperty('platform');
      expect(data).toHaveProperty('cpus');
      expect(data).toHaveProperty('totalMemory');
      expect(data).toHaveProperty('nodeVersion');
    });
  });

  describe('File Stats Tool', () => {
    it('should return file statistics', async () => {
      const { client } = await setupTestEnvironment();
      
      // テスト用にpackage.jsonの統計を取得
      const result = await client.callTool({
        name: 'file_stats',
        arguments: {
          path: './package.json',
        },
      });
      
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content).toHaveLength(1);
      expect(content[0].type).toBe('text');
      
      const data = JSON.parse(content[0].text);
      expect(data).toHaveProperty('path', './package.json');
      expect(data).toHaveProperty('size');
      expect(data).toHaveProperty('isFile', true);
      expect(data).toHaveProperty('isDirectory', false);
    });

    it('should handle non-existent files', async () => {
      const { client } = await setupTestEnvironment();
      
      await expect(
        client.callTool({
          name: 'file_stats',
          arguments: {
            path: './non-existent-file.txt',
          },
        })
      ).rejects.toThrow();
    });
  });

  describe('Directory Tree Tool', () => {
    it('should generate directory tree', async () => {
      const { client } = await setupTestEnvironment();
      
      const result = await client.callTool({
        name: 'directory_tree',
        arguments: {
          path: './src',
          maxDepth: 2,
        },
      });
      
      const content = result.content as Array<{ type: string; text: string }>;
      expect(content).toHaveLength(1);
      expect(content[0].type).toBe('text');
      expect(content[0].text).toContain('├──');
    });
  });

  describe('Resource Listing', () => {
    it('should list available resources', async () => {
      const { client } = await setupTestEnvironment();
      
      const response = await client.listResources();
      
      expect(response.resources).toHaveLength(2);
      expect(response.resources.map(r => r.uri)).toContain('file://project-info');
      expect(response.resources.map(r => r.uri)).toContain('file://server-config');
    });
  });

  describe('Resource Reading', () => {
    it('should read project info resource', async () => {
      const { client } = await setupTestEnvironment();
      
      const result = await client.readResource({
        uri: 'file://project-info',
      });
      
      const contents = result.contents as Array<{ uri: string; mimeType: string; text: string }>;
      expect(contents).toHaveLength(1);
      expect(contents[0].mimeType).toBe('application/json');
      
      const data = JSON.parse(contents[0].text);
      expect(data).toHaveProperty('name', 'file-tools MCP Server');
      expect(data).toHaveProperty('version', '1.0.0');
    });

    it('should read server config resource', async () => {
      const { client } = await setupTestEnvironment();
      
      const result = await client.readResource({
        uri: 'file://server-config',
      });
      
      const contents = result.contents as Array<{ uri: string; mimeType: string; text: string }>;
      expect(contents).toHaveLength(1);
      expect(contents[0].mimeType).toBe('application/json');
      
      const data = JSON.parse(contents[0].text);
      expect(data).toHaveProperty('transport', 'stdio');
      expect(data).toHaveProperty('tools');
      expect(data.tools).toHaveLength(3);
    });

    it('should handle unknown resources', async () => {
      const { client } = await setupTestEnvironment();
      
      await expect(
        client.readResource({
          uri: 'file://unknown-resource',
        })
      ).rejects.toThrow();
    });
  });
});