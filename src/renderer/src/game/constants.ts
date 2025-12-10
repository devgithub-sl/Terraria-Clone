export const TILE_SIZE = 32;
export const WORLD_WIDTH = 300; // Even wider world
export const WORLD_HEIGHT = 100;

// Physics
export const GRAVITY = 0.6;
export const FRICTION = 0.85;
export const MOVE_SPEED = 0.5;
export const MAX_SPEED = 6;
export const JUMP_FORCE = -12;

// Combat
export const PLAYER_MAX_HP = 5;
export const ENEMY_DAMAGE = 1;
export const ENEMY_KNOCKBACK = 10;
export const INVULNERABILITY_TIME = 60; // Frames (1 second)

// Block IDs
export const BLOCK_AIR = 0;
export const BLOCK_DIRT = 1;
export const BLOCK_GRASS = 2;
export const BLOCK_STONE = 3;
export const BLOCK_LAVA = 4;
export const BLOCK_WOOD = 5;
export const BLOCK_LEAVES = 6;
export const BLOCK_BEDROCK = 99;

// Block Health
export const BLOCK_HEALTH: Record<number, number> = {
  [BLOCK_DIRT]: 20,
  [BLOCK_GRASS]: 20,
  [BLOCK_STONE]: 60,
  [BLOCK_LAVA]: 1000,
  [BLOCK_WOOD]: 40,
  [BLOCK_LEAVES]: 5,
  [BLOCK_BEDROCK]: Infinity
};

export const COLORS: Record<number, number> = {
  [BLOCK_DIRT]: 0x8B4513,
  [BLOCK_GRASS]: 0x228B22,
  [BLOCK_STONE]: 0x808080,
  [BLOCK_LAVA]: 0xFF4500,
  [BLOCK_WOOD]: 0x5D4037, // Dark Brown
  [BLOCK_LEAVES]: 0x32CD32, // Lime Green
  [BLOCK_BEDROCK]: 0x000000
};