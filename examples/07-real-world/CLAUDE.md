# Todo API プロジェクト

このファイルは AI アシスタント（Claude Code / Cline）への詳細な指示とコンテキストを提供します。

## プロジェクト概要

本プロジェクトは、実践的な Todo 管理 RESTful API です。高品質なコードベースを維持し、本番環境での運用を想定した設計となっています。

## 技術スタック

- **言語**: TypeScript 5.x (ESModules)
- **ランタイム**: Node.js 20.x
- **フレームワーク**: Express.js 5.x
- **ORM**: Prisma 5.x
- **データベース**: SQLite (開発環境) / PostgreSQL (本番環境想定)
- **テスト**: Vitest
- **リンター**: oxlint
- **CI/CD**: GitHub Actions

## プロジェクト構造

```
src/
├── server.ts          # エントリーポイント
├── app.ts             # Express アプリケーションの設定
├── routes/            # ルート定義
│   └── todos.ts       # Todo エンドポイント
├── controllers/       # コントローラー層
│   └── todos.ts       # Todo ビジネスロジック
├── services/          # サービス層
│   └── todos.ts       # データアクセスロジック
├── middleware/        # ミドルウェア
│   ├── error.ts       # エラーハンドリング
│   └── validation.ts  # リクエストバリデーション
├── types/             # 型定義
│   ├── todo.ts        # Todo 関連の型
│   └── error.ts       # エラー型定義
├── utils/             # ユーティリティ関数
│   └── errors.ts      # カスタムエラークラス
└── __tests__/         # テストファイル
    └── todos.test.ts  # Todo エンドポイントのテスト
```

## コーディング規約

### 1. 関数とクラス

- 単一責任の原則を厳守
- 関数は 20 行以内を目安とする
- 早期リターンを活用してネストを減らす
- 純粋関数を優先する

### 2. エラーハンドリング

neverthrow を使用した関数型エラーハンドリング：

```typescript
import { Result, ok, err } from 'neverthrow';

// エラー型の定義
type AppError = 
  | { type: 'NOT_FOUND'; resource: string }
  | { type: 'VALIDATION_ERROR'; message: string }
  | { type: 'DATABASE_ERROR'; error: unknown }
  | { type: 'UNKNOWN_ERROR'; error: unknown };

// サービス層での使用例
async findById(id: string): Result<Todo, AppError> {
  try {
    const todo = await prisma.todo.findUnique({ where: { id } });
    if (!todo) {
      return err({ type: 'NOT_FOUND', resource: 'Todo' });
    }
    return ok(todo);
  } catch (error) {
    return err({ type: 'DATABASE_ERROR', error });
  }
}

// ルート層での処理
result.match(
  (todo) => res.json({ data: todo }),
  (error) => handleAppError(error, res)
);
```

**重要**: throw を使わず、常に Result 型を返すこと

### 3. 型定義

- 明示的な型定義を使用
- `any` 型は禁止
- `unknown` 型を適切に使用
- Prisma の型を活用

### 4. 非同期処理

- async/await を使用
- Promise チェーンは避ける
- エラーは try-catch で捕捉

### 5. コメント

- JSDoc 形式でパブリック API を文書化
- 複雑なロジックには説明コメントを追加
- TODO コメントには担当者と期限を記載

## API 仕様

### エンドポイント

```
GET    /api/todos          # 一覧取得
GET    /api/todos/:id      # 個別取得
POST   /api/todos          # 新規作成
PATCH  /api/todos/:id      # 部分更新
DELETE /api/todos/:id      # 削除
```

### リクエスト/レスポンス形式

```typescript
// 一覧取得レスポンス
{
  "data": Todo[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}

// エラーレスポンス
{
  "error": {
    "code": string,
    "message": string,
    "details": any
  }
}
```

### クエリパラメータ

- `page`: ページ番号（デフォルト: 1）
- `limit`: 1ページあたりの件数（デフォルト: 10、最大: 100）
- `status`: フィルタリング（completed | pending）
- `sort`: ソート（createdAt | -createdAt | updatedAt | -updatedAt）

## データベース設計

### Prisma スキーマ

```prisma
model Todo {
  id          String   @id @default(cuid())
  title       String
  description String?
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([completed])
  @@index([createdAt])
}
```

## テスト戦略

### 1. ユニットテスト

- すべてのサービス関数をテスト
- モックは最小限に留める
- エッジケースを網羅

### 2. 統合テスト

- 各エンドポイントの正常系と異常系
- データベース接続を含む実際の動作確認
- ステータスコードとレスポンス形式の検証

### 3. テストデータ

- ファクトリー関数を使用してテストデータを生成
- シードデータは `src/seed.ts` で管理

## パフォーマンス考慮事項

1. **データベースクエリ最適化**
   - N+1 問題を回避
   - 適切なインデックスを設定
   - 必要なフィールドのみ取得

2. **レスポンスキャッシング**
   - 将来的に Redis の導入を検討
   - ETag を使用した条件付きリクエスト

3. **ペイロードサイズ**
   - 大きなリストは必ずページネーション
   - 不要なフィールドは返さない

## セキュリティ考慮事項

1. **入力検証**
   - すべての入力をバリデーション
   - SQL インジェクション対策（Prisma が自動的に処理）
   - XSS 対策

2. **認証・認可**
   - 現時点では未実装
   - 将来的に JWT ベースの認証を追加予定

3. **レート制限**
   - 現時点では未実装
   - 将来的に express-rate-limit を導入予定

## 開発時の注意事項

1. **環境変数**
   - `.env` ファイルで管理
   - `DATABASE_URL` は必須
   - 本番環境の値は絶対にコミットしない

2. **マイグレーション**
   - スキーマ変更時は必ず `npm run db:migrate` を実行
   - マイグレーションファイルはコミットする

3. **コード品質**
   - コミット前に `npm run lint` を実行
   - テストが通ることを確認

## AI アシスタントへの追加指示

1. **コード生成時**
   - 上記の規約に厳密に従ってください
   - 型安全性を最優先に考慮してください
   - エラーハンドリングを忘れないでください

2. **問題解決時**
   - エラーメッセージを正確に読み取ってください
   - スタックトレースから原因を特定してください
   - 修正は最小限の変更に留めてください

3. **機能追加時**
   - 既存のパターンに従ってください
   - テストを同時に実装してください
   - ドキュメントを更新してください

## よくある質問と回答

**Q: なぜ Express 5.x を使用しているのですか？**
A: 最新の機能とパフォーマンス改善のためです。ただし、一部のミドルウェアとの互換性に注意が必要です。

**Q: なぜ oxlint を使用しているのですか？**
A: 高速で設定不要、かつ厳格なルールセットを提供するためです。

**Q: データベースはなぜ SQLite なのですか？**
A: 開発環境での簡便性のためです。本番環境では PostgreSQL を想定しています。