// Инициализация переменных
let credits = parseInt(localStorage.getItem('credits')) || 0;
let clickValue = parseInt(localStorage.getItem('clickValue')) || 1;
let autoClickValue = parseInt(localStorage.getItem('autoClickValue')) || 0;
let asteroidLevel = parseInt(localStorage.getItem('asteroidLevel')) || 1;
let progress = parseInt(localStorage.getItem('progress')) || 0;
let clickCount = parseInt(localStorage.getItem('clickCount')) || 0;
const progressMax = 100;

// Улучшения и предметы магазина
const upgradesAndShopItems = [
  { id: 'upgrade1', name: "Улучшить кирку", cost: 100, effect: () => clickValue += 1 },
  { id: 'upgrade2', name: "Нанять помощника", cost: 500, effect: () => autoClickValue += 1 },
  { id: 'upgrade3', name: "Автоматическая добыча", cost: 1000, effect: () => setInterval(autoMine, 1000) },
  { id: 'item1', name: "Улучшение брони", cost: 200, effect: () => alert("Броня улучшена!") },
  { id: 'item2', name: "Скорость добычи", cost: 300, effect: () => clickValue += 2 },
  { id: 'item3', name: "Редкий минерал", cost: 500, effect: () => credits += 100 },
  { id: 'item4', name: "Увеличение уровня астероида", cost: 1000, effect: () => asteroidLevel += 1 },
  { id: 'item5', name: "Автоматическая добыча", cost: 1500, effect: () => autoClickValue += 1 },
  { id: 'item6', name: "Буст добычи (30 сек)", cost: 400, effect: () => activateBoost('click', 2, 30000) },
  { id: 'item7', name: "Буст автоматической добычи (1 мин)", cost: 800, effect: () => activateBoost('auto', 3, 60000) }
];

// Квесты
const quests = [
  { name: "Новичок", condition: () => credits >= 100, reward: 50, completed: localStorage.getItem('quest1') === 'completed' },
  { name: "Опытный майнер", condition: () => credits >= 1000, reward: 200, completed: localStorage.getItem('quest2') === 'completed' },
  { name: "Магнат", condition: () => credits >= 10000, reward: 1000, completed: localStorage.getItem('quest3') === 'completed' },
];

// Достижения
const achievements = [
  { name: "Первый шаг", condition: () => credits >= 100, reward: 50, completed: false },
  { name: "Мастер кликов", condition: () => clickCount >= 500, reward: 100, completed: false },
  { name: "Богач", condition: () => credits >= 10000, reward: 1000, completed: false },
];

// Лидерборд
const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

// Элементы интерфейса
const creditsDisplay = document.getElementById('credits');
const asteroidLevelDisplay = document.getElementById('asteroidLevel');
const mineButton = document.getElementById('mineButton');
const progressBar = document.getElementById('progress');
const questsContainer = document.getElementById('quests');
const upgradesAndShopContainer = document.getElementById('upgradesAndShop');
const achievementsContainer = document.getElementById('achievements');
const leaderboardContainer = document.getElementById('leaderboard');

// Функция для добычи ресурсов
mineButton.addEventListener('click', () => {
  let mined = clickValue * asteroidLevel;
  if (Math.random() < 0.1) { // 10% шанс критического удара
    mined *= 2;
    alert(`Критический удар! +${mined} кредитов!`);
  }
  credits += mined;
  progress += clickValue;
  clickCount += 1;
  checkAsteroidLevel();
  if (progress >= progressMax) {
    progress = 0;
    randomEvent();
  }
  updateDisplay();
  checkQuests();
  checkAchievements();
  saveGame();
});

// Функция для автоматической добычи
function autoMine() {
  credits += autoClickValue * asteroidLevel;
  progress += autoClickValue;
  if (progress >= progressMax) {
    progress = 0;
    randomEvent();
  }
  updateDisplay();
  checkQuests();
  checkAchievements();
  saveGame();
}

// Рандомные события
function randomEvent() {
  const events = [
    { message: "Метеоритный дождь! +50 кредитов", effect: () => credits += 50 },
    { message: "Поломка оборудования! -30 кредитов", effect: () => credits -= 30 },
    { message: "Найден редкий минерал! +100 кредитов", effect: () => credits += 100 },
  ];
  const event = events[Math.floor(Math.random() * events.length)];
  event.effect();
  alert(event.message);
}

// Проверка квестов
function checkQuests() {
  quests.forEach((quest, index) => {
    if (!quest.completed && quest.condition()) {
      quest.completed = true;
      credits += quest.reward;
      localStorage.setItem(`quest${index + 1}`, 'completed');
      displayQuests();
    }
  });
}

