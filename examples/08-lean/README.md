# Lean 4 形式検証サンプル

このプロジェクトは、Lean 4を使用した形式検証の基本的なサンプルです。

## 必要な環境

- Lean 4 (v4.12.0)
- VS Code with Lean 4 extension（推奨）

## インストール

```bash
# elanをインストール（Leanのバージョン管理ツール）
curl https://raw.githubusercontent.com/leanprover/elan/master/elan-init.sh -sSf | sh
source ~/.profile

# VS Codeの拡張機能
# VS Codeの拡張機能マーケットプレイスから「lean4」を検索してインストール
```

## プロジェクト構造

```
08-lean/
├── lakefile.lean    # Leanプロジェクト設定
├── lean-toolchain   # Leanバージョン指定
├── Main.lean        # サンプルコード
└── README.md
```

## 含まれている証明の例

1. **基本的な定理**
   - `simple_proof`: 1 + 1 = 2 の証明

2. **論理演算**
   - `and_intro`: 論理積の導入（p ∧ q）
   - `modus_ponens`: 前件肯定（p → q, p ⊢ q）

3. **自然数の性質**
   - `zero_add`: 0 + n = n
   - `add_comm`: a + b = b + a
   - `add_zero`: n + 0 = n（帰納法による証明）

4. **リストの証明**
   - `length_append`: リスト結合の長さの性質

5. **偶数・奇数**
   - `even_or_odd`: すべての自然数は偶数か奇数

## 実行方法

```bash
cd examples/08-lean
lake build
lake exe formal-verification
```

## VS Codeでの使い方

1. VS Codeで`examples/08-lean`フォルダを開く
2. `Main.lean`を開くと、証明の各ステップがインタラクティブに確認できる
3. カーソルを証明のどこかに置くと、その時点での証明の状態が表示される

## 基本的なタクティク

- `rfl`: 反射律（定義により等しい）
- `constructor`: 論理積や存在量化子の導入
- `exact`: 正確な項の指定
- `apply`: 定理の適用
- `simp`: 簡約
- `rw`: 書き換え
- `induction`: 帰納法

## 学習リソース

- [Lean 4 公式ドキュメント](https://leanprover.github.io/lean4/doc/)
- [Theorem Proving in Lean 4](https://leanprover.github.io/theorem_proving_in_lean4/)