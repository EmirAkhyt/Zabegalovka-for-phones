const canvas = document.getElementById('game3d');
const ctx = canvas.getContext('2d');
const statusText = document.getElementById('status-bar');

const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

function playSound(freq, dur, type) {
  if (!soundEnabled) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + dur);
}

let hasPattyOnPan = false;
let cookLevel = 0;
let burgerLayers = new Array();
let smokeParticles = new Array();
let isClosed = false;

function handleInteractE() {
  if (!lookedTarget) return;

  if (lookedTarget.id === 'computer') {
    openComputerSite();
    return;
  }

  if (lookedTarget.id === 'buns') {
    if (burgerLayers.length === 0) {
      burgerLayers.push({ type: 'bun_bottom', h: 6, r: 15, color: '#b45309', topColor: '#f59e0b' });
      isClosed = false;
      playSound(320, 0.15);
      statusText.innerText = 'Нижняя булка на доске! Пожарь котлету на плите слева.';
    } else if (!isClosed) {
      burgerLayers.push({ type: 'bun_top', h: 9, r: 15, color: '#b45309', topColor: '#ea580c' });
      isClosed = true;
      playSound(380, 0.15);
      statusText.innerText = '🍔 Бургер накрыт! Посмотри в окно на покупателя и нажми [E]!';
    } else {
      statusText.innerText = 'Бургер уже закрыт верхней булкой!';
    }
  }

  else if (lookedTarget.id === 'stove') {
    if (!hasPattyOnPan) {
      hasPattyOnPan = true;
      cookLevel = 0;
      playSound(180, 0.3, 'sawtooth');
      statusText.innerText = '🔥 Котлета жарится! Жди коричневый цвет и нажми [E]!';
    } else {
      if (burgerLayers.length === 0) {
        statusText.innerText = 'Сначала положи нижнюю булку (ящик рядом с плитой)!';
        return;
      }
      if (isClosed) {
        statusText.innerText = 'Бургер уже закрыт верхней булкой!';
        return;
      }
      if (cookLevel < 55) {
        statusText.innerText = '⚠️ Котлета ещё сырая! Подожди пару секунд.';
        return;
      }
      const isBurned = cookLevel > 145;
      burgerLayers.push({
        type: isBurned ? 'burned' : 'patty',
        h: 5,
        r: 14,
        color: isBurned ? '#09090b' : '#451a03',
        topColor: isBurned ? '#18181b' : '#78350f'
      });
      hasPattyOnPan = false;
      cookLevel = 0;

      if (isBurned) {
        statusText.innerText = '💀 Котлета сгорела! Выброси бургер в ведро справа.';
        playSound(120, 0.4, 'sawtooth');
      } else {
        statusText.innerText = '🥩 Котлета в бургере! Добавь сыр/салат или закрой булкой.';
        playSound(520, 0.2);
      }
    }
  }

  else if (lookedTarget.id === 'cheese') {
    if (burgerLayers.length === 0 || isClosed) {
      statusText.innerText = 'Сыр кладётся поверх булки или котлеты!';
      return;
    }
    burgerLayers.push({ type: 'cheese', h: 2.5, r: 16, color: '#ca8a04', topColor: '#facc15' });
    playSound(440, 0.12);
    statusText.innerText = '🧀 Сыр добавлен в бургер!';
  }

  else if (lookedTarget.id === 'salad') {
    if (burgerLayers.length === 0 || isClosed) {
      statusText.innerText = 'Салат кладётся внутрь бургера!';
      return;
    }
    burgerLayers.push({ type: 'salad', h: 3.5, r: 17, color: '#15803d', topColor: '#4ade80' });
    playSound(480, 0.12);
    statusText.innerText = '🥬 Салат добавлен в бургер!';
  }

  else if (lookedTarget.id === 'trash') {
    burgerLayers = new Array();
    isClosed = false;
    playSound(200, 0.2);
    statusText.innerText = '🗑️ Бургер выброшен в ведро!';
  }

  else if (lookedTarget.id === 'customer') {
    if (!currentCustomer) {
      statusText.innerText = '⏳ Сейчас у окна никого нет — ждём следующего клиента!';
      return;
    }

    const hasBottom = burgerLayers.some(l => l.type === 'bun_bottom');
    const hasBurned = burgerLayers.some(l => l.type === 'burned');

    if (!hasBottom || !isClosed || hasBurned) {
      statusText.innerText = '❌ Бургер не готов или в нём сгоревшая котлета!';
      customerShake = 20;
      playSound(150, 0.3, 'sawtooth');
      return;
    }

    let pattyCount = 0;
    let cheeseCount = 0;
    let saladCount = 0;

    burgerLayers.forEach(l => {
      if (l.type === 'patty') pattyCount++;
      if (l.type === 'cheese') cheeseCount++;
      if (l.type === 'salad') saladCount++;
    });

    const req = currentCustomer.order;
    if (pattyCount !== req.patty || cheeseCount !== req.cheese || saladCount !== req.salad) {
      statusText.innerText = '😠 ' + currentCustomer.name + ': «Не то! Я заказывал: ' + req.title + '»';
      customerShake = 25;
      playSound(140, 0.35, 'sawtooth');
      return;
    }

    const earned = addDayEarnings(req.reward);
    playSound(660, 0.15);
    setTimeout(() => playSound(880, 0.25), 140);
    statusText.innerText = '🎉 +' + earned + ' ₽ от ' + currentCustomer.name + '! Новый клиент через 10 сек.';
    burgerLayers = new Array();
    isClosed = false;
    scheduleNextCustomer(10);
  }
}