// Отображение квестов
function displayQuests() {
  questsContainer.innerHTML = '';
  quests.forEach(quest => {
    const questElement = document.createElement('div');
    questElement.className = 'quest';
    if (quest.completed) {
      questElement.classList.add('completed');
      questElement.textContent = `${quest.name} выполнено! +${quest.reward} кредитов`;
    } else {
      questElement.classList.add('in-progress');
      questElement.textContent = `${quest.name}: ${quest.condition().toString()} (${quest.reward} кредитов)`;
    }
    questsContainer.appendChild(questElement);
  });
}

// Отображение улучшений и магазина
function displayUpgradesAndShop() {
  upgradesAndShopContainer.innerHTML = '';
  upgradesAndShopItems.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'upgrade-item';
    itemElement.textContent = `${item.name} - ${item.cost} кредитов`;
    const buyButton = document.createElement('button');
    buyButton.textContent = 'Купить';
    buyButton.onclick = () => buyItem(item);
    if (credits >= item.cost) {
      buyButton.classList.add('available');
    } else {
      buyButton.disabled = true;
    }
    itemElement.appendChild(buyButton);
    upgradesAndShopContainer.appendChild(itemElement);
  });
}

// Покупка улучшений и предметов
function buyItem(item) {
  if (credits >= item.cost) {
    credits -= item.cost;
    item.effect();
    updateDisplay();
    saveGame();
  } else {
    alert('Недостаточно кредитов!');
  }
}

// Активация бустов
function activateBoost(type, multiplier, duration) {
  if (type === 'click') {
    clickValue *= multiplier;
    setTimeout(() => clickValue /= multiplier, duration);
  } else if (type === 'auto') {
    autoClickValue *= multiplier;
    setTimeout(() => autoClickValue /= multiplier, duration);
  }
  alert(`Буст активирован на ${duration / 1000} секунд!`);
}

// Проверка достижений
function checkAchievements() {
  achievements.forEach((achievement, index) => {
    if (!achievement.completed && achievement.condition()) {
      achievement.completed = true;
      credits += achievement.reward;
      alert(`Достижение "${achievement.name}" выполнено! +${achievement.reward} кредитов!`);
      saveGame();
      displayAchievements();
    }
  });
}

// Отображение достижений
function displayAchievements() {
  achievementsContainer.innerHTML = '';
  achievements.forEach(achievement => {
    const achievementElement = document.createElement('div');
    achievementElement.className = 'achievement';
    if (achievement.completed) {
      achievementElement.classList.add('completed');
      achievementElement.textContent = `${achievement.name} выполнено! +${achievement.reward} кредитов`;
    } else {
      achievementElement.classList.add('in-progress');
      achievementElement.textContent = `${achievement.name}: ${achievement.condition().toString()} (${achievement.reward} кредитов)`;
    }
    achievementsContainer.appendChild(achievementElement);
  });
}

// Обновление интерфейса
function updateDisplay() {
  creditsDisplay.textContent = credits;
  asteroidLevelDisplay.textContent = asteroidLevel;
  progressBar.style.width = `${(progress / progressMax) * 100}%`;
  displayUpgradesAndShop();
  displayQuests();
  displayAchievements();
  if (credits >= 5000 && !leaderboardUpdated) {
    updateLeaderboard();
    leaderboardUpdated = true;
  }
}

// Проверка уровня астероида
function checkAsteroidLevel() {
  const levelThresholds = [300, 700, 1200];
  for (let i = 0; i < levelThresholds.length; i++) {
    if (clickCount >= levelThresholds[i] && asteroidLevel < i + 2) {
      asteroidLevel = i + 2;
      alert(`Уровень астероида повышен до ${asteroidLevel}!`);
      updateDisplay();
      saveGame();
    }
  }
}

// Сохранение игры
function saveGame() {
  localStorage.setItem('credits', credits);
  localStorage.setItem('clickValue', clickValue);
  localStorage.setItem('autoClickValue', autoClickValue);
  localStorage.setItem('asteroidLevel', asteroidLevel);
  localStorage.setItem('progress', progress);
  localStorage.setItem('clickCount', clickCount);
  localStorage.setItem('quests', JSON.stringify(quests));
  localStorage.setItem('achievements', JSON.stringify(achievements));
}

// Загрузка игры
function loadGame() {
  updateDisplay();
  displayQuests();
  displayUpgradesAndShop();
  displayAchievements();
  checkQuests();
  checkAchievements();
}

// Лидерборд
let leaderboardUpdated = false;

function updateLeaderboard() {
  const playerName = prompt("Введите ваше имя для таблицы лидеров:");
  if (playerName) {
    leaderboard.push({ name: playerName, score: credits });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    displayLeaderboard();
  }
}

function displayLeaderboard() {
  leaderboardContainer.innerHTML = '<h2>Таблица лидеров</h2>';
  leaderboard.forEach((entry, index) => {
    const entryElement = document.createElement('div');
    entryElement.className = 'leaderboard-entry';
    entryElement.textContent = `${index + 1}. ${entry.name}: ${entry.score} кредитов`;
    leaderboardContainer.appendChild(entryElement);
  });
}

// Запуск игры
loadGame();