// Firebase إعداد
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCIngK0rjuc0afE5rDjNHzV7ALmBj0CY78",
  authDomain: "farm-ecb9f.firebaseapp.com",
  databaseURL: "https://farm-ecb9f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "farm-ecb9f",
  storageBucket: "farm-ecb9f.firebasestorage.app",
  messagingSenderId: "500210794931",
  appId: "1:500210794931:web:43466af6701d0f69844bc6",
  measurementId: "G-2B17MMQRYK"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentPlayer = null;
let gameInterval = null;
let isOnline = true;
let lastOnlineTime = Date.now();

const BASE_FARM_TIME = 300;
const BASE_MINE_TIME = 300;
const BASE_QUARRY_TIME = 240;

const LEVEL_CONFIG = {
  farm: [
    { level: 1, production: 10, time: 300, cost: 0 },
    { level: 2, production: 20, time: 300, cost: 50 },
    { level: 3, production: 35, time: 285, cost: 100 },
    { level: 4, production: 50, time: 285, cost: 200 },
    { level: 5, production: 75, time: 270, cost: 400 },
    { level: 6, production: 100, time: 270, cost: 700 },
    { level: 7, production: 140, time: 255, cost: 1200 },
    { level: 8, production: 180, time: 255, cost: 2000 },
    { level: 9, production: 240, time: 240, cost: 3500 },
    { level: 10, production: 300, time: 240, cost: 6000 },
    { level: 11, production: 400, time: 225, cost: 10000 },
    { level: 12, production: 500, time: 225, cost: 16000 },
    { level: 13, production: 650, time: 210, cost: 25000 },
    { level: 14, production: 800, time: 210, cost: 40000 },
    { level: 15, production: 1000, time: 195, cost: 65000 },
    { level: 16, production: 1300, time: 195, cost: 100000 },
    { level: 17, production: 1600, time: 180, cost: 150000 },
    { level: 18, production: 2000, time: 180, cost: 230000 },
    { level: 19, production: 2500, time: 165, cost: 350000 },
    { level: 20, production: 3500, time: 150, cost: 500000 }
  ],
  mine: [
    { level: 1, production: 8, time: 300, cost: 0 },
    { level: 2, production: 16, time: 300, cost: 50 },
    { level: 3, production: 28, time: 285, cost: 100 },
    { level: 4, production: 40, time: 285, cost: 200 },
    { level: 5, production: 60, time: 270, cost: 400 },
    { level: 6, production: 80, time: 270, cost: 700 },
    { level: 7, production: 110, time: 255, cost: 1200 },
    { level: 8, production: 145, time: 255, cost: 2000 },
    { level: 9, production: 190, time: 240, cost: 3500 },
    { level: 10, production: 240, time: 240, cost: 6000 },
    { level: 11, production: 320, time: 225, cost: 10000 },
    { level: 12, production: 400, time: 225, cost: 16000 },
    { level: 13, production: 520, time: 210, cost: 25000 },
    { level: 14, production: 650, time: 210, cost: 40000 },
    { level: 15, production: 800, time: 195, cost: 65000 },
    { level: 16, production: 1050, time: 195, cost: 100000 },
    { level: 17, production: 1300, time: 180, cost: 150000 },
    { level: 18, production: 1600, time: 180, cost: 230000 },
    { level: 19, production: 2000, time: 165, cost: 350000 },
    { level: 20, production: 2800, time: 150, cost: 500000 }
  ],
  quarry: [
    { level: 1, production: 5, time: 240, cost: 0 },
    { level: 2, production: 10, time: 240, cost: 30 },
    { level: 3, production: 18, time: 230, cost: 60 },
    { level: 4, production: 25, time: 230, cost: 120 },
    { level: 5, production: 38, time: 220, cost: 250 },
    { level: 6, production: 50, time: 220, cost: 450 },
    { level: 7, production: 70, time: 210, cost: 800 },
    { level: 8, production: 90, time: 210, cost: 1400 },
    { level: 9, production: 120, time: 200, cost: 2500 },
    { level: 10, production: 150, time: 200, cost: 4200 },
    { level: 11, production: 200, time: 190, cost: 7000 },
    { level: 12, production: 250, time: 190, cost: 11000 },
    { level: 13, production: 330, time: 180, cost: 18000 },
    { level: 14, production: 410, time: 180, cost: 28000 },
    { level: 15, production: 500, time: 170, cost: 45000 },
    { level: 16, production: 650, time: 170, cost: 70000 },
    { level: 17, production: 800, time: 160, cost: 105000 },
    { level: 18, production: 1000, time: 160, cost: 160000 },
    { level: 19, production: 1250, time: 150, cost: 245000 },
    { level: 20, production: 1750, time: 140, cost: 350000 }
  ]
};

