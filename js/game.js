// ============================================================
// Happy Feet — Canvas rewrite
// One file, no classes, just vibes
// ============================================================

(function () {
  'use strict';

  // --- Config ---
  const IS_MOBILE = window.innerWidth < 768;
  const GAME_H = Math.floor(window.innerHeight * 0.88);
  const GAME_W = Math.floor(GAME_H * (5 / 6));
  const SCALE = GAME_W / 375;

  const COLS = 5;
  const COL_W = Math.floor(GAME_W / COLS);

  const ENEMY_W = Math.floor(65 * SCALE * (IS_MOBILE ? 0.75 : 1));
  const ENEMY_H = Math.floor(70 * SCALE * (IS_MOBILE ? 0.75 : 1));
  const MAX_ENEMIES = 5;

  const PLAYER_W = Math.floor((IS_MOBILE ? 60 : 75) * SCALE);
  const PLAYER_H = Math.floor((IS_MOBILE ? 44 : 54) * SCALE);
  const PLAYER_Y = GAME_H - PLAYER_H - Math.floor(90 * SCALE);
  const HIT_PADDING = Math.floor(15 * SCALE);

  const FONT_SIZE_TITLE = Math.floor(28 * SCALE * (IS_MOBILE ? 0.7 : 1));
  const FONT_SIZE_SCORE = Math.floor(12 * SCALE * (IS_MOBILE ? 0.7 : 1));

  // --- Canvas setup ---
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  canvas.width = GAME_W;
  canvas.height = GAME_H;
  const wrapper = document.getElementById('game-wrapper');
  wrapper.style.width = GAME_W + 'px';
  wrapper.style.height = GAME_H + 'px';

  // --- Player element (DOM img so GIF animates) ---
  const playerEl = document.createElement('img');
  playerEl.id = 'player-sprite';
  playerEl.src = 'images/penguinmove.gif';
  playerEl.style.position = 'absolute';
  playerEl.style.width = PLAYER_W + 'px';
  playerEl.style.height = 'auto'; // preserve aspect ratio
  playerEl.style.zIndex = '10';
  playerEl.style.pointerEvents = 'none';
  wrapper.appendChild(playerEl);

  // --- Load images ---
  const imgBg = new Image();
  imgBg.src = 'images/snowscape.png';

  const imgPlayerHit = new Image();
  imgPlayerHit.src = 'images/penguinpowpow.png';

  const imgEnemy = new Image();
  imgEnemy.src = 'images/cube.png';

  // --- Audio helpers ---
  function playSound(id) {
    const a = document.getElementById(id);
    if (a) { a.currentTime = 0; a.play().catch(() => {}); }
  }

  // --- Game state ---
  let state = 'menu'; // menu | instructions | countdown | playing | dead
  let player = { col: 2, x: 0 };
  let enemies = [];
  let snow = [];
  let score = 0;
  let hiScore = 0;
  let gameStartTime = 0;
  let countdownEnd = 0;
  let animId = null;

  // Snow config
  const SNOW_MIN = 30;
  const SNOW_MAX = 400;
  const SNOW_RAMP = 6000;
  const SNOW_BLIZZARD_RAMP = 9000;

  function initSnow() {
    snow = [];
    for (let i = 0; i < SNOW_MIN; i++) {
      snow.push(makeFlake(true));
    }
  }

  function makeFlake(randomY) {
    const weight = Math.random() * 6 + 1;
    return {
      x: Math.random() * GAME_W,
      y: randomY ? Math.random() * GAME_H : -weight,
      a: Math.random() * Math.PI,
      aStep: 0.01,
      r: Math.random() * 1.5,
      weight,
      alpha: Math.min(weight / 7 + 0.2, 1),
      baseSpeed: weight / 7
    };
  }

  function updateSnow() {
    const elapsed = Date.now() - gameStartTime;
    const intensity = Math.min(elapsed / SNOW_RAMP, 1);
    const blizzard = Math.min(Math.max(0, elapsed - SNOW_RAMP) / SNOW_BLIZZARD_RAMP, 1);
    const progress = intensity * 0.5 + blizzard * 0.5;

    const speedMult = 0.5 + (8 - 0.5) * progress;
    const targetCount = Math.floor(SNOW_MIN + (SNOW_MAX - SNOW_MIN) * progress);

    while (snow.length < targetCount) snow.push(makeFlake(false));

    ctx.globalAlpha = intensity;
    for (let i = 0; i < snow.length; i++) {
      const f = snow[i];
      f.x += Math.cos(f.a) * f.r;
      f.a += f.aStep;
      f.y += f.baseSpeed * speedMult;

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.weight, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${f.alpha})`;
      ctx.fill();

      if (f.y >= GAME_H) {
        f.y = -f.weight;
        f.x = Math.random() * GAME_W;
      }
    }
    ctx.globalAlpha = 1;
  }

  // --- Player helpers ---
  function playerX() {
    return player.col * COL_W;
  }

  function moveLeft() {
    if (state === 'menu' || state === 'dead') return;
    if (player.col > 0) player.col--;
    playSound('audio-move');
  }

  function moveRight() {
    if (state === 'menu' || state === 'dead') return;
    if (player.col < COLS - 1) player.col++;
    playSound('audio-move');
  }

  // --- Enemy helpers ---
  function spawnEnemy() {
    // Pick a column not already occupied near the top
    const taken = new Set(enemies.filter(e => e.y < ENEMY_H * 2).map(e => e.col));
    let col;
    let tries = 0;
    do {
      col = Math.floor(Math.random() * COLS);
      tries++;
    } while (taken.has(col) && tries < 20);

    enemies.push({
      col,
      x: col * COL_W + (COL_W - ENEMY_W) / 2,
      y: -(ENEMY_H + Math.random() * ENEMY_H * 2),
      speed: Math.random() * 3 + 3
    });
  }

  function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies[i].y += enemies[i].speed;
      if (enemies[i].y > GAME_H) {
        enemies.splice(i, 1);
      }
    }
    while (enemies.length < MAX_ENEMIES) {
      spawnEnemy();
    }
  }

  // --- Collision ---
  function checkCollision() {
    const px = playerX() + HIT_PADDING;
    const pr = playerX() + PLAYER_W - HIT_PADDING;
    const pt = PLAYER_Y + HIT_PADDING;
    const pb = PLAYER_Y + PLAYER_H;

    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      const ex = e.x + HIT_PADDING;
      const er = e.x + ENEMY_W - HIT_PADDING;
      const et = e.y + HIT_PADDING;
      const eb = e.y + ENEMY_H - HIT_PADDING;

      if (er > px && ex < pr && eb > pt && et < pb) {
        return true;
      }
    }
    return false;
  }

  // --- Drawing ---
  function draw() {
    ctx.clearRect(0, 0, GAME_W, GAME_H);

    // Background
    ctx.drawImage(imgBg, 0, 0, GAME_W, GAME_H);

    // Enemies (cube.png is square, draw as square using ENEMY_W)
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      ctx.drawImage(imgEnemy, e.x, e.y, ENEMY_W, ENEMY_W);
    }

    // Snow (draws on top of enemies, below UI)
    if (state === 'playing') updateSnow();

    // Player (DOM element for GIF animation)
    const px = playerX() + (COL_W - PLAYER_W) / 2;
    playerEl.style.left = px + 'px';
    playerEl.style.top = PLAYER_Y + 'px';
    if (state === 'dead') {
      playerEl.src = 'images/penguinpowpow.png';
    } else if (playerEl.src.indexOf('penguinmove') === -1) {
      playerEl.src = 'images/penguinmove.gif';
    }

    // Bottom cover (hides enemies going off-screen)
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, GAME_H - 4, GAME_W, 4);

    // Title banner
    ctx.fillStyle = '#568FB0';
    const bannerH = Math.floor(45 * SCALE);
    ctx.fillRect(0, 0, GAME_W, bannerH);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = Math.floor(3 * SCALE);
    ctx.strokeRect(0, 0, GAME_W, bannerH);
    ctx.fillStyle = 'white';
    ctx.font = `800 ${FONT_SIZE_TITLE}px 'Work Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('HAPPY FEET!', GAME_W / 2, bannerH * 0.7);

    // Scores
    if (state === 'playing' || state === 'dead') {
      ctx.textAlign = 'left';
      ctx.font = `${IS_MOBILE ? 600 : 700} ${FONT_SIZE_SCORE}px 'Work Sans', sans-serif`;
      const scoreY = bannerH + Math.floor(20 * SCALE);
      ctx.fillStyle = '#568FB0';
      ctx.fillRect(Math.floor(5 * SCALE), scoreY - FONT_SIZE_SCORE, Math.floor(120 * SCALE), Math.floor(FONT_SIZE_SCORE * 2.8));
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(Math.floor(5 * SCALE), scoreY - FONT_SIZE_SCORE, Math.floor(120 * SCALE), Math.floor(FONT_SIZE_SCORE * 2.8));
      ctx.fillStyle = 'white';
      ctx.fillText(`SCORE: ${score}`, Math.floor(10 * SCALE), scoreY);
      ctx.fillText(`HIGHSCORE: ${hiScore}`, Math.floor(10 * SCALE), scoreY + FONT_SIZE_SCORE + 4);
    }
  }

  // --- Game loop ---
  function loop() {
    if (state === 'playing') {
      score = Date.now() - gameStartTime;
      if (score > hiScore) hiScore = score;

      updateEnemies();

      if (checkCollision()) {
        die();
        draw();
        return;
      }
    }

    draw();

    if (state === 'countdown') {
      // Draw countdown text
      const remaining = Math.ceil((countdownEnd - Date.now()) / 1000);
      if (remaining <= 0) {
        state = 'playing';
        gameStartTime = Date.now();
        initSnow();
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, 0, GAME_W, GAME_H);
        ctx.fillStyle = 'white';
        ctx.font = `800 ${Math.floor(60 * SCALE)}px 'Work Sans', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(remaining, GAME_W / 2, GAME_H / 2);
      }
    }

    animId = requestAnimationFrame(loop);
  }

  // --- State transitions ---
  function startGame() {
    playSound('audio-theme');
    const popup = document.getElementById('popup');
    const popupText = document.getElementById('popup-text');
    const popupBtn = document.getElementById('popup-btn');

    // Show instructions
    popupBtn.classList.add('hidden');
    if (IS_MOBILE || 'ontouchstart' in window) {
      popupText.innerHTML = "Tap left or right<br>to dodge the blocks!<br><br>Beat your highscore!";
    } else {
      popupText.innerHTML = "Use \u2190 and \u2192 arrows<br>to avoid the blocks!<br><br>Beat your highscore!";
    }

    // Allow movement during instructions — start rendering
    state = 'instructions';
    resetGameState();
    if (!animId) loop();

    setTimeout(() => {
      popup.classList.add('hidden');
      state = 'countdown';
      countdownEnd = Date.now() + 3000;
    }, 4000);
  }

  function resetGameState() {
    player.col = 2;
    enemies = [];
    snow = [];
    score = 0;
    playerEl.src = 'images/penguinmove.gif';
  }

  function die() {
    state = 'dead';
    playSound('audio-hit');
    cancelAnimationFrame(animId);
    animId = null;

    const popup = document.getElementById('popup');
    const popupText = document.getElementById('popup-text');
    const popupBtn = document.getElementById('popup-btn');

    popupText.textContent = 'Try Again!';
    popupBtn.textContent = 'Reload';
    popupBtn.classList.remove('hidden');
    popup.classList.remove('hidden');
  }

  function restart() {
    const popup = document.getElementById('popup');
    popup.classList.add('hidden');
    resetGameState();
    state = 'countdown';
    countdownEnd = Date.now() + 3000;
    loop();
  }

  // --- Input ---
  document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') moveLeft();
    if (e.code === 'ArrowRight') moveRight();
  });

  document.addEventListener('touchstart', (e) => {
    if (state === 'menu' || state === 'dead') return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const tapX = touch.clientX - rect.left;
    if (tapX < rect.width / 2) moveLeft();
    else moveRight();
  }, { passive: false });

  // --- UI wiring ---
  const popupBtn = document.getElementById('popup-btn');
  popupBtn.addEventListener('click', () => {
    if (state === 'menu') {
      startGame();
    } else if (state === 'dead') {
      restart();
    }
  });

  // Play opening sound
  playSound('audio-opening');

  // Resize: just reload — canvas games need to recalculate all constants,
  // and since everything is derived from viewport height at the top of this
  // IIFE, a reload is the cleanest approach for a game this size.
  // Debounced so it doesn't fire repeatedly while dragging.
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => window.location.reload(), 400);
  });

  // Initial draw so screen isn't blank
  imgBg.onload = () => draw();

})();
