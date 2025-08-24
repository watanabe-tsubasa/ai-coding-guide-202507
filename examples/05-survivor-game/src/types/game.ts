
export interface Vector {
  x: number;
  y: number;
}

export interface GameObject {
  id: string;
  position: Vector;
  radius: number;
}

export interface Player extends GameObject {
  health: number;
  level: number;
  experience: number;
  speed: number;
  fireRate: number; // shots per second
  bulletSpeed: number;
  bulletDamage: number;
}

export type UpgradeType = 'speed' | 'fireRate' | 'bulletSpeed' | 'bulletDamage';

export interface Upgrade {
  type: UpgradeType;
  title: string;
  description: string;
  apply: (player: Player) => Partial<Player>;
}

export interface Enemy extends GameObject {
  health: number;
  speed: number;
}

export interface Bullet extends GameObject {
  velocity: Vector;
  damage: number;
}

export interface ExperienceOrb extends GameObject {
  value: number;
}

export interface GameState {
  player: Player;
  enemies: Enemy[];
  bullets: Bullet[];
  experienceOrbs: ExperienceOrb[];
  camera: Vector;
  gameTime: number;
}
