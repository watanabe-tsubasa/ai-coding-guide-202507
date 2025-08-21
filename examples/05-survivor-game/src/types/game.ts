
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