const BUILDINGS = {
  factory: [
    { level: 1, cost: 500, ironReq: 10, stoneReq: 10, produces: 5 },
    { level: 2, cost: 1000, ironReq: 20, stoneReq: 20, produces: 12 },
    { level: 3, cost: 2500, ironReq: 40, stoneReq: 40, produces: 25 },
    { level: 4, cost: 6000, ironReq: 80, stoneReq: 80, produces: 55 },
    { level: 5, cost: 15000, ironReq: 150, stoneReq: 150, produces: 120 },
    { level: 6, cost: 35000, ironReq: 300, stoneReq: 300, produces: 250 }
  ],
  village: [
    { level: 1, goldCost: 800, buildMatCost: 20, foodReq: 50, bonus: 1.1 },
    { level: 2, goldCost: 2000, buildMatCost: 50, foodReq: 100, bonus: 1.25 },
    { level: 3, goldCost: 5000, buildMatCost: 120, foodReq: 200, bonus: 1.4 },
    { level: 4, goldCost: 12000, buildMatCost: 300, foodReq: 400, bonus: 1.6 },
    { level: 5, goldCost: 30000, buildMatCost: 700, foodReq: 800, bonus: 1.85 },
    { level: 6, goldCost: 70000, buildMatCost: 1500, foodReq: 1500, bonus: 2.2 }
  ],
  army: [
    { level: 1, goldCost: 1200, ironReq: 30, foodReq: 30, points: 100 },
    { level: 2, goldCost: 3000, ironReq: 70, foodReq: 70, points: 250 },
    { level: 3, goldCost: 7500, ironReq: 150, foodReq: 150, points: 600 },
    { level: 4, goldCost: 18000, ironReq: 350, foodReq: 350, points: 1500 },
    { level: 5, goldCost: 45000, ironReq: 800, foodReq: 800, points: 3500 },
    { level: 6, goldCost: 100000, ironReq: 1800, foodReq: 1800, points: 8000 }
  ],
  market: [
    { level: 1, cost: 0, sellRate: 0.5 },
    { level: 2, cost: 800, sellRate: 0.7 },
    { level: 3, cost: 2000, sellRate: 0.9 },
    { level: 4, cost: 5000, sellRate: 1.2 },
    { level: 5, cost: 12000, sellRate: 1.5 },
    { level: 6, cost: 30000, sellRate: 2.0 }
  ]
};

document.getElementById("login-btn").addEventListener("click", login);
document.getElementById("register-btn").addEventListener("click", register);
document.getElementById("show-register-btn").addEventListener("click", showRegister);
document.getElementById("show-login-btn").addEventListener("click", showLogin);
document.getElementById("logout-btn").addEventListener("click", logout);

window.addEventListener('focus', () => {
  isOnline = true;
  if (currentPlayer) calculateOfflineProgress();
});

window.addEventListener('blur', () => {
  isOnline = false;
  lastOnlineTime = Date.now();
});

