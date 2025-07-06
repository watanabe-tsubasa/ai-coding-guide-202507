# 04. MCP (Model Context Protocol) サーバーの実装

## 概要

MCP (Model Context Protocol) は、AIアシスタントが外部ツールやリソースにアクセスするためのプロトコルです。この章では、Claude Codeから使用できるMCPサーバーを実装します。

## 学習目標

- MCPプロトコルの理解
- TypeScriptでMCPサーバーを実装
- ツールとリソースの提供方法を学ぶ
- Claude Codeとの統合方法

## 実装するMCPサーバー

簡単なファイル操作とシステム情報を提供するMCPサーバーを実装します。

### 提供する機能

1. **ツール（Tools）**
   - `system_info`: システム情報を取得
   - `file_stats`: ファイルの統計情報を取得
   - `directory_tree`: ディレクトリツリーを生成

2. **リソース（Resources）**
   - システム設定ファイルへのアクセス
   - プロジェクト情報の提供

## 重要な注意点

### AIの学習データの遅れについて

AIアシスタントは最新のMCP SDKの情報を学習していない可能性があります。特に以下の点に注意：

❌ **AIが提案する可能性のある古い実装**:
```typescript
// 古い方法（registerTool）- 現在は存在しません
server.registerTool('echo', async (args) => {
  return { text: args.message };
});
```

✅ **正しい実装方法**:
```typescript
// 現在の方法（setRequestHandler）
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  // ツール処理
});
```

### 推奨される実装アプローチ

MCPサーバーを実装する際は、以下の手順を推奨します：

1. **最初に簡単なエコーサーバーを作成**
2. **MCPクライアントとセットでテスト**
3. **段階的に機能を追加**

## 実装手順

### 1. プロジェクトのセットアップ

```bash
# examples/04-mcp ディレクトリを作成
mkdir -p examples/04-mcp
cd examples/04-mcp

# package.json を作成
npm init -y

# 必要なパッケージをインストール
npm install @modelcontextprotocol/sdk
npm install -D @types/node typescript tsx vitest
```

### AIへの指示例

以下のような具体的な指示を出すことで、正確な実装を得られます：

```
「MCP (Model Context Protocol) サーバーを実装してください。
以下の要件に従ってください：

1. 最初に簡単なエコーサーバーを作成
   - 'echo' ツールのみを持つ
   - 入力されたメッセージをそのまま返す

2. 同時にテスト用のMCPクライアントも作成
   - サーバーに接続してechoツールを呼び出す
   - 結果を表示する

3. 重要: 最新のSDKを使用してください
   - setRequestHandler を使用（registerToolは古い）
   - CallToolRequestSchema を使用
   - 参考: https://github.com/modelcontextprotocol/typescript-sdk

4. TypeScriptで実装し、ESModulesを使用」
```

### 2. TypeScript設定

`tsconfig.json`を作成：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 3. エコーサーバーから始める

最初に簡単なエコーサーバーを実装することを推奨します：

```typescript
// src/echo-server.ts
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === 'echo') {
    const message = args?.message as string;
    return {
      content: [{
        type: 'text',
        text: `Echo: ${message}`
      }]
    };
  }
});
```

### 4. MCPサーバーの実装

エコーサーバーが動作したら、より複雑な機能を持つ`src/server.ts`を作成します。

### 5. ツールの実装

各ツールは以下の構造を持ちます：
- 名前と説明
- 入力パラメータのスキーマ
- 実行ハンドラ

### 6. リソースの実装

リソースは静的なコンテンツへのアクセスを提供します。

### 7. テストの作成

MCPサーバーの動作を検証するテストを作成します。

## Claude Codeでの使用方法

### 1. MCPサーバーの設定

`~/.claude/claude_code_config.json`に以下を追加：

```json
{
  "mcpServers": {
    "file-tools": {
      "command": "node",
      "args": ["/path/to/examples/04-mcp/dist/server.js"],
      "env": {}
    }
  }
}
```

### 2. 使用例

Claude Codeから以下のように使用できます：

```
# システム情報を取得
mcp__file-tools__system_info

# ファイル統計を取得
mcp__file-tools__file_stats --path ./src/server.ts

# ディレクトリツリーを表示
mcp__file-tools__directory_tree --path ./src --max-depth 2
```

## 発展的な内容

1. **認証機能の追加**
   - APIキーによる認証
   - ユーザー権限の管理

2. **キャッシング**
   - 結果のキャッシュ
   - TTLの管理

3. **エラーハンドリング**
   - 適切なエラーメッセージ
   - リトライ機構

4. **ログ機能**
   - 実行ログの記録
   - デバッグ情報の出力

## トラブルシューティング

### よくある実装の問題

1. **古いAPIの使用**
   - `registerTool` → `setRequestHandler` を使用
   - `server.tool()` → 存在しません

2. **型エラー**
   - `arguments` は optional なので `args?.` でアクセス
   - 戻り値は `content` 配列を含むオブジェクト

3. **接続の問題**
   - StdioServerTransport を使用
   - process.stdin/stdout を正しく処理

## まとめ

MCPサーバーを実装することで、Claude Codeの機能を拡張できます。独自のツールやリソースを提供することで、特定のワークフローに最適化されたAIアシスタントを構築できます。