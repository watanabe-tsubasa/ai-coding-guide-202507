import React, { useState, useCallback, useRef } from 'react';
import { useKeyboard } from '../hooks/useKeyboard';
import { useGameLoop } from '../hooks/useGameLoop';
import { subtract, normalize, distance, multiply } from '../utils/physics';
import { generateSpawnPoint } from '../utils/spawner';
import type { GameState, Upgrade } from '../types/game';
import Player from './Player';
import Enemy from './Enemy';
import Bullet from './Bullet';
import ExperienceOrb from './Experience';
import GameUI from './GameUI';
import GameOverScreen from './GameOverScreen';
import UpgradeScreen from './UpgradeScreen';
import { upgrades } from '../utils/upgrades';

const initialGameState: GameState = {
  player: {
    id: 'player',
    position: { x: 400, y: 300 },
    radius: 15,
    health: 100,
    level: 1,
    experience: 0,
    speed: 300,
    fireRate: 1,
    bulletSpeed: 500,
    bulletDamage: 10,
  },
  enemies: [],
  bullets: [],
  experienceOrbs: [],
  camera: { x: 0, y: 0 },
  gameTime: 0,
};

const GAME_AREA_WIDTH = 1600;
const GAME_AREA_HEIGHT = 1200;

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const pressedKeys = useKeyboard();
  const nextSpawnTime = useRef(5000); // Spawn every 5 seconds
  const nextShootTime = useRef(1000); // Shoot every 1 second

  const update = useCallback((deltaTime: number) => {

    setGameState((prev) => {
      const newGameTime = prev.gameTime + deltaTime;

      const newPlayerPos = { ...prev.player.position };
      const moveDistance = prev.player.speed * (deltaTime / 1000);

      if (pressedKeys.has('ArrowUp')) newPlayerPos.y -= moveDistance;
      if (pressedKeys.has('ArrowDown')) newPlayerPos.y += moveDistance;
      if (pressedKeys.has('ArrowLeft')) newPlayerPos.x -= moveDistance;
      if (pressedKeys.has('ArrowRight')) newPlayerPos.x += moveDistance;

      // Clamp player position to game area
      newPlayerPos.x = Math.max(prev.player.radius, Math.min(GAME_AREA_WIDTH - prev.player.radius, newPlayerPos.x));
      newPlayerPos.y = Math.max(prev.player.radius, Math.min(GAME_AREA_HEIGHT - prev.player.radius, newPlayerPos.y));

      const newEnemies = prev.enemies.map(enemy => {
        const direction = normalize(subtract(newPlayerPos, enemy.position));
        const enemyMoveDistance = enemy.speed * (deltaTime / 1000);
        const newEnemyPos = {
          x: enemy.position.x + direction.x * enemyMoveDistance,
          y: enemy.position.y + direction.y * enemyMoveDistance,
        };
        return { ...enemy, position: newEnemyPos };
      });

      const newEnemiesWithSpawn = newEnemies;
      if (newGameTime > nextSpawnTime.current) {
        const spawnPoint = generateSpawnPoint(newPlayerPos, 400, { width: GAME_AREA_WIDTH, height: GAME_AREA_HEIGHT }); // 400 is a placeholder for view radius
        const newEnemy = {
          id: `enemy-${newGameTime}`,
          position: spawnPoint,
          radius: 10,
          health: 50,
          speed: 100,
        };
        newEnemiesWithSpawn.push(newEnemy);
        nextSpawnTime.current = newGameTime + 5000;
      }

      // Bullet shooting logic
      const newBullets = prev.bullets;
      if (newGameTime > nextShootTime.current && newEnemies.length > 0) {
        // Find the closest enemy
        const closestEnemy = newEnemies.reduce((closest, enemy) => {
          const dist = distance(newPlayerPos, enemy.position);
          const closestDist = distance(newPlayerPos, closest.position);
          return dist < closestDist ? enemy : closest;
        });

        const bulletDirection = normalize(subtract(closestEnemy.position, newPlayerPos));
        const newBullet = {
          id: `bullet-${newGameTime}`,
          position: { ...newPlayerPos },
          velocity: multiply(bulletDirection, prev.player.bulletSpeed), // Bullet speed
          radius: 5,
          damage: prev.player.bulletDamage,
        };
        newBullets.push(newBullet);
        nextShootTime.current = newGameTime + 1000 / prev.player.fireRate; // 1 second cooldown
      }

      // Update bullet positions
      const updatedBullets = newBullets.map(bullet => ({
        ...bullet,
        position: {
          x: bullet.position.x + bullet.velocity.x * (deltaTime / 1000),
          y: bullet.position.y + bullet.velocity.y * (deltaTime / 1000),
        },
      }));

      // Collision detection: bullets and enemies
      const hitEnemyIds = new Set<string>();
      const hitBulletIds = new Set<string>();
      const newExperienceOrbs = [...prev.experienceOrbs];

      for (const bullet of updatedBullets) {
        for (const enemy of newEnemiesWithSpawn) {
          if (distance(bullet.position, enemy.position) < bullet.radius + enemy.radius) {
            hitBulletIds.add(bullet.id);
            enemy.health -= bullet.damage;
            if (enemy.health <= 0) {
              hitEnemyIds.add(enemy.id);
              newExperienceOrbs.push({
                id: `orb-${enemy.id}`,
                position: enemy.position,
                radius: 7,
                value: 10,
              });
            }
          }
        }
      }

      const remainingEnemies = newEnemiesWithSpawn.filter(enemy => !hitEnemyIds.has(enemy.id));
      const remainingBullets = updatedBullets.filter(bullet => !hitBulletIds.has(bullet.id));

      // Collision detection: player and enemies
      let playerHealth = prev.player.health;
      for (const enemy of remainingEnemies) {
        if (distance(newPlayerPos, enemy.position) < prev.player.radius + enemy.radius) {
          playerHealth -= 10; // Damage value
        }
      }

      if (playerHealth <= 0) {
        setIsGameOver(true);
        playerHealth = 0;
      }

      // Collision detection: player and experience orbs
      let newExperience = prev.player.experience;
      const remainingOrbs = newExperienceOrbs.filter(orb => {
        if (distance(newPlayerPos, orb.position) < prev.player.radius + orb.radius) {
          newExperience += orb.value;
          return false; // Remove orb
        }
        return true; // Keep orb
      });

      // Level up logic
      let newLevel = prev.player.level;
      let finalExperience = newExperience;
      const experienceToNextLevel = newLevel * 100;

      if (finalExperience >= experienceToNextLevel) {
        newLevel++;
        finalExperience -= experienceToNextLevel;
        setIsLevelingUp(true);
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          position: newPlayerPos,
          health: playerHealth,
          level: newLevel,
          experience: finalExperience,
        },
        enemies: remainingEnemies,
        bullets: remainingBullets,
        experienceOrbs: remainingOrbs,
        gameTime: newGameTime,
      };
    });
  }, [pressedKeys]);

  useGameLoop(isGameOver || isLevelingUp ? () => {} : update);

  const handleRestart = () => {
    setGameState(initialGameState);
    setIsGameOver(false);
  };

  const handleSelectUpgrade = (upgrade: Upgrade) => {
    setGameState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        ...upgrade.apply(prev.player),
      },
    }));
    setIsLevelingUp(false);
  };

  const { player } = gameState;

  const getUpgradeOptions = (): Upgrade[] => {
    const shuffled = [...upgrades].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  // Center the camera on the player
  const cameraX = player.position.x - 400;
  const cameraY = player.position.y - 300;

  return (
    <div style={{ position: 'relative', width: '800px', height: '600px' }}>
      {isGameOver && <GameOverScreen onRestart={handleRestart} />}
      {isLevelingUp && <UpgradeScreen upgrades={getUpgradeOptions()} onSelectUpgrade={handleSelectUpgrade} />}
      <GameUI player={player} />
      <svg
        width="800"
        height="600"
        viewBox={`${cameraX} ${cameraY} 800 600`}
        style={{ border: '1px solid black', backgroundColor: '#f0f0f0', position: 'absolute', top: 0, left: 0 }}
      >
        {/* Game Area Background */}
        <rect x="0" y="0" width={GAME_AREA_WIDTH} height={GAME_AREA_HEIGHT} fill="#e0e0e0" />
        
        <Player player={player} />

        {gameState.enemies.map(enemy => (
          <Enemy key={enemy.id} position={enemy.position} />
        ))}

        {gameState.bullets.map(bullet => (
          <Bullet key={bullet.id} position={bullet.position} />
        ))}

        {gameState.experienceOrbs.map(orb => (
          <ExperienceOrb key={orb.id} position={orb.position} />
        ))}
      </svg>
    </div>
  );
};

export default Game;
