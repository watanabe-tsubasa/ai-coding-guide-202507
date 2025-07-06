# 06. Hindley-Milner 型推論の実装

TypeScript で実装された簡単な関数型言語の型チェッカーです。Hindley-Milner 型推論アルゴリズムを使用しています。

## 機能

- 変数、ラムダ式、関数適用、let式、リテラル（整数・真偽値）のサポート
- let多相による多相型のサポート
- 型エラーの検出

## セットアップ

```bash
npm install
```

## テスト実行

```bash
npm test
```

## 使用例

```typescript
import { lambda, var_, app, let_, lit } from './src/ast.js';
import { infer } from './src/infer.js';
import { prettyPrintType } from './src/types.js';

// 恒等関数: λx. x
const id = lambda('x', var_('x'));
console.log(prettyPrintType(infer(id))); // t0 -> t0

// let多相: let id = λx. x in id 42
const expr = let_('id', lambda('x', var_('x')), app(var_('id'), lit(42)));
console.log(prettyPrintType(infer(expr))); // Int
```

## 実装の構成

- `ast.ts`: 抽象構文木の定義
- `types.ts`: 型の定義と操作
- `environment.ts`: 型環境の管理
- `unification.ts`: 単一化アルゴリズム
- `infer.ts`: 型推論の実装
- `index.test.ts`: テストケース