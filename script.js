// عناصر واجهة المستخدم
const loginScreen = document.getElementById("login-screen");
const gameScreen = document.getElementById("game-screen");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const showRegisterBtn = document.getElementById("show-register-btn");
const showLoginBtn = document.getElementById("show-login-btn");

// تنقل بين التسجيل والدخول
showRegisterBtn.onclick = () => {
  loginForm.style.display = "none";
  registerForm.style.display = "block";
};

showLoginBtn.onclick = () => {
  registerForm.style.display = "none";
  loginForm.style.display = "block";
};

// عملية تسجيل الدخول
loginBtn.onclick = () => {
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;
  const msg = document.getElementById("login-message");

  if (username === "player" && password === "1234") {
    loginScreen.style.display = "none";
    gameScreen.style.display = "block";
    document.getElementById("player-name").textContent = username;
  } else {
    msg.textContent = "❌ اسم المستخدم أو كلمة المرور غير صحيحة";
    loginForm.classList.add("shake");
    setTimeout(() => loginForm.classList.remove("shake"), 400);
  }
};

// تسجيل الحساب (تجريبي)
registerBtn.onclick = () => {
  const msg = document.getElementById("register-message");
  msg.textContent = "✅ تم التسجيل بنجاح! يمكنك تسجيل الدخول الآن.";
  registerForm.classList.add("shake");
  setTimeout(() => registerForm.classList.remove("shake"), 400);
};

// زر التقدم
document.getElementById("progress-btn").onclick = () => {
  const bar = document.getElementById("progress-fill");
  let width = parseInt(bar.style.width) || 0;
  if (width < 100) {
    width += 10;
    bar.style.width = width + "%";
    bar.textContent = width + "%";
  }
};