function calculateOfflineProgress() {
  if (!currentPlayer) return;
  const now = Date.now();
  const lastLogin = new Date(currentPlayer.lastLogin).getTime();
  const offlineTime = Math.floor((now - lastLogin) / 1000);
  if (offlineTime < 10) return;
  
  const farmConfig = LEVEL_CONFIG.farm[currentPlayer.farmLevel - 1];
  const mineConfig = LEVEL_CONFIG.mine[currentPlayer.mineLevel - 1];
  const quarryConfig = LEVEL_CONFIG.quarry[currentPlayer.quarryLevel - 1];
  const farmCycles = Math.floor(offlineTime / farmConfig.time);
  const mineCycles = Math.floor(offlineTime / mineConfig.time);
  const quarryCycles = Math.floor(offlineTime / quarryConfig.time);
  const offlineRate = 0.65;
  const villageBonus = currentPlayer.villageLevel > 0 ? BUILDINGS.village[currentPlayer.villageLevel - 1].bonus : 1;
  
  const foodGained = Math.floor(farmCycles * farmConfig.production * villageBonus * offlineRate);
  const ironGained = Math.floor(mineCycles * mineConfig.production * offlineRate);
  const stoneGained = Math.floor(quarryCycles * quarryConfig.production * offlineRate);
  
  currentPlayer.food += foodGained;
  currentPlayer.iron += ironGained;
  currentPlayer.stone += stoneGained;
  currentPlayer.crops += foodGained;
  currentPlayer.minedIron += ironGained;
  currentPlayer.minedStone += stoneGained;
  currentPlayer.farmTimer = farmConfig.time - (offlineTime % farmConfig.time);
  currentPlayer.mineTimer = mineConfig.time - (offlineTime % mineConfig.time);
  currentPlayer.quarryTimer = quarryConfig.time - (offlineTime % quarryConfig.time);
  
  if (foodGained > 0 || ironGained > 0 || stoneGained > 0) {
    alert(`📦 إنتاج أثناء غيابك (65%):\n🌾 ${foodGained} غذاء\n⛏️ ${ironGained} حديد\n🪨 ${stoneGained} حجر`);
  }
  updateDisplay();
  savePlayerData();
}

function register() {
  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value;
  const msg = document.getElementById('register-message');
  if (!username || !password) {
    msg.innerHTML = "❌ الرجاء إدخال جميع الحقول";
    msg.style.color = "#e74c3c";
    return;
  }
  const playerRef = ref(db, 'players/' + username);
  get(playerRef).then(snapshot => {
    if (snapshot.exists()) {
      msg.innerHTML = "❌ هذا الاسم مستخدم مسبقًا";
      msg.style.color = "#e74c3c";
    } else {
      const newPlayer = {
        password: password,
        playerData: {
          name: username,
          gold: 100,
          food: 0,
          iron: 0,
          stone: 0,
          buildingMaterials: 0,
          crops: 0,
          minedIron: 0,
          minedStone: 0,
          farmLevel: 1,
          mineLevel: 1,
          quarryLevel: 1,
          factoryLevel: 0,
          villageLevel: 0,
          armyLevel: 0,
          marketLevel: 1,
          score: 0,
          level: 1,
          farmTimer: BASE_FARM_TIME,
          mineTimer: BASE_MINE_TIME,
          quarryTimer: BASE_QUARRY_TIME,
          joinDate: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      };
      set(playerRef, newPlayer).then(() => {
        msg.innerHTML = "✅ تم إنشاء الحساب بنجاح!";
        msg.style.color = "#27ae60";
        setTimeout(showLogin, 2000);
      }).catch(error => {
        msg.innerHTML = "❌ خطأ: " + error.message;
        msg.style.color = "#e74c3c";
      });
    }
  }).catch(error => {
    msg.innerHTML = "❌ خطأ: " + error.message;
    msg.style.color = "#e74c3c";
  });
}

function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const msg = document.getElementById('login-message');
  const playerRef = ref(db, 'players/' + username);
  get(playerRef).then(snapshot => {
    if (snapshot.exists()) {
      const player = snapshot.val();
      if (player.password === password) {
        currentPlayer = player.playerData;
        lastOnlineTime = Date.now();
        isOnline = true;
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        document.getElementById('current-player').textContent = currentPlayer.name;
        calculateOfflineProgress();
        startGameLoop();
        loadLeaderboard();
        updateDisplay();
      } else {
        msg.innerHTML = "❌ كلمة المرور غير صحيحة";
        msg.style.color = "#e74c3c";
      }
    } else {
      msg.innerHTML = "❌ اسم المستخدم غير موجود";
      msg.style.color = "#e74c3c";
    }
  }).catch(error => {
    msg.innerHTML = "❌ خطأ: " + error.message;
    msg.style.color = "#e74c3c";
  });
}

