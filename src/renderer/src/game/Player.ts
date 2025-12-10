import { Container, Graphics } from 'pixi.js';
import { GRAVITY, JUMP_FORCE, MOVE_SPEED, MAX_SPEED, FRICTION, PLAYER_MAX_HP } from './constants';
import { World } from './World';

export class Player {
  public container: Container;
  public vx: number = 0;
  public vy: number = 0;
  public width: number = 20;
  public height: number = 40;
  public hp: number = PLAYER_MAX_HP;
  public invulnerable: number = 0; // Frames

  private keys: { [key: string]: boolean } = {};
  private graphics: Graphics;

  constructor() {
    this.container = new Container();
    this.graphics = new Graphics();
    this.graphics.rect(0, 0, this.width, this.height);
    this.graphics.fill(0x00A0FF); // Blue Player
    this.container.addChild(this.graphics);

    window.addEventListener('keydown', (e) => this.keys[e.code] = true);
    window.addEventListener('keyup', (e) => this.keys[e.code] = false);
  }

  damage(amount: number, knockbackDir: number) {
    if (this.invulnerable > 0) return;
    
    this.hp -= amount;
    this.invulnerable = 60; // 1 Second iframe
    
    // Knockback
    this.vx = knockbackDir * 10;
    this.vy = -5;
    
    // Visual Red Flash
    this.graphics.tint = 0xFF0000;
  }

  update(world: World): void {
    // Handle I-Frames color
    if (this.invulnerable > 0) {
        this.invulnerable--;
        if (this.invulnerable % 10 < 5) this.graphics.tint = 0xFF0000;
        else this.graphics.tint = 0xFFFFFF;
    } else {
        this.graphics.tint = 0xFFFFFF; // Reset color
    }

    // 1. Horizontal Input (Only if not being knocked back hard)
    if (Math.abs(this.vx) < 8) { 
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) this.vx -= MOVE_SPEED;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) this.vx += MOVE_SPEED;
        
        this.vx = Math.max(Math.min(this.vx, MAX_SPEED), -MAX_SPEED);
        this.vx *= FRICTION;
    } else {
        // Air drag when knocked back
        this.vx *= 0.95;
    }

    if (Math.abs(this.vx) < 0.1) this.vx = 0;

    this.container.x += this.vx;
    if (this.checkCollision(world)) {
      this.container.x -= this.vx;
      this.vx = 0;
    }

    // 2. Vertical
    this.vy += GRAVITY;
    this.container.y += this.vy;

    if (this.checkCollision(world)) {
      this.container.y -= this.vy;
      if (this.vy > 0) { 
        this.vy = 0;
        if (this.keys['Space'] || this.keys['ArrowUp']) this.vy = JUMP_FORCE;
      } else { 
        this.vy = 0;
      }
    }
  }

  checkCollision(world: World): boolean {
    const x = this.container.x;
    const y = this.container.y;
    return (
      world.isSolid(x, y) ||
      world.isSolid(x + this.width, y) ||
      world.isSolid(x, y + this.height) ||
      world.isSolid(x + this.width, y + this.height)
    );
  }
}