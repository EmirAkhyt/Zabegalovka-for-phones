let isComputerOpen = false;
let sashaHoldingPatty = false;

const computerOverlay = document.getElementById('computer-overlay');
const btnClosePc = document.getElementById('btn-close-pc');

const staffFryer = {
  id: 'fryer',
  name: '👨‍🍳 Шеф-гриль Саша',
  desc: 'Сам жарит котлеты строго по заказу, вовремя снимает до подгорания и кладёт на бургер.',
  price: 2500,
  hired: false
};

function openComputerSite() {
  isComputerOpen = true;
  isGamePaused = true;

  if (document.exitPointerLock) {
    document.exitPointerLock();
  }

  pauseOverlay.style.display = 'none';
  computerOverlay.style.display = 'flex';
  renderWorkersSite('');
}

function closeComputerSite() {
  isComputerOpen = false;
  isGamePaused = false;
  computerOverlay.style.display = 'none';

  const gameCanvas = document.getElementById('game3d');
  if (gameCanvas && gameCanvas.requestPointerLock) {
    gameCanvas.requestPointerLock();
  }
}

btnClosePc.addEventListener('click', closeComputerSite);

function tryHireWorker(worker) {
  if (worker.hired) return;

  if (!spendFromWallet(worker.price)) {
    playSound(140, 0.3, 'sawtooth');
    renderWorkersSite('❌ Недостаточно денег в кассе! Нужно ' + worker.price + ' ₽, а у тебя ' + totalCoins + ' ₽.');
    return;
  }

  worker.hired = true;
  saveGameProgress();
  playSound(660, 0.15);
  setTimeout(() => playSound(880, 0.25), 140);
  statusText.innerText = '🎉 ' + worker.name + ' вышел на смену! Из кассы списано ' + worker.price + ' ₽.';
  renderWorkersSite('✅ Нанят: ' + worker.name + ' (-' + worker.price + ' ₽ из кассы)');
}

function createWorkerCardElement(worker) {
  const card = document.createElement('div');
  card.className = 'worker-card';

  const info = document.createElement('div');
  info.className = 'worker-info';
  info.innerHTML = '<h3>' + worker.name + '</h3><p>' + worker.desc + '</p>';

  const btn = document.createElement('button');
  btn.type = 'button';

  if (worker.hired) {
    btn.className = 'hire-btn hired';
    btn.innerText = '✅ Нанят в штат';
  } else {
    btn.className = 'hire-btn';
    btn.innerText = 'Нанять за ' + worker.price + ' ₽';
    btn.onclick = function () {
      tryHireWorker(worker);
    };
  }

  card.appendChild(info);
  card.appendChild(btn);
  return card;
}

function renderWorkersSite(alertMessage) {
  document.getElementById('pc-coins-val').innerText = totalCoins;
  const container = document.getElementById('workers-list');
  container.innerHTML = '';

  if (alertMessage) {
    const msgBox = document.createElement('div');
    msgBox.style.padding = '10px 14px';
    msgBox.style.borderRadius = '10px';
    msgBox.style.fontWeight = 'bold';
    msgBox.style.fontSize = '14px';
    msgBox.style.background = alertMessage.startsWith('✅') ? '#dcfce7' : '#fee2e2';
    msgBox.style.color = alertMessage.startsWith('✅') ? '#166534' : '#991b1b';
    msgBox.innerText = alertMessage;
    container.appendChild(msgBox);
  }

  container.appendChild(createWorkerCardElement(staffFryer));
}

