const recipes = new Array(
  { title: 'Классика (1 котлета)', patty: 1, cheese: 0, salad: 0, reward: 150 },
  { title: 'Чизбургер (котлета + сыр)', patty: 1, cheese: 1, salad: 0, reward: 200 },
  { title: 'Фреш (котлета + салат)', patty: 1, cheese: 0, salad: 1, reward: 200 },
  { title: 'Двойной чиз (2 котлеты + 2 сыра)', patty: 2, cheese: 2, salad: 0, reward: 360 },
  { title: 'Шеф-Бургер (котлета + сыр + салат)', patty: 1, cheese: 1, salad: 1, reward: 280 }
);

const customerStyles = new Array(
  { name: 'Артём', shirt: '#3b82f6', shirtDark: '#2563eb', stripe: '#93c5fd', pants: '#334155', pantsDark: '#1e293b', shoes: '#ef4444', hair: '#78350f', hairDark: '#451a03', skin: '#fed7aa', skinDark: '#fdba74' },
  { name: 'Макс', shirt: '#10b981', shirtDark: '#059669', stripe: '#6ee7b7', pants: '#334155', pantsDark: '#1e293b', shoes: '#f59e0b', hair: '#d97706', hairDark: '#b45309', skin: '#fde68a', skinDark: '#fcd34d' },
  { name: 'Вика', shirt: '#ec4899', shirtDark: '#db2777', stripe: '#fbcfe8', pants: '#4338ca', pantsDark: '#3730a3', shoes: '#f8fafc', hair: '#9a3412', hairDark: '#7c2d12', skin: '#ffedd5', skinDark: '#fed7aa' },
  { name: 'Дима', shirt: '#f97316', shirtDark: '#ea580c', stripe: '#fed7aa', pants: '#334155', pantsDark: '#1e293b', shoes: '#38bdf8', hair: '#57534e', hairDark: '#44403c', skin: '#fed7aa', skinDark: '#fdba74' }
);

let currentCustomer = null;
let customerJump = 0;
let customerShake = 0;

// Таймер ожидания следующего клиента (в секундах)
let nextCustomerTimer = 0;

function spawnCustomer() {
  const style = customerStyles.at(Math.floor(Math.random() * customerStyles.length));
  const order = recipes.at(Math.floor(Math.random() * recipes.length));
  currentCustomer = {
    name: style.name,
    shirt: style.shirt,
    shirtDark: style.shirtDark,
    stripe: style.stripe,
    pants: style.pants,
    pantsDark: style.pantsDark,
    shoes: style.shoes,
    hair: style.hair,
    hairDark: style.hairDark,
    skin: style.skin,
    skinDark: style.skinDark,
    order: order
  };
  customerJump = 14;
  nextCustomerTimer = 0;
  playSound(520, 0.14);
  document.getElementById('order-desc').innerText = currentCustomer.name + ': ' + currentCustomer.order.title + ' (' + currentCustomer.order.reward + ' ₽)';
}

// Запускаем 10-секундный перерыв после того, как клиент получил заказ
function scheduleNextCustomer(delaySec) {
  currentCustomer = null;
  nextCustomerTimer = delaySec || 10;
  document.getElementById('order-desc').innerText = 'Следующий клиент через ' + Math.ceil(nextCustomerTimer) + ' сек...';
}

// Обновление 10-секундного таймера каждый кадр
function updateCustomerTimer() {
  if (isGamePaused || isDayEnded) return;
  if (currentCustomer !== null) return;

  if (nextCustomerTimer > 0) {
    nextCustomerTimer -= 1 / 60;
    const secLeft = Math.max(1, Math.ceil(nextCustomerTimer));
    document.getElementById('order-desc').innerText = 'Следующий клиент через ' + secLeft + ' сек...';

    if (nextCustomerTimer <= 0) {
      spawnCustomer();
      statusText.innerText = '🔔 Подошёл новый покупатель: ' + currentCustomer.name + '!';
    }
  }
}

