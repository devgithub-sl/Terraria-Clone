export class Perlin {
  private p: number[] = [];
  
  constructor(seed: number = Math.random()) {
    this.reseed(seed);
  }

  reseed(seed: number) {
    this.p = new Array(512);
    const permutation = new Array(256).fill(0).map((_, i) => i);
    
    // Shuffle based on seed
    let currentIndex = permutation.length, randomIndex;
    
    // Simple seeded random
    const random = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    while (currentIndex != 0) {
      randomIndex = Math.floor(random() * currentIndex);
      currentIndex--;
      [permutation[currentIndex], permutation[randomIndex]] = [
        permutation[randomIndex], permutation[currentIndex]];
    }

    for (let i = 0; i < 256; i++) this.p[256 + i] = this.p[i] = permutation[i];
  }

  noise(x: number, y: number, z: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);
    const A = this.p[X] + Y, AA = this.p[A] + Z, AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y, BA = this.p[B] + Z, BB = this.p[B + 1] + Z;

    return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z),
      this.grad(this.p[BA], x - 1, y, z)),
      this.lerp(u, this.grad(this.p[AB], x, y - 1, z),
        this.grad(this.p[BB], x - 1, y - 1, z))),
      this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1),
        this.grad(this.p[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1),
          this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
  }

  fade(t: number): number { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(t: number, a: number, b: number): number { return a + t * (b - a); }
  grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
}