function showRegister() {
  document.getElementById('login-form').style.display = 'none';
  document.getElementById('register-form').style.display = 'block';
}

function showLogin() {
  document.getElementById('register-form').style.display = 'none';
  document.getElementById('login-form').style.display = 'block';
}

function logout() {
  if (currentPlayer) {
    currentPlayer.lastLogin = new Date().toISOString();
    savePlayerData();
  }
  if (gameInterval) clearInterval(gameInterval);
  currentPlayer = null;
  isOnline = false;
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  showLogin();
}

function startGameLoop() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    if (!currentPlayer) return;
    const productionRate = isOnline ? 1 : 0.65;
    currentPlayer.farmTimer--;
    currentPlayer.mineTimer--;
    currentPlayer.quarryTimer--;
    
    if (currentPlayer.farmTimer <= 0) {
      const farmConfig = LEVEL_CONFIG.farm[currentPlayer.farmLevel - 1];
      const villageBonus = currentPlayer.villageLevel > 0 ? BUILDINGS.village[currentPlayer.villageLevel - 1].bonus : 1;
      const production = Math.floor(farmConfig.production * villageBonus * productionRate);
      currentPlayer.food += production;
      currentPlayer.crops += production;
      currentPlayer.score += production;
      currentPlayer.farmTimer = farmConfig.time;
    }
    
    if (currentPlayer.mineTimer <= 0) {
      const mineConfig = LEVEL_CONFIG.mine[currentPlayer.mineLevel - 1];
      const production = Math.floor(mineConfig.production * productionRate);
      currentPlayer.iron += production;
      currentPlayer.minedIron += production;
      currentPlayer.score += production;
      currentPlayer.mineTimer = mineConfig.time;
    }
    
    if (currentPlayer.quarryTimer <= 0) {
      const quarryConfig = LEVEL_CONFIG.quarry[currentPlayer.quarryLevel - 1];
      const production = Math.floor(quarryConfig.production * productionRate);
      currentPlayer.stone += production;
      currentPlayer.minedStone += production;
      currentPlayer.score += production;
      currentPlayer.quarryTimer = quarryConfig.time;
    }
    
    currentPlayer.level = Math.floor(currentPlayer.score / 1000) + 1;
    updateDisplay();
    if (Date.now() - lastOnlineTime > 60000) {
      lastOnlineTime = Date.now();
      savePlayerData();
    }
  }, 1000);
}

function savePlayerData() {
  if (!currentPlayer) return;
  const playerRef = ref(db, 'players/' + currentPlayer.name + '/playerData');
  update(playerRef, currentPlayer);
}

function loadLeaderboard() {
  const playersRef = ref(db, 'players');
  onValue(playersRef, (snapshot) => {
    const players = [];
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      if (data.playerData) players.push(data.playerData);
    });
    players.sort((a, b) => b.score - a.score);
    const leaderboardEl = document.getElementById('players-list');
    leaderboardEl.innerHTML = '';
    players.slice(0, 10).forEach((player, index) => {
      const div = document.createElement('div');
      div.className = 'leaderboard-item' + (player.name === currentPlayer.name ? ' current-player' : '');
      div.innerHTML = `<span class="rank">#${index + 1}</span><span class="name">${player.name}</span><span class="score">${Math.floor(player.score)} نقطة</span>`;
      leaderboardEl.appendChild(div);
    });
  });
}

