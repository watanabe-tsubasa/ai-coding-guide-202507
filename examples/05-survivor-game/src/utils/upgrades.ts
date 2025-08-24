import type { Upgrade } from '../types/game';

export const upgrades: Upgrade[] = [
  {
    type: 'speed',
    title: 'Increased Speed',
    description: 'Move 10% faster.',
    apply: (player) => ({ speed: player.speed * 1.1 }),
  },
  {
    type: 'fireRate',
    title: 'Increased Fire Rate',
    description: 'Shoot 15% faster.',
    apply: (player) => ({ fireRate: player.fireRate * 1.15 }),
  },
  {
    type: 'bulletSpeed',
    title: 'Increased Bullet Speed',
    description: 'Bullets travel 20% faster.',
    apply: (player) => ({ bulletSpeed: player.bulletSpeed * 1.2 }),
  },
  {
    type: 'bulletDamage',
    title: 'Increased Bullet Damage',
    description: 'Bullets deal 10 more damage.',
    apply: (player) => ({ bulletDamage: player.bulletDamage + 10 }),
  },
];
