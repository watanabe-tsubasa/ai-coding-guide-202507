# 00-setup: AIコーディング環境のセットアップとプロジェクト作成

このガイドでは、AIアシスタントと協力してTypeScriptプロジェクトを作成し、テスト駆動開発を体験します。

## 学習目標

- AIコーディングツールの基本的な使い方を理解する
- AIが環境構築で苦手とする部分を理解する
- 明確で具体的な指示の重要性を学ぶ
- テスト駆動開発の基本的な流れを体験する

## 前準備: AIコーディングツール

以下のいずれかを使用してください：
- **Claude Code** (推奨) - Anthropic公式のCLIツール
- **VSCode + Cline** - VSCodeの拡張機能

詳しいセットアップ方法は各ツールの公式ドキュメントを参照してください。

## ステップ1: プロジェクトの初期化

### 1-1. プロジェクトディレクトリの作成

**AIへの指示:**
```
examples/00-setupディレクトリを作成して、そこに移動してください
```

**期待される結果:**
```bash
mkdir -p examples/00-setup
cd examples/00-setup
```

**よくある失敗例:**
- AIが相対パスで移動しようとして失敗する
- 親ディレクトリの確認をせずに作成する

### 1-2. プロジェクトの初期設定

**AIへの指示:**
```
以下の設定を行ってください：
1. npm init -yでpackage.jsonを作成
2. TypeScript、Vitest、@types/nodeを開発依存関係としてインストール
3. package.jsonに"type": "module"を追加
4. tsconfig.jsonを作成（target: ES2022、module: ESNext、moduleResolution: bundler、strict: true）
5. package.jsonのscriptsに"test": "vitest"を追加
```

**期待される結果:**
- package.jsonが正しく設定される（ESModule対応）
- 必要な依存関係がインストールされる
- TypeScriptが正しく設定される
- テストスクリプトが追加される

**よくある失敗例:**
- `"type": "module"`の追加を忘れる → **結果**: import/export文でエラーが発生
- 本番依存関係（--save）としてインストール → **結果**: 不要な依存関係が本番環境に含まれる
- 古い設定（target: ES5、moduleResolution: node）を使う → **結果**: 最新の機能が使えない、ESModuleが正しく動作しない
- testスクリプトの追加を忘れる → **結果**: npm testが実行できない

## ステップ2: 関数の実装

### 2-1. 関数の実装

**AIへの指示:**
```
以下を実行してください：
1. srcディレクトリを作成
2. src/math.tsファイルを作成し、以下の2つの関数を実装：
   - add(a: number, b: number): number - 2つの数値を足す
   - distance(x1: number, y1: number, x2: number, y2: number): number - 2点間のユークリッド距離を計算する
   両方の関数をexportしてください。
```

**期待される結果:**
```typescript
export function add(a: number, b: number): number {
  return a + b;
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
```

**よくある失敗例:**
- exportを忘れる → **結果**: テストファイルからインポートできない
- 関数名や引数名が指示と異なる → **結果**: テストが動作しない
- distanceの計算式を間違える → **結果**: テストが失敗する

## ステップ3: テストの作成

### 3-1. テストファイルの作成と実装

**AIへの指示:**
```
src/math.test.tsファイルを作成し、以下のテストを実装してください：

1. Vitestのdescribe、it、expectをインポート
2. math.tsからadd、distance関数をインポート

3. add関数のテスト：
   - 正の数同士（2 + 3 = 5）
   - 正の数と負の数（5 + (-3) = 2）
   - ゼロを含む（0 + 5 = 5）

4. distance関数のテスト：
   - 原点から(3,4)までの距離は5
   - 同じ点(5,5)から(5,5)の距離は0
   - (1,1)から(4,5)までの距離は5
```

**期待される結果:**
- 正しいインポート文が記述される
- 6つのテストケースが実装される
- ピタゴラスの定理に基づいた正しい結果

**よくある失敗例:**
- `from '@vitest'`などの間違ったインポート → **結果**: モジュールが見つからないエラー
- インポート時に`./math.js`の拡張子を忘れる → **結果**: ESModuleでモジュールが見つからない
- テストケースの数値が指示と異なる → **結果**: 期待した動作の確認ができない
- 浮動小数点の誤差を考慮していない → **結果**: 5.0000000001のような値で失敗

## ステップ4: テストの実行

**AIへの指示:**
```
npm testでテストを実行して、全てのテストがパスすることを確認してください
```

**期待される結果:**
- 全てのテストが緑色でパス
- テストの実行時間が表示される

