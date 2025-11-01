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

// الأوقات الأساسية (بالثواني)
const BASE_FARM_TIME = 300;
const BASE_MINE_TIME = 300;
const BASE_QUARRY_TIME = 240;

// نظام المستويات - 20 مستوى لكل مبنى (متوازن لـ 20 يوم)
const LEVEL_CONFIG = {
  farm: [
    { level: 1, production: 10, time: 300, cost: 0 },
    { level: 2, production: 22, time: 300, cost: 80 },
    { level: 3, production: 38, time: 290, cost: 180 },
    { level: 4, production: 58, time: 280, cost: 350 },
    { level: 5, production: 82, time: 270, cost: 650 },
    { level: 6, production: 110, time: 260, cost: 1100 },
    { level: 7, production: 142, time: 250, cost: 1800 },
    { level: 8, production: 178, time: 240, cost: 2800 },
    { level: 9, production: 218, time: 230, cost: 4200 },
    { level: 10, production: 262, time: 220, cost: 6200 },
    { level: 11, production: 310, time: 210, cost: 9000 },
    { level: 12, production: 362, time: 200, cost: 12500 },
    { level: 13, production: 418, time: 190, cost: 17000 },
    { level: 14, production: 478, time: 180, cost: 23000 },
    { level: 15, production: 542, time: 170, cost: 31000 },
    { level: 16, production: 610, time: 160, cost: 42000 },
    { level: 17, production: 682, time: 150, cost: 56000 },
    { level: 18, production: 758, time: 150, cost: 74000 },
    { level: 19, production: 838, time: 150, cost: 96000 },
    { level: 20, production: 950, time: 150, cost: 125000 }
  ],
  mine: [
    { level: 1, production: 8, time: 300, cost: 0 },
    { level: 2, production: 18, time: 300, cost: 80 },
    { level: 3, production: 30, time: 290, cost: 180 },
    { level: 4, production: 46, time: 280, cost: 350 },
    { level: 5, production: 66, time: 270, cost: 650 },
    { level: 6, production: 88, time: 260, cost: 1100 },
    { level: 7, production: 114, time: 250, cost: 1800 },
    { level: 8, production: 142, time: 240, cost: 2800 },
    { level: 9, production: 174, time: 230, cost: 4200 },
    { level: 10, production: 210, time: 220, cost: 6200 },
    { level: 11, production: 248, time: 210, cost: 9000 },
    { level: 12, production: 290, time: 200, cost: 12500 },
    { level: 13, production: 334, time: 190, cost: 17000 },
    { level: 14, production: 382, time: 180, cost: 23000 },
    { level: 15, production: 434, time: 170, cost: 31000 },
    { level: 16, production: 488, time: 160, cost: 42000 },
    { level: 17, production: 546, time: 150, cost: 56000 },
    { level: 18, production: 606, time: 150, cost: 74000 },
    { level: 19, production: 670, time: 150, cost: 96000 },
    { level: 20, production: 760, time: 150, cost: 125000 }
  ],
  quarry: [
    { level: 1, production: 5, time: 240, cost: 0 },
    { level: 2, production: 11, time: 240, cost: 60 },
    { level: 3, production: 19, time: 235, cost: 140 },
    { level: 4, production: 29, time: 230, cost: 270 },
    { level: 5, production: 41, time: 225, cost: 500 },
    { level: 6, production: 55, time: 220, cost: 850 },
    { level: 7, production: 71, time: 215, cost: 1400 },
    { level: 8, production: 89, time: 210, cost: 2200 },
    { level: 9, production: 109, time: 205, cost: 3300 },
    { level: 10, production: 131, time: 200, cost: 4900 },
    { level: 11, production: 155, time: 195, cost: 7100 },
    { level: 12, production: 181, time: 190, cost: 9900 },
    { level: 13, production: 209, time: 185, cost: 13500 },
    { level: 14, production: 239, time: 180, cost: 18200 },
    { level: 15, production: 271, time: 175, cost: 24500 },
    { level: 16, production: 305, time: 170, cost: 33200 },
    { level: 17, production: 341, time: 165, cost: 44300 },
    { level: 18, production: 379, time: 160, cost: 58500 },
    { level: 19, production: 419, time: 160, cost: 76000 },
    { level: 20, production: 475, time: 160, cost: 99000 }
  ]
};

