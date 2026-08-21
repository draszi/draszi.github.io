  /**
-------------------------------------ASCII cool art thing --------------------------------------------
    How this works basically :
    1. Fill the screen with a monospace text grid
    2. On cursor move, emit expanding ring "waves"
    3. Each frame, check every cell: if inside a wave's ring, scramble it
    4. Intensity (0->1) drives which char is picked from a light->heavy palette
    5. A per-cell hash threshold dithers the edges so they look textured
    6. One DOM write per frame
  */

  // const cfg = {
  //   dur:       2050,
  //   speed:     670,
  //   bandWidth: 268,
  //   shrink:    2.5,
  //   trail:     2.2,
  //   noise:     4,
  //   chars:     '.,·-─~+:;=*π┐┌┘╔╝║╚!?1742&35$690#@8$▀▄■░▒▓',
  //   charSpeed: 76,
  //   density:   1.25,
  //   minDist:   69,
  //   maxWaves:  16,
  //   fontSize:  15,
  //   lineHeight: 1.35,
  // };

  // const EXCERPT = `ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
  // ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
  // ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
  // ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ🌙ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ
  // ㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤㅤ`;
  // const WORDS = EXCERPT.split(/\s+/);

  // /** Deterministic hash, yeah random nums */
  // function hash(x, y, z) {
  //   const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  //   return n - Math.floor(n);
  // }

  // function smoothstep(t) {
  //   return t * t * (3 - 2 * t);
  // }

  // /** Returns 0–1 intensity for how strongly a wave affects pixel (px,py). Returns -1 if outside. */
  // function getWaveIntensity(px, py, wave, now) {
  //   const age = now - wave.time;
  //   const life = 1 - age / cfg.dur;
  //   const bandHalf = (cfg.bandWidth / 2) * Math.pow(life, cfg.shrink);
  //   if (bandHalf < 0.5) return -1;

  //   const front = bandHalf;
  //   const wake = bandHalf * cfg.trail;
  //   const dx = px - wave.x;
  //   const dy = py - wave.y;
  //   const dist = Math.sqrt(dx * dx + dy * dy);
  //   const radius = (age / 1000) * cfg.speed;

  //   if (dist > radius + front + cfg.noise) return -1;
  //   if (dist < radius - wake - cfg.noise) return -1;

  //   // 3 layered sine waves make the ring wobble organically
  //   const angle = Math.atan2(dy, dx);
  //   const wobble = (
  //     Math.sin(angle * 5 + age * 0.004) * 0.45 +
  //     Math.sin(angle * 8 - age * 0.006) * 0.30 +
  //     Math.sin(angle * 13 + age * 0.002) * 0.18
  //   ) * cfg.noise;

  //   const gap = (radius + wobble) - dist;
  //   if (gap < -front || gap > wake) return -1;

  //   const t = gap < 0 ? 1 + gap / front : 1 - gap / wake;
  //   return smoothstep(t);
  // }

  // /** Maps intensity to a character in the palette. Higher intensity -> heavier glyphs. */
  // function pickChar(col, row, intensity, age, waveId) {
  //   const len = cfg.chars.length;
  //   const target = intensity * (len - 1);
  //   const seed = Math.floor(age / cfg.charSpeed) + waveId;
  //   const jitter = (hash(col, row, seed) - 0.5) * len * 0.25;
  //   return cfg.chars[Math.max(0, Math.min(len - 1, Math.round(target + jitter)))];
  // }

  // // SETUP
  // const field = document.getElementById('field');
  // const pre = document.createElement('pre');
  // pre.style.cssText = `margin:0;padding:0;font-family:inherit;font-size:${cfg.fontSize}px;line-height:${cfg.lineHeight};white-space:pre;overflow:hidden;width:100%;height:100%`;
  // field.appendChild(pre);

  // let charW, lineH, cols, rows, grid;

  // /** Measures the pixel width of one monospace character. */
  // function measure() {
  //   const span = document.createElement('span');
  //   span.style.cssText = `position:absolute;visibility:hidden;white-space:pre;font-size:${cfg.fontSize}px;font-family:inherit`;
  //   span.textContent = 'M'; // usually M is cool for measures
  //   field.appendChild(span);
  //   charW = span.getBoundingClientRect().width;
  //   span.remove();
  //   lineH = cfg.fontSize * cfg.lineHeight;
  // }

  // /** Fills the viewport with words, building a 2D character grid. */
  // function buildGrid() {
  //   measure();
  //   const rect = field.getBoundingClientRect();
  //   cols = Math.ceil(rect.width / charW) + 1;
  //   rows = Math.ceil(rect.height / lineH) + 1;
  //   grid = [];
  //   let wi = 0;
  //   for (let r = 0; r < rows; r++) {
  //     let line = '';
  //     while (line.length < cols) {
  //       if (line.length > 0) line += ' ';
  //       line += WORDS[wi % WORDS.length];
  //       wi++;
  //     }
  //     grid.push(line.substring(0, cols).split(''));
  //   }
  //   pre.textContent = grid.map(row => row.join('')).join('\n');
  // }

  // // WAVES
  // let waves = [];
  // let waveId = 0;
  // let lastX = -9999, lastY = -9999;
  // let running = false;

  // /** Spawns a wave if cursor moved far enough since the last one. */
  // function emitWave(x, y) {
  //   const dx = x - lastX, dy = y - lastY;
  //   if (dx * dx + dy * dy < cfg.minDist * cfg.minDist) return;
  //   lastX = x; lastY = y;
  //   waves.push({ x, y, time: performance.now(), id: waveId++ });
  //   if (waves.length > cfg.maxWaves) waves.shift();
  //   if (!running) { running = true; requestAnimationFrame(loop); }
  // }

  // field.addEventListener('mousemove', (e) => {
  //   const r = field.getBoundingClientRect();
  //   emitWave(e.clientX - r.left, e.clientY - r.top);
  // });
  // field.addEventListener('touchmove', (e) => {
  //   const t = e.touches[0];
  //   if (!t) return;
  //   const r = field.getBoundingClientRect();
  //   emitWave(t.clientX - r.left, t.clientY - r.top);
  // }, { passive: true });
  // window.addEventListener('resize', buildGrid);

  // // LOOP
  // function loop() {
  //   const now = performance.now();
  //   waves = waves.filter(w => now - w.time < cfg.dur);

  //   if (waves.length === 0) {
  //     pre.textContent = grid.map(row => row.join('')).join('\n');
  //     running = false;
  //     return;
  //   }

  //   let text = '';
  //   for (let r = 0; r < rows; r++) {
  //     if (r > 0) text += '\n';
  //     const py = r * lineH + lineH / 2;
  //     const rowChars = grid[r];
  //     if (!rowChars) continue;

  //     for (let c = 0; c < rowChars.length; c++) {
  //       const ch = rowChars[c];
  //       if (ch === ' ') { text += ' '; continue; }

  //       const px = c * charW + charW / 2;
  //       // Fixed per-cell threshold for dithering
  //       const threshold = hash(c, r, 0);
  //       let scrambled = false;

  //       for (const wave of waves) {
  //         const age = now - wave.time;
  //         const intensity = getWaveIntensity(px, py, wave, now);
  //         if (intensity < 0) continue;
  //         // break (not continue): a cell either scrambles or stays original, consistently
  //         if (threshold > intensity * cfg.density) break;
  //         text += pickChar(c, r, intensity, age, wave.id);
  //         scrambled = true;
  //         break;
  //       }
  //       if (!scrambled) text += ch;
  //     }
  //   }
  //   pre.textContent = text; // seems perf but there might be a better way to do it
  //   requestAnimationFrame(loop);
  // }

  // // GUI
  // function setupGUI() {
  //   const gui = new GUI({ title: 'ASCII Wave Config' });
  //   gui.add(cfg, 'speed', 100, 2000, 10).name('Speed');
  //   gui.add(cfg, 'bandWidth', 10, 300, 1).name('Band width');
  //   gui.add(cfg, 'trail', 1.0, 6.0, 0.1).name('Trail');
  //   gui.add(cfg, 'density', 0.1, 2.0, 0.01).name('Density');
  //   gui.add(cfg, 'dur', 200, 3000, 10).name('Duration');
  //   const r = (min, max, step = 1) => Math.round((min + Math.random() * (max - min)) / step) * step;
  //   gui.add({ randomise() {
  //     cfg.speed = r(150, 1600, 10); cfg.bandWidth = r(20, 280, 1);
  //     cfg.trail = r(1, 5, 0.1); cfg.density = r(0.3, 1.8, 0.01);
  //     cfg.dur = r(400, 2800, 10);
  //     gui.controllersRecursive().forEach(c => c.updateDisplay());
  //   }}, 'randomise').name('Randomise');
  //   gui.domElement.addEventListener('mouseenter', e => e.stopPropagation());
  //   gui.domElement.addEventListener('mousemove', e => e.stopPropagation());
  // }

  // // Wait for font to load before measuring characters
  // function init() { buildGrid(); setupGUI(); }
  // if (document.fonts?.ready) {
  //   Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2000))]).then(init);
  // } else {
  //   window.addEventListener('load', init);
  // }



  // -------------------------------dark mode manual setter -------------------------------------------------------
 
  // const toggleButton = document.getElementById('switch');

  // // 1. Determine the starting theme
  // const savedTheme = localStorage.getItem('theme');
  // const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
  //   document.body.classList.add('dark');
  // } else {
  //   document.body.classList.remove('dark');
  // }
  
  // // 2. Handle the manual toggle click
  // toggleButton.addEventListener('click', () => {
  //   const isDarkMode = document.body.classList.toggle('dark');
  // });



  //----------------------------------------------------------------------
  
