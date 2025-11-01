import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, get, set, update, onValue } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-uIUpKD9MsGA9ZcvTAT9-kEykOZ9RyXw",
  authDomain: "game-4b832.firebaseapp.com",
  databaseURL: "https://game-4b832-default-rtdb.firebaseio.com",
  projectId: "game-4b832",
  storageBucket: "game-4b832.appspot.com",
  messagingSenderId: "164126998957",
  appId: "1:164126998957:web:82b358b9ce73ee179fcd13"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = null;

// عناصر الواجهة
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const showRegisterBtn = document.getElementById("show-register-btn");
const showLoginBtn = document.getElementById("show-login-btn");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");

// التنقل بين الصفحات
showRegisterBtn.addEventListener("click", () => {
  loginForm.style.display = "none";
  registerForm.style.display = "block";
});

showLoginBtn.addEventListener("click", () => {
  registerForm.style.display = "none";
  loginForm.style.display = "block";
});

// إنشاء حساب جديد
registerBtn.addEventListener("click", async () => {
  const username = document.getElementById("new-username").value.trim();
  const password = document.getElementById("new-password").value;
  const msg = document.getElementById("register-message");

  if (!username || !password) {
    msg.textContent = "❌ الرجاء إدخال جميع الحقول";
    msg.style.color = "red";
    return;
  }

  const userRef = ref(db, "players/" + username);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    msg.textContent = "❌ الاسم مستخدم مسبقًا";
    msg.style.color = "red";
    return;
  }

  try {
    const playerData = {
      password: password,
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
      marketLevel: 1, // ✅ السوق يبدأ من المستوى 1 مباشرة
      score: 0,
      level: 1,
      joinDate: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    await set(userRef, playerData);

    msg.textContent = "✅ تم إنشاء الحساب بنجاح!";
    msg.style.color = "green";
    setTimeout(() => {
      registerForm.style.display = "none";
      loginForm.style.display = "block";
    }, 1500);

  } catch (error) {
    console.error("خطأ في إنشاء الحساب:", error);
    msg.textContent = "⚠️ حدث خطأ أثناء إنشاء الحساب";
    msg.style.color = "red";
  }
});

// تسجيل الدخول
loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const msg = document.getElementById("login-message");

  if (!username || !password) {
    msg.textContent = "❌ الرجاء إدخال جميع الحقول";
    msg.style.color = "red";
    return;
  }

  const userRef = ref(db, "players/" + username);
  const snapshot = await get(userRef);

  if (!snapshot.exists()) {
    msg.textContent = "❌ المستخدم غير موجود";
    msg.style.color = "red";
    return;
  }

  const data = snapshot.val();
  if (data.password !== password) {
    msg.textContent = "❌ كلمة المرور غير صحيحة";
    msg.style.color = "red";
    return;
  }

  currentUser = username;
  msg.textContent = "✅ تم تسجيل الدخول بنجاح!";
  msg.style.color = "green";

  await update(userRef, { lastLogin: new Date().toISOString() });

  setTimeout(() => {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("game-screen").style.display = "block";
    document.getElementById("current-player").textContent = username;
    loadPlayerData();
  }, 1000);
});

// تحميل بيانات اللاعب
async function loadPlayerData() {
  const userRef = ref(db, "players/" + currentUser);
  onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      document.getElementById("gold").textContent = data.gold;
      document.getElementById("food").textContent = data.food;
      document.getElementById("iron").textContent = data.iron;
      document.getElementById("stone").textContent = data.stone;
      document.getElementById("building-materials").textContent = data.buildingMaterials;
      document.getElementById("level").textContent = data.level;
      document.getElementById("score").textContent = data.score;

      document.getElementById("farm-level").textContent = data.farmLevel;
      document.getElementById("mine-level").textContent = data.mineLevel;
      document.getElementById("quarry-level").textContent = data.quarryLevel;
      document.getElementById("factory-level").textContent = data.factoryLevel || "—";
      document.getElementById("village-level").textContent = data.villageLevel || "—";
      document.getElementById("army-level").textContent = data.armyLevel || "—";
      document.getElementById("market-level").textContent = data.marketLevel || 1;
    }
  });
}

// تسجيل الخروج
document.getElementById("logout-btn").addEventListener("click", () => {
  currentUser = null;
  document.getElementById("game-screen").style.display = "none";
  document.getElementById("login-screen").style.display = "flex";
});
