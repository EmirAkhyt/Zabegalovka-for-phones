const player = { x: 0, z: 85, eyeY: 78, yaw: 0, pitch: -0.10, speed: 3.3, walkAnim: 0 };
const keys = new Set();
let lookedTarget = null;

let joyForward = 0;
let joyStrafe = 0;
let joyTouchId = null;
let lookTouchId = null;
let lastLookX = 0;
let lastLookY = 0;

window.addEventListener('keydown', (e) => {
  keys.add(e.code);
  if (e.code === 'KeyE' && !isGamePaused) {
    handleInteractE();
  }
});

window.addEventListener('keyup', (e) => {
  keys.delete(e.code);
});

window.addEventListener('mousemove', (e) => {
  if (isGamePaused) return;
  if (document.pointerLockElement === document.getElementById('game3d')) {
    player.yaw += e.movementX * 0.0025;
    player.pitch += e.movementY * 0.0022;
    if (player.pitch > 0.7) player.pitch = 0.7;
    if (player.pitch < -0.7) player.pitch = -0.7;
  }
});

window.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') return;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (isTouchDevice) return;

  const gameCanvas = document.getElementById('game3d');
  if (!isGamePaused && document.pointerLockElement !== gameCanvas && gameCanvas.requestPointerLock) {
    gameCanvas.requestPointerLock();
  }
});

function initTouchControls() {
  const joyZone = document.getElementById('joy-zone');
  const joyStick = document.getElementById('joy-stick');
  const btnAction = document.getElementById('btn-mobile-action');
  const btnMobilePause = document.getElementById('btn-mobile-pause');
  const gameCanvas = document.getElementById('game3d');

  if (btnAction) {
    btnAction.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!isGamePaused) handleInteractE();
    });
    btnAction.addEventListener('click', () => {
      if (!isGamePaused) handleInteractE();
    });
  }

  if (btnMobilePause) {
    btnMobilePause.addEventListener('click', () => {
      isGamePaused = true;
      if (document.exitPointerLock) document.exitPointerLock();
      if (!isDayEnded && !isInMainMenu && !isComputerOpen && !isSecondShopModalOpen) {
        pauseOverlay.style.display = 'flex';
      }
    });
  }

  if (joyZone) {
    joyZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      joyTouchId = touch.identifier;
      updateJoystickPosition(touch);
    }, { passive: false });

    joyZone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joyTouchId) {
          updateJoystickPosition(e.changedTouches[i]);
        }
      }
    }, { passive: false });

    const resetJoy = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === joyTouchId) {
          joyTouchId = null;
          joyForward = 0;
          joyStrafe = 0;
          joyStick.style.transform = 'translate(0px, 0px)';
        }
      }
    };
    joyZone.addEventListener('touchend', resetJoy);
    joyZone.addEventListener('touchcancel', resetJoy);
  }

  function updateJoystickPosition(touch) {
    const rect = joyZone.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;
    const maxRadius = 38;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    joyStick.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
    joyStrafe = dx / maxRadius;
    joyForward = -dy / maxRadius;
  }

  gameCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (isGamePaused) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier !== joyTouchId && lookTouchId === null) {
        lookTouchId = t.identifier;
        lastLookX = t.clientX;
        lastLookY = t.clientY;
      }
    }
  }, { passive: false });

  gameCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isGamePaused) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const t = e.changedTouches[i];
      if (t.identifier === lookTouchId) {
        const dx = t.clientX - lastLookX;
        const dy = t.clientY - lastLookY;
        lastLookX = t.clientX;
        lastLookY = t.clientY;

        player.yaw += dx * 0.0055;
        player.pitch += dy * 0.0045;
        if (player.pitch > 0.7) player.pitch = 0.7;
        if (player.pitch < -0.7) player.pitch = -0.7;
      }
    }
  }, { passive: false });

  const endLook = (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === lookTouchId) {
        lookTouchId = null;
      }
    }
  };
  gameCanvas.addEventListener('touchend', endLook, { passive: false });
  gameCanvas.addEventListener('touchcancel', endLook, { passive: false });
}

initTouchControls();

function updatePlayer() {
  if (isGamePaused) return;

  let forward = joyForward;
  let strafe = joyStrafe;

  if (keys.has('KeyW') || keys.has('ArrowUp')) forward += 1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) forward -= 1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) strafe += 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) strafe -= 1;

  const currentSpeed = upgShoes.bought ? 5.2 : player.speed;

  if (Math.abs(forward) > 0.05 || Math.abs(strafe) > 0.05) {
    const sin = Math.sin(player.yaw);
    const cos = Math.cos(player.yaw);

    let dx = forward * sin + strafe * cos;
    let dz = -forward * cos + strafe * sin;

    const len = Math.hypot(dx, dz);
    if (len > 1) {
      dx /= len;
      dz /= len;
    }
    dx *= currentSpeed;
    dz *= currentSpeed;

    let nextX = player.x + dx;
    let nextZ = player.z + dz;

    if (nextX < -158) nextX = -158;
    if (nextX > 158) nextX = 158;
    if (nextZ < -12) nextZ = -12;
    if (nextZ > 142) nextZ = 142;

    if (nextZ < 28 && (nextX < -42 || nextX > 42)) {
      nextZ = player.z;
    }

    if (nextX < -128 && nextZ > 35 && nextZ < 95) {
      nextX = player.x;
    }

    player.x = nextX;
    player.z = nextZ;
    player.walkAnim += 0.22;
  } else {
    player.walkAnim = 0;
  }

  detectLookTarget();
}

function detectLookTarget() {
  const promptEl = document.getElementById('interact-prompt');
  const btnAction = document.getElementById('btn-mobile-action');
  const gameCanvas = document.getElementById('game3d');
  const stations = new Array(
    { id: 'stove', x: -135, z: -10, label: 'Пожарить / Снять котлету' },
    { id: 'buns', x: -75, z: -10, label: 'Положить булку (низ / верх)' },
    { id: 'customer', x: 0, z: -65, label: 'Отдать заказ покупателю' },
    { id: 'cheese', x: 75, z: -10, label: 'Добавить ломтик сыра' },
    { id: 'salad', x: 135, z: -10, label: 'Добавить свежий салат' },
    { id: 'fryer', x: 165, z: 22, label: 'Фритюрница: Картошка Фри' },
    { id: 'cola', x: 165, z: 62, label: 'Автомат: Налить Колу' },
    { id: 'trash', x: 165, z: 105, label: 'Выбросить заказ в ведро' },
    { id: 'computer', x: -165, z: 65, label: 'Открыть сайт ПоварБургер.com' }
  );

  let best = null;
  let bestScore = 999;

  stations.forEach(st => {
    if (st.id === 'customer' && !currentCustomer) return;

    const dist = Math.hypot(player.x - st.x, player.z - st.z);
    if (dist > 155) return;

    const screenPos = project3D(st.x, 30, st.z);
    if (!screenPos.visible) return;

    const centerDist = Math.hypot(screenPos.x - gameCanvas.width / 2, screenPos.y - gameCanvas.height / 2);
    if (centerDist < 105 && centerDist < bestScore) {
      bestScore = centerDist;
      best = st;
    }
  });

  lookedTarget = best;
  if (best) {
    promptEl.style.display = 'block';
    promptEl.innerText = 'Нажми [E] — ' + best.label;
    if (btnAction) btnAction.style.background = '#22c55e';
  } else {
    promptEl.style.display = 'none';
    if (btnAction) btnAction.style.background = 'rgba(245, 158, 11, 0.92)';
  }
}
