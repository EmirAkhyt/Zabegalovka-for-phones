let currentDay = 1;
let totalCoins = 0; // сохраняется между днями!
let dayEarned = 0;
let dailyGoal = 500;

let hasSecondShop = false;
let profitMultiplier = 1;
let isSecondShopModalOpen = false;

// Время в минутах от начала суток: 480 = 08:00, 1320 = 22:00
let timeMinutes = 480;
let isDayEnded = false;

const dayEndOverlay = document.getElementById('day-end-overlay');
const btnNextDay = document.getElementById('btn-next-day');

const secondShopOverlay = document.getElementById('second-shop-overlay');
const btnBuySecondShop = document.getElementById('btn-buy-second-shop');
const btnSkipSecondShop = document.getElementById('btn-skip-second-shop');

function updateDayUI() {
  document.getElementById('day-num').innerText = currentDay;
  document.getElementById('wallet-coins').innerText = totalCoins;
  document.getElementById('day-coins').innerText = dayEarned;
  document.getElementById('day-goal').innerText = dailyGoal;
  document.getElementById('profit-mult-badge').innerText = hasSecondShop ? '(×2)' : '';

  const hrs = Math.floor(timeMinutes / 60);
  const mins = Math.floor(timeMinutes % 60);
  const hh = hrs < 10 ? '0' + hrs : '' + hrs;
  const mm = mins < 10 ? '0' + mins : '' + mins;
  document.getElementById('clock-text').innerText = hh + ':' + mm;
}

// Начисление заработка с учётом множителя ×2 от второй Забегаловки
function addDayEarnings(baseAmount) {
  const finalAmount = baseAmount * profitMultiplier;
  totalCoins += finalAmount;
  dayEarned += finalAmount;
  updateDayUI();
  saveGameProgress();

  if (dayEarned >= dailyGoal) {
    document.getElementById('day-coins').style.color = '#facc15';
  }
  return finalAmount;
}

function spendFromWallet(amount) {
  if (totalCoins < amount) return false;
  totalCoins -= amount;
  updateDayUI();
  refreshMainMenuStats();
  saveGameProgress();
  return true;
}

function updateDayTime() {
  if (isGamePaused || isDayEnded || isSecondShopModalOpen) return;

  timeMinutes += 0.11;

  if (timeMinutes >= 1320) {
    timeMinutes = 1320;
    finishWorkDay();
  }

  updateDayUI();
}

function finishWorkDay() {
  isDayEnded = true;
  isGamePaused = true;

  if (document.exitPointerLock) {
    document.exitPointerLock();
  }

  mainMenuOverlay.style.display = 'none';
  pauseOverlay.style.display = 'none';
  dayEndOverlay.style.display = 'flex';

  const titleEl = document.getElementById('day-end-title');
  const subEl = document.getElementById('day-end-subtitle');
  const statsEl = document.getElementById('day-end-stats');

  if (dayEarned >= dailyGoal) {
    titleEl.innerText = '🎉 День ' + currentDay + ' пройден!';
    titleEl.style.color = '#4ade80';
    subEl.innerText = 'Отличная работа, шеф! План выполнен.';
    statsEl.innerHTML =
      'Заработано за смену: <b>' + dayEarned + ' ₽</b><br>' +
      'Цель дня была: <b>' + dailyGoal + ' ₽</b><br>' +
      'Баланс в кассе (сохраняется): <b>' + totalCoins + ' ₽</b>';
    btnNextDay.innerText = '▶ НАЧАТЬ ДЕНЬ ' + (currentDay + 1);
    btnNextDay.dataset.passed = 'true';
  } else {
    titleEl.innerText = '😔 План не выполнен';
    titleEl.style.color = '#f87171';
    subEl.innerText = 'Не хватило совсем немного до цели дня!';
    statsEl.innerHTML =
      'Заработано за смену: <b>' + dayEarned + ' ₽</b><br>' +
      'Нужно было набрать: <b>' + dailyGoal + ' ₽</b><br>' +
      'Баланс в кассе: <b>' + totalCoins + ' ₽</b>';
    btnNextDay.innerText = '🔄 ПЕРЕИГРАТЬ ДЕНЬ ' + currentDay;
    btnNextDay.dataset.passed = 'false';
  }
}

// С вероятностью 10% утром следующего дня грабят кассу
function checkMorningRobbery() {
  const banner = document.getElementById('robbery-banner');
  if (Math.random() < 0.10) {
    totalCoins = 0;
    updateDayUI();
    refreshMainMenuStats();
    saveGameProgress();
    playSound(110, 0.5, 'sawtooth');
    banner.style.display = 'block';
    statusText.innerText = '🚨 ВАС ОБОКРАЛИ ночью! Баланс кассы обнулён до 0 ₽!';
    setTimeout(() => {
      banner.style.display = 'none';
    }, 6000);
  } else {
    banner.style.display = 'none';
  }
}

function startDayGameplay() {
  isSecondShopModalOpen = false;
  isDayEnded = false;
  isGamePaused = false;
  secondShopOverlay.style.display = 'none';

  const gameCanvas = document.getElementById('game3d');
  if (gameCanvas && gameCanvas.requestPointerLock) {
    gameCanvas.requestPointerLock();
  }
}

// Переход на следующий день
btnNextDay.addEventListener('click', () => {
  if (btnNextDay.dataset.passed === 'true') {
    currentDay += 1;
    dailyGoal = 500 + (currentDay - 1) * 300;
  }

  dayEarned = 0;
  timeMinutes = 480;
  document.getElementById('day-coins').style.color = '#4ade80';
  dayEndOverlay.style.display = 'none';

  checkMorningRobbery();
  saveGameProgress();

  burgerLayers = new Array();
  isClosed = false;
  hasPattyOnPan = false;
  cookLevel = 0;
  spawnCustomer();
  updateDayUI();

  if (currentDay === 4 && !hasSecondShop) {
    isSecondShopModalOpen = true;
    isDayEnded = false;
    isGamePaused = true;
    document.getElementById('shop2-coins').innerText = totalCoins;
    document.getElementById('shop2-msg').innerText = '';
    secondShopOverlay.style.display = 'flex';
    return;
  }

  startDayGameplay();
});

// Покупка второй Забегаловки за 5000 ₽
btnBuySecondShop.addEventListener('click', () => {
  if (!spendFromWallet(5000)) {
    playSound(140, 0.3, 'sawtooth');
    document.getElementById('shop2-msg').innerText = '❌ Не хватает денег! Нужно 5000 ₽, а в кассе ' + totalCoins + ' ₽.';
    return;
  }

  hasSecondShop = true;
  profitMultiplier = 2;
  saveGameProgress();
  playSound(660, 0.15);
  setTimeout(() => playSound(880, 0.25), 140);
  updateDayUI();
  statusText.innerText = '🏪 Вторая «Забегаловка» открыта за 5000 ₽! Теперь прибыль ×2!';
  startDayGameplay();
});

btnSkipSecondShop.addEventListener('click', () => {
  startDayGameplay();
});

function getSkyColorByTime() {
  if (timeMinutes < 660) return '#7dd3fc';
  if (timeMinutes < 1020) return '#38bdf8';
  if (timeMinutes < 1170) return '#fb923c';
  return '#1e1b4b';
}

function isEveningTime() {
  return timeMinutes >= 1140;
}
