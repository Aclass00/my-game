// -------- إعداد Firebase --------
//import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
//import { getDatabase, ref, set, get, child, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ← ضع بيانات Firebase هنا
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

// --------------------------------
let currentPlayer = null;
const FARM_TIME = 300;
const MINE_TIME = 300;
const GOLD_TIME = 60;
let gameInterval = null;

// إنشاء لاعب جديد
function register() {
    const username = document.getElementById('new-username').value.trim();
    const password = document.getElementById('new-password').value;
    const msg = document.getElementById('register-message');

    if (!username || !password) {
        msg.innerHTML = "❌ الرجاء إدخال جميع الحقول";
        return;
    }

    const playerRef = ref(db, 'players/' + username);
    get(playerRef).then(snapshot => {
        if (snapshot.exists()) {
            msg.innerHTML = "❌ هذا الاسم مستخدم مسبقًا";
        } else {
            const newPlayer = {
                password: password,
                playerData: {
                    name: username,
                    gold: 100,
                    food: 0,
                    iron: 0,
                    crops: 0,
                    minedIron: 0,
                    farmLevel: 1,
                    mineLevel: 1,
                    goldLevel: 1,
                    score: 0,
                    farmTimer: FARM_TIME,
                    mineTimer: MINE_TIME,
                    goldTimer: GOLD_TIME,
                    joinDate: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                }
            };
            set(playerRef, newPlayer);
            msg.innerHTML = "✅ تم إنشاء الحساب بنجاح!";
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
                currentPlayer.lastLogin = new Date().toISOString();

                document.getElementById('login-screen').style.display = 'none';
                document.getElementById('game-screen').style.display = 'block';
                document.getElementById('current-player').textContent = currentPlayer.name;

                startGameLoop();
                updateUI();
            } else {
                msg.innerHTML = "❌ كلمة المرور غير صحيحة";
            }
        } else {
            msg.innerHTML = "❌ اسم المستخدم غير موجود";
        }
    });
}

// تسجيل الخروج
function logout() {
    stopGameLoop();
    currentPlayer = null;
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    showLogin();
}

// حفظ بيانات اللاعب في Firebase
function savePlayerData() {
    if (!currentPlayer) return;
    const updates = {};
    updates['/players/' + currentPlayer.name + '/playerData'] = currentPlayer;
    update(ref(db), updates);
}

// تحديث لوحة المتصدرين في الوقت الحقيقي
function listenToLeaderboard() {
    const playersRef = ref(db, 'players');
    onValue(playersRef, snapshot => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const playersArray = Object.values(data).map(p => p.playerData);
            const leaderboard = document.getElementById('players-list');
            leaderboard.innerHTML = playersArray
                .sort((a, b) => b.score - a.score)
                .map((player, index) => `
                    <div class="leaderboard-item ${currentPlayer && player.name === currentPlayer.name ? 'current-player' : ''}">
                        <span class="rank">${index + 1}</span>
                        <span class="name">${player.name}</span>
                        <span class="score">${player.score} نقطة</span>
                    </div>
                `)
                .join('');
        }
    });
}

// حلقة اللعبة
function startGameLoop() {
    listenToLeaderboard();

    if (gameInterval) clearInterval(gameInterval);

    gameInterval = setInterval(() => {
        if (!currentPlayer) return;

        currentPlayer.farmTimer--;
        if (currentPlayer.farmTimer <= 0) {
            const p = 10 + (currentPlayer.farmLevel - 1) * 5;
            currentPlayer.food += p;
            currentPlayer.crops += p;
            currentPlayer.score += p;
            currentPlayer.farmTimer = FARM_TIME;
        }

        currentPlayer.mineTimer--;
        if (currentPlayer.mineTimer <= 0) {
            const p = 8 + (currentPlayer.mineLevel - 1) * 4;
            currentPlayer.iron += p;
            currentPlayer.minedIron += p;
            currentPlayer.score += p * 2;
            currentPlayer.mineTimer = MINE_TIME;
        }

        currentPlayer.goldTimer--;
        if (currentPlayer.goldTimer <= 0) {
            const inc = 5 * currentPlayer.goldLevel;
            currentPlayer.gold += inc;
            currentPlayer.score += inc;
            currentPlayer.goldTimer = GOLD_TIME;
        }

        updateUI();
        savePlayerData();
    }, 1000);
}

function stopGameLoop() {
    if (gameInterval) clearInterval(gameInterval);
}

function updateUI() {
    if (!currentPlayer) return;
    document.getElementById('gold').textContent = currentPlayer.gold;
    document.getElementById('food').textContent = currentPlayer.food;
    document.getElementById('iron').textContent = currentPlayer.iron;
    document.getElementById('farm-level').textContent = currentPlayer.farmLevel;
    document.getElementById('mine-level').textContent = currentPlayer.mineLevel;
    document.getElementById('score').textContent = currentPlayer.score;
}

// واجهة المستخدم
function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}
function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
}