// المباني الجديدة
const BUILDINGS = {
  factory: [
    { level: 0, unlockCost: 200, cost: 0, ironReq: 0, stoneReq: 0, produces: 0 }, // مقفل
    { level: 1, cost: 0, ironReq: 10, stoneReq: 10, produces: 5 },
    { level: 2, cost: 500, ironReq: 20, stoneReq: 20, produces: 12 },
    { level: 3, cost: 1500, ironReq: 40, stoneReq: 40, produces: 25 },
    { level: 4, cost: 4000, ironReq: 80, stoneReq: 80, produces: 55 },
    { level: 5, cost: 10000, ironReq: 150, stoneReq: 150, produces: 120 },
    { level: 6, cost: 25000, ironReq: 300, stoneReq: 300, produces: 250 }
  ],
  village: [
    { level: 0, unlockCost: 300, unlockFood: 30, unlockBuildMat: 15, goldCost: 0, buildMatCost: 0, foodReq: 0, bonus: 1 }, // مقفل
    { level: 1, goldCost: 0, buildMatCost: 0, foodReq: 0, bonus: 1.15 },
    { level: 2, goldCost: 800, buildMatCost: 50, foodReq: 100, bonus: 1.3 },
    { level: 3, goldCost: 2500, buildMatCost: 120, foodReq: 200, bonus: 1.5 },
    { level: 4, goldCost: 7000, buildMatCost: 300, foodReq: 400, bonus: 1.75 },
    { level: 5, goldCost: 18000, buildMatCost: 700, foodReq: 800, bonus: 2.0 },
    { level: 6, goldCost: 45000, buildMatCost: 1500, foodReq: 1500, bonus: 2.5 }
  ],
  army: [
    { level: 0, unlockCost: 400, unlockIron: 20, unlockFood: 20, goldCost: 0, ironReq: 0, foodReq: 0, points: 0 }, // مقفل
    { level: 1, goldCost: 0, ironReq: 0, foodReq: 0, points: 100 },
    { level: 2, goldCost: 1200, ironReq: 70, foodReq: 70, points: 250 },
    { level: 3, goldCost: 3500, ironReq: 150, foodReq: 150, points: 600 },
    { level: 4, goldCost: 10000, ironReq: 350, foodReq: 350, points: 1500 },
    { level: 5, goldCost: 25000, ironReq: 800, foodReq: 800, points: 3500 },
    { level: 6, goldCost: 60000, ironReq: 1800, foodReq: 1800, points: 8000 }
  ],
  market: [
    { level: 1, cost: 0, foodRate: 0.5, ironRate: 1.2, stoneRate: 0.9, buildMatRate: 4.0 },
    { level: 2, cost: 800, foodRate: 0.7, ironRate: 1.5, stoneRate: 1.1, buildMatRate: 5.0 },
    { level: 3, cost: 2000, foodRate: 0.9, ironRate: 1.8, stoneRate: 1.3, buildMatRate: 6.0 },
    { level: 4, cost: 5000, foodRate: 1.2, ironRate: 2.2, stoneRate: 1.6, buildMatRate: 7.5 },
    { level: 5, cost: 12000, foodRate: 1.5, ironRate: 2.6, stoneRate: 2.0, buildMatRate: 9.0 },
    { level: 6, cost: 30000, foodRate: 2.0, ironRate: 3.2, stoneRate: 2.5, buildMatRate: 12.0 }
  ]
};

// تسجيل الأحداث
document.getElementById("login-btn").addEventListener("click", login);
document.getElementById("register-btn").addEventListener("click", register);
document.getElementById("show-register-btn").addEventListener("click", showRegister);
document.getElementById("show-login-btn").addEventListener("click", showLogin);
document.getElementById("logout-btn").addEventListener("click", logout);

