# 08-lean: Leanによる形式検証

このガイドでは、Lean 4を使用した形式検証の基礎を学びます。形式検証は、プログラムや数学的定理の正しさを論理的に証明する技術です。

## 学習目標

- Lean 4の基本的な構文と証明の書き方を理解する
- 基本的な論理演算の証明を書く
- 自然数やリストの性質を証明する
- 帰納法を使った証明を理解する

## プロジェクト構成

```
examples/08-lean/
├── lakefile.lean    # Leanプロジェクト設定
├── lean-toolchain   # Leanバージョン指定
├── Main.lean        # サンプルコード
└── README.md
```

## 実装された証明の例

### 1. 基本的な定理

- `simple_proof`: 1 + 1 = 2 の証明（反射律の使用）

### 2. 論理演算

- `and_intro`: 論理積の導入（p ∧ q の構成）
- `modus_ponens`: 前件肯定（p → q と p から q を導出）

### 3. 自然数の性質

- `zero_add`: 0 + n = n
- `add_comm`: a + b = b + a（加法の可換性）
- `add_zero`: n + 0 = n

### 4. リストの証明

- `length_append`: リスト結合の長さの性質（帰納法による証明）

### 5. 偶数・奇数の証明

- `even_or_odd`: すべての自然数は偶数か奇数（帰納法による証明）

## 重要な概念

### 定理の基本構造

```lean
theorem theorem_name (仮定) : 結論 := by
  証明のステップ
```

### よく使うタクティク

- `rfl`: 反射律（定義により等しい）
- `constructor`: 論理積や存在量化子の導入
- `exact`: 正確な項の指定
- `apply`: 定理の適用
- `simp`: 簡約
- `rw`: 書き換え
- `induction`: 帰納法

### 帰納法による証明

```lean
induction n with
| zero => 
  -- n = 0 の場合の証明
| succ n ih =>
  -- n = k+1 の場合の証明（ihは帰納法の仮定）
```

## 演習課題

1. **論理演算の追加証明**
   - 論理和の除去規則
   - 含意の推移律

2. **自然数の性質**
   - 乗法の可換性
   - 分配法則

3. **リストの操作**
   - リストの反転の性質
   - map関数の性質

## 実行方法

```bash
cd examples/08-lean
lake build
lake exe formal-verification
```

## 学習のポイント

1. **証明の構造を理解する**
   - 仮定から結論を導く流れ
   - タクティクの選び方

2. **帰納法の使い方**
   - 基底ケースと帰納ステップ
   - 帰納法の仮定の活用

3. **VS Codeでのインタラクティブな開発**
   - 証明の各ステップでの状態確認
   - エラーメッセージの読み方

## 参考資料

- [Lean 4 公式ドキュメント](https://leanprover.github.io/lean4/doc/)
- [Theorem Proving in Lean 4](https://leanprover.github.io/theorem_proving_in_lean4/)