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
const FARM_TIME = 300;
const MINE_TIME = 300;
const GOLD_TIME = 60;
let gameInterval = null;

// تسجيل الأحداث
document.getElementById("login-btn").addEventListener("click", login);
document.getElementById("register-btn").addEventListener("click", register);
document.getElementById("show-register-btn").addEventListener("click", showRegister);
document.getElementById("show-login-btn").addEventListener("click", showLogin);
document.getElementById("logout-btn").addEventListener("click", logout);

// إنشاء حساب جديد
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
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';
        document.getElementById('current-player').textContent = currentPlayer.name;
        startGameLoop();
      } else {
        msg.innerHTML = "❌ كلمة المرور غير صحيحة";
      }
    } else {
      msg.innerHTML = "❌ اسم المستخدم غير موجود";
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
  currentPlayer = null;
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  showLogin();
}

function startGameLoop() {
  if (gameInterval) clearInterval(gameInterval);
  gameInterval = setInterval(() => {
    if (!currentPlayer) return;
    currentPlayer.gold += 1;
    document.getElementById('gold').textContent = currentPlayer.gold;
    update(ref(db, { ['players/' + currentPlayer.name + '/playerData']: currentPlayer }));
  }, 1000);
}
