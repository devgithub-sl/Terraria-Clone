import { Container, Graphics } from 'pixi.js';
import { 
  TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH, COLORS, 
  BLOCK_AIR, BLOCK_DIRT, BLOCK_GRASS, BLOCK_STONE, BLOCK_BEDROCK, BLOCK_WOOD, BLOCK_LEAVES 
} from './constants';
import { Perlin } from './Perlin';

export class World {
  public container: Container;
  public grid: number[][];
  private graphics: Graphics; 
  private noise: Perlin;

  constructor(seed: number) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.grid = [];
    this.noise = new Perlin(seed);
    
    this.generate();
    this.render();
  }

  // Helper: "Spectral Synthesis" (Sum of Sines/Noise) to mimic FFT signal reconstruction
  // We combine Low Frequency (Terrain shape) + High Frequency (Tree scatter)
  getBiomass(x: number): number {
    // Octave 1: Low frequency
    const o1 = this.noise.noise(x * 0.05, 0, 0);
    // Octave 2: High frequency (detail)
    const o2 = this.noise.noise(x * 0.5, 0, 0) * 0.5;
    return o1 + o2;
  }

  generate() {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      this.grid[x] = [];
      
      // 1. Terrain Height (Perlin)
      const surfaceY = Math.floor(25 + this.noise.noise(x * 0.08, 0, 0) * 12);

      for (let y = 0; y < WORLD_HEIGHT; y++) {
        if (y < surfaceY) {
          this.grid[x][y] = BLOCK_AIR;
        } else if (y === surfaceY) {
          this.grid[x][y] = BLOCK_GRASS;
        } else if (y >= WORLD_HEIGHT - 2) {
          this.grid[x][y] = BLOCK_BEDROCK;
        } else {
          // Caves
          const cave = this.noise.noise(x * 0.1, y * 0.1, 0.5);
          if (cave > 0.45) {
            this.grid[x][y] = BLOCK_AIR;
          } else {
            if (y > 45 && Math.random() > 0.3) this.grid[x][y] = BLOCK_STONE;
            else this.grid[x][y] = BLOCK_DIRT;
          }
        }
      }

      // 2. Tree Generation (Spectral Synthesis Check)
      // Check biomass value at this X. If high enough, grow a tree!
      // Also ensure we have space (x is not edge)
      if (x > 2 && x < WORLD_WIDTH - 2) {
         // Using a specific "frequency" to pick tree spots
         const treeProb = this.getBiomass(x * 12.5); 
         // If probability > 0.6 AND we are not in a cave (surface is solid)
         if (treeProb > 0.6 && this.grid[x][surfaceY] === BLOCK_GRASS) {
            this.growTree(x, surfaceY - 1);
         }
      }
    }
  }

  growTree(baseX: number, baseY: number) {
    const height = 4 + Math.floor(Math.random() * 3); // 4 to 6 blocks tall
    
    // Trunk
    for (let i = 0; i < height; i++) {
        this.setBlock(baseX, baseY - i, BLOCK_WOOD);
    }
    
    // Leaves (Circle-ish)
    const topY = baseY - height;
    for (let lx = baseX - 2; lx <= baseX + 2; lx++) {
        for (let ly = topY - 2; ly <= topY + 1; ly++) {
            // Don't overwrite trunk
            if (lx === baseX && ly > topY) continue; 
            
            // Random chance for "fuzzy" edges
            if (Math.abs(lx - baseX) === 2 && Math.abs(ly - topY) === 2 && Math.random() > 0.5) continue;

            this.setBlock(lx, ly, BLOCK_LEAVES);
        }
    }
  }

  getSurfaceHeight(x: number): number {
    // Find the first solid block from top
    if (x < 0 || x >= WORLD_WIDTH) return 0;
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        if (this.grid[x][y] !== BLOCK_AIR && this.grid[x][y] !== BLOCK_WOOD && this.grid[x][y] !== BLOCK_LEAVES) {
            return y;
        }
    }
    return WORLD_HEIGHT;
  }

  render() {
    this.graphics.clear();
    for (let x = 0; x < WORLD_WIDTH; x++) {
      for (let y = 0; y < WORLD_HEIGHT; y++) {
        const type = this.grid[x][y];
        if (type === BLOCK_AIR) continue;
        this.graphics.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        this.graphics.fill(COLORS[type] || 0xFF00FF);
      }
    }
  }

  setBlock(x: number, y: number, type: number) {
    if (x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT) return;
    this.grid[x][y] = type;
    
    // Optimization: In real game, don't redraw everything. 
    // Here we just draw the specific rect.
    const color = type === BLOCK_AIR ? 0x87CEEB : (COLORS[type] || 0x000000);
    this.graphics.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    this.graphics.fill(color);
  }

  isSolid(px: number, py: number): boolean {
    const gx = Math.floor(px / TILE_SIZE);
    const gy = Math.floor(py / TILE_SIZE);
    if (gx < 0 || gx >= WORLD_WIDTH || gy < 0 || gy >= WORLD_HEIGHT) return false;
    
    const type = this.grid[gx][gy];
    // Can walk through leaves
    if (type === BLOCK_LEAVES) return false; 
    return type !== BLOCK_AIR;
  }
}