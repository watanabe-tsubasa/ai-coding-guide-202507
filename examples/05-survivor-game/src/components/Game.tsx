import React, { useState, useCallback, useRef } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useKeyboard } from '../hooks/useKeyboard';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Bullet } from './Bullet';
import { Experience } from './Experience';
import type { GameState, PlayerStats, Bullet as BulletType, ExperienceOrb } from '../types/game';
import { 
  checkCircleCollision, 
  moveTowards, 
  findNearestEnemy,
  normalize,
  distance
} from '../utils/physics';
import { spawnEnemy, shouldSpawnEnemy } from '../utils/spawner';

const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;
const SPAWN_RADIUS = 400;
const EXPERIENCE_PICKUP_RANGE = 50;

const initialGameState: GameState = {
  player: {
    id: 'player',
    x: 0,
    y: 0,
    radius: 20,
    health: 100,
    maxHealth: 100,
    level: 1,
    experience: 0,
    experienceToNext: 10,
  },
  enemies: [],
  bullets: [],
  experienceOrbs: [],
  camera: { x: -VIEWPORT_WIDTH / 2, y: -VIEWPORT_HEIGHT / 2 },
  gameTime: 0,
  score: 0,
  isGameOver: false,
  isPaused: false,
};

const initialPlayerStats: PlayerStats = {
  fireRate: 500, // ms
  bulletSpeed: 10,
  bulletDamage: 10,
  bulletRange: 300,
  moveSpeed: 3,
};

let bulletIdCounter = 0;
let orbIdCounter = 0;

