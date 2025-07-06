export interface Position {
  x: number;
  y: number;
}

export interface GameObject extends Position {
  id: string;
  radius: number;
}

export interface Player extends GameObject {
  health: number;
  maxHealth: number;
  level: number;
  experience: number;
  experienceToNext: number;
}

export interface Enemy extends GameObject {
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
}

export interface Bullet extends GameObject {
  velocity: Position;
  damage: number;
  lifespan: number;
  maxLifespan: number;
}

export interface ExperienceOrb extends GameObject {
  value: number;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  experienceOrbs: ExperienceOrb[];
  camera: Position;
  gameTime: number;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export interface PlayerStats {
  fireRate: number;
  bulletSpeed: number;
  bulletDamage: number;
  bulletRange: number;
  moveSpeed: number;
}