**よくある失敗例:**
- import/exportのエラー → **原因**: package.jsonに"type": "module"がない
- 型エラー → **原因**: tsconfig.jsonの設定ミス、またはインポート時の拡張子指定漏れ
- テストの期待値が間違っている → **原因**: 計算結果の確認不足

## トラブルシューティング

### よくあるエラーと対処法

1. **"Cannot use import statement outside a module"**
   - 対処: package.jsonに`"type": "module"`を追加

2. **"Module not found"**
   - 対処: ファイルパスの拡張子を確認（.jsや.tsを明示的に指定）

3. **型エラー**
   - 対処: tsconfig.jsonのstrict設定を確認

## 学んだこと

1. **段階的な指示の重要性**
   - 一度に多くのことを頼むと、AIが一部を忘れる可能性がある
   - ステップごとに確認しながら進める

2. **具体的な値の指定**
   - テストケースの具体的な数値を指定することで、正確な実装を促す

3. **エラーからの学習**
   - AIも間違えることがある
   - エラーメッセージを読んで適切な修正指示を出す

## TypeScriptの実行パターン

TypeScriptファイルを実行する方法は、Node.jsの歴史的経緯により多岐にわたります。AIに明確な指示を出すために、主要な実行パターンを理解しましょう。

### なぜ実行パターンが多いのか？

Node.jsの歴史的経緯：
1. **CommonJS時代** (2009-2015): `require/module.exports`
2. **ES Modules導入** (2015-2020): `import/export`の標準化
3. **TypeScript普及** (2012-現在): 型付きJavaScriptの需要
4. **ツールの乱立** (2018-現在): 各ツールが独自の解決策を提供

### 主要な実行パターン

#### パターン1: トランスパイル後に実行（従来型）

**AIへの指示例:**
```
TypeScriptをJavaScriptにコンパイルしてから実行する方法を教えてください。
tscでビルドして、nodeで実行する手順でお願いします。
```

**実行例:**
```bash
# ビルド
npx tsc

# 実行
node dist/index.js
```

**特徴:**
- 最も互換性が高い
- 本番環境向け
- ビルドステップが必要

#### パターン2: ts-node（開発環境向け）

**AIへの指示例:**
```
ts-nodeを使って開発環境でTypeScriptを直接実行する設定をしてください。
ESModuleに対応した設定でお願いします。
```

**実行例:**
```bash
# CommonJS
npx ts-node src/index.ts

# ESModule（要設定）
node --loader ts-node/esm src/index.ts
```

**特徴:**
- 開発時に便利
- 設定が複雑
- ESModule対応が不完全

#### パターン3: tsx（モダンな選択肢）

**AIへの指示例:**
```
tsxを使ってTypeScriptファイルを直接実行できるようにしてください。
ESModuleネイティブで動作する設定でお願いします。
```

**実行例:**
```bash
# インストール
npm install --save-dev tsx

# 実行
npx tsx src/index.ts

# watch モード
npx tsx watch src/index.ts
```

**特徴:**
- 設定不要
- ESModule完全対応
- 高速

#### パターン4: Bun/Deno（代替ランタイム）

**AIへの指示例:**
```
BunでTypeScriptを直接実行する方法を教えてください。
Node.jsとの互換性についても説明してください。
```

**実行例:**
```bash
# Bun
bun run src/index.ts

# Deno
deno run --allow-read src/index.ts
```

**特徴:**
- TypeScriptネイティブサポート
- 高速
- Node.jsとの互換性に注意

### 実行パターンのベストプラクティス

#### 開発環境

**AIへの指示例:**
```
開発環境用の設定をしてください：
- tsxを使用してホットリロード対応
- デバッグしやすい設定
- 高速な実行
```

#### 本番環境

**AIへの指示例:**
```
本番環境用の設定をしてください：
- tscでビルド後、最適化されたJSを実行
- ソースマップは別ファイル
- 型チェックは厳密に
```

### TypeScript実行の学習ポイント

1. **具体的な指示の重要性**
   - 「TypeScriptを実行して」では不十分
   - 使用するツールと設定を明確に指定

2. **プロジェクトに応じた選択**
   - 開発速度重視: tsx
   - 互換性重視: tsc + node
   - 最新機能: Bun/Deno

3. **設定の複雑さ**
   - ESModule対応は特に注意が必要
   - 各ツールの特性を理解して使い分ける

## 次のステップ

01-dijkstraでは、このプロジェクトを基に、より複雑なアルゴリズム（ダイクストラ法）を実装します。AIが既知のアルゴリズムの実装に優れていることを体験できます。