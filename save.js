const SAVE_KEY = 'zabegalovka_save_v1';

// Сохраняем весь прогресс в память браузера
function saveGameProgress() {
  const data = {
    currentDay: currentDay,
    totalCoins: totalCoins,
    dailyGoal: dailyGoal,
    hasSecondShop: hasSecondShop,
    profitMultiplier: profitMultiplier,
    sashaHired: staffFryer.hired
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    // Игнорируем ошибку, если хранилище заблокировано
  }
}

// Загружаем сохранённый прогресс при старте игры
function loadGameProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);

    if (typeof data.currentDay === 'number') currentDay = data.currentDay;
    if (typeof data.totalCoins === 'number') totalCoins = data.totalCoins;
    if (typeof data.dailyGoal === 'number') dailyGoal = data.dailyGoal;
    if (typeof data.hasSecondShop === 'boolean') hasSecondShop = data.hasSecondShop;
    if (typeof data.profitMultiplier === 'number') profitMultiplier = data.profitMultiplier;
    if (typeof data.sashaHired === 'boolean') staffFryer.hired = data.sashaHired;
  } catch (e) {
    // Если сохранение повреждено — начинаем с нуля
  }
}

// Сброс прогресса (кнопка в Главном меню)
function resetGameProgress() {
  localStorage.removeItem(SAVE_KEY);
  currentDay = 1;
  totalCoins = 0;
  dayEarned = 0;
  dailyGoal = 500;
  hasSecondShop = false;
  profitMultiplier = 1;
  staffFryer.hired = false;
  sashaHoldingPatty = false;
  timeMinutes = 480;
  isDayEnded = false;

  burgerLayers = new Array();
  isClosed = false;
  hasPattyOnPan = false;
  cookLevel = 0;

  updateDayUI();
  refreshMainMenuStats();
  spawnCustomer();
}
