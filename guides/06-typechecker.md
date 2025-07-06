# 06. 型チェッカーと Hindley-Milner 型推論の実装

## 概要

TypeScript で簡単な関数型言語の型チェッカーを実装し、Hindley-Milner (HM) 型推論アルゴリズムを学びます。コンパイラ理論の基礎を実践的に理解できます。

## 学習目標

- 抽象構文木 (AST) の設計
- 型システムの基礎概念
- Hindley-Milner 型推論の理解
- 単一化 (Unification) アルゴリズム
- let 多相の実装

## 実装する言語の仕様

### サポートする構文

```
// 変数
x

// ラムダ式
\x -> x

// 関数適用
f x

// let 式
let x = e1 in e2

// リテラル
42        // 整数
true      // 真偽値
```

### 型システム

```
τ ::= α           // 型変数
    | Int         // 整数型
    | Bool        // 真偽値型
    | τ₁ -> τ₂    // 関数型
```

## 実装手順

### 1. プロジェクトセットアップ

```bash
mkdir -p examples/06-typechecker
cd examples/06-typechecker
npm init -y
npm install -D typescript vitest @types/node
```

### 2. AST の定義

```typescript
// src/ast.ts
export type Expr =
  | { kind: 'Var'; name: string }
  | { kind: 'Lambda'; param: string; body: Expr }
  | { kind: 'App'; func: Expr; arg: Expr }
  | { kind: 'Let'; name: string; value: Expr; body: Expr }
  | { kind: 'Lit'; value: number | boolean };
```

### 3. 型の定義

```typescript
// src/types.ts
export type Type =
  | { kind: 'TVar'; name: string }
  | { kind: 'TInt' }
  | { kind: 'TBool' }
  | { kind: 'TArrow'; from: Type; to: Type };

export type TypeScheme = {
  vars: string[];
  type: Type;
};
```

### 4. HM 型推論の実装

主要なコンポーネント：

1. **型環境 (Type Environment)**
   - 変数と型スキームのマッピング

2. **型代入 (Substitution)**
   - 型変数を具体的な型に置き換える

3. **単一化 (Unification)**
   - 2つの型を同一にする代入を見つける

4. **一般化 (Generalization)**
   - 自由変数を型スキームに変換

5. **具体化 (Instantiation)**
   - 型スキームから新しい型を生成

### 5. アルゴリズムの流れ

```
infer(env, expr) = 
  case expr of
    Var(x)      -> instantiate(lookup(env, x))
    Lambda(x,e) -> let α = fresh()
                   let τ = infer(env + {x:α}, e)
                   in α -> τ
    App(e1,e2)  -> let τ1 = infer(env, e1)
                   let τ2 = infer(env, e2)
                   let α = fresh()
                   unify(τ1, τ2 -> α)
                   return α
    Let(x,e1,e2)-> let τ1 = infer(env, e1)
                   let σ = generalize(env, τ1)
                   infer(env + {x:σ}, e2)
```

## AIへの指示のコツ

### 段階的な実装

```
1. "まず AST と型の定義を作成"
2. "次に型環境と代入の実装"
3. "単一化アルゴリズムを実装"
4. "最後に型推論関数を完成"
```

### 具体的な仕様の伝達

```
"Hindley-Milner 型推論を実装してください。
let 多相をサポートし、以下の式が型チェックを通るようにしてください：
let id = \x -> x in id 42
これは Int 型になるべきです。"
```

### テストケースの指定

```
"以下のテストケースを実装してください：
1. 恒等関数: \x -> x は 'a -> 'a
2. K コンビネータ: \x -> \y -> x は 'a -> 'b -> 'a
3. 型エラー: (\x -> x) true 42 はエラー"
```

## トラブルシューティング

### よくある実装の問題

1. **無限ループ**
   - Occurs check を忘れている
   - 再帰的な型の検出が必要

2. **型変数の重複**
   - Fresh な型変数の生成が正しくない
   - カウンターやユニークIDの管理

3. **スコープの問題**
   - let 式での一般化のタイミング
   - 環境の更新が正しくない

4. **代入の合成**
   - 代入の適用順序が重要
   - compose(s1, s2) ≠ compose(s2, s1)

## 発展的な内容

1. **型注釈のサポート**
   ```
   let f : Int -> Int = \x -> x + 1
   ```

2. **代数的データ型**
   ```
   type List a = Nil | Cons a (List a)
   ```

3. **パターンマッチング**
   ```
   case xs of
     Nil -> 0
     Cons x xs' -> 1 + length xs'
   ```

4. **型クラス（型制約）**
   ```
   class Eq a where
     (==) : a -> a -> Bool
   ```

## まとめ

型チェッカーの実装を通じて、プログラミング言語の型システムの仕組みを深く理解できます。Hindley-Milner 型推論は、ML系言語（OCaml、Haskell、F#）の基礎となっている重要なアルゴリズムです。