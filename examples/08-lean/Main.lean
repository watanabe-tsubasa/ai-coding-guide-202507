-- Lean 4 形式検証の基本的なサンプル

-- 1. 簡単な定理の証明
theorem simple_proof : 1 + 1 = 2 := by
  rfl  -- reflexivity: 定義により等しい

-- 2. 論理演算の証明
theorem and_intro (p q : Prop) (hp : p) (hq : q) : p ∧ q := by
  constructor  -- 論理積を構成
  · exact hp   -- 左側の証明
  · exact hq   -- 右側の証明

theorem modus_ponens (p q : Prop) (hp : p) (hpq : p → q) : q := by
  apply hpq    -- p → q を適用
  exact hp     -- p を与える

-- 3. 自然数に関する証明
theorem zero_add (n : Nat) : 0 + n = n := by
  exact Nat.zero_add n  -- 標準ライブラリの定理を使用

theorem add_comm (a b : Nat) : a + b = b + a := by
  exact Nat.add_comm a b  -- 標準ライブラリの定理を使用

-- 4. 帰納法を使った証明
theorem add_zero (n : Nat) : n + 0 = n := by
  exact Nat.add_zero n  -- 標準ライブラリの定理を使用

-- 5. リストに関する証明
def length : List α → Nat
  | [] => 0
  | _ :: xs => 1 + length xs

theorem length_append (xs ys : List α) : 
    length (xs ++ ys) = length xs + length ys := by
  induction xs with
  | nil => 
    simp [length]
  | cons x xs ih =>
    simp [length, ih, Nat.add_assoc]

-- 6. 偶数・奇数の定義と証明
def is_even (n : Nat) : Prop := ∃ k, n = 2 * k
def is_odd (n : Nat) : Prop := ∃ k, n = 2 * k + 1

theorem even_or_odd (n : Nat) : is_even n ∨ is_odd n := by
  induction n with
  | zero =>
    left  -- 0は偶数
    exact ⟨0, rfl⟩
  | succ n ih =>
    cases ih with
    | inl h =>  -- nが偶数の場合
      right     -- n+1は奇数
      cases h with
      | intro k hk =>
        use k
        rw [hk]
    | inr h =>  -- nが奇数の場合  
      left      -- n+1は偶数
      cases h with
      | intro k hk =>
        use k + 1
        rw [hk]
        simp [Nat.mul_add]

-- メイン関数
def main : IO Unit := do
  IO.println "Lean 4 形式検証サンプル"
  IO.println "====================="
  IO.println ""
  IO.println "このファイルには以下の証明が含まれています："
  IO.println "1. simple_proof: 1 + 1 = 2"
  IO.println "2. and_intro: 論理積の導入"
  IO.println "3. modus_ponens: 前件肯定"
  IO.println "4. add_zero: n + 0 = n (帰納法)"
  IO.println "5. length_append: リストの長さの性質"
  IO.println "6. even_or_odd: すべての自然数は偶数か奇数"