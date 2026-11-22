let isGamePaused = true;
let isInMainMenu = true;
let soundEnabled = true;

const mainMenuOverlay = document.getElementById('main-menu-overlay');
const pauseOverlay = document.getElementById('pause-overlay');

const btnStartMain = document.getElementById('btn-start-main');
const btnResume = document.getElementById('btn-resume');
const btnToMain = document.getElementById('btn-to-main');
const btnSoundMain = document.getElementById('btn-sound-main');
const btnSoundPause = document.getElementById('btn-sound-pause');
const btnResetSave = document.getElementById('btn-reset-save');

function refreshMainMenuStats() {
  document.getElementById('menu-day-val').innerText = currentDay;
  document.getElementById('menu-total-coins').innerText = totalCoins;
}

function lockPointerAndPlay() {
  mainMenuOverlay.style.display = 'none';
  pauseOverlay.style.display = 'none';
  isInMainMenu = false;
  isGamePaused = false;

  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const gameCanvas = document.getElementById('game3d');
  if (!isTouchDevice && gameCanvas && gameCanvas.requestPointerLock) {
    gameCanvas.requestPointerLock();
  }
}

btnStartMain.addEventListener('click', () => {
  lockPointerAndPlay();
});

btnResume.addEventListener('click', () => {
  lockPointerAndPlay();
});

btnToMain.addEventListener('click', () => {
  pauseOverlay.style.display = 'none';
  mainMenuOverlay.style.display = 'flex';
  isInMainMenu = true;
  isGamePaused = true;
  btnStartMain.innerText = '▶ ПРОДОЛЖИТЬ СМЕНУ';
  refreshMainMenuStats();
});

btnResetSave.addEventListener('click', () => {
  resetGameProgress();
  btnStartMain.innerText = '▶ НАЧАТЬ ИГРУ';
});

function toggleSound() {
  soundEnabled = !soundEnabled;
  const label = soundEnabled ? '🔊 Звук: ВКЛ' : '🔇 Звук: ВЫКЛ';
  btnSoundMain.innerText = label;
  btnSoundPause.innerText = label;
}

btnSoundMain.addEventListener('click', toggleSound);
btnSoundPause.addEventListener('click', toggleSound);

document.addEventListener('pointerlockchange', () => {
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (isTouchDevice) return;

  const gameCanvas = document.getElementById('game3d');
  if (document.pointerLockElement !== gameCanvas) {
    isGamePaused = true;
    if (!isDayEnded && !isInMainMenu && !isComputerOpen && !isSecondShopModalOpen) {
      pauseOverlay.style.display = 'flex';
    }
  }
});