function drawCustomerBody3D() {
  if (!currentCustomer) return;

  if (customerJump > 0) customerJump -= 1.2;
  if (customerShake > 0) customerShake -= 1;

  const t = Date.now() * 0.004;
  const idle = Math.abs(Math.sin(t)) * 2.2;
  const shakeX = customerShake > 0 ? Math.sin(customerShake * 1.6) * 5 : 0;
  const cx = shakeX;
  const cz = -92;
  const baseY = idle + customerJump;

  // Кроссовки
  drawBox3DImmediate(cx - 11, 0, cz + 2, 15, 4, 20, '#ffffff', '#e2e8f0');
  drawBox3DImmediate(cx + 11, 0, cz + 2, 15, 4, 20, '#ffffff', '#e2e8f0');
  drawBox3DImmediate(cx - 11, 4, cz + 1, 15, 6, 18, currentCustomer.shoes, currentCustomer.shoes);
  drawBox3DImmediate(cx + 11, 4, cz + 1, 15, 6, 18, currentCustomer.shoes, currentCustomer.shoes);

  // Штаны
  drawBox3DImmediate(cx - 11, 10, cz, 14, 21, 16, currentCustomer.pants, currentCustomer.pantsDark);
  drawBox3DImmediate(cx + 11, 10, cz, 14, 21, 16, currentCustomer.pants, currentCustomer.pantsDark);

  // Туловище
  const bodyY = 31 + baseY;
  drawBox3DImmediate(cx, bodyY, cz, 44, 14, 24, currentCustomer.shirt, currentCustomer.shirt);
  drawBox3DImmediate(cx, bodyY + 14, cz, 44, 7, 24, currentCustomer.stripe, currentCustomer.stripe);
  drawBox3DImmediate(cx, bodyY + 21, cz, 44, 14, 24, currentCustomer.shirt, currentCustomer.shirt);
  drawBox3DImmediate(cx, bodyY + 34, cz, 24, 3, 20, '#f8fafc', '#e2e8f0');

  // Руки
  const armWave = Math.sin(Date.now() * 0.005) * 3;
  drawBox3DImmediate(cx - 29, bodyY + 22 + armWave, cz, 12, 12, 14, currentCustomer.shirt, currentCustomer.shirtDark);
  drawBox3DImmediate(cx + 29, bodyY + 22 - armWave, cz, 12, 12, 14, currentCustomer.shirt, currentCustomer.shirtDark);
  drawBox3DImmediate(cx - 29, bodyY + 5 + armWave, cz + 2, 10, 17, 11, currentCustomer.skin, currentCustomer.skin);
  drawBox3DImmediate(cx + 29, bodyY + 5 - armWave, cz + 2, 10, 17, 11, currentCustomer.skin, currentCustomer.skin);

  // Шея, уши, голова и волосы
  const neckY = bodyY + 36;
  drawBox3DImmediate(cx, neckY, cz, 16, 6, 16, currentCustomer.skin, currentCustomer.skinDark);

  const headY = neckY + 5;
  drawBox3DImmediate(cx, headY + 6, cz - 13, 32, 22, 8, currentCustomer.hair, currentCustomer.hairDark);
  drawBox3DImmediate(cx - 17, headY + 10, cz, 5, 10, 8, currentCustomer.skin, currentCustomer.skinDark);
  drawBox3DImmediate(cx + 17, headY + 10, cz, 5, 10, 8, currentCustomer.skin, currentCustomer.skinDark);
  drawBox3DImmediate(cx, headY, cz, 30, 28, 28, currentCustomer.skin, currentCustomer.skin);
  drawBox3DImmediate(cx, headY + 27, cz - 1, 33, 8, 30, currentCustomer.hair, currentCustomer.hairDark);
  drawBox3DImmediate(cx - 7, headY + 24, cz + 14, 15, 4, 4, currentCustomer.hair, currentCustomer.hairDark);

  // Лицо
  const eyeL = project3D(cx - 7, headY + 16, cz + 15);
  const eyeR = project3D(cx + 7, headY + 16, cz + 15);
  const cheekL = project3D(cx - 10, headY + 10, cz + 15);
  const cheekR = project3D(cx + 10, headY + 10, cz + 15);
  const nose = project3D(cx, headY + 12, cz + 16);
  const mouth = project3D(cx, headY + 6, cz + 15);

  if (eyeL.visible && eyeR.visible && player.z > cz) {
    const isBlinking = (Date.now() % 3500) < 130;

    if (isBlinking) {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2 * eyeL.scale;
      ctx.beginPath();
      ctx.moveTo(eyeL.x - 4 * eyeL.scale, eyeL.y);
      ctx.lineTo(eyeL.x + 4 * eyeL.scale, eyeL.y);
      ctx.moveTo(eyeR.x - 4 * eyeR.scale, eyeR.y);
      ctx.lineTo(eyeR.x + 4 * eyeR.scale, eyeR.y);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeL.x, eyeL.y, 4 * eyeL.scale, 0, Math.PI * 2);
      ctx.arc(eyeR.x, eyeR.y, 4 * eyeR.scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(eyeL.x, eyeL.y, 2.1 * eyeL.scale, 0, Math.PI * 2);
      ctx.arc(eyeR.x, eyeR.y, 2.1 * eyeR.scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeL.x - 0.8 * eyeL.scale, eyeL.y - 0.8 * eyeL.scale, 0.8 * eyeL.scale, 0, Math.PI * 2);
      ctx.arc(eyeR.x - 0.8 * eyeR.scale, eyeR.y - 0.8 * eyeR.scale, 0.8 * eyeR.scale, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = currentCustomer.hairDark;
    ctx.lineWidth = 2.2 * eyeL.scale;
    ctx.beginPath();
    ctx.moveTo(eyeL.x - 4.5 * eyeL.scale, eyeL.y - 5.5 * eyeL.scale);
    ctx.lineTo(eyeL.x + 3.5 * eyeL.scale, eyeL.y - 5 * eyeL.scale);
    ctx.moveTo(eyeR.x - 3.5 * eyeR.scale, eyeR.y - 5 * eyeR.scale);
    ctx.lineTo(eyeR.x + 4.5 * eyeR.scale, eyeR.y - 5.5 * eyeR.scale);
    ctx.stroke();

    ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
    ctx.beginPath();
    ctx.arc(cheekL.x, cheekL.y, 3 * cheekL.scale, 0, Math.PI * 2);
    ctx.arc(cheekR.x, cheekR.y, 3 * cheekR.scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fb923c';
    ctx.beginPath();
    ctx.arc(nose.x, nose.y, 2.3 * nose.scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2 * mouth.scale;
    ctx.beginPath();
    if (customerShake > 0) {
      ctx.arc(mouth.x, mouth.y + 3 * mouth.scale, 5 * mouth.scale, Math.PI, 0);
    } else {
      ctx.arc(mouth.x, mouth.y, 5 * mouth.scale, 0, Math.PI);
    }
    ctx.stroke();
  }

  // Облачко с заказом над головой
  const bubblePos = project3D(cx, headY + 46, cz);
  if (bubblePos.visible) {
    const text = currentCustomer.order.title;
    ctx.font = 'bold 12px Segoe UI';
    const tw = ctx.measureText(text).width + 18;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.roundRect(bubblePos.x - tw / 2, bubblePos.y - 14, tw, 24, 8);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.fillText(text, bubblePos.x, bubblePos.y + 2);
  }
}
