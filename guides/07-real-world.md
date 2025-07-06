# 07. 実践的なプロジェクト開発

## 概要

実際の開発で使用される設定を含む、本格的なプロジェクトを構築します。CLAUDE.md による詳細なプロンプト、oxlint による厳格なコード品質管理、GitHub Actions による CI/CD を含みます。

## 学習目標

- CLAUDE.md を使用した効果的なプロンプトエンジニアリング
- oxlint による TypeScript/JavaScript のリンティング
- GitHub Actions を使用した自動テストとビルド
- Prisma を使用した本格的なデータベースアプリケーション
- neverthrow による関数型エラーハンドリング
- 実践的なプロジェクト構成とベストプラクティス

## プロジェクトの特徴

### 1. CLAUDE.md による詳細なコンテキスト提供

プロジェクトルートに配置する CLAUDE.md は、AI アシスタントに対して以下を明確に伝えます：

- プロジェクトの目的と背景
- 技術スタックと設計方針
- コーディング規約
- ディレクトリ構造
- エラーハンドリング方針
- テスト戦略

### 2. oxlint による厳格なコード品質管理

oxlint は Rust 製の高速な JavaScript/TypeScript リンターです：

- ESLint より高速な実行
- ゼロ設定で使用可能
- 厳格なルールセット
- TypeScript サポート

### 3. GitHub Actions による自動化

以下のワークフローを実装します：

- コードリンティング（oxlint）
- ユニットテスト（Vitest）
- ビルド検証
- Prisma スキーマ検証

## 実装する機能

### Todo アプリケーション API

02-todo をベースに、以下の機能を持つ本格的な API を実装：

1. **RESTful API エンドポイント**
   - GET /todos - 一覧取得
   - GET /todos/:id - 個別取得
   - POST /todos - 新規作成
   - PATCH /todos/:id - 部分更新
   - DELETE /todos/:id - 削除

2. **高度な機能**
   - ページネーション
   - フィルタリング（完了/未完了）
   - ソート（作成日時、更新日時）
   - バリデーション
   - エラーハンドリング

3. **データベース設計**
   - Prisma を使用したスキーマ定義
   - マイグレーション管理
   - シードデータ

### Next.js ダッシュボード

シンプルで使いやすい Todo 管理インターフェース：

1. **機能**
   - Todo の一覧表示
   - 新規 Todo の作成フォーム
   - Todo の完了/未完了の切り替え
   - Todo の削除
   - リアルタイムでのデータ更新

2. **技術的特徴**
   - React Hooks によるステート管理
   - Tailwind CSS によるスタイリング
   - fetch API による非同期通信
   - TypeScript による型安全性
   - Playwright による E2E テスト

## AI への指示のコツ

### CLAUDE.md の活用

```markdown
# プロジェクト概要
このプロジェクトは Todo 管理 API です。

## 技術スタック
- TypeScript 5.x
- Prisma 5.x
- Vitest
- Express.js

## コーディング規約
- 関数は単一責任の原則に従う
- エラーは適切に型付けされたカスタムエラークラスを使用
- すべての公開 API にはドキュメントコメントを付ける

## テスト方針
- すべてのエンドポイントに対してテストを書く
- エッジケースを考慮する
- モックは最小限に留める
```

### 段階的な実装指示

```
1. "Prisma スキーマを定義してください。Todo モデルには id, title, description, completed, createdAt, updatedAt を含めてください"
2. "Express.js で RESTful API を実装してください。エラーハンドリングミドルウェアを含めてください"
3. "各エンドポイントのテストを Vitest で書いてください"
4. "oxlint の設定を追加して、コード品質を保証してください"
```

## トラブルシューティング

### oxlint のインストール

```bash
npm install -D oxlint
```

### Prisma の初期設定

```bash
npx prisma init
npx prisma migrate dev --name init
```

### GitHub Actions の権限

ワークフローがプロジェクトルートの `.github/workflows/` に配置されることを確認してください。

## 発展的な内容

1. **認証・認可**
   - JWT トークンベースの認証
   - ロールベースのアクセス制御

2. **API ドキュメント**
   - OpenAPI/Swagger の自動生成
   - API バージョニング

3. **パフォーマンス最適化**
   - データベースインデックス
   - クエリ最適化
   - キャッシング戦略

4. **監視とロギング**
   - 構造化ログ
   - APM（Application Performance Monitoring）
   - エラートラッキング

## まとめ

このプロジェクトを通じて、実際の開発で必要とされる様々な要素を学習できます。CLAUDE.md による詳細なコンテキスト提供により、AI アシスタントとより効果的に協働できるようになります。