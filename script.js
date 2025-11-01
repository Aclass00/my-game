// ------------------------------
// إعداد Firebase
// ------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "YOUR-API-KEY",
  authDomain: "YOUR-DOMAIN.firebaseapp.com",
  databaseURL: "https://YOUR-DATABASE.firebaseio.com",
  projectId: "YOUR-PROJECT-ID",
  storageBucket: "YOUR-BUCKET.appspot.com",
  messagingSenderId: "YOUR-SENDER-ID",
  appId: "YOUR-APP-ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ------------------------------
// المتغيرات العامة
// ------------------------------
const BASE_FARM_TIME = 60;
const BASE_MINE_TIME = 90;
const BASE_QUARRY_TIME = 120;

let currentUser = null;
let playerData = null;

// ------------------------------
// عرض النماذج
// ------------------------------
function showLogin() {
  document.getElementById("register-form").style.display = "none";
  document.getElementById("login-screen").style.display = "block";
}

function showRegister() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("register-form").style.display = "block";
}

// ------------------------------
// تسجيل حساب جديد
// ------------------------------
async function register() {
  const username = document.getElementById("new-username").value.trim();
  const password = document.getElementById("new-password").value;
  const msg = document.getElementById("register-message");

  if (!username || !password) {
    msg.innerHTML = "❌ الرجاء إدخال جميع الحقول";
    msg.style.color = "red";
    return;
  }

  const playerRef = ref(db, "players/" + username);

  try {
    const snapshot = await get(playerRef);

    if (snapshot.exists()) {
      msg.innerHTML = "❌ هذا الاسم مستخدم مسبقًا";
      msg.style.color = "red";
      return;
    }

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

    await set(playerRef, newPlayer);

    msg.innerHTML = "✅ تم إنشاء الحساب بنجاح!";
    msg.style.color = "green";
    setTimeout(showLogin, 2000);

  } catch (error) {
    console.error("❌ خطأ أثناء إنشاء الحساب:", error);
    msg.innerHTML = "⚠️ حدث خطأ أثناء إنشاء الحساب. تحقق من الاتصال بقاعدة البيانات.";
    msg.style.color = "orange";
  }
}

// ------------------------------
// تسجيل الدخول
// ------------------------------
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const msg = document.getElementById("login-message");

  if (!username || !password) {
    msg.innerHTML = "❌ الرجاء إدخال جميع الحقول";
    msg.style.color = "red";
    return;
  }

  const playerRef = ref(db, "players/" + username);

  try {
    const snapshot = await get(playerRef);
    if (!snapshot.exists()) {
      msg.innerHTML = "❌ الحساب غير موجود";
      msg.style.color = "red";
      return;
    }

    const data = snapshot.val();
    if (data.password !== password) {
      msg.innerHTML = "❌ كلمة المرور غير صحيحة";
      msg.style.color = "red";
      return;
    }

    currentUser = username;
    playerData = data.playerData;
    playerData.lastLogin = new Date().toISOString();

    await update(playerRef, { "playerData/lastLogin": playerData.lastLogin });

    document.getElementById("login-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";

    loadGameData();

  } catch (error) {
    console.error("⚠️ خطأ أثناء تسجيل الدخول:", error);
    msg.innerHTML = "⚠️ لم يتم الاتصال بقاعدة البيانات";
    msg.style.color = "orange";
  }
}

// ------------------------------
// تحميل بيانات اللاعب
// ------------------------------
function loadGameData() {
  document.getElementById("current-player").innerText = playerData.name;
  document.getElementById("gold").innerText = playerData.gold;
  document.getElementById("market-level").innerText = playerData.marketLevel;
  // أضف بقية البيانات عند الحاجة
}

// ------------------------------
// زر الخروج
// ------------------------------
function logout() {
  currentUser = null;
  playerData = null;
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("login-screen").style.display = "block";
}

// ------------------------------
// ربط الأزرار
// ------------------------------
document.getElementById("register-btn").addEventListener("click", register);
document.getElementById("login-btn").addEventListener("click", login);
document.getElementById("show-register-btn").addEventListener("click", showRegister);
document.getElementById("show-login-btn").addEventListener("click", showLogin);
document.getElementById("logout-btn").addEventListener("click", logout);
