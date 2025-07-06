# 07-real-world: 実践的な Todo API + Dashboard

本格的な RESTful API とNext.js ダッシュボードの実装例です。CLAUDE.md による詳細なプロンプト、oxlint によるコード品質管理、GitHub Actions による CI/CD を含みます。

## セットアップ

### バックエンド（API）

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env

# データベースのセットアップ
npm run db:generate
npm run db:migrate

# 開発サーバーの起動（ポート3000）
npm run dev
```

### フロントエンド（Dashboard）

別のターミナルで：

```bash
# ダッシュボードディレクトリに移動
cd dashboard

# 依存関係のインストール
npm install

# 開発サーバーの起動（ポート3001）
npm run dev
```

ダッシュボードは http://localhost:3001 でアクセスできます。

### E2E テスト

```bash
# Playwright のインストール（初回のみ）
cd dashboard
npx playwright install

# E2E テストの実行
npm run test:e2e

# UI モードでテストを実行
npm run test:e2e:ui
```

## スクリプト

- `npm run dev` - 開発サーバー起動（ホットリロード）
- `npm run build` - TypeScript のビルド
- `npm run start` - 本番サーバー起動
- `npm test` - テスト実行
- `npm run lint` - oxlint による静的解析
- `npm run db:migrate` - データベースマイグレーション
- `npm run db:seed` - シードデータ投入

## API エンドポイント

```
GET    /api/todos          # Todo 一覧取得
GET    /api/todos/:id      # Todo 個別取得
POST   /api/todos          # Todo 作成
PATCH  /api/todos/:id      # Todo 更新
DELETE /api/todos/:id      # Todo 削除
```

## プロジェクトの特徴

### CLAUDE.md

プロジェクトルートの CLAUDE.md ファイルは、AI アシスタントに対して詳細なコンテキストを提供します：

- プロジェクト構造
- コーディング規約
- API 仕様
- エラーハンドリング方針（neverthrow を使用）
- テスト戦略

### oxlint

高速な JavaScript/TypeScript リンターで、コード品質を保証します：

- ゼロ設定で使用可能
- ESLint より高速
- 厳格なルールセット

### GitHub Actions

`.github/workflows/07-test.yaml` で自動テストを実行：

- コードリンティング
- TypeScript ビルド
- ユニットテスト
- カバレッジレポート

### Next.js Dashboard

シンプルな Todo 管理ダッシュボード：

- Todo の一覧表示
- 新規 Todo の追加
- Todo の完了/未完了の切り替え
- Todo の削除
- リアルタイムでの更新
- Playwright による E2E テスト

## 技術スタック

### バックエンド
- TypeScript 5.x
- Express.js 5.x
- Prisma 5.x
- neverthrow（関数型エラーハンドリング）
- Vitest
- oxlint
- SQLite（開発）/ PostgreSQL（本番想定）

### フロントエンド
- Next.js 14.x (App Router)
- TypeScript
- Tailwind CSS
- React Hooks