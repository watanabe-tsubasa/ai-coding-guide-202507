import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as os from 'node:os';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

// ツール名の定義
export const TOOL_SYSTEM_INFO = 'system_info';
export const TOOL_FILE_STATS = 'file_stats';
export const TOOL_DIRECTORY_TREE = 'directory_tree';

// ディレクトリツリー生成関数
async function generateDirectoryTree(
  dirPath: string,
  prefix: string,
  depth: number,
  maxDepth: number,
  includeHidden: boolean
): Promise<string> {
  if (depth > maxDepth) {
    return '';
  }

  let result = '';
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  
  // ファイルとディレクトリをソート
  const sortedEntries = entries
    .filter(entry => includeHidden || !entry.name.startsWith('.'))
    .sort((a, b) => {
      // ディレクトリを先に、その後ファイル
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i];
    const isLast = i === sortedEntries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const extension = isLast ? '    ' : '│   ';

    result += `${prefix}${connector}${entry.name}\n`;

    if (entry.isDirectory() && depth < maxDepth) {
      const subPath = path.join(dirPath, entry.name);
      const subTree = await generateDirectoryTree(
        subPath,
        prefix + extension,
        depth + 1,
        maxDepth,
        includeHidden
      );
      result += subTree;
    }
  }

  return result;
}

export function createMCPServer(): Server {
  // MCPサーバーインスタンスの作成
  const server = new Server(
    {
      name: 'file-tools',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // ツール一覧の提供
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: TOOL_SYSTEM_INFO,
          description: 'Get system information including OS, CPU, and memory',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: TOOL_FILE_STATS,
          description: 'Get detailed statistics about a file',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the file',
              },
            },
            required: ['path'],
          },
        },
        {
          name: TOOL_DIRECTORY_TREE,
          description: 'Generate a directory tree structure',
          inputSchema: {
            type: 'object',
            properties: {
              path: {
                type: 'string',
                description: 'Path to the directory',
              },
              maxDepth: {
                type: 'number',
                description: 'Maximum depth to traverse (default: 3)',
                default: 3,
              },
              includeHidden: {
                type: 'boolean',
                description: 'Include hidden files/directories (default: false)',
                default: false,
              },
            },
            required: ['path'],
          },
        },
      ],
    };
  });

  // ツールの実行
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case TOOL_SYSTEM_INFO:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  platform: os.platform(),
                  release: os.release(),
                  type: os.type(),
                  arch: os.arch(),
                  cpus: os.cpus().length,
                  totalMemory: `${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`,
                  freeMemory: `${Math.round(os.freemem() / 1024 / 1024 / 1024)}GB`,
                  uptime: `${Math.round(os.uptime() / 3600)} hours`,
                  hostname: os.hostname(),
                  nodeVersion: process.version,
                },
                null,
                2
              ),
            },
          ],
        };

      case TOOL_FILE_STATS:
        try {
          const filePath = args?.path as string;
        if (!filePath) {
          throw new Error('Path parameter is required');
        }
          const stats = await fs.stat(filePath);
          
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    path: filePath,
                    size: `${stats.size} bytes`,
                    isFile: stats.isFile(),
                    isDirectory: stats.isDirectory(),
                    created: stats.birthtime.toISOString(),
                    modified: stats.mtime.toISOString(),
                    accessed: stats.atime.toISOString(),
                    permissions: stats.mode.toString(8),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          throw new Error(`Failed to get file stats: ${error}`);
        }

      case TOOL_DIRECTORY_TREE:
        try {
          const dirPath = args?.path as string;
          if (!dirPath) {
            throw new Error('Path parameter is required');
          }
          const maxDepth = (args?.maxDepth as number) || 3;
          const includeHidden = (args?.includeHidden as boolean) || false;
          
          const tree = await generateDirectoryTree(dirPath, '', 0, maxDepth, includeHidden);
          
          return {
            content: [
              {
                type: 'text',
                text: tree,
              },
            ],
          };
        } catch (error) {
          throw new Error(`Failed to generate directory tree: ${error}`);
        }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  // リソース一覧の提供
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        {
          uri: 'file://project-info',
          name: 'Project Information',
          description: 'Information about the current MCP server project',
          mimeType: 'application/json',
        },
        {
          uri: 'file://server-config',
          name: 'Server Configuration',
          description: 'Current server configuration and capabilities',
          mimeType: 'application/json',
        },
      ],
    };
  });

  // リソースの読み取り
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    switch (uri) {
      case 'file://project-info':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(
                {
                  name: 'file-tools MCP Server',
                  version: '1.0.0',
                  description: 'MCP server providing file system tools',
                  capabilities: ['system_info', 'file_stats', 'directory_tree'],
                  author: 'AI Coding Guide',
                },
                null,
                2
              ),
            },
          ],
        };

      case 'file://server-config':
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(
                {
                  transport: 'stdio',
                  tools: [TOOL_SYSTEM_INFO, TOOL_FILE_STATS, TOOL_DIRECTORY_TREE],
                  resources: ['project-info', 'server-config'],
                  maxFileSize: '10MB',
                  supportedFormats: ['json', 'text'],
                },
                null,
                2
              ),
            },
          ],
        };

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  });

  return server;
}