# 05. React + SVG サバイバーゲームの実装

## 概要

React と SVG を使用して、Vampire Survivors 風の全方位シューティングゲームを実装します。Vite を使用した高速な開発環境で、ゲーム開発の基礎を学びます。

## 学習目標

- React でのゲームループ実装
- SVG を使用したグラフィックス描画
- 衝突判定とゲームロジック
- パフォーマンス最適化
- ゲームステート管理
- **AI コーディングの限界**: GUI 開発における課題の理解

## AI コーディングにおける GUI 開発の課題

### フィードバックループの問題

GUI アプリケーション開発では、以下の理由により AI との協働が難しくなります：

1. **視覚的フィードバックが必要**
   - コードの正しさは実際に画面を見ないと判断できない
   - AI は実行結果を直接確認できない
   - 人間が画面を確認して AI にフィードバックする必要がある

2. **デバッグサイクルの長期化**
   ```
   AI がコード生成 → 人間が実行 → 画面確認 → 問題を報告 → AI が修正
   ```
   - 各ステップで人間の介入が必要
   - 自動テストだけでは検証できない部分が多い

3. **出力の不安定性**
   - 同じコードでも環境により表示が異なる場合がある
   - ブラウザの違い、画面サイズ、タイミングなどの要因
   - AI が期待する結果と実際の表示が一致しない

### 効果的な AI との協働方法

1. **段階的な実装**
   - 小さな機能単位で実装と確認を繰り返す
   - 一度に大きな変更を加えない

2. **明確な問題報告**
   - 「動かない」ではなく具体的な症状を伝える
   - 例：「プレイヤーのグラフィックが固定で追従してない」

3. **コンソールエラーの共有**
   - TypeScript のエラーメッセージを正確に伝える
   - 実行時エラーの詳細を共有

4. **スクリーンショットの活用**
   - 可能であれば画面の状態を視覚的に共有
   - 期待する動作と実際の動作の違いを明確に

## ゲームの仕様

### 基本機能

1. **プレイヤー**
   - カーソルキーで移動可能
   - カメラは常にプレイヤーを中心に追従
   - 自動で最も近い敵に向けて弾を発射

2. **敵**
   - 全方位から出現
   - プレイヤーに向かって移動
   - 倒すと経験値をドロップ

3. **弾丸システム**
   - 自動発射
   - 最も近い敵をターゲット
   - 威力と飛距離がある

4. **経験値システム**
   - 敵を倒すとドロップ
   - 拾うとレベルアップ
   - ランダムな強化を獲得

5. **カメラ**
   - SVG の viewBox でカメラ操作
   - プレイヤーを中心に表示

## 実装手順

### 1. プロジェクトセットアップ

```bash
# Vite でプロジェクト作成
npm create vite@latest examples/05-survivor-game -- --template react-ts
cd examples/05-survivor-game
npm install

# 必要なパッケージを追加
npm install --save-dev @types/node
```

### 2. ゲームの基本構造

プロジェクトは以下の構造で実装します：

```
src/
├── components/
│   ├── Game.tsx         # メインゲームコンポーネント
│   ├── Player.tsx       # プレイヤー
│   ├── Enemy.tsx        # 敵
│   ├── Bullet.tsx       # 弾丸
│   └── Experience.tsx   # 経験値オーブ
├── hooks/
│   ├── useGameLoop.ts   # ゲームループ
│   └── useKeyboard.ts   # キーボード入力
├── types/
│   └── game.ts          # 型定義
└── utils/
    ├── physics.ts       # 物理演算
    └── spawner.ts       # 敵生成ロジック
```

### 3. 実装のポイント

#### ゲームループ

```typescript
// requestAnimationFrame を使用したゲームループ
useEffect(() => {
  let animationId: number;
  
  const gameLoop = (timestamp: number) => {
    update(timestamp);
    render();
    animationId = requestAnimationFrame(gameLoop);
  };
  
  animationId = requestAnimationFrame(gameLoop);
  
  return () => cancelAnimationFrame(animationId);
}, []);
```

#### SVG カメラ

```typescript
// viewBox でカメラ位置を制御
<svg
  viewBox={`${cameraX} ${cameraY} ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`}
  width="100%"
  height="100%"
>
  {/* ゲームオブジェクト */}
</svg>
```

#### 衝突判定

```typescript
// 円同士の衝突判定
const checkCircleCollision = (
  a: { x: number; y: number; radius: number },
  b: { x: number; y: number; radius: number }
): boolean => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < a.radius + b.radius;
};
```

