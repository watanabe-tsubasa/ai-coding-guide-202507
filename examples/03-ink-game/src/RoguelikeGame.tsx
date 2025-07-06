import React, { useState, useEffect } from "react";
import { Box, Text, useInput, useApp } from "ink";
import { dijkstra, gridToGraph } from "./pathfinding.js";

type Position = { x: number; y: number };
type Cell = "." | "#" | "@" | "$" | "E";

interface GameState {
  map: Cell[][];
  player: Position;
  enemies: Position[];
  items: Position[];
  points: number;
  gameOver: boolean;
  level: number;
}

const MAP_SIZE = 10;

export const RoguelikeGame: React.FC = () => {
  const { exit } = useApp();

  // ゲーム状態の初期化
  const initializeGame = (level: number = 1): GameState => {
    const map: Cell[][] = Array(MAP_SIZE)
      .fill(null)
      .map(() => Array(MAP_SIZE).fill("."));

    // 壁を配置（外周）
    for (let i = 0; i < MAP_SIZE; i++) {
      map[0][i] = "#";
      map[MAP_SIZE - 1][i] = "#";
      map[i][0] = "#";
      map[i][MAP_SIZE - 1] = "#";
    }

    // ランダムな内部の壁
    for (let i = 0; i < 5 + level; i++) {
      const x = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
      const y = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
      map[y][x] = "#";
    }

    // プレイヤーの初期位置
    const player: Position = { x: 1, y: 1 };
    map[player.y][player.x] = "@";

    // アイテムを配置
    const items: Position[] = [];
    for (let i = 0; i < 3 + level; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
        y = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
      } while (map[y][x] !== ".");
      map[y][x] = "$";
      items.push({ x, y });
    }

    // 敵を配置
    const enemies: Position[] = [];
    for (let i = 0; i < level; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
        y = Math.floor(Math.random() * (MAP_SIZE - 2)) + 1;
      } while (map[y][x] !== ".");
      map[y][x] = "E";
      enemies.push({ x, y });
    }

    return {
      map,
      player,
      enemies,
      items,
      points: 0,
      gameOver: false,
      level,
    };
  };

  const [gameState, setGameState] = useState<GameState>(() => initializeGame());

  // マップの更新
  const updateMap = (state: GameState): Cell[][] => {
    const newMap = state.map.map((row) => [...row]);

    // マップをクリア
    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        if (newMap[y][x] !== "#") {
          newMap[y][x] = ".";
        }
      }
    }

    // アイテムを配置
    state.items.forEach((item) => {
      newMap[item.y][item.x] = "$";
    });

    // 敵を配置
    state.enemies.forEach((enemy) => {
      newMap[enemy.y][enemy.x] = "E";
    });

    // プレイヤーを配置
    newMap[state.player.y][state.player.x] = "@";

    return newMap;
  };

  // プレイヤーの移動
  const movePlayer = (dx: number, dy: number) => {
    if (gameState.gameOver) return;

    setGameState((prev) => {
      const newX = prev.player.x + dx;
      const newY = prev.player.y + dy;

      // 境界チェック（先に行う）
      if (newX < 0 || newX >= MAP_SIZE || newY < 0 || newY >= MAP_SIZE) {
        return prev;
      }

      // 壁チェック
      if (prev.map[newY] && prev.map[newY][newX] === "#") {
        return prev;
      }

      const newState = { ...prev };
      newState.player = { x: newX, y: newY };

      // アイテム取得チェック
      const itemIndex = newState.items.findIndex(
        (item) => item.x === newX && item.y === newY
      );
      if (itemIndex !== -1) {
        newState.items = [...newState.items];
        newState.items.splice(itemIndex, 1);
        newState.points += 10;

        // レベルクリアチェック
        if (newState.items.length === 0) {
          return initializeGame(newState.level + 1);
        }
      }

      // 敵との衝突チェック
      const enemyCollision = newState.enemies.some(
        (enemy) => enemy.x === newX && enemy.y === newY
      );
      if (enemyCollision) {
        newState.gameOver = true;
      }

      newState.map = updateMap(newState);
      return newState;
    });
  };

  // 敵の移動（ダイクストラ法を使用）
  useEffect(() => {
    if (gameState.gameOver || gameState.enemies.length === 0) return;

    const timer = setInterval(() => {
      try {
        setGameState((prev) => {
          if (prev.gameOver) return prev;

          const newState = { ...prev };

          // マップをグラフに変換（歩行可能なセル）
          const walkableCells = new Set<string>([".", "@", "$", "E"]);
          const { graph } = gridToGraph(prev.map, walkableCells);

          newState.enemies = prev.enemies.map((enemy) => {
            const enemyNode = `${enemy.x},${enemy.y}`;
            const playerNode = `${prev.player.x},${prev.player.y}`;

            // ダイクストラ法で最短経路を計算
            const path = dijkstra(graph, enemyNode, playerNode);

            if (path && path.length > 1) {
              // 次のステップの座標を取得
              const nextStep = path[1];
              const [nextX, nextY] = nextStep.split(",").map(Number);

              // 他の敵との衝突を避ける
              const isOccupiedByOtherEnemy = newState.enemies.some(
                (otherEnemy, index) =>
                  otherEnemy !== enemy &&
                  otherEnemy.x === nextX &&
                  otherEnemy.y === nextY
              );

              if (!isOccupiedByOtherEnemy) {
                // プレイヤーとの衝突チェック
                if (nextX === prev.player.x && nextY === prev.player.y) {
                  newState.gameOver = true;
                }

                return { x: nextX, y: nextY };
              }
            }

            return enemy; // 移動できない場合は現在位置を維持
          });

          newState.map = updateMap(newState);
          return newState;
        });
      } catch (error) {
        console.error("Enemy movement error:", error);
      }
    }, 1000 - gameState.level * 100); // レベルが上がるほど速くなる

    return () => clearInterval(timer);
  }, [gameState.level, gameState.gameOver, gameState.enemies.length]);

  // キー入力処理
  useInput((input, key) => {
    try {
      if (input === "q") {
        exit();
      } else if (input === "r" && gameState.gameOver) {
        setGameState(initializeGame());
      } else if (!gameState.gameOver) {
        // 矢印キーの処理（複数の方法に対応）
        if (key.upArrow || input === "\u001B[A") movePlayer(0, -1);
        else if (key.downArrow || input === "\u001B[B") movePlayer(0, 1);
        else if (key.leftArrow || input === "\u001B[D") movePlayer(-1, 0);
        else if (key.rightArrow || input === "\u001B[C") movePlayer(1, 0);
        // WASDキーのサポートも追加
        else if (input === "w" || input === "W") movePlayer(0, -1);
        else if (input === "s" || input === "S") movePlayer(0, 1);
        else if (input === "a" || input === "A") movePlayer(-1, 0);
        else if (input === "d" || input === "D") movePlayer(1, 0);
      }
    } catch (error) {
      // エラーが発生してもアプリを終了させない
      console.error("Input error:", error);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Box
        borderStyle="double"
        borderColor="yellow"
        padding={1}
        marginBottom={1}
      >
        <Text color="yellow" bold>
          == ROGUELIKE DUNGEON ==
        </Text>
      </Box>

      <Box borderStyle="single" padding={1} marginBottom={1}>
        <Box flexDirection="column">
          <Text>
            LV:{" "}
            <Text color="cyan" bold>
              {gameState.level}
            </Text>{" "}
            | SCORE:{" "}
            <Text color="yellow" bold>
              {gameState.points}
            </Text>{" "}
            | ITEMS:{" "}
            <Text color="green" bold>
              {gameState.items.length}
            </Text>
          </Text>
        </Box>
      </Box>

      <Box borderStyle="single">
        <Box flexDirection="column">
          {gameState.map.map((row, y) => (
            <Box key={y}>
              {row.map((cell, x) => {
                let char = cell;
                let color = "white";
                let bold = false;

                if (cell === "@") {
                  char = "@";
                  color = "green";
                  bold = true;
                } else if (cell === "#") {
                  char = "#";
                  color = "gray";
                } else if (cell === "$") {
                  char = "$";
                  color = "yellow";
                } else if (cell === "E") {
                  char = "E";
                  color = "red";
                  bold = true;
                } else if (cell === ".") {
                  char = ".";
                  color = "gray";
                }

                return (
                  <Text key={x} color={color} bold={bold}>
                    {char}
                  </Text>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {gameState.gameOver ? (
        <Box marginTop={1} borderStyle="double" borderColor="red" padding={1}>
          <Text color="red" bold>
            GAME OVER!
          </Text>
          <Text color="white">SCORE: {gameState.points} | [R] RETRY</Text>
        </Box>
      ) : (
        <Box marginTop={1}>
          <Text dimColor>
            Arrow/WASD: Move | $: Collect items | E: Avoid enemies | Q: Quit
          </Text>
        </Box>
      )}
    </Box>
  );
};
