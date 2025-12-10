import { Application, Container, Graphics } from 'pixi.js';
import { World } from './World';
import { Player } from './Player';
import { TILE_SIZE, BLOCK_AIR, BLOCK_DIRT, BLOCK_STONE, BLOCK_LAVA } from './constants';

export class Game {
  public app: Application;
  public world!: World;
  public player!: Player;
  private stageContainer: Container;
  
  // Interaction
  private cursor: Graphics;
  private particleLayer: Graphics;
  public currentBlockType: number = BLOCK_DIRT; // Default tool

  // Time
  private time: number = 0;

  constructor() {
    this.app = new Application();
    this.stageContainer = new Container();
    this.cursor = new Graphics();
    this.particleLayer = new Graphics();
  }

  async init(element: HTMLElement): Promise<void> {
    await this.app.init({ 
      background: '#87CEEB', 
      resizeTo: window,
      preference: 'webgl', 
    });
    element.appendChild(this.app.canvas);

    this.world = new World();
    this.player = new Player();

    // Layers: World -> Particles -> Player -> Cursor
    this.stageContainer.addChild(this.world.container);
    this.stageContainer.addChild(this.particleLayer);
    this.stageContainer.addChild(this.player.container);
    
    // Cursor Setup
    this.cursor.rect(0,0, TILE_SIZE, TILE_SIZE);
    this.cursor.stroke({ width: 2, color: 0xFFFF00 });
    this.stageContainer.addChild(this.cursor);

    this.app.stage.addChild(this.stageContainer);
    this.setupInputs();

    this.app.ticker.add(() => this.update());
  }

  setupInputs(): void {
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;

    // Mouse Interaction
    this.app.stage.on('pointerdown', (event) => {
      const worldX = event.global.x - this.stageContainer.x;
      const worldY = event.global.y - this.stageContainer.y;

      if (event.button === 0) {
        // Mine
        this.world.setBlock(worldX, worldY, BLOCK_AIR);
      } else if (event.button === 2) {
        // Build with selected block
        this.world.setBlock(worldX, worldY, this.currentBlockType);
      }
    });

    // Keyboard (Block Switching)
    window.addEventListener('keydown', (e) => {
      if (e.key === '1') this.currentBlockType = BLOCK_DIRT;
      if (e.key === '2') this.currentBlockType = BLOCK_STONE;
      if (e.key === '3') this.currentBlockType = BLOCK_LAVA;
    });
  }

  update(): void {
    // 1. Logic
    this.player.update(this.world);
    
    // 2. Day/Night Cycle (Simple Sine wave)
    this.time += 0.002;
    const brightness = (Math.sin(this.time) + 1) / 2; // 0 to 1
    // Interpolate Sky Color (Blue to Dark Blue)
    const r = Math.floor(135 * brightness);
    const g = Math.floor(206 * brightness);
    const b = Math.floor(235 * (0.5 + brightness/2));
    this.app.renderer.background.color = `rgb(${r},${g},${b})`;

    // 3. Render Particles
    this.world.renderParticles(this.particleLayer);

    // 4. Camera
    const cw = this.app.screen.width / 2;
    const ch = this.app.screen.height / 2;
    // Smooth lerp for camera
    const targetX = cw - this.player.container.x;
    const targetY = ch - this.player.container.y;
    
    this.stageContainer.x += (targetX - this.stageContainer.x) * 0.1;
    this.stageContainer.y += (targetY - this.stageContainer.y) * 0.1;

    // 5. Cursor
    const mousePos = this.stageContainer.toLocal(this.app.renderer.events.pointer);
    this.cursor.x = Math.floor(mousePos.x / TILE_SIZE) * TILE_SIZE;
    this.cursor.y = Math.floor(mousePos.y / TILE_SIZE) * TILE_SIZE;
  }

  destroy(): void {
    this.app.destroy(true, { children: true });
  }
}