function project3D(x, y, z) {
  const headBob = Math.sin(player.walkAnim * 2) * 2;
  const dx = x - player.x;
  const dy = y - (player.eyeY + headBob);
  const dz = z - player.z;

  const cosY = Math.cos(player.yaw);
  const sinY = Math.sin(player.yaw);
  const rx = dx * cosY + dz * sinY;
  const rz = -dx * sinY + dz * cosY;

  const cosP = Math.cos(player.pitch);
  const sinP = Math.sin(player.pitch);
  const ry = dy * cosP - rz * sinP;
  const depth = -(dy * sinP + rz * cosP);

  const safeDepth = Math.max(12, depth);
  const scale = 470 / safeDepth;

  return {
    x: canvas.width / 2 + rx * scale,
    y: canvas.height / 2 - ry * scale,
    scale: scale,
    visible: depth > 10
  };
}

let renderQueue = new Array();

function queueBox3D(cx, cy, cz, w, h, d, topCol, sideCol) {
  const dist = Math.hypot(cx - player.x, cz - player.z);
  renderQueue.push({
    dist: dist,
    draw: () => drawBox3DImmediate(cx, cy, cz, w, h, d, topCol, sideCol)
  });
}

function queueCylinder3D(cx, cy, cz, r, h, sideColor, topColor, isDome) {
  const dist = Math.hypot(cx - player.x, cz - player.z) - 0.1;
  renderQueue.push({
    dist: dist,
    draw: () => drawCylinder3DImmediate(cx, cy, cz, r, h, sideColor, topColor, isDome)
  });
}

