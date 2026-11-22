const SAVE_KEY = 'zabegalovka_save_v2';

function saveGameProgress() {
  const data = {
    currentDay: currentDay,
    totalCoins: totalCoins,
    dailyGoal: dailyGoal,
    hasSecondShop: hasSecondShop,
    profitMultiplier: profitMultiplier,
    sashaHired: staffFryer.hired,
    upgStove: upgStove.bought,
    upgShoes: upgShoes.bought,
    upgSign: upgSign.bought
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {}
}

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
    if (typeof data.upgStove === 'boolean') upgStove.bought = data.upgStove;
    if (typeof data.upgShoes === 'boolean') upgShoes.bought = data.upgShoes;
    if (typeof data.upgSign === 'boolean') upgSign.bought = data.upgSign;
  } catch (e) {}
}

function resetGameProgress() {
  localStorage.removeItem(SAVE_KEY);
  currentDay = 1;
  totalCoins = 0;
  dayEarned = 0;
  dailyGoal = 500;
  hasSecondShop = false;
  profitMultiplier = 1;
  staffFryer.hired = false;
  upgStove.bought = false;
  upgShoes.bought = false;
  upgSign.bought = false;
  sashaHoldingPatty = false;
  timeMinutes = 480;
  isDayEnded = false;

  burgerLayers = new Array();
  isClosed = false;
  hasPattyOnPan = false;
  cookLevel = 0;
  hasFriesOnTray = false;
  hasColaOnTray = false;
  isFryingPotatoes = false;
  fryerLevel = 0;

  updateDayUI();
  refreshMainMenuStats();
  spawnCustomer();
}
