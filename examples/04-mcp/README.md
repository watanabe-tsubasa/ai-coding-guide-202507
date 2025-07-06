# MCP File Tools Server

このプロジェクトは、Model Context Protocol (MCP) を使用したファイル操作ツールを提供するサーバーの実装例です。

## 機能

### ツール

1. **system_info** - システム情報を取得
   - OS、CPU、メモリ、Node.jsバージョンなど

2. **file_stats** - ファイルの統計情報を取得
   - サイズ、作成日時、更新日時、権限など

3. **directory_tree** - ディレクトリツリーを生成
   - 指定された深さまでのディレクトリ構造を表示

### リソース

1. **project-info** - プロジェクト情報
2. **server-config** - サーバー設定情報

## セットアップ

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# テスト
npm test
```

## Claude Codeでの使用方法

### 1. MCPサーバーの設定

`~/.claude/claude_code_config.json` に以下を追加：

```json
{
  "mcpServers": {
    "file-tools": {
      "command": "node",
      "args": ["/absolute/path/to/examples/04-mcp/dist/server.js"],
      "env": {}
    }
  }
}
```

### 2. Claude Codeの再起動

設定を追加した後、Claude Codeを再起動してください。

### 3. ツールの使用

Claude Code内で以下のようにツールを使用できます：

```
# システム情報を取得
mcp__file-tools__system_info を実行してください

# ファイル統計を取得
mcp__file-tools__file_stats で package.json の情報を見せて

# ディレクトリツリーを表示
mcp__file-tools__directory_tree で src ディレクトリの構造を表示
```

## 開発

### エコーサーバーで基本動作を確認

最初に簡単なエコーサーバーで動作確認することを推奨します：

```bash
# エコーサーバーをビルド
npm run build

# エコークライアントでテスト
npm run test:echo
```

### ローカルでのテスト

```bash
# 開発モードで実行
npm run dev

# テストクライアントで動作確認
npx tsx src/test-client.ts
```

### ディレクトリ構造

```
04-mcp/
├── src/
│   ├── server.ts         # MCPサーバーのエントリーポイント
│   ├── mcp-server.ts     # MCPサーバーの実装
│   ├── echo-server.ts    # シンプルなエコーサーバー
│   ├── echo-client.ts    # エコーサーバー用クライアント
│   ├── server.test.ts    # テスト
│   └── test-client.ts    # テスト用クライアント
├── dist/                 # ビルド済みファイル
├── package.json
├── tsconfig.json
└── README.md
```

## トラブルシューティング

### エラー: "MCP server not found"

Claude Codeの設定ファイルのパスが正しいことを確認してください。絶対パスを使用する必要があります。

### エラー: "Permission denied"

`dist/server.js` に実行権限があることを確認してください：

```bash
chmod +x dist/server.js
```

## ライセンス

ISC