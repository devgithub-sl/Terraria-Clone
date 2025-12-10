import { Application, Container, Graphics } from 'pixi.js';
import { World } from './World';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { TILE_SIZE, BLOCK_AIR, BLOCK_HEALTH, ENEMY_DAMAGE, ENEMY_KNOCKBACK } from './constants';

export class Game {
  public app: Application;
  public world!: World;
  public player!: Player;
  public enemies: Enemy[] = [];
  
  private stageContainer: Container;
  private cursor: Graphics;
  private miningOverlay: Graphics;
  
  public isPaused: boolean = true;
  private miningTarget: { x: number, y: number } | null = null;
  private miningProgress: number = 0;

  constructor() {
    this.app = new Application();
    this.stageContainer = new Container();
    this.cursor = new Graphics();
    this.miningOverlay = new Graphics();
  }

  async init(element: HTMLElement) {
    await this.app.init({ background: '#87CEEB', resizeTo: window, preference: 'webgl' });
    element.appendChild(this.app.canvas);
    this.restart(Math.random());
    this.setupInputs();
    this.app.ticker.add(() => this.loop());
  }

  restart(seed: number) {
    this.stageContainer.removeChildren();
    this.enemies = [];

    this.world = new World(seed);
    this.player = new Player();
    
    // Spawn Player safely
    const startX = 200;
    const startY = (this.world.getSurfaceHeight(Math.floor(startX/TILE_SIZE)) * TILE_SIZE) - 100;
    this.player.container.x = startX;
    this.player.container.y = startY;

    // Spawn Enemies safely on surface
    for(let i=0; i<8; i++) {
        const ex = Math.random() * (this.world.grid.length * TILE_SIZE);
        // Calculate ground height at this X
        const gridX = Math.floor(ex / TILE_SIZE);
        const gridY = this.world.getSurfaceHeight(gridX);
        
        // Spawn 50px above ground
        const ey = (gridY * TILE_SIZE) - 50; 
        
        this.enemies.push(new Enemy(ex, ey));
    }

    this.stageContainer.addChild(this.world.container);
    this.enemies.forEach(e => this.stageContainer.addChild(e.container));
    this.stageContainer.addChild(this.player.container);
    this.stageContainer.addChild(this.miningOverlay);
    this.stageContainer.addChild(this.cursor);
    this.app.stage.addChild(this.stageContainer);

    this.cursor.rect(0,0, TILE_SIZE, TILE_SIZE);
    this.cursor.stroke({ width: 2, color: 0xFFFF00 });
  }

  setupInputs() {
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;

    this.app.stage.on('pointerdown', (e) => {
        if (this.isPaused) return;
        const wx = e.global.x - this.stageContainer.x;
        const wy = e.global.y - this.stageContainer.y;
        
        // COMBAT: Click to Attack Enemy
        let hitEnemy = false;
        this.enemies.forEach(en => {
            if (en.dead) return;
            const bounds = en.container.getBounds(); // Global bounds
            if (e.global.x > bounds.x && e.global.x < bounds.x + bounds.width &&
                e.global.y > bounds.y && e.global.y < bounds.y + bounds.height) {
                    
                // Check distance (Melee Range = 150px)
                const dist = Math.sqrt((this.player.container.x - en.container.x)**2 + (this.player.container.y - en.container.y)**2);
                if (dist < 150) {
                    en.takeDamage(1);
                    // Knockback enemy
                    en.vx = (en.container.x - this.player.container.x) > 0 ? 5 : -5;
                    en.vy = -5;
                    hitEnemy = true;
                }
            }
        });

        if (hitEnemy) return; // Don't mine if we attacked

        // MINING Logic
        if (e.button === 0) {
            const gx = Math.floor(wx / TILE_SIZE);
            const gy = Math.floor(wy / TILE_SIZE);
            this.miningTarget = { x: gx, y: gy };
            this.miningProgress = 0;
        }
    });

    this.app.stage.on('pointerup', () => {
        this.miningTarget = null;
        this.miningOverlay.clear();
    });
  }

  loop() {
    if (this.isPaused) return;

    this.player.update(this.world);
    
    // Update Enemies & Check Collision
    this.enemies.forEach(e => {
        e.update(this.world, this.player.container.x, this.player.container.y);
        
        // Player vs Enemy Collision
        if (!e.dead && !this.player.invulnerable) {
            // Simple AABB
            if (this.player.container.x < e.container.x + TILE_SIZE &&
                this.player.container.x + 20 > e.container.x &&
                this.player.container.y < e.container.y + TILE_SIZE &&
                this.player.container.y + 40 > e.container.y) {
                    
                // Hit!
                const dir = this.player.container.x < e.container.x ? -1 : 1;
                this.player.damage(ENEMY_DAMAGE, dir);
            }
        }
    });

    // Mining
    if (this.miningTarget) {
        const { x, y } = this.miningTarget;
        if (this.world.grid[x] && this.world.grid[x][y] !== BLOCK_AIR) {
            const type = this.world.grid[x][y];
            const maxHealth = BLOCK_HEALTH[type] || 20;
            this.miningProgress++;
            
            this.miningOverlay.clear();
            const pct = this.miningProgress / maxHealth;
            this.miningOverlay.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE * pct, 5);
            this.miningOverlay.fill(0xFF0000);

            if (this.miningProgress >= maxHealth) {
                this.world.setBlock(x * TILE_SIZE, y * TILE_SIZE, BLOCK_AIR);
                this.miningTarget = null;
                this.miningOverlay.clear();
            }
        }
    }

    // Camera
    const cx = this.app.screen.width / 2 - this.player.container.x;
    const cy = this.app.screen.height / 2 - this.player.container.y;
    this.stageContainer.x += (cx - this.stageContainer.x) * 0.1;
    this.stageContainer.y += (cy - this.stageContainer.y) * 0.1;

    // Cursor
    const m = this.stageContainer.toLocal(this.app.renderer.events.pointer);
    this.cursor.x = Math.floor(m.x / TILE_SIZE) * TILE_SIZE;
    this.cursor.y = Math.floor(m.y / TILE_SIZE) * TILE_SIZE;
  }

  destroy() { this.app.destroy(true, { children: true }); }
}