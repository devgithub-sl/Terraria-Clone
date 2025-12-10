import { Container, Graphics } from 'pixi.js';
import { GRAVITY, TILE_SIZE } from './constants';
import { World } from './World';

export class Enemy {
  public container: Container;
  public vx: number = 0;
  public vy: number = 0;
  public hp: number = 3;
  public dead: boolean = false;
  
  private speed = 1.5;
  private graphics: Graphics;

  constructor(x: number, y: number) {
    this.container = new Container();
    this.graphics = new Graphics();
    this.graphics.rect(0, 0, TILE_SIZE, TILE_SIZE);
    this.graphics.fill(0xFF0000); // Red Slime
    this.container.addChild(this.graphics);
    
    this.container.x = x;
    this.container.y = y;
  }

  takeDamage(amount: number) {
    this.hp -= amount;
    // Visual Flash
    this.graphics.alpha = 0.5;
    setTimeout(() => this.graphics.alpha = 1, 100);

    if (this.hp <= 0) {
        this.dead = true;
        this.container.visible = false; // Hide
    }
  }

  update(world: World, playerX: number, playerY: number) {
    if (this.dead) return;

    // AI: Chase Player
    const dx = playerX - this.container.x;
    const dist = Math.sqrt(dx*dx + (playerY - this.container.y)**2);

    if (dist < 400) {
      if (dx > 10) this.vx = this.speed;
      else if (dx < -10) this.vx = -this.speed;
      else this.vx = 0;
    } else {
        this.vx = 0;
    }

    // Physics: Gravity
    this.vy += GRAVITY;
    
    // Move X
    this.container.x += this.vx;
    if (this.checkCollision(world)) {
      this.container.x -= this.vx;
      // Jump if hit wall (Auto-Jump)
      if (this.vy === 0) this.vy = -9; 
    }

    // Move Y
    this.container.y += this.vy;
    if (this.checkCollision(world)) {
      this.container.y -= this.vy;
      this.vy = 0;
    }
  }

  checkCollision(world: World): boolean {
    // Check center point for smoother movement
    return world.isSolid(this.container.x + 16, this.container.y + 16);
  }
}