export const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(initialPlayerStats);
  const lastSpawnTimeRef = useRef(0);
  const lastFireTimeRef = useRef(0);
  const keysRef = useKeyboard();

  const spawnBullet = useCallback((state: GameState, stats: PlayerStats): BulletType | null => {
    const nearestEnemy = findNearestEnemy(state.player, state.enemies);
    if (!nearestEnemy) return null;

    const direction = normalize({
      x: nearestEnemy.x - state.player.x,
      y: nearestEnemy.y - state.player.y,
    });

    return {
      id: `bullet-${bulletIdCounter++}`,
      x: state.player.x,
      y: state.player.y,
      radius: 5,
      velocity: {
        x: direction.x * stats.bulletSpeed,
        y: direction.y * stats.bulletSpeed,
      },
      damage: stats.bulletDamage,
      lifespan: 0,
      maxLifespan: stats.bulletRange / stats.bulletSpeed,
    };
  }, []);

  const spawnExperienceOrb = useCallback((x: number, y: number, value: number): ExperienceOrb => {
    return {
      id: `orb-${orbIdCounter++}`,
      x,
      y,
      radius: 8,
      value,
    };
  }, []);

  const levelUp = useCallback((state: GameState): PlayerStats => {
    const upgrades = ['fireRate', 'bulletSpeed', 'bulletDamage', 'bulletRange', 'moveSpeed'];
    const randomUpgrade = upgrades[Math.floor(Math.random() * upgrades.length)];
    
    const newStats = { ...playerStats };
    
    switch (randomUpgrade) {
      case 'fireRate':
        newStats.fireRate *= 0.9; // 発射速度10%アップ
        console.log('Fire rate increased!');
        break;
      case 'bulletSpeed':
        newStats.bulletSpeed *= 1.1;
        console.log('Bullet speed increased!');
        break;
      case 'bulletDamage':
        newStats.bulletDamage += 5;
        console.log('Bullet damage increased!');
        break;
      case 'bulletRange':
        newStats.bulletRange += 50;
        console.log('Bullet range increased!');
        break;
      case 'moveSpeed':
        newStats.moveSpeed += 0.5;
        console.log('Move speed increased!');
        break;
    }
    
    return newStats;
  }, [playerStats]);

  const update = useCallback((deltaTime: number) => {
    if (gameState.isGameOver || gameState.isPaused) return;

    setGameState(prevState => {
      const newState = { ...prevState };
      newState.gameTime += deltaTime;

      // プレイヤーの移動
      const keys = keysRef.current;
      let dx = 0;
      let dy = 0;
      
      if (keys.ArrowUp) dy -= 1;
      if (keys.ArrowDown) dy += 1;
      if (keys.ArrowLeft) dx -= 1;
      if (keys.ArrowRight) dx += 1;
      
      // 斜め移動の正規化
      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }
      
      // プレイヤーの位置を更新
      newState.player.x += dx * playerStats.moveSpeed;
      newState.player.y += dy * playerStats.moveSpeed;
      
      // カメラをプレイヤーに追従（プレイヤーが常に画面中央）
      newState.camera.x = newState.player.x - VIEWPORT_WIDTH / 2;
      newState.camera.y = newState.player.y - VIEWPORT_HEIGHT / 2;

      // 敵のスポーン
      if (shouldSpawnEnemy(newState.gameTime, lastSpawnTimeRef.current, 1000)) {
        newState.enemies.push(spawnEnemy(newState.player, SPAWN_RADIUS));
        lastSpawnTimeRef.current = newState.gameTime;
      }

      // 弾の発射
      if (newState.gameTime - lastFireTimeRef.current > playerStats.fireRate) {
        const newBullet = spawnBullet(newState, playerStats);
        if (newBullet) {
          newState.bullets.push(newBullet);
          lastFireTimeRef.current = newState.gameTime;
        }
      }

      // 敵の移動
      newState.enemies = newState.enemies.map(enemy => ({
        ...enemy,
        ...moveTowards(enemy, newState.player, enemy.speed),
      }));

      // 弾の移動
      newState.bullets = newState.bullets
        .map(bullet => ({
          ...bullet,
          x: bullet.x + bullet.velocity.x,
          y: bullet.y + bullet.velocity.y,
          lifespan: bullet.lifespan + 1,
        }))
        .filter(bullet => bullet.lifespan < bullet.maxLifespan);

      // 衝突判定: 弾と敵
      const remainingEnemies: typeof newState.enemies = [];
      const remainingBullets: typeof newState.bullets = [];
      const newOrbs: ExperienceOrb[] = [];

      newState.enemies.forEach(enemy => {
        let hit = false;
        
        newState.bullets.forEach(bullet => {
          if (!hit && checkCircleCollision(enemy, bullet)) {
            enemy.health -= bullet.damage;
            hit = true;
          } else {
            remainingBullets.push(bullet);
          }
        });

        if (enemy.health <= 0) {
          // 敵を倒したら経験値オーブを生成
          newOrbs.push(spawnExperienceOrb(enemy.x, enemy.y, 1));
          newState.score += 10;
        } else {
          remainingEnemies.push(enemy);
        }
      });

      newState.enemies = remainingEnemies;
      newState.bullets = Array.from(new Set(remainingBullets));
      newState.experienceOrbs = [...newState.experienceOrbs, ...newOrbs];

      // 衝突判定: プレイヤーと敵
      newState.enemies.forEach(enemy => {
        if (checkCircleCollision(newState.player, enemy)) {
          newState.player.health -= enemy.damage;
          enemy.health = 0; // 敵も消滅
        }
      });

      // 経験値オーブの回収
      newState.experienceOrbs = newState.experienceOrbs.filter(orb => {
        const dist = distance(newState.player, orb);
        if (dist < EXPERIENCE_PICKUP_RANGE) {
          newState.player.experience += orb.value;
          
          // レベルアップチェック
          if (newState.player.experience >= newState.player.experienceToNext) {
            newState.player.level++;
            newState.player.experience = 0;
            newState.player.experienceToNext = newState.player.level * 10;
            newState.player.health = newState.player.maxHealth; // 体力回復
            
            // ステータス強化
            const newStats = levelUp(newState);
            setPlayerStats(newStats);
          }
          
          return false;
        }
        return true;
      });

      // ゲームオーバーチェック
      if (newState.player.health <= 0) {
        newState.isGameOver = true;
      }

      return newState;
    });
  }, [spawnBullet, spawnExperienceOrb, levelUp, playerStats, keysRef]);

  const render = useCallback(() => {
    // レンダリングはReactが行うため、ここでは何もしない
  }, []);

  useGameLoop({
    update,
    render,
    isRunning: !gameState.isGameOver && !gameState.isPaused,
  });

  const handleRestart = () => {
    setGameState(initialGameState);
    setPlayerStats(initialPlayerStats);
    lastSpawnTimeRef.current = 0;
    lastFireTimeRef.current = 0;
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#1a1a1a' }}>
      {/* ゲーム画面 */}
      <svg
        width="100%"
        height="100%"
        viewBox={`${gameState.camera.x} ${gameState.camera.y} ${VIEWPORT_WIDTH} ${VIEWPORT_HEIGHT}`}
        style={{ backgroundColor: '#0f172a' }}
      >
        {/* グリッド背景 */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1e293b" strokeWidth="1" />
          </pattern>
        </defs>
        <rect
          x={gameState.camera.x - 1000}
          y={gameState.camera.y - 1000}
          width={VIEWPORT_WIDTH + 2000}
          height={VIEWPORT_HEIGHT + 2000}
          fill="url(#grid)"
        />

        {/* 経験値オーブ */}
        {gameState.experienceOrbs.map(orb => (
          <Experience key={orb.id} orb={orb} />
        ))}

        {/* 敵 */}
        {gameState.enemies.map(enemy => (
          <Enemy key={enemy.id} enemy={enemy} />
        ))}

        {/* 弾 */}
        {gameState.bullets.map(bullet => (
          <Bullet key={bullet.id} bullet={bullet} />
        ))}

        {/* プレイヤー */}
        <Player player={gameState.player} />
      </svg>

      {/* UI オーバーレイ */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '20px',
        color: 'white',
        fontSize: '18px',
        fontFamily: 'monospace',
        pointerEvents: 'none',
      }}>
        <div>Score: {gameState.score}</div>
        <div>Level: {gameState.player.level}</div>
        <div>EXP: {gameState.player.experience}/{gameState.player.experienceToNext}</div>
        <div>Time: {Math.floor(gameState.gameTime / 1000)}s</div>
      </div>

      {/* ゲームオーバー画面 */}
      {gameState.isGameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '40px',
          borderRadius: '10px',
        }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 20px 0' }}>Game Over</h1>
          <p style={{ fontSize: '24px', margin: '10px 0' }}>Score: {gameState.score}</p>
          <p style={{ fontSize: '24px', margin: '10px 0' }}>Level: {gameState.player.level}</p>
          <p style={{ fontSize: '24px', margin: '10px 0' }}>Time: {Math.floor(gameState.gameTime / 1000)}s</p>
          <button
            onClick={handleRestart}
            style={{
              marginTop: '20px',
              padding: '10px 30px',
              fontSize: '20px',
              backgroundColor: '#4ade80',
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
};