function updateHiredStaff() {
  if (isGamePaused || isDayEnded || !currentCustomer) return;
  if (!staffFryer.hired) return;

  const req = currentCustomer.order;

  let curPatties = 0;
  burgerLayers.forEach(l => {
    if (l.type === 'patty') curPatties++;
  });

  if (sashaHoldingPatty && burgerLayers.length > 0 && !isClosed && curPatties < req.patty) {
    burgerLayers.push({ type: 'patty', h: 5, r: 14, color: '#451a03', topColor: '#78350f' });
    sashaHoldingPatty = false;
    curPatties += 1;
    playSound(520, 0.12);
    statusText.innerText = '👨‍🍳 Саша положил готовую котлету в бургер!';
  }

  if (hasPattyOnPan && cookLevel >= 60) {
    if (burgerLayers.length > 0 && !isClosed && curPatties < req.patty) {
      burgerLayers.push({ type: 'patty', h: 5, r: 14, color: '#451a03', topColor: '#78350f' });
      hasPattyOnPan = false;
      cookLevel = 0;
      curPatties += 1;
      playSound(520, 0.12);
      statusText.innerText = '👨‍🍳 Саша снял котлету со сковороды и положил в бургер!';
    } else if (cookLevel >= 115 && !sashaHoldingPatty) {
      hasPattyOnPan = false;
      cookLevel = 0;
      sashaHoldingPatty = true;
      playSound(480, 0.12);
      statusText.innerText = '👨‍🍳 Саша снял готовую котлету, чтобы не сгорела! Положи нижнюю булку.';
    }
  }

  const totalPattiesAccounted = curPatties + (hasPattyOnPan ? 1 : 0) + (sashaHoldingPatty ? 1 : 0);
  if (totalPattiesAccounted < req.patty && !isClosed) {
    hasPattyOnPan = true;
    cookLevel = 0;
    playSound(180, 0.15, 'sawtooth');
  }
}

function queueHiredChefs3D() {
  if (!staffFryer.hired) return;
  const anim = Math.abs(Math.sin(Date.now() * 0.006)) * 2.5;
  drawChefNPC(-135, 32, anim, '#38bdf8', '#451a03');
}

function drawChefNPC(cx, cz, bounce, apronColor, hairColor) {
  renderQueue.push({
    dist: Math.hypot(cx - player.x, cz - player.z),
    draw: () => {
      drawBox3DImmediate(cx - 8, 0, cz, 11, 24, 12, '#334155', '#1e293b');
      drawBox3DImmediate(cx + 8, 0, cz, 11, 24, 12, '#334155', '#1e293b');

      const bodyY = 24 + bounce;
      drawBox3DImmediate(cx, bodyY, cz, 36, 34, 20, '#ffffff', '#f1f5f9');
      drawBox3DImmediate(cx, bodyY + 2, cz - 2, 37, 22, 18, apronColor, apronColor);

      drawBox3DImmediate(cx - 23, bodyY + 8, cz - 6, 9, 22, 12, '#fed7aa', '#fdba74');
      drawBox3DImmediate(cx + 23, bodyY + 8, cz - 6, 9, 22, 12, '#fed7aa', '#fdba74');

      const headY = bodyY + 35;
      drawBox3DImmediate(cx, headY + 4, cz + 10, 25, 18, 6, hairColor, hairColor);
      drawBox3DImmediate(cx, headY, cz, 24, 24, 24, '#fed7aa', '#fed7aa');
      drawBox3DImmediate(cx, headY + 24, cz, 26, 15, 26, '#ffffff', '#f8fafc');

      const eyeL = project3D(cx - 5.5, headY + 14, cz - 13);
      const eyeR = project3D(cx + 5.5, headY + 14, cz - 13);
      const nose = project3D(cx, headY + 10, cz - 14);
      const mouth = project3D(cx, headY + 5, cz - 13);

      if (eyeL.visible && eyeR.visible && player.z < cz) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(eyeL.x, eyeL.y, 3.2 * eyeL.scale, 0, Math.PI * 2);
        ctx.arc(eyeR.x, eyeR.y, 3.2 * eyeR.scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(eyeL.x, eyeL.y, 1.7 * eyeL.scale, 0, Math.PI * 2);
        ctx.arc(eyeR.x, eyeR.y, 1.7 * eyeR.scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = hairColor;
        ctx.lineWidth = 1.8 * eyeL.scale;
        ctx.beginPath();
        ctx.moveTo(eyeL.x - 3.5 * eyeL.scale, eyeL.y - 4.5 * eyeL.scale);
        ctx.lineTo(eyeL.x + 3 * eyeL.scale, eyeL.y - 4 * eyeL.scale);
        ctx.moveTo(eyeR.x - 3 * eyeR.scale, eyeR.y - 4 * eyeR.scale);
        ctx.lineTo(eyeR.x + 3.5 * eyeR.scale, eyeR.y - 4.5 * eyeR.scale);
        ctx.stroke();

        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.arc(nose.x, nose.y, 2 * nose.scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.8 * mouth.scale;
        ctx.beginPath();
        ctx.arc(mouth.x, mouth.y, 4.2 * mouth.scale, 0, Math.PI);
        ctx.stroke();
      }
    }
  });
}
