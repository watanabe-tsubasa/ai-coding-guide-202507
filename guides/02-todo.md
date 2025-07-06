# 02-todo: SQLiteでTodoアプリを作り、Prismaにリファクタリング

このガイドでは、Node.jsの組み込みSQLiteを使ったTodoアプリのCLIを作成し、その後Prismaにリファクタリングする過程を体験します。

## 学習目標

- テスト駆動開発（TDD）の実践
- AIと協力してCRUDアプリケーションを構築する
- データベースアクセスの抽象化を理解する
- 段階的なリファクタリングの手法を学ぶ
- CLIアプリケーションの構造を理解する

## パート1: node:sqliteでTodoアプリを作成

### ステップ1: プロジェクトのセットアップ

**AIへの指示:**
```
examples/02-todoディレクトリを作成し、TypeScriptプロジェクトをセットアップしてください。
- ESModule対応
- tsxで実行できる設定
- Vitestをインストール（テスト用）
- Node.js 22以上が必要（node:sqliteのため）
```

**期待される結果:**
- TypeScript環境の構築
- テスト環境の準備
- package.jsonに適切な設定

**よくある失敗例:**
- Node.jsバージョンの確認忘れ → **結果**: node:sqliteが使えない
- ESModule設定忘れ → **結果**: importエラー

### ステップ2: データベース層の実装とテスト

**AIへの指示:**
```
最初にテストファイルsrc/__tests__/db.test.tsを作成してください。
以下のテストケースを実装：
1. データベースの初期化テスト
2. Todoの作成テスト
3. 全件取得テスト
4. ID検索テスト
5. 更新テスト
6. 削除テスト

その後、src/db.tsを実装してテストをパスさせてください。
```

**期待されるテスト例:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { Database } from '../db.js';

describe('Database', () => {
  let db: Database;

  beforeEach(() => {
    db = new Database(':memory:');
  });

  it('should create a todo', () => {
    const todo = db.create('Test Todo');
    expect(todo.title).toBe('Test Todo');
    expect(todo.completed).toBe(false);
    expect(todo.id).toBeDefined();
  });

  it('should find all todos', () => {
    db.create('Todo 1');
    db.create('Todo 2');
    const todos = db.findAll();
    expect(todos).toHaveLength(2);
  });
  
  // ... 他のテストケース
});
```

**よくある失敗例:**
- テストの独立性を保てない → **結果**: テストが相互に影響
- メモリDBを使わない → **結果**: テスト実行が遅い、ファイルが残る

### ステップ3: データベース層の実装

**AIへの指示:**
```
src/db.tsを作成し、node:sqliteを使ったデータベース層を実装してください。
先ほど作成したテストがすべてパスするように実装してください。

要件：
1. Databaseクラスを作成
2. todosテーブル（id, title, completed, created_at）
3. 初期化メソッド（テーブル作成）
4. CRUD操作のメソッド（同期的に実装）
```

**期待される結果:**
```typescript
import { DatabaseSync } from 'node:sqlite';

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export class Database {
  private db: DatabaseSync;

  constructor(filename: string = ':memory:') {
    this.db = new DatabaseSync(filename);
    this.init();
  }
  // ... CRUD methods
}
```

**よくある失敗例:**
- `node:sqlite`のインポート方法を間違える → **結果**: モジュールが見つからない
- 非同期処理の扱いを間違える → **結果**: DatabaseSyncは同期APIなのにasync/awaitを使う

### ステップ4: テストの実行と確認

**AIへの指示:**
```
npm testでテストを実行し、すべてパスすることを確認してください。
失敗するテストがあれば、実装を修正してください。
```

**期待される結果:**
- すべてのテストが緑色でパス
- カバレッジの確認

### ステップ5: CLIの実装

**AIへの指示:**
```
src/cli.tsを作成し、コマンドライン引数を解析してTodo操作を行うCLIを実装してください。

コマンド例：
- node cli.js add "買い物に行く"
- node cli.js list
- node cli.js done 1
- node cli.js delete 1