#### キーボード入力

```typescript
// useKeyboard フックでキー入力を管理
const useKeyboard = () => {
  const keysRef = useRef<KeyState>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key in keysRef.current) {
        keysRef.current[e.key as keyof KeyState] = true;
        e.preventDefault(); // ページのスクロールを防ぐ
      }
    };
    // ...
  }, []);

  return keysRef;
};
```

### 4. パフォーマンス最適化

1. **頻繁に更新されるコンポーネントには React.memo を使わない**
   - プレイヤーや敵など、座標が頻繁に変わるコンポーネントは memo 化しない
2. **オブジェクトプール** で頻繁な生成・破棄を避ける
3. **空間分割** で衝突判定を効率化
4. **requestAnimationFrame** で描画を最適化

### 5. 拡張機能

- 複数の武器タイプ
- 特殊能力の実装
- ウェーブシステム
- スコアとハイスコア
- サウンドエフェクト

## AIへの指示のコツ

### 段階的な実装

```
1. "まず基本的なゲームループとプレイヤーの表示を実装"
2. "次に敵の生成と移動を追加"
3. "弾の発射と衝突判定を実装"
4. "最後に経験値システムを追加"
```

### 具体的な仕様の伝達

```
"敵は画面外の円周上からランダムに出現し、
プレイヤーに向かって速度2で移動する。
出現間隔は1秒ごとで、徐々に短くなる"
```

### パフォーマンスの考慮

```
"パフォーマンスのため、画面外のオブジェクトは
削除し、オブジェクトプールを使用して
メモリ割り当てを最小化する"
```

## 実装時の注意点

### 必要なファイルの準備

1. **不要なファイルの削除**
   ```bash
   rm src/App.css src/index.css
   ```

2. **HTML のスタイル設定**
   ```html
   <!-- index.html -->
   <style>
     body {
       margin: 0;
       padding: 0;
       overflow: hidden;
     }
     #root {
       margin: 0;
       padding: 0;
     }
   </style>
   ```

## トラブルシューティング

### よくある問題と解決方法

1. **TypeScript の型インポートエラー**
   ```
   The requested module does not provide an export named 'Player'
   ```
   **解決策**: 型定義のインポートには `type` キーワードを使用
   ```typescript
   // ❌ 間違い
   import { Player } from '../types/game';
   
   // ✅ 正しい
   import type { Player } from '../types/game';
   ```

2. **プレイヤーが動かない問題**
   - React.memo によるメモ化が原因で再レンダリングされない
   - **解決策**: 頻繁に更新されるコンポーネントから React.memo を削除
   ```typescript
   // ❌ 動かない
   export const Player = React.memo(({ player }) => { ... });
   
   // ✅ 動く
   export const Player = ({ player }) => { ... };
   ```

3. **カメラとプレイヤーの動きの問題**
   - プレイヤーを中心にカメラを追従させる必要がある
   - **解決策**: プレイヤーの移動時にカメラ位置も更新
   ```typescript
   // カメラをプレイヤーに追従（プレイヤーが常に画面中央）
   newState.camera.x = newState.player.x - VIEWPORT_WIDTH / 2;
   newState.camera.y = newState.player.y - VIEWPORT_HEIGHT / 2;
   ```

4. **ページのスクロール問題**
   - カーソルキーでページがスクロールしてしまう
   - **解決策**: キーイベントで preventDefault() を呼び出す

5. **初期位置の設定**
   ```typescript
   // プレイヤーの初期位置
   player: {
     x: 0,
     y: 0,
     // ...
   },
   // カメラの初期位置（プレイヤーが画面中央になるように）
   camera: { 
     x: -VIEWPORT_WIDTH / 2, 
     y: -VIEWPORT_HEIGHT / 2 
   },
   ```

6. **メモリリーク**
   - イベントリスナーの解除忘れ
   - タイマーのクリア忘れ
   - 削除されないオブジェクト

## まとめ

このプロジェクトでは、React と SVG を使用してゲームを作成する基本的な手法を学びます。ゲームループ、衝突判定、パフォーマンス最適化など、ゲーム開発に必要な要素を実践的に習得できます。

また、GUI アプリケーション開発における AI コーディングの限界も体験できます。視覚的なフィードバックが必要な開発では、人間と AI の協働方法を工夫する必要があることを理解できるでしょう。