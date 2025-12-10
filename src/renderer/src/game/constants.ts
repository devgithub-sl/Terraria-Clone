export const TILE_SIZE = 32;
export const WORLD_WIDTH = 100;
export const WORLD_HEIGHT = 60;

// Physics
export const GRAVITY = 0.6;
export const MOVE_SPEED = 0.5; // Acceleration
export const MAX_SPEED = 6;
export const FRICTION = 0.85;
export const JUMP_FORCE = -12;

// Block Types
export const BLOCK_AIR = 0;
export const BLOCK_DIRT = 1;
export const BLOCK_GRASS = 2;
export const BLOCK_STONE = 3;
export const BLOCK_LAVA = 4;

// Colors
export const COLORS: { [key: number]: number } = {
  [BLOCK_DIRT]: 0x8B4513,  // Brown
  [BLOCK_GRASS]: 0x228B22, // Forest Green
  [BLOCK_STONE]: 0x808080, // Grey
  [BLOCK_LAVA]: 0xFF4500   // Red/Orange
};