// تتبع حالة اللاعب (Online/Offline)
window.addEventListener('focus', () => {
  isOnline = true;
  if (currentPlayer) {
    calculateOfflineProgress();
  }
});

window.addEventListener('blur', () => {
  isOnline = false;
  lastOnlineTime = Date.now();
});

// حساب التقدم أثناء الأوفلاين
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
  const villageBonus = currentPlayer.villageLevel > 0 ? BUILDINGS.village[currentPlayer.villageLevel].bonus : 1;
  
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
  
  updateDisplay();
  savePlayerData();
  
  // عرض إشعار الإنتاج
  if (foodGained > 0 || ironGained > 0 || stoneGained > 0) {
    const notificationEl = document.getElementById('offline-notification');
    if (notificationEl) {
      showOfflineNotification(foodGained, ironGained, stoneGained);
    }
  }
}

// عرض إشعار الإنتاج أثناء الغياب
function showOfflineNotification(food, iron, stone) {
  const notification = document.getElementById('offline-notification');
  notification.innerHTML = `
    <button class="close-btn" onclick="closeOfflineNotification()">×</button>
    <h4>📦 إنتاج أثناء غيابك (65%)</h4>
    <p>🌾 ${food} غذاء</p>
    <p>⛏️ ${iron} حديد</p>
    <p>🪨 ${stone} حجر</p>
  `;
  notification.style.display = 'block';
  
  // إخفاء تلقائي بعد 10 ثواني
  setTimeout(() => {
    closeOfflineNotification();
  }, 10000);
}

// إغلاق الإشعار
window.closeOfflineNotification = function() {
  const notification = document.getElementById('offline-notification');
  notification.style.animation = 'slideOutLeft 0.5s ease-out';
  setTimeout(() => {
    notification.style.display = 'none';
    notification.style.animation = '';
  }, 500);
}

// إنشاء حساب جديد
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
          gold: 500,
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
      set(playerRef, newPlayer);
      msg.innerHTML = "✅ تم إنشاء الحساب بنجاح!";
      msg.style.color = "#27ae60";
      setTimeout(showLogin, 2000);
    }
  });
}

// تسجيل الدخول
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
        
        // تحديث الحسابات القديمة (إضافة marketLevel إذا لم يكن موجوداً)
        if (currentPlayer.marketLevel === undefined || currentPlayer.marketLevel === null) {
          currentPlayer.marketLevel = 1;
        }
        if (currentPlayer.stone === undefined) {
          currentPlayer.stone = 0;
        }
        if (currentPlayer.buildingMaterials === undefined) {
          currentPlayer.buildingMaterials = 0;
        }
        if (currentPlayer.minedStone === undefined) {
          currentPlayer.minedStone = 0;
        }
        if (currentPlayer.quarryLevel === undefined) {
          currentPlayer.quarryLevel = 1;
        }
        if (currentPlayer.quarryTimer === undefined) {
          currentPlayer.quarryTimer = BASE_QUARRY_TIME;
        }
        if (currentPlayer.factoryLevel === undefined) {
          currentPlayer.factoryLevel = 0;
        }
        if (currentPlayer.villageLevel === undefined) {
          currentPlayer.villageLevel = 0;
        }
        if (currentPlayer.armyLevel === undefined) {
          currentPlayer.armyLevel = 0;
        }
        
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        document.getElementById('current-player').textContent = currentPlayer.name;
        
        startGameLoop();
        loadLeaderboard();
        updateDisplay();
        savePlayerData();
        
        // حساب التقدم أثناء الأوفلاين بعد ثانية
        const lastLogin = new Date(currentPlayer.lastLogin).getTime();
        const offlineTime = Math.floor((Date.now() - lastLogin) / 1000);
        
        if (offlineTime > 60) {
          setTimeout(() => {
            calculateOfflineProgress();
          }, 1000);
        }
      } else {
        msg.innerHTML = "❌ كلمة المرور غير صحيحة";
        msg.style.color = "#e74c3c";
      }
    } else {
      msg.innerHTML = "❌ اسم المستخدم غير موجود";
      msg.style.color = "#e74c3c";
    }
  });
}