function updateDisplay() {
  if (!currentPlayer) return;
  document.getElementById('gold').textContent = Math.floor(currentPlayer.gold);
  document.getElementById('food').textContent = Math.floor(currentPlayer.food);
  document.getElementById('iron').textContent = Math.floor(currentPlayer.iron);
  document.getElementById('stone').textContent = Math.floor(currentPlayer.stone);
  document.getElementById('building-materials').textContent = Math.floor(currentPlayer.buildingMaterials);
  document.getElementById('level').textContent = currentPlayer.level;
  document.getElementById('score').textContent = Math.floor(currentPlayer.score);
  
  const farmConfig = LEVEL_CONFIG.farm[currentPlayer.farmLevel - 1];
  const villageBonus = currentPlayer.villageLevel > 0 ? BUILDINGS.village[currentPlayer.villageLevel - 1].bonus : 1;
  document.getElementById('farm-level').textContent = currentPlayer.farmLevel;
  document.getElementById('farm-production').textContent = Math.floor(farmConfig.production * villageBonus);
  document.getElementById('crops').textContent = Math.floor(currentPlayer.crops);
  document.getElementById('farm-timer').textContent = formatTime(currentPlayer.farmTimer);
  document.getElementById('farm-progress').style.width = ((farmConfig.time - currentPlayer.farmTimer) / farmConfig.time * 100) + '%';
  document.getElementById('farm-cost').textContent = currentPlayer.farmLevel < 20 ? LEVEL_CONFIG.farm[currentPlayer.farmLevel].cost : '—';
  
  const mineConfig = LEVEL_CONFIG.mine[currentPlayer.mineLevel - 1];
  document.getElementById('mine-level').textContent = currentPlayer.mineLevel;
  document.getElementById('mine-production').textContent = mineConfig.production;
  document.getElementById('mined-iron').textContent = Math.floor(currentPlayer.minedIron);
  document.getElementById('mine-timer').textContent = formatTime(currentPlayer.mineTimer);
  document.getElementById('mine-progress').style.width = ((mineConfig.time - currentPlayer.mineTimer) / mineConfig.time * 100) + '%';
  document.getElementById('mine-cost').textContent = currentPlayer.mineLevel < 20 ? LEVEL_CONFIG.mine[currentPlayer.mineLevel].cost : '—';
  
  const quarryConfig = LEVEL_CONFIG.quarry[currentPlayer.quarryLevel - 1];
  document.getElementById('quarry-level').textContent = currentPlayer.quarryLevel;
  document.getElementById('quarry-production').textContent = quarryConfig.production;
  document.getElementById('mined-stone').textContent = Math.floor(currentPlayer.minedStone);
  document.getElementById('quarry-timer').textContent = formatTime(currentPlayer.quarryTimer);
  document.getElementById('quarry-progress').style.width = ((quarryConfig.time - currentPlayer.quarryTimer) / quarryConfig.time * 100) + '%';
  document.getElementById('quarry-cost').textContent = currentPlayer.quarryLevel < 20 ? LEVEL_CONFIG.quarry[currentPlayer.quarryLevel].cost : '—';
  
  updateFactoryDisplay();
  updateVillageDisplay();
  updateArmyDisplay();
  updateMarketDisplay();
}

function updateFactoryDisplay() {
  const factoryEl = document.getElementById('factory-level');
  const statusEl = document.getElementById('factory-status');
  const produceBtn = document.getElementById('produce-building');
  const upgradeBtn = document.getElementById('upgrade-factory');
  if (currentPlayer.factoryLevel === 0) {
    factoryEl.textContent = '—';
    statusEl.textContent = 'غير مبني';
    produceBtn.disabled = true;
    upgradeBtn.textContent = `بناء المصنع (تكلفة: ${BUILDINGS.factory[0].cost} ذهب)`;
  } else {
    const factory = BUILDINGS.factory[currentPlayer.factoryLevel - 1];
    factoryEl.textContent = currentPlayer.factoryLevel;
    statusEl.textContent = `يحول ${factory.ironReq} حديد + ${factory.stoneReq} حجر → ${factory.produces} مواد بناء`;
    produceBtn.disabled = false;
    if (currentPlayer.factoryLevel < 6) {
      const nextFactory = BUILDINGS.factory[currentPlayer.factoryLevel];
      upgradeBtn.textContent = `تطوير المصنع (تكلفة: ${nextFactory.cost} ذهب)`;
      upgradeBtn.disabled = false;
    } else {
      upgradeBtn.textContent = 'المستوى الأقصى';
      upgradeBtn.disabled = true;
    }
  }
}

