# Todo CLI Application

Node.jsのnode:sqliteを使用したシンプルなTodo管理CLIアプリケーションです。

## 必要要件

- Node.js 22.0.0以上（node:sqliteサポートのため）

## インストール

```bash
npm install
npm run build
npm link  # グローバルにtodoコマンドをインストール
```

## 使い方

### 開発モード

```bash
# Todoを追加
npm run dev -- add "買い物に行く"

# Todo一覧を表示
npm run dev -- list

# Todoを完了にする
npm run dev -- done 1

# Todoを未完了に戻す
npm run dev -- undone 1

# Todoを削除
npm run dev -- delete 1
```

### ビルド後の実行

```bash
# ビルド
npm run build

# 実行
node dist/index.js add "新しいタスク"
```

### グローバルインストール後

```bash
todo add "買い物に行く"
todo list
todo done 1
todo delete 1
```

## データベース

デフォルトでは`./todos.db`にSQLiteデータベースが作成されます。

## 開発

```bash
# テストの実行
npm test

# TypeScriptのビルド
npm run build
```