parseArgs（Node.js組み込み）を使用してください。
```

**期待される結果:**
- コマンドライン引数の適切な解析
- 各コマンドの実装
- エラーハンドリング

**よくある失敗例:**
- `process.argv`を直接解析しようとする → **結果**: 複雑で保守しづらいコード
- エラーハンドリングを忘れる → **結果**: 不正な入力でクラッシュ

### ステップ6: CLIのテスト

**AIへの指示:**
```
src/__tests__/cli.test.tsを作成し、CLIの統合テストを実装してください。
各コマンドの動作を確認するテストを書いてください。
```

**期待される結果:**
- CLIコマンドの動作確認
- エラーケースのテスト

### ステップ7: 実行可能なCLIにする

**AIへの指示:**
```
以下を実装してください：
1. src/index.tsをエントリーポイントとして作成
2. package.jsonにbinフィールドを追加
3. ビルドスクリプトを追加
4. 実行例を含むREADMEを作成
```

**期待される結果:**
```json
{
  "bin": {
    "todo": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "test": "vitest"
  }
}
```

## パート2: Prismaへのリファクタリング

### ステップ8: Prismaのセットアップ

**AIへの指示:**
```
既存のコードを保持したまま、Prismaを導入してください：
1. Prismaをインストール
2. prisma/schema.prismaを作成（SQLite使用）
3. Todoモデルを定義
4. マイグレーションを実行
```

**期待される結果:**
```prisma
model Todo {
  id        Int      @id @default(autoincrement())
  title     String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

**よくある失敗例:**
- 既存のデータベースとの整合性を考慮しない → **結果**: データ移行が必要
- カラム名の違い（created_at vs createdAt） → **結果**: マッピングエラー

### ステップ9: リポジトリパターンの導入

**AIへの指示:**
```
src/repository.tsを作成し、データアクセスを抽象化してください：

1. TodoRepositoryインターフェースを定義
2. SqliteRepository（既存のDatabaseクラスを使用）
3. PrismaRepository（Prismaクライアントを使用）
4. 両方が同じインターフェースを実装
```

**期待される結果:**
```typescript
export interface TodoRepository {
  create(title: string): Promise<Todo>;
  findAll(): Promise<Todo[]>;
  findById(id: number): Promise<Todo | null>;
  update(id: number, data: Partial<Todo>): Promise<Todo | null>;
  delete(id: number): Promise<boolean>;
}
```

**よくある失敗例:**
- インターフェースの不一致 → **結果**: 実装の切り替えができない
- 型の不整合 → **結果**: TypeScriptエラー

### ステップ10: リポジトリのテスト

**AIへの指示:**
```
src/__tests__/repository.test.tsを作成し、
両方のリポジトリ実装が同じインターフェースに従うことを確認するテストを書いてください。
```

### ステップ11: 実装の切り替え

**AIへの指示:**
```
CLIで実装を切り替えられるようにしてください：
1. 環境変数DB_TYPEで切り替え（sqlite/prisma）
2. ファクトリーパターンでリポジトリを生成
3. CLIコードは変更なしで動作
```

**期待される結果:**
- 環境変数による実装の切り替え
- CLIコードの変更が不要

## パート3: 発展的な機能追加

### ステップ12: 高度な機能の実装

**AIへの指示:**
```
以下の機能を追加してください：
1. タグ機能（多対多リレーション）
2. 検索機能（タイトルとタグで検索）
3. 統計表示（完了率など）
4. エクスポート機能（JSON/CSV）
```

**期待される結果:**
- Prismaスキーマの拡張
- 新しいコマンドの追加
- リポジトリインターフェースの拡張

## 学んだこと

1. **テスト駆動開発の重要性**
   - テストを先に書くことで仕様を明確化
   - リファクタリング時の安心感

2. **段階的な開発**
   - シンプルな実装から始める
   - 動作する状態を保ちながらリファクタリング

3. **抽象化の重要性**
   - リポジトリパターンによる実装の切り替え
   - インターフェースによる契約の定義

4. **AIへの指示のコツ**
   - テストファーストで仕様を明確に
   - 既存コードの保持を明示的に指示
   - インターフェースを先に定義させる

5. **実践的な選択**
   - node:sqlite: シンプル、依存関係なし
   - Prisma: 型安全、高機能、学習コスト

## トラブルシューティング

1. **Node.jsバージョンエラー**
   ```
   対処: Node.js 22以上にアップグレード、またはbetter-sqlite3を使用
   ```

2. **Prismaの型エラー**
   ```
   対処: prisma generateを実行して型定義を更新
   ```

3. **パスの問題**
   ```
   対処: __dirnameの代わりにimport.meta.urlを使用
   ```

## 次のステップ

- Web APIとして公開（Express/Fastify）
- フロントエンドの追加（React/Vue）
- 認証機能の実装