function queueBurgerLayer3D(cx, cy, cz, layer) {
  const dist = Math.hypot(cx - player.x, cz - player.z) - 0.2;
  renderQueue.push({
    dist: dist,
    draw: () => {
      const bot = project3D(cx, cy, cz);
      const top = project3D(cx, cy + layer.h, cz);
      if (!bot.visible || !top.visible) return;

      const radX = layer.r * bot.scale;
      const radY = layer.r * 0.45 * bot.scale;

      if (layer.type === 'cheese') {
        drawBox3DImmediate(cx, cy, cz, layer.r * 1.65, layer.h, layer.r * 1.65, '#facc15', '#eab308');
        return;
      }

      if (layer.type === 'salad') {
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.35) {
          const wave = 1 + Math.sin(a * 6) * 0.14;
          const px = bot.x + Math.cos(a) * radX * wave;
          const py = bot.y + Math.sin(a) * radY * wave;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.35) {
          const wave = 1 + Math.sin(a * 6) * 0.14;
          const px = top.x + Math.cos(a) * radX * wave;
          const py = top.y + Math.sin(a) * radY * wave;
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        return;
      }

      drawCylinder3DImmediate(cx, cy, cz, layer.r, layer.h, layer.color, layer.topColor, layer.type === 'bun_top');

      if (layer.type === 'patty') {
        ctx.strokeStyle = '#270e02';
        ctx.lineWidth = Math.max(1.2, 2 * top.scale);
        ctx.beginPath();
        ctx.moveTo(top.x - radX * 0.55, top.y - radY * 0.25);
        ctx.lineTo(top.x + radX * 0.55, top.y - radY * 0.25);
        ctx.moveTo(top.x - radX * 0.65, top.y + radY * 0.15);
        ctx.lineTo(top.x + radX * 0.65, top.y + radY * 0.15);
        ctx.stroke();
      }

      if (layer.type === 'bun_top') {
        ctx.fillStyle = '#fef3c7';
        const seeds = new Array(
          { sx: -0.42, sy: -0.22 },
          { sx: -0.15, sy: -0.35 },
          { sx: 0.22, sy: -0.30 },
          { sx: 0.45, sy: -0.15 },
          { sx: -0.25, sy: -0.08 },
          { sx: 0.08, sy: -0.12 },
          { sx: 0.32, sy: 0.02 }
        );
        seeds.forEach(s => {
          ctx.beginPath();
          ctx.ellipse(
            bot.x + radX * s.sx,
            bot.y + radX * s.sy,
            Math.max(1.2, 2.2 * bot.scale),
            Math.max(0.8, 1.3 * bot.scale),
            0.3, 0, Math.PI * 2
          );
          ctx.fill();
        });
      }
    }
  });
}