function updateVillageDisplay() {
  const villageEl = document.getElementById('village-level');
  const bonusEl = document.getElementById('village-bonus');
  const upgradeBtn = document.getElementById('upgrade-village');
  if (currentPlayer.villageLevel === 0) {
    villageEl.textContent = '—';
    bonusEl.textContent = '+0%';
    const village = BUILDINGS.village[0];
    upgradeBtn.textContent = `بناء القرية (${village.goldCost} ذهب + ${village.buildMatCost} مواد بناء + ${village.foodReq} غذاء)`;
  } else {
    const village = BUILDINGS.village[currentPlayer.villageLevel - 1];
    villageEl.textContent = currentPlayer.villageLevel;
    bonusEl.textContent = `+${Math.floor((village.bonus - 1) * 100)}%`;
    if (currentPlayer.villageLevel < 6) {
      const nextVillage = BUILDINGS.village[currentPlayer.villageLevel];
      upgradeBtn.textContent = `تطوير القرية (${nextVillage.goldCost} ذهب + ${nextVillage.buildMatCost} مواد + ${nextVillage.foodReq} غذاء)`;
      upgradeBtn.disabled = false;
    } else {
      upgradeBtn.textContent = 'المستوى الأقصى';
      upgradeBtn.disabled = true;
    }
  }
}

function updateArmyDisplay() {
  const armyEl = document.getElementById('army-level');
  const pointsEl = document.getElementById('army-points');
  const upgradeBtn = document.getElementById('upgrade-army');
  if (currentPlayer.armyLevel === 0) {
    armyEl.textContent = '—';
    pointsEl.textContent = '0';
    const army = BUILDINGS.army[0];
    upgradeBtn.textContent = `بناء الجيش (${army.goldCost} ذهب + ${army.ironReq} حديد + ${army.foodReq} غذاء)`;
  } else {
    const army = BUILDINGS.army[currentPlayer.armyLevel - 1];
    armyEl.textContent = currentPlayer.armyLevel;
    pointsEl.textContent = army.points;
    if (currentPlayer.armyLevel < 6) {
      const nextArmy = BUILDINGS.army[currentPlayer.armyLevel];
      upgradeBtn.textContent = `تطوير الجيش (${nextArmy.goldCost} ذهب + ${nextArmy.ironReq} حديد + ${nextArmy.foodReq} غذاء)`;
      upgradeBtn.disabled = false;
    } else {
      upgradeBtn.textContent = 'المستوى الأقصى';
      upgradeBtn.disabled = true;
    }
  }
}

