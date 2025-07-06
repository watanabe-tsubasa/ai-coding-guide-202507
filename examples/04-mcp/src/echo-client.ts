#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// シンプルなエコークライアントの実装例
async function main() {
  // クライアントインスタンスの作成
  const client = new Client(
    {
      name: 'echo-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  // トランスポートの作成
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/echo-server.js'],
  });

  try {
    // サーバーに接続
    await client.connect(transport);
    console.log('Connected to echo server');

    // ツール一覧を取得
    const tools = await client.listTools();
    console.log('\nAvailable tools:');
    tools.tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });

    // エコーツールを呼び出し
    console.log('\nCalling echo tool...');
    const messages = [
      'Hello, MCP!',
      'This is a test message',
      '日本語のテスト',
      '🚀 Emoji test!',
    ];

    for (const message of messages) {
      const result = await client.callTool({
        name: 'echo',
        arguments: { message },
      });

      const content = result.content as Array<{ type: string; text: string }>;
      console.log(`Sent: "${message}"`);
      console.log(`Received: "${content[0].text}"`);
      console.log('---');
    }

    // エラーケースのテスト
    console.log('\nTesting error case (no message)...');
    try {
      await client.callTool({
        name: 'echo',
        arguments: {},
      });
    } catch (error) {
      console.log('Expected error:', (error as Error).message);
    }

  } catch (error) {
    console.error('Client error:', error);
  } finally {
    // 接続を閉じる
    await client.close();
    console.log('\nDisconnected from server');
  }
}

// クライアント実行
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});