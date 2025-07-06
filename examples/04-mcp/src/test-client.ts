#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'node:child_process';

async function main() {
  // MCPサーバープロセスを起動
  const serverProcess = spawn('node', ['dist/server.js'], {
    stdio: ['pipe', 'pipe', 'inherit'],
  });

  // クライアントを作成
  const client = new Client({
    name: 'test-client',
    version: '1.0.0',
  }, {
    capabilities: {},
  });

  // トランスポートを作成して接続
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/server.js'],
  });

  await client.connect(transport);

  try {
    // ツール一覧を取得
    console.log('📋 Available tools:');
    const tools = await client.listTools();
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });

    // システム情報を取得
    console.log('\n💻 System Information:');
    const sysInfo = await client.callTool({
      name: 'system_info',
      arguments: {},
    });
    console.log(sysInfo.content);

    // ファイル統計を取得
    console.log('\n📁 File Statistics (package.json):');
    const fileStats = await client.callTool({
      name: 'file_stats',
      arguments: { path: './package.json' },
    });
    console.log(fileStats.content);

    // ディレクトリツリーを取得
    console.log('\n🌳 Directory Tree (src):');
    const dirTree = await client.callTool({
      name: 'directory_tree',
      arguments: { path: './src', maxDepth: 2 },
    });
    console.log(dirTree.content);

    // リソース一覧を取得
    console.log('\n📚 Available resources:');
    const resources = await client.listResources();
    resources.resources.forEach(resource => {
      console.log(`  - ${resource.name}: ${resource.description}`);
    });

    // プロジェクト情報を読み込み
    console.log('\n📖 Project Information:');
    const projectInfo = await client.readResource({
      uri: 'file://project-info',
    });
    console.log(projectInfo.contents);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    serverProcess.kill();
  }
}

main().catch(console.error);