import { Container, Graphics } from 'pixi.js';
import { 
  TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH, COLORS, 
  BLOCK_AIR, BLOCK_DIRT, BLOCK_GRASS, BLOCK_STONE, BLOCK_LAVA 
} from './constants';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: number;
}

export class World {
  public container: Container;
  public grid: number[][];
  private graphics: Graphics; 
  private particles: Particle[] = [];

  constructor() {
    this.container = new Container();
    this.grid = [];
    this.graphics = new Graphics();
    this.container.addChild(this.graphics);
    this.generate();
    this.render();
  }

  generate(): void {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      this.grid[x] = [];
      for (let y = 0; y < WORLD_HEIGHT; y++) {
        // Procedural Generation
        if (y < 20) {
          this.grid[x][y] = BLOCK_AIR;
        } else if (y === 20) {
          this.grid[x][y] = BLOCK_GRASS;
        } else if (y > 45) {
          // Deep underground = Lava & Stone
          const rand = Math.random();
          if (rand > 0.8) this.grid[x][y] = BLOCK_LAVA;
          else if (rand > 0.4) this.grid[x][y] = BLOCK_STONE;
          else this.grid[x][y] = BLOCK_DIRT;
        } else {
          // Standard Dirt & Caves
          if (Math.random() > 0.9) this.grid[x][y] = BLOCK_AIR; // Caves
          else if (Math.random() > 0.9) this.grid[x][y] = BLOCK_STONE; // Ores
          else this.grid[x][y] = BLOCK_DIRT;
        }
      }
    }
  }

  // Called every frame to animate particles
  update(): void {
    if (this.particles.length === 0) return;

    // Draw Particles on top of the world
    // Note: In a big game, use a separate container for particles.
    // Here we redraw particles into the same graphics context for simplicity.
    
    // We don't clear() here because we want the blocks to stay.
    // Instead, we just keep adding "temp" draws or, for performance,
    // we should re-render the whole scene or use a separate Graphics for dynamic stuff.
    // For this MVP, let's use a separate method or just accept the dirty rectangle.
  }

  // Separate render for dynamic elements (Particles)
  renderParticles(g: Graphics): void {
    g.clear(); // clear ONLY the particle layer
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // Gravity
      p.life--;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Draw particle
      g.rect(p.x, p.y, 4, 4);
      g.fill(p.color);
    }
  }

  render(): void {
    this.graphics.clear();
    for (let x = 0; x < WORLD_WIDTH; x++) {
      for (let y = 0; y < WORLD_HEIGHT; y++) {
        const type = this.grid[x][y];
        if (type === BLOCK_AIR) continue;
        
        const color = COLORS[type] || 0xFFFFFF;
        this.graphics.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        this.graphics.fill(color);
      }
    }
  }

  setBlock(pixelX: number, pixelY: number, type: number): void {
    const gridX = Math.floor(pixelX / TILE_SIZE);
    const gridY = Math.floor(pixelY / TILE_SIZE);

    if (gridX < 0 || gridX >= WORLD_WIDTH || gridY < 0 || gridY >= WORLD_HEIGHT) return;

    const oldType = this.grid[gridX][gridY];
    
    // JUICE: If destroying a block (setting to AIR), spawn particles!
    if (type === BLOCK_AIR && oldType !== BLOCK_AIR) {
      this.spawnParticles(pixelX, pixelY, COLORS[oldType]);
    }

    this.grid[gridX][gridY] = type;

    // Quick visual patch (redraw just this block)
    // To properly clear the old block, we redraw the "Sky" if it's air
    // or the new color.
    if (type === BLOCK_AIR) {
       // Ideally trigger full re-render or draw background color. 
       // For MVP, we will rely on the main loop re-rendering or just leave a gap.
       // Let's trigger a full render for correctness (it's fast enough for this size)
       this.render();
    } else {
      this.graphics.rect(gridX * TILE_SIZE, gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      this.graphics.fill(COLORS[type]);
    }
  }

  spawnParticles(x: number, y: number, color: number) : void {
    // Snap to center of tile
    const cx = Math.floor(x / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
    const cy = Math.floor(y / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;

    for(let i=0; i<8; i++) {
      this.particles.push({
        x: cx,
        y: cy,
        vx: (Math.random() - 0.5) * 8, // Explode outward
        vy: (Math.random() - 0.5) * 8,
        life: 30 + Math.random() * 20, // Frames to live
        color: color
      });
    }
  }

  isSolid(pixelX: number, pixelY: number): boolean {
    const gridX = Math.floor(pixelX / TILE_SIZE);
    const gridY = Math.floor(pixelY / TILE_SIZE);
    if (gridX < 0 || gridX >= WORLD_WIDTH || gridY < 0 || gridY >= WORLD_HEIGHT) return false;
    
    // Lava is not solid (you can walk through it, but maybe take damage?)
    // For now, let's make Lava liquid (non-solid)
    if (this.grid[gridX][gridY] === BLOCK_LAVA) return false;

    return this.grid[gridX][gridY] !== BLOCK_AIR;
  }
}