// عرض وإخفاء النماذج
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

// حلقة اللعبة الرئيسية
function startGameLoop() {
  if (gameInterval) clearInterval(gameInterval);
  
  gameInterval = setInterval(() => {
    if (!currentPlayer) return;
    
    const productionRate = isOnline ? 1 : 0.65;
    
    currentPlayer.farmTimer--;
    currentPlayer.mineTimer--;
    currentPlayer.quarryTimer--;
    
    // المزرعة
    if (currentPlayer.farmTimer <= 0) {
      const farmConfig = LEVEL_CONFIG.farm[currentPlayer.farmLevel - 1];
      const villageBonus = currentPlayer.villageLevel > 0 ? BUILDINGS.village[currentPlayer.villageLevel].bonus : 1;
      const production = Math.floor(farmConfig.production * villageBonus * productionRate);
      
      currentPlayer.food += production;
      currentPlayer.crops += production;
      currentPlayer.score += production;
      currentPlayer.farmTimer = farmConfig.time;
    }
    
    // المنجم
    if (currentPlayer.mineTimer <= 0) {
      const mineConfig = LEVEL_CONFIG.mine[currentPlayer.mineLevel - 1];
      const production = Math.floor(mineConfig.production * productionRate);
      
      currentPlayer.iron += production;
      currentPlayer.minedIron += production;
      currentPlayer.score += production;
      currentPlayer.mineTimer = mineConfig.time;
    }
    
    // المحجر
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

// تحديث العرض
function updateDisplay() {
  if (!currentPlayer) return;
  
  document.getElementById('gold').textContent = Math.floor(currentPlayer.gold);
  document.getElementById('food').textContent = Math.floor(currentPlayer.food);
  document.getElementById('iron').textContent = Math.floor(currentPlayer.iron);
  document.getElementById('stone').textContent = Math.floor(currentPlayer.stone);
  document.getElementById('building-materials').textContent = Math.floor(currentPlayer.buildingMaterials);
  document.getElementById('level').textContent = currentPlayer.level;
  document.getElementById('score').textContent = Math.floor(currentPlayer.score);
  
  // المزرعة
  const farmConfig = LEVEL_CONFIG.farm[currentPlayer.farmLevel - 1];
  const villageBonus = currentPlayer.villageLevel > 0 ? BUILDINGS.village[currentPlayer.villageLevel].bonus : 1;
  document.getElementById('farm-level').textContent = currentPlayer.farmLevel;
  document.getElementById('farm-production').textContent = Math.floor(farmConfig.production * villageBonus);
  document.getElementById('crops').textContent = Math.floor(currentPlayer.crops);
  document.getElementById('farm-timer').textContent = formatTime(currentPlayer.farmTimer);
  document.getElementById('farm-progress').style.width = ((farmConfig.time - currentPlayer.farmTimer) / farmConfig.time * 100) + '%';
  
  const nextFarmCost = currentPlayer.farmLevel < 20 ? LEVEL_CONFIG.farm[currentPlayer.farmLevel].cost : '—';
  document.getElementById('farm-cost').textContent = nextFarmCost;
  
  // المنجم
  const mineConfig = LEVEL_CONFIG.mine[currentPlayer.mineLevel - 1];
  document.getElementById('mine-level').textContent = currentPlayer.mineLevel;
  document.getElementById('mine-production').textContent = mineConfig.production;
  document.getElementById('mined-iron').textContent = Math.floor(currentPlayer.minedIron);
  document.getElementById('mine-timer').textContent = formatTime(currentPlayer.mineTimer);
  document.getElementById('mine-progress').style.width = ((mineConfig.time - currentPlayer.mineTimer) / mineConfig.time * 100) + '%';
  
  const nextMineCost = currentPlayer.mineLevel < 20 ? LEVEL_CONFIG.mine[currentPlayer.mineLevel].cost : '—';
  document.getElementById('mine-cost').textContent = nextMineCost;
  
  // المحجر
  const quarryConfig = LEVEL_CONFIG.quarry[currentPlayer.quarryLevel - 1];
  document.getElementById('quarry-level').textContent = currentPlayer.quarryLevel;
  document.getElementById('quarry-production').textContent = quarryConfig.production;
  document.getElementById('mined-stone').textContent = Math.floor(currentPlayer.minedStone);
  document.getElementById('quarry-timer').textContent = formatTime(currentPlayer.quarryTimer);
  document.getElementById('quarry-progress').style.width = ((quarryConfig.time - currentPlayer.quarryTimer) / quarryConfig.time * 100) + '%';
  
  const nextQuarryCost = currentPlayer.quarryLevel < 20 ? LEVEL_CONFIG.quarry[currentPlayer.quarryLevel].cost : '—';
  document.getElementById('quarry-cost').textContent = nextQuarryCost;
  
  updateFactoryDisplay();
  updateVillageDisplay();
  updateArmyDisplay();
  updateMarketDisplay();
}

// تحديث عرض المصنع
function updateFactoryDisplay() {
  const factoryEl = document.getElementById('factory-level');
  const statusEl = document.getElementById('factory-status');
  const produceBtn = document.getElementById('produce-building');
  const upgradeBtn = document.getElementById('upgrade-factory');
  
  if (currentPlayer.factoryLevel === 0) {
    factoryEl.textContent = 'مقفل 🔒';
    statusEl.textContent = 'غير مفتوح';
    produceBtn.disabled = true;
    upgradeBtn.textContent = `فتح المصنع (${BUILDINGS.factory[0].unlockCost} ذهب)`;
    upgradeBtn.disabled = false;
  } else {
    const factory = BUILDINGS.factory[currentPlayer.factoryLevel];
    factoryEl.textContent = currentPlayer.factoryLevel;
    statusEl.textContent = `يحول ${factory.ironReq} حديد + ${factory.stoneReq} حجر → ${factory.produces} مواد بناء`;
    produceBtn.disabled = false;
    
    if (currentPlayer.factoryLevel < 6) {
      const nextFactory = BUILDINGS.factory[currentPlayer.factoryLevel + 1];
      upgradeBtn.textContent = `تطوير المصنع (${nextFactory.cost} ذهب)`;
      upgradeBtn.disabled = false;
    } else {
      upgradeBtn.textContent = 'المستوى الأقصى';
      upgradeBtn.disabled = true;
    }
  }
}

// تحديث عرض القرية
function updateVillageDisplay() {
  const villageEl = document.getElementById('village-level');
  const bonusEl = document.getElementById('village-bonus');
  const upgradeBtn = document.getElementById('upgrade-village');
  
  if (currentPlayer.villageLevel === 0) {
    villageEl.textContent = 'مقفل 🔒';
    bonusEl.textContent = '+0%';
    const village = BUILDINGS.village[0];
    upgradeBtn.textContent = `فتح القرية (${village.unlockCost} ذهب + ${village.unlockBuildMat} مواد + ${village.unlockFood} غذاء)`;
    upgradeBtn.disabled = false;
  } else {
    const village = BUILDINGS.village[currentPlayer.villageLevel];
    villageEl.textContent = currentPlayer.villageLevel;
    bonusEl.textContent = `+${Math.floor((village.bonus - 1) * 100)}%`;
    
    if (currentPlayer.villageLevel < 6) {
      const nextVillage = BUILDINGS.village[currentPlayer.villageLevel + 1];
      upgradeBtn.textContent = `تطوير القرية (${nextVillage.goldCost} ذهب + ${nextVillage.buildMatCost} مواد + ${nextVillage.foodReq} غذاء)`;
      upgradeBtn.disabled = false;
    } else {
      upgradeBtn.textContent = 'المستوى الأقصى';
      upgradeBtn.disabled = true;
    }
  }
}

// تحديث عرض الجيش
function updateArmyDisplay() {
  const armyEl = document.getElementById('army-level');
  const pointsEl = document.getElementById('army-points');
  const upgradeBtn = document.getElementById('upgrade-army');
  
  if (currentPlayer.armyLevel === 0) {
    armyEl.textContent = 'مقفل 🔒';
    pointsEl.textContent = '0';
    const army = BUILDINGS.army[0];
    upgradeBtn.textContent = `فتح الجيش (${army.unlockCost} ذهب + ${army.unlockIron} حديد + ${army.unlockFood} غذاء)`;
    upgradeBtn.disabled = false;
  } else {
    const army = BUILDINGS.army[currentPlayer.armyLevel];
    armyEl.textContent = currentPlayer.armyLevel;
    pointsEl.textContent = army.points;
    
    if (currentPlayer.armyLevel < 6) {
      const nextArmy = BUILDINGS.army[currentPlayer.armyLevel + 1];
      upgradeBtn.textContent = `تطوير الجيش (${nextArmy.goldCost} ذهب + ${nextArmy.ironReq} حديد + ${nextArmy.foodReq} غذاء)`;
      upgradeBtn.disabled = false;
    } else {
      upgradeBtn.textContent = 'المستوى الأقصى';
      upgradeBtn.disabled = true;
    }
  }
}

// تحديث عرض السوق
function updateMarketDisplay() {
  const marketEl = document.getElementById('market-level');
  const rateEl = document.getElementById('market-rate');
  const upgradeBtn = document.getElementById('upgrade-market');
  
  // فحص وتحديث marketLevel إذا كان undefined
  if (!currentPlayer.marketLevel || currentPlayer.marketLevel === 0) {
    currentPlayer.marketLevel = 1;
  }
  
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

// تنسيق الوقت
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// تطوير المزرعة
window.upgradeFarm = function() {
  if (currentPlayer.farmLevel >= 20) {
    alert('⚠️ وصلت للمستوى الأقصى!');
    return;
  }
  
  const nextLevel = LEVEL_CONFIG.farm[currentPlayer.farmLevel];
  if (currentPlayer.gold >= nextLevel.cost) {
    currentPlayer.gold -= nextLevel.cost;
    currentPlayer.farmLevel++;
    currentPlayer.farmTimer = nextLevel.time;
    updateDisplay();
    savePlayerData();
    alert('✅ تم تطوير المزرعة!');
  } else {
    alert('❌ ذهب غير كافٍ!');
  }
}

// تطوير المنجم
window.upgradeMine = function() {
  if (currentPlayer.mineLevel >= 20) {
    alert('⚠️ وصلت للمستوى الأقصى!');
    return;
  }
  
  const nextLevel = LEVEL_CONFIG.mine[currentPlayer.mineLevel];
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

// تطوير المحجر
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

// إنتاج مواد البناء في المصنع
window.produceBuilding = function() {
  if (currentPlayer.factoryLevel === 0) {
    alert('❌ يجب فتح المصنع أولاً!');
    return;
  }
  
  const factory = BUILDINGS.factory[currentPlayer.factoryLevel];
  
  if (currentPlayer.iron >= factory.ironReq && currentPlayer.stone >= factory.stoneReq) {
    currentPlayer.iron -= factory.ironReq;
    currentPlayer.stone -= factory.stoneReq;
    currentPlayer.buildingMaterials += factory.produces;
    currentPlayer.score += factory.produces * 2;
    updateDisplay();
    savePlayerData();
    alert(`✅ تم إنتاج ${factory.produces} مواد بناء!`);
  } else {
    alert(`❌ تحتاج إلى ${factory.ironReq} حديد و ${factory.stoneReq} حجر!`);
  }
}

// فتح/تطوير المصنع
window.upgradeFactory = function() {
  if (currentPlayer.factoryLevel === 0) {
    // فتح المصنع
    const unlock = BUILDINGS.factory[0];
    if (currentPlayer.gold >= unlock.unlockCost) {
      currentPlayer.gold -= unlock.unlockCost;
      currentPlayer.factoryLevel = 1;
      updateDisplay();
      savePlayerData();
      alert('✅ تم فتح المصنع!');
    } else {
      alert(`❌ تحتاج إلى ${unlock.unlockCost} ذهب!`);
    }
  } else if (currentPlayer.factoryLevel >= 6) {
    alert('⚠️ وصلت للمستوى الأقصى!');
  } else {
    // تطوير المصنع
    const nextFactory = BUILDINGS.factory[currentPlayer.factoryLevel + 1];
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

// فتح/تطوير القرية
window.upgradeVillage = function() {
  if (currentPlayer.villageLevel === 0) {
    // فتح القرية
    const unlock = BUILDINGS.village[0];
    if (currentPlayer.gold >= unlock.unlockCost && 
        currentPlayer.buildingMaterials >= unlock.unlockBuildMat && 
        currentPlayer.food >= unlock.unlockFood) {
      
      currentPlayer.gold -= unlock.unlockCost;
      currentPlayer.buildingMaterials -= unlock.unlockBuildMat;
      currentPlayer.food -= unlock.unlockFood;
      currentPlayer.villageLevel = 1;
      currentPlayer.score += 500;
      updateDisplay();
      savePlayerData();
      alert('✅ تم فتح القرية! إنتاج المزرعة زاد بنسبة 15%!');
    } else {
      alert(`❌ تحتاج إلى ${unlock.unlockCost} ذهب + ${unlock.unlockBuildMat} مواد بناء + ${unlock.unlockFood} غذاء!`);
    }
  } else if (currentPlayer.villageLevel >= 6) {
    alert('⚠️ وصلت للمستوى الأقصى!');
  } else {
    // تطوير القرية
    const nextVillage = BUILDINGS.village[currentPlayer.villageLevel + 1];
    if (currentPlayer.gold >= nextVillage.goldCost && 
        currentPlayer.buildingMaterials >= nextVillage.buildMatCost && 
        currentPlayer.food >= nextVillage.foodReq) {
      
      currentPlayer.gold -= nextVillage.goldCost;
      currentPlayer.buildingMaterials -= nextVillage.buildMatCost;
      currentPlayer.food -= nextVillage.foodReq;
      currentPlayer.villageLevel++;
      currentPlayer.score += 500;
      updateDisplay();
      savePlayerData();
      alert('✅ تم تطوير القرية! إنتاج المزرعة زاد!');
    } else {
      alert(`❌ تحتاج إلى ${nextVillage.goldCost} ذهب + ${nextVillage.buildMatCost} مواد بناء + ${nextVillage.foodReq} غذاء!`);
    }
  }
}

// فتح/تطوير الجيش
window.upgradeArmy = function() {
  if (currentPlayer.armyLevel === 0) {
    // فتح الجيش
    const unlock = BUILDINGS.army[0];
    if (currentPlayer.gold >= unlock.unlockCost && 
        currentPlayer.iron >= unlock.unlockIron && 
        currentPlayer.food >= unlock.unlockFood) {
      
      currentPlayer.gold -= unlock.unlockCost;
      currentPlayer.iron -= unlock.unlockIron;
      currentPlayer.food -= unlock.unlockFood;
      currentPlayer.armyLevel = 1;
      currentPlayer.score += BUILDINGS.army[1].points;
      updateDisplay();
      savePlayerData();
      alert(`✅ تم فتح الجيش! حصلت على ${BUILDINGS.army[1].points} نقطة!`);
    } else {
      alert(`❌ تحتاج إلى ${unlock.unlockCost} ذهب + ${unlock.unlockIron} حديد + ${unlock.unlockFood} غذاء!`);
    }
  } else if (currentPlayer.armyLevel >= 6) {
    alert('⚠️ وصلت للمستوى الأقصى!');
  } else {
    // تطوير الجيش
    const nextArmy = BUILDINGS.army[currentPlayer.armyLevel + 1];
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
      alert(`✅ تم تطوير الجيش! حصلت على ${nextArmy.points} نقطة!`);
    } else {
      alert(`❌ تحتاج إلى ${nextArmy.goldCost} ذهب + ${nextArmy.ironReq} حديد + ${nextArmy.foodReq} غذاء!`);
    }
  }
}

// بناء/تطوير السوق
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
    alert(`✅ تم تطوير السوق!`);
  } else {
    alert('❌ ذهب غير كافٍ!');
  }
}

// البيع في السوق
window.sellFood = function() {
  if (!currentPlayer) return;
  
  // فحص وتحديث marketLevel إذا كان undefined
  if (!currentPlayer.marketLevel || currentPlayer.marketLevel === 0) {
    currentPlayer.marketLevel = 1;
    savePlayerData();
  }
  
  const amount = parseInt(prompt('كم من الغذاء تريد بيعه؟'));
  
  if (isNaN(amount) || amount <= 0) {
    alert('❌ الرجاء إدخال رقم صحيح!');
    return;
  }
  
  if (currentPlayer.food >= amount) {
    const market = BUILDINGS.market[currentPlayer.marketLevel - 1];
    const goldEarned = Math.floor(amount * market.sellRate);
    
    currentPlayer.food -= amount;
    currentPlayer.gold += goldEarned;
    updateDisplay();
    savePlayerData();
    alert(`✅ تم بيع ${amount} غذاء مقابل ${goldEarned} ذهب!`);
  } else {
    alert(`❌ غذاء غير كافٍ! لديك ${Math.floor(currentPlayer.food)} غذاء فقط.`);
  }
}

window.sellBuildingMaterials = function() {
  if (!currentPlayer) return;
  
  // فحص وتحديث marketLevel إذا كان undefined
  if (!currentPlayer.marketLevel || currentPlayer.marketLevel === 0) {
    currentPlayer.marketLevel = 1;
    savePlayerData();
  }
  
  const amount = parseInt(prompt('كم من مواد البناء تريد بيعها؟'));
  
  if (isNaN(amount) || amount <= 0) {
    alert('❌ الرجاء إدخال رقم صحيح!');
    return;
  }
  
  if (currentPlayer.buildingMaterials >= amount) {
    const market = BUILDINGS.market[currentPlayer.marketLevel - 1];
    const goldEarned = Math.floor(amount * market.sellRate * 3);
    
    currentPlayer.buildingMaterials -= amount;
    currentPlayer.gold += goldEarned;
    updateDisplay();
    savePlayerData();
    alert(`✅ تم بيع ${amount} مواد بناء مقابل ${goldEarned} ذهب!`);
  } else {
    alert(`❌ مواد بناء غير كافية! لديك ${Math.floor(currentPlayer.buildingMaterials)} فقط.`);
  }
}

// حفظ بيانات اللاعب
function savePlayerData() {
  if (!currentPlayer) return;
  
  const playerRef = ref(db, 'players/' + currentPlayer.name + '/playerData');
  update(playerRef, currentPlayer);
}

// تحميل لوحة المتصدرين
function loadLeaderboard() {
  const playersRef = ref(db, 'players');
  onValue(playersRef, (snapshot) => {
    const players = [];
    snapshot.forEach((child) => {
      const data = child.val();
      if (data.playerData) {
        players.push(data.playerData);
      }
    });
    
    players.sort((a, b) => b.score - a.score);
    
    const listDiv = document.getElementById('players-list');
    listDiv.innerHTML = '';
    
    players.forEach((player, index) => {
      const item = document.createElement('div');
      item.className = 'leaderboard-item' + (player.name === currentPlayer.name ? ' current-player' : '');
      item.innerHTML = `
        <span class="rank">#${index + 1}</span>
        <span class="name">${player.name} (مستوى ${player.level})</span>
        <span class="score">${Math.floor(player.score)} نقطة</span>
      `;
      listDiv.appendChild(item);
    });
  });
}
