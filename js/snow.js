// Snow particle system
// Starts invisible and slow, gradually fades in and speeds up over time
class Snow {
  constructor(root) {
    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('snow');
    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '50';
    this.canvas.style.opacity = '0';
    root.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.flakes = [];
    this.startTime = null;
    this.running = false;

    // Intensity ramps from 0 to 1 over this duration (ms)
    this.rampDuration = 6000;

    // After full intensity, keep ramping density/speed
    this.blizzardRampDuration = 9000;

    // Flake count bounds
    this.minFlakes = 30;
    this.maxFlakes = 500;

    // Speed bounds
    this.minSpeed = 0.5;
    this.maxSpeed = 8.0;

    this._initFlakes(this.minFlakes);
  }

  _initFlakes(count) {
    this.flakes = [];
    for (let i = 0; i < count; i++) {
      this.flakes.push(this._createFlake(true));
    }
  }

  _createFlake(randomY) {
    const maxWeight = 7;
    const weight = Math.random() * (maxWeight - 1) + 1;
    return {
      x: Math.random() * GAME_WIDTH,
      y: randomY ? Math.random() * GAME_HEIGHT : -weight,
      r: Math.random() * 1.5,
      a: Math.random() * Math.PI,
      aStep: 0.01,
      weight: weight,
      alpha: Math.min((weight / maxWeight) + 0.2, 1),
      baseSpeed: (weight / maxWeight)
    };
  }

  _getIntensity() {
    if (!this.startTime) return 0;
    const elapsed = Date.now() - this.startTime;
    return Math.min(elapsed / this.rampDuration, 1);
  }

  _getBlizzardProgress() {
    if (!this.startTime) return 0;
    const elapsed = Date.now() - this.startTime;
    const blizzardElapsed = Math.max(0, elapsed - this.rampDuration);
    return Math.min(blizzardElapsed / this.blizzardRampDuration, 1);
  }

  start() {
    this.startTime = Date.now();
    this._initFlakes(this.minFlakes);
    this.canvas.style.opacity = '0';
    this.running = true;
  }

  stop() {
    this.running = false;
    this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.canvas.style.opacity = '0';
  }

  reset() {
    this.stop();
  }

  // Called once per frame from the game loop
  render() {
    if (!this.running) return;

    const intensity = this._getIntensity();
    const blizzard = this._getBlizzardProgress();

    this.canvas.style.opacity = String(intensity);

    const totalProgress = intensity * 0.5 + blizzard * 0.5;
    const currentSpeedMult = this.minSpeed + (this.maxSpeed - this.minSpeed) * totalProgress;
    const targetFlakes = Math.floor(this.minFlakes + (this.maxFlakes - this.minFlakes) * totalProgress);

    while (this.flakes.length < targetFlakes) {
      this.flakes.push(this._createFlake(false));
    }

    this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    for (let i = 0; i < this.flakes.length; i++) {
      const f = this.flakes[i];

      f.x += Math.cos(f.a) * f.r;
      f.a += f.aStep;
      f.y += f.baseSpeed * currentSpeedMult;

      this.ctx.beginPath();
      this.ctx.arc(f.x, f.y, f.weight, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = 'rgba(255, 255, 255, ' + f.alpha + ')';
      this.ctx.fill();

      if (f.y >= GAME_HEIGHT) {
        f.y = -f.weight;
        f.x = Math.random() * GAME_WIDTH;
      }
    }
  }
}
