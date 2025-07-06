#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// シンプルなエコーサーバーの実装例
async function main() {
  // サーバーインスタンスの作成
  const server = new Server(
    {
      name: 'echo-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // ツール一覧の提供
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'echo',
          description: 'Echo back the provided message',
          inputSchema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                description: 'The message to echo back',
              },
            },
            required: ['message'],
          },
        },
      ],
    };
  });

  // ツールの実行
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    if (name === 'echo') {
      const message = args?.message as string;
      if (!message) {
        throw new Error('Message is required');
      }

      return {
        content: [
          {
            type: 'text',
            text: `Echo: ${message}`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  });

  // トランスポートの作成と接続
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Echo MCP Server is running...');
}

// エラーハンドリング
process.on('SIGINT', () => {
  process.exit(0);
});

// サーバー起動
main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});