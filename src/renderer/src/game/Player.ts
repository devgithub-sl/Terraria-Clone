import { Container, Graphics } from 'pixi.js';
import { GRAVITY, JUMP_FORCE, MOVE_SPEED, MAX_SPEED, FRICTION } from './constants';
import { World } from './World';

export class Player {
  public container: Container;
  public vx: number = 0;
  public vy: number = 0;
  public width: number = 20;
  public height: number = 40;
  private keys: { [key: string]: boolean } = {};

  constructor() {
    this.container = new Container();
    const graphics = new Graphics();
    graphics.rect(0, 0, this.width, this.height);
    graphics.fill(0x00A0FF); // Brighter Blue
    this.container.addChild(graphics);

    this.container.x = 200;
    this.container.y = 200;

    window.addEventListener('keydown', (e) => this.keys[e.code] = true);
    window.addEventListener('keyup', (e) => this.keys[e.code] = false);
  }

  update(world: World): void {
    // 1. Horizontal Physics (Acceleration + Friction)
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
      this.vx -= MOVE_SPEED;
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      this.vx += MOVE_SPEED;
    }

    // Clamp speed
    this.vx = Math.max(Math.min(this.vx, MAX_SPEED), -MAX_SPEED);
    
    // Apply Friction (slow down if no keys pressed)
    this.vx *= FRICTION;
    
    // Stop completely if very slow
    if (Math.abs(this.vx) < 0.1) this.vx = 0;

    // Move X
    this.container.x += this.vx;
    if (this.checkCollision(world)) {
      this.container.x -= this.vx;
      this.vx = 0; // Bonk
    }

    // 2. Vertical Physics
    this.vy += GRAVITY;
    this.container.y += this.vy;

    if (this.checkCollision(world)) {
      this.container.y -= this.vy;
      
      if (this.vy > 0) { // Landed
        this.vy = 0;
        if (this.keys['Space'] || this.keys['ArrowUp']) {
          this.vy = JUMP_FORCE;
        }
      } else { // Hit Head
        this.vy = 0;
      }
    }
    
    // Check World Bounds (Don't fall off edge)
    if (this.container.y > 3000) {
        this.container.x = 200;
        this.container.y = 200;
        this.vx = 0;
        this.vy = 0;
    }
  }

  checkCollision(world: World): boolean {
    const x = this.container.x;
    const y = this.container.y;
    // Check feet, head, left, right
    return (
      world.isSolid(x, y) ||
      world.isSolid(x + this.width, y) ||
      world.isSolid(x, y + this.height) ||
      world.isSolid(x + this.width, y + this.height)
    );
  }
}