function updateMarketDisplay() {
  const marketEl = document.getElementById('market-level');
  const rateEl = document.getElementById('market-rate');
  const upgradeBtn = document.getElementById('upgrade-market');
  const market = BUILDINGS.market[currentPlayer.marketLevel - 1];
  marketEl.textContent = currentPlayer.marketLevel;
  rateEl.textContent = market.sellRate;
  if (currentPlayer.marketLevel < 6) {
    const nextMarket = BUILDINGS.market[currentPlayer.marketLevel];
    upgradeBtn.textContent = `تطوير السوق (تكلفة: ${nextMarket.cost} ذهب)`;
    upgradeBtn.disabled = false;
  } else {
    upgradeBtn.textContent = 'المستوى الأقصى';
    upgradeBtn.disabled = true;
  }
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

window.upgradeFarm = function() {
  if (currentPlayer.farmLevel >= 20) {
    alert('⚠️ وصلت للمستوى الأقصى!');
    return;
  }
  const nextLevel = LEVEL_CONFIG.farm[currentPlayer.farmLevel];
  if (currentPlayer.gold >= nextLevel.cost) {
    currentPlayer.gold -= nextLevel.cost;
    currentPlayer.mineLevel++;
    currentPlayer.mineTimer = nextLevel.time;
    updateDisplay();
    savePlayerData();
    alert('✅ تم تطوير المنجم!');
  } else {
    alert('❌ ذهب غير كافٍ!');
  }
}

window.upgradeQuarry = function() {
  if (currentPlayer.quarryLevel >= 20) {
    alert('⚠️ وصلت للمستوى الأقصى!');
    return;
  }
  const nextLevel = LEVEL_CONFIG.quarry[currentPlayer.quarryLevel];
  if (currentPlayer.gold >= nextLevel.cost) {
    currentPlayer.gold -= nextLevel.cost;
    currentPlayer.quarryLevel++;
    currentPlayer.quarryTimer = nextLevel.time;
    updateDisplay();
    savePlayerData();
    alert('✅ تم تطوير المحجر!');
  } else {
    alert('❌ ذهب غير كافٍ!');
  }
}

window.upgradeFactory = function() {
  if (currentPlayer.factoryLevel === 0) {
    const factory = BUILDINGS.factory[0];
    if (currentPlayer.gold >= factory.cost) {
      currentPlayer.gold -= factory.cost;
      currentPlayer.factoryLevel = 1;
      updateDisplay();
      savePlayerData();
      alert('✅ تم بناء المصنع!');
    } else {
      alert('❌ ذهب غير كافٍ!');
    }
  } else if (currentPlayer.factoryLevel < 6) {
    const nextFactory = BUILDINGS.factory[currentPlayer.factoryLevel];
    if (currentPlayer.gold >= nextFactory.cost) {
      currentPlayer.gold -= nextFactory.cost;
      currentPlayer.factoryLevel++;
      updateDisplay();
      savePlayerData();
      alert('✅ تم تطوير المصنع!');
    } else {
      alert('❌ ذهب غير كافٍ!');
    }
  }
}

window.produceBuilding = function() {
  if (currentPlayer.factoryLevel === 0) {
    alert('❌ يجب بناء المصنع أولاً!');
    return;
  }
  const factory = BUILDINGS.factory[currentPlayer.factoryLevel - 1];
  if (currentPlayer.iron >= factory.ironReq && currentPlayer.stone >= factory.stoneReq) {
    currentPlayer.iron -= factory.ironReq;
    currentPlayer.stone -= factory.stoneReq;
    currentPlayer.buildingMaterials += factory.produces;
    updateDisplay();
    savePlayerData();
    alert(`✅ تم إنتاج ${factory.produces} مواد بناء!`);
  } else {
    alert('❌ موارد غير كافية!');
  }
}

window.upgradeVillage = function() {
  if (currentPlayer.villageLevel === 0) {
    const village = BUILDINGS.village[0];
    if (currentPlayer.gold >= village.goldCost && 
        currentPlayer.buildingMaterials >= village.buildMatCost && 
        currentPlayer.food >= village.foodReq) {
      currentPlayer.gold -= village.goldCost;
      currentPlayer.buildingMaterials -= village.buildMatCost;
      currentPlayer.food -= village.foodReq;
      currentPlayer.villageLevel = 1;
      updateDisplay();
      savePlayerData();
      alert('✅ تم بناء القرية!');
    } else {
      alert('❌ موارد غير كافية!');
    }
  } else if (currentPlayer.villageLevel < 6) {
    const nextVillage = BUILDINGS.village[currentPlayer.villageLevel];
    if (currentPlayer.gold >= nextVillage.goldCost && 
        currentPlayer.buildingMaterials >= nextVillage.buildMatCost && 
        currentPlayer.food >= nextVillage.foodReq) {
      currentPlayer.gold -= nextVillage.goldCost;
      currentPlayer.buildingMaterials -= nextVillage.buildMatCost;
      currentPlayer.food -= nextVillage.foodReq;
      currentPlayer.villageLevel++;
      updateDisplay();
      savePlayerData();
      alert('✅ تم تطوير القرية!');
    } else {
      alert('❌ موارد غير كافية!');
    }
  }
}

window.upgradeArmy = function() {
  if (currentPlayer.armyLevel === 0) {
    const army = BUILDINGS.army[0];
    if (currentPlayer.gold >= army.goldCost && 
        currentPlayer.iron >= army.ironReq && 
        currentPlayer.food >= army.foodReq) {
      currentPlayer.gold -= army.goldCost;
      currentPlayer.iron -= army.ironReq;
      currentPlayer.food -= army.foodReq;
      currentPlayer.armyLevel = 1;
      currentPlayer.score += army.points;
      updateDisplay();
      savePlayerData();
      alert('✅ تم بناء الجيش!');
    } else {
      alert('❌ موارد غير كافية!');
    }
  } else if (currentPlayer.armyLevel < 6) {
    const nextArmy = BUILDINGS.army[currentPlayer.armyLevel];
    if (currentPlayer.gold >= nextArmy.goldCost && 
        currentPlayer.iron >= nextArmy.ironReq && 
        currentPlayer.food >= nextArmy.foodReq) {
      currentPlayer.gold -= nextArmy.goldCost;
      currentPlayer.iron -= nextArmy.ironReq;
      currentPlayer.food -= nextArmy.foodReq;
      currentPlayer.armyLevel++;
      currentPlayer.score += nextArmy.points;
      updateDisplay();
      savePlayerData();
      alert('✅ تم تطوير الجيش!');
    } else {
      alert('❌ موارد غير كافية!');
    }
  }
}

window.upgradeMarket = function() {
  if (currentPlayer.marketLevel >= 6) {
    alert('⚠️ وصلت للمستوى الأقصى!');
    return;
  }
  const nextMarket = BUILDINGS.market[currentPlayer.marketLevel];
  if (currentPlayer.gold >= nextMarket.cost) {
    currentPlayer.gold -= nextMarket.cost;
    currentPlayer.marketLevel++;
    updateDisplay();
    savePlayerData();
    alert('✅ تم تطوير السوق!');
  } else {
    alert('❌ ذهب غير كافٍ!');
  }
}

window.sellFood = function() {
  if (currentPlayer.food <= 0) {
    alert('❌ لا يوجد غذاء للبيع!');
    return;
  }
  const market = BUILDINGS.market[currentPlayer.marketLevel - 1];
  const amount = prompt(`كم وحدة غذاء تريد بيعها؟ (متوفر: ${Math.floor(currentPlayer.food)})`);
  if (amount && !isNaN(amount) && amount > 0) {
    const sellAmount = Math.min(parseInt(amount), Math.floor(currentPlayer.food));
    const goldEarned = Math.floor(sellAmount * market.sellRate);
    currentPlayer.food -= sellAmount;
    currentPlayer.gold += goldEarned;
    updateDisplay();
    savePlayerData();
    alert(`✅ تم بيع ${sellAmount} غذاء مقابل ${goldEarned} ذهب!`);
  }
}

window.sellBuildingMaterials = function() {
  if (currentPlayer.buildingMaterials <= 0) {
    alert('❌ لا توجد مواد بناء للبيع!');
    return;
  }
  const market = BUILDINGS.market[currentPlayer.marketLevel - 1];
  const amount = prompt(`كم وحدة مواد بناء تريد بيعها؟ (متوفر: ${Math.floor(currentPlayer.buildingMaterials)})`);
  if (amount && !isNaN(amount) && amount > 0) {
    const sellAmount = Math.min(parseInt(amount), Math.floor(currentPlayer.buildingMaterials));
    const goldEarned = Math.floor(sellAmount * market.sellRate * 2);
    currentPlayer.buildingMaterials -= sellAmount;
    currentPlayer.gold += goldEarned;
    updateDisplay();
    savePlayerData();
    alert(`✅ تم بيع ${sellAmount} مواد بناء مقابل ${goldEarned} ذهب!`);
  }
}d -= nextLevel.cost;
    currentPlayer.farmLevel++;
    currentPlayer.farmTimer = nextLevel.time;
    updateDisplay();
    savePlayerData();
    alert('✅ تم تطوير المزرعة!');
  } else {
    alert('❌ ذهب غير كافٍ!');
  }
}

window.upgradeMine = function() {
  if (currentPlayer.mineLevel >= 20) {
    alert('⚠️ وصلت للمستوى الأقصى!');
    return;
  }
  const nextLevel = LEVEL_CONFIG.mine[currentPlayer.mineLevel];
  if (currentPlayer.gold >= nextLevel.cost) {
    currentPlayer.gol