function drawCylinder3DImmediate(cx, cy, cz, r, h, sideColor, topColor, isDome) {
  const bot = project3D(cx, cy, cz);
  const top = project3D(cx, cy + h, cz);
  if (!bot.visible || !top.visible) return;

  const radX = r * bot.scale;
  const radY = r * 0.45 * bot.scale;

  ctx.fillStyle = sideColor;
  ctx.beginPath();
  ctx.ellipse(bot.x, bot.y, radX, radY, 0, 0, Math.PI);
  ctx.lineTo(top.x - radX, top.y);
  ctx.ellipse(top.x, top.y, radX, radY, 0, Math.PI, 0, true);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = topColor;
  ctx.beginPath();
  if (isDome) {
    ctx.ellipse(bot.x, bot.y, radX, radX * 0.75, 0, Math.PI, 0);
ctx.ellipse(bot.x, bot.y, radX, radY, 0, 0, Math.PI);
} else {
ctx.ellipse(top.x, top.y, radX, radY, 0, 0, Math.PI * 2);
}
ctx.fill();
}
function drawBox3DImmediate(cx, cy, cz, w, h, d, topCol, sideCol) {
const hw = w / 2;
const hd = d / 2;
const p1 = project3D(cx - hw, cy + h, cz - hd);
const p2 = project3D(cx + hw, cy + h, cz - hd);
const p3 = project3D(cx + hw, cy + h, cz + hd);
const p4 = project3D(cx - hw, cy + h, cz + hd);
const b1 = project3D(cx - hw, cy, cz - hd);
const b2 = project3D(cx + hw, cy, cz - hd);
const b3 = project3D(cx + hw, cy, cz + hd);
const b4 = project3D(cx - hw, cy, cz + hd);
if (!p1.visible || !p2.visible || !p3.visible || !p4.visible) {
return;
}
ctx.fillStyle = sideCol;
if (player.z >= cz) {
ctx.beginPath();
ctx.moveTo(p4.x, p4.y); ctx.lineTo(p3.x, p3.y);
ctx.lineTo(b3.x, b3.y); ctx.lineTo(b4.x, b4.y);
ctx.closePath(); ctx.fill();
} else {
ctx.beginPath();
ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
ctx.lineTo(b2.x, b2.y); ctx.lineTo(b1.x, b1.y);
ctx.closePath(); ctx.fill();
}
if (player.x > cx) {
ctx.beginPath();
ctx.moveTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y);
ctx.lineTo(b3.x, b3.y); ctx.lineTo(b2.x, b2.y);
ctx.closePath(); ctx.fill();
} else {
ctx.beginPath();
ctx.moveTo(p1.x, p1.y); ctx.lineTo(p4.x, p4.y);
ctx.lineTo(b4.x, b4.y); ctx.lineTo(b1.x, b1.y);
ctx.closePath(); ctx.fill();
}
if (player.eyeY >= cy + h) {
ctx.fillStyle = topCol;
ctx.beginPath();
ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
ctx.lineTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
ctx.closePath(); ctx.fill();
}
}
function drawFloorAndCeiling() {
ctx.fillStyle = getSkyColorByTime();
ctx.fillRect(0, 0, canvas.width, canvas.height);
const grassMain = isEveningTime() ? '#15803d' : '#22c55e';
const grassEdge = isEveningTime() ? '#14532d' : '#16a34a';
for (let gx = -240; gx < 240; gx += 40) {
for (let gz = -360; gz < -180; gz += 40) {
drawQuad3D(gx, 0, gz, gx + 40, 0, gz + 40, grassMain, grassEdge);
}
}
for (let gx = -200; gx < 200; gx += 40) {
for (let gz = -180; gz < -60; gz += 40) {
const shade = ((gx + gz) / 40) % 2 === 0 ? '#78350f' : '#92400e';
drawQuad3D(gx, 0, gz, gx + 40, 0, gz + 40, shade, '#451a03');
}
}
for (let gx = -200; gx < 200; gx += 40) {
for (let gz = -60; gz < 180; gz += 40) {
const isLight = ((gx + gz) / 40) % 2 === 0;
const tileCol = isLight ? '#f1f5f9' : '#94a3b8';
drawQuad3D(gx, 0, gz, gx + 40, 0, gz + 40, tileCol, '#64748b');
}
}
for (let gx = -200; gx < 200; gx += 40) {
for (let gz = -180; gz < 180; gz += 40) {
drawQuad3D(gx, 150, gz, gx + 40, 150, gz + 40, '#f8fafc', '#cbd5e1');
}
}
}
function drawQuad3D(x1, y, z1, x2, y2, z2, fillColor, strokeColor) {
const p1 = project3D(x1, y, z1);
const p2 = project3D(x2, y, z1);
const p3 = project3D(x2, y, z2);
const p4 = project3D(x1, y, z2);
if (!p1.visible || !p2.visible || !p3.visible || !p4.visible) return;
ctx.fillStyle = fillColor;
ctx.beginPath();
ctx.moveTo(p1.x, p1.y);
ctx.lineTo(p2.x, p2.y);
ctx.lineTo(p3.x, p3.y);
ctx.lineTo(p4.x, p4.y);
ctx.closePath();
ctx.fill();
if (strokeColor) {
ctx.strokeStyle = strokeColor;
ctx.lineWidth = 1;
ctx.stroke();
}
}
function queueOutsideWorld() {
const cloudShift = Math.sin(Date.now() * 0.0005) * 30;
const cloudCol = isEveningTime() ? '#94a3b8' : '#ffffff';
queueBox3D(-65 + cloudShift, 115, -300, 50, 12, 16, cloudCol, '#cbd5e1');
queueBox3D(65 - cloudShift, 125, -320, 60, 14, 16, cloudCol, '#cbd5e1');
queueBox3D(-80, 0, -250, 12, 42, 12, '#78350f', '#451a03');
queueBox3D(-80, 42, -250, 40, 34, 40, '#16a34a', '#15803d');
queueBox3D(80, 0, -260, 12, 45, 12, '#78350f', '#451a03');
queueBox3D(80, 45, -260, 44, 36, 44, '#22c55e', '#16a34a');
queueBox3D(0, 0, -310, 84, 60, 44, '#fef3c7', '#fde68a');
queueBox3D(0, 60, -310, 92, 20, 50, '#dc2626', '#991b1b');
const winCol = isEveningTime() ? '#fef08a' : '#38bdf8';
queueBox3D(-18, 22, -287, 16, 18, 4, winCol, winCol);
queueBox3D(18, 22, -287, 16, 18, 4, winCol, winCol);
}
function queueRedWhiteWall(cx, cz, w, d) {
queueBox3D(cx, 0, cz, w, 45, d, '#dc2626', '#dc2626');
queueBox3D(cx, 45, cz, w, 50, d, '#f8fafc', '#f8fafc');
queueBox3D(cx, 95, cz, w, 17, d, '#ef4444', '#ef4444');
queueBox3D(cx, 112, cz, w, 38, d, '#f8fafc', '#f8fafc');
}
function queueAllWalls() {
queueBox3D(-80, 146, 40, 36, 4, 36, '#fef08a', '#facc15');
queueBox3D(80, 146, 40, 36, 4, 36, '#fef08a', '#facc15');
queueBox3D(0, 146, -110, 44, 4, 36, '#fef08a', '#facc15');
for (let wx = -200; wx < 200; wx += 25) {
const cx = wx + 12.5;
if (cx > -60 && cx < 60) {
queueBox3D(cx, 0, -185, 25, 38, 12, '#dc2626', '#dc2626');
queueBox3D(cx, 38, -185, 26, 4, 16, '#f8fafc', '#cbd5e1');
queueBox3D(cx, 118, -185, 25, 32, 12, '#f8fafc', '#f8fafc');
} else {
queueRedWhiteWall(cx, -185, 25, 12);
}
queueRedWhiteWall(cx, 185, 25, 12);
}
for (let wz = -180; wz < 180; wz += 25) {
const cz = wz + 12.5;
queueRedWhiteWall(-205, cz, 12, 25);
queueRedWhiteWall(205, cz, 12, 25);
}
queueRedWhiteWall(-125, -55, 160, 14);
queueRedWhiteWall(125, -55, 160, 14);
queueBox3D(0, 0, -55, 90, 24, 18, '#dc2626', '#b91c1c');
queueBox3D(0, 24, -55, 96, 4, 26, '#d97706', '#92400e');
queueBox3D(-45, 28, -55, 6, 82, 20, '#b45309', '#78350f');
queueBox3D(45, 28, -55, 6, 82, 20, '#b45309', '#78350f');
queueBox3D(0, 110, -55, 96, 40, 16, '#f8fafc', '#f8fafc');
}
function queueComputerDesk3D() {
renderQueue.push({
dist: Math.hypot(-165 - player.x, 65 - player.z),
draw: () => {
drawBox3DImmediate(-165, 0, 65, 42, 24, 52, '#b45309', '#78350f');
drawBox3DImmediate(-172, 24, 80, 14, 16, 10, '#1e293b', '#0f172a');
drawBox3DImmediate(-174, 24, 60, 8, 6, 8, '#334155', '#1e293b');
drawBox3DImmediate(-174, 30, 60, 6, 18, 26, '#0f172a', '#1e293b');
drawBox3DImmediate(-170, 32, 60, 2, 14, 22, '#38bdf8', '#0284c7');
drawBox3DImmediate(-156, 24, 62, 10, 2, 18, '#cbd5e1', '#94a3b8');
drawBox3DImmediate(-156, 24, 48, 6, 2, 4, '#f8fafc', '#cbd5e1');
}
});
}
function drawWindowSign() {
const signPos = project3D(0, 126, -45);
if (signPos.visible) {
const sw = 92 * signPos.scale;
const sh = 20 * signPos.scale;
ctx.fillStyle = '#dc2626';
ctx.fillRect(signPos.x - sw / 2, signPos.y - sh / 2, sw, sh);
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 2;
ctx.strokeRect(signPos.x - sw / 2, signPos.y - sh / 2, sw, sh);
ctx.fillStyle = '#ffffff';
ctx.font = 'bold ' + Math.max(9, Math.round(12 * signPos.scale)) + 'px Segoe UI';
ctx.textAlign = 'center';
ctx.fillText('ЗАКАЗЫ', signPos.x, signPos.y + 4 * signPos.scale);
}
}
function drawFirstPersonHands() {
const swayX = Math.cos(player.walkAnim) * 9;
const swayY = Math.abs(Math.sin(player.walkAnim)) * 11;
const w = canvas.width;
const h = canvas.height;
ctx.fillStyle = '#fed7aa';
ctx.beginPath();
ctx.roundRect(w * 0.16 + swayX, h - 105 + swayY, 52, 120, 18);
ctx.fill();
ctx.fillStyle = '#ffffff';
ctx.fillRect(w * 0.16 + swayX - 4, h - 52 + swayY, 60, 65);
ctx.fillStyle = '#94a3b8';
ctx.fillRect(w * 0.80 + swayX + 12, h - 170 + swayY, 30, 40);
ctx.fillStyle = '#1e293b';
ctx.fillRect(w * 0.80 + swayX + 22, h - 132 + swayY, 10, 42);
ctx.fillStyle = '#fed7aa';
ctx.beginPath();
ctx.roundRect(w * 0.80 + swayX, h - 100 + swayY, 52, 120, 18);
ctx.fill();
ctx.fillStyle = '#ffffff';
ctx.fillRect(w * 0.80 + swayX - 4, h - 48 + swayY, 60, 65);
}
function loop() {
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.clearRect(0, 0, canvas.width, canvas.height);
updatePlayer();
updateDayTime();
updateCustomerTimer();
updateHiredStaff();
drawFloorAndCeiling();
renderQueue = new Array();
queueOutsideWorld();
queueAllWalls();
queueComputerDesk3D();
queueHiredChefs3D();
if (currentCustomer) {
renderQueue.push({
dist: Math.hypot(0 - player.x, -92 - player.z),
draw: () => drawCustomerBody3D()
});
}
queueBox3D(-135, 0, -10, 44, 24, 44, '#1e293b', '#0f172a');
queueCylinder3D(-135, 24, -10, 18, 6, '#18181b', '#27272a', false);
queueBox3D(-75, 0, -10, 44, 24, 44, '#d97706', '#92400e');
queueCylinder3D(-75, 24, -10, 11, 6, '#b45309', '#f59e0b', true);
queueBox3D(75, 0, -10, 44, 24, 44, '#eab308', '#a16207');
queueBox3D(135, 0, -10, 44, 24, 44, '#16a34a', '#15803d');
queueBox3D(-24, 28, -50, 32, 2, 18, '#b45309', '#78350f');
queueCylinder3D(165, 0, 55, 18, 26, '#334155', '#0f172a', false);
if (hasPattyOnPan) {
if (!isGamePaused && !isDayEnded && !isSecondShopModalOpen) {
cookLevel += 0.35;
}
let sideCol = '#db2777';
let topCol = '#f472b6';
if (cookLevel >= 55 && cookLevel <= 145) {
sideCol = '#451a03';
topCol = '#78350f';
} else if (cookLevel > 145) {
sideCol = '#09090b';
topCol = '#18181b';
}
const shake = Math.sin(Date.now() * 0.06) * 1.1;
queueCylinder3D(-135 + shake, 30, -10, 14, 5, sideCol, topCol, false);
if (!isGamePaused && Math.random() < 0.25) {
smokeParticles.push({ x: -135 + (Math.random() * 14 - 7), y: 40, z: -10, alpha: 0.7 });
}
}
let currentY = 30;
burgerLayers.forEach(layer => {
queueBurgerLayer3D(-24, currentY, -50, layer);
currentY += layer.h;
});
renderQueue.sort((a, b) => b.dist - a.dist);
renderQueue.forEach(item => item.draw());
drawWindowSign();
smokeParticles.forEach((p, idx) => {
if (!isGamePaused) {
p.y += 1.1;
p.alpha -= 0.015;
}
if (p.alpha <= 0) {
smokeParticles.splice(idx, 1);
return;
}
const pos = project3D(p.x, p.y, p.z);
if (!pos.visible) return;
ctx.fillStyle = 'rgba(226, 232, 240, ' + p.alpha + ')';
ctx.beginPath();
ctx.arc(pos.x, pos.y, 6 * pos.scale, 0, Math.PI * 2);
ctx.fill();
});
drawFirstPersonHands();
requestAnimationFrame(loop);
}
loadGameProgress();
updateDayUI();
refreshMainMenuStats();
spawnCustomer();
loop();