#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from './mcp-server.js';

// サーバーの起動
async function main() {
  const server = createMCPServer();
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  console.error('MCP Server "file-tools" is running...');

  // エラーハンドリング
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
}

// メイン関数の実行
main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});