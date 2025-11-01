<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>لعبة المزرعة والمصنع</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div id="login-screen">
    <div id="login-form">
      <h2>🎮 تسجيل الدخول</h2>
      <input type="text" id="username" placeholder="اسم اللاعب">
      <input type="password" id="password" placeholder="كلمة المرور">
      <button id="login-btn">دخول</button>
      <button id="show-register-btn">إنشاء حساب جديد</button>
      <div id="login-message"></div>
    </div>
    <div id="register-form" style="display:none;">
      <h2>📝 إنشاء حساب جديد</h2>
      <input type="text" id="new-username" placeholder="اسم اللاعب الجديد">
      <input type="password" id="new-password" placeholder="كلمة المرور">
      <button id="register-btn">إنشاء حساب</button>
      <button id="show-login-btn">العودة لتسجيل الدخول</button>
      <div id="register-message"></div>
    </div>
  </div>

  <div id="game-screen" style="display:none;">
    <!-- إشعار الإنتاج أثناء الغياب -->
    <div id="offline-notification" style="display:none;"></div>
    
    <div id="player-info">
      <span>مرحباً, <span id="current-player">...</span></span>
      <button id="logout-btn">تسجيل الخروج</button>
    </div>
    
    <div id="leaderboard">
      <h2>🏆 لوحة المتصدرين</h2>
      <div id="players-list"></div>
    </div>

    <div id="resources">
      <h3>💰 مواردك</h3>
      <div>ذهب: <span id="gold">100</span></div>
      <div>غذاء: <span id="food">0</span></div>
      <div>حديد: <span id="iron">0</span></div>
      <div>حجر: <span id="stone">0</span></div>
      <div>مواد بناء: <span id="building-materials">0</span></div>
      <div>المستوى: <span id="level">1</span></div>
      <div>النقاط: <span id="score">0</span></div>
    </div>

    <div id="actions">
      <!-- المزرعة -->
      <div class="section">
        <h3>🌱 المزرعة (المستوى <span id="farm-level">1</span>)</h3>
        <div>إنتاج: <span id="farm-production">10</span> غذاء كل 5 دقائق</div>
        <div>إجمالي المحصول: <span id="crops">0</span></div>
        <div class="progress-bar">
          <div class="progress-fill" id="farm-progress" style="width: 0%">
            <span id="farm-timer">5:00</span>
          </div>
        </div>
        <button onclick="upgradeFarm()">تطوير المزرعة (تكلفة: <span id="farm-cost">50</span> ذهب)</button>
      </div>

      <!-- المنجم -->
      <div class="section">
        <h3>⛏️ المنجم (المستوى <span id="mine-level">1</span>)</h3>
        <div>إنتاج: <span id="mine-production">8</span> حديد كل 5 دقائق</div>
        <div>إجمالي الحديد المستخرج: <span id="mined-iron">0</span></div>
        <div class="progress-bar">
          <div class="progress-fill mine" id="mine-progress" style="width: 0%">
            <span id="mine-timer">5:00</span>
          </div>
        </div>
        <button onclick="upgradeMine()">تطوير المنجم (تكلفة: <span id="mine-cost">50</span> ذهب)</button>
      </div>

      <!-- المحجر -->
      <div class="section">
        <h3>🪨 المحجر (المستوى <span id="quarry-level">1</span>)</h3>
        <div>إنتاج: <span id="quarry-production">5</span> حجر كل 4 دقائق</div>
        <div>إجمالي الحجر المستخرج: <span id="mined-stone">0</span></div>
        <div class="progress-bar">
          <div class="progress-fill gold" id="quarry-progress" style="width: 0%">
            <span id="quarry-timer">4:00</span>
          </div>
        </div>
        <button onclick="upgradeQuarry()">تطوير المحجر (تكلفة: <span id="quarry-cost">30</span> ذهب)</button>
      </div>

      <!-- المصنع -->
      <div class="section factory-section">
        <h3>🏭 المصنع (المستوى <span id="factory-level">—</span>)</h3>
        <div>الحالة: <span id="factory-status">غير مبني</span></div>
        <button onclick="produceBuilding()" id="produce-building">إنتاج مواد بناء</button>
        <button onclick="upgradeFactory()" id="upgrade-factory">بناء المصنع (تكلفة: 500 ذهب)</button>
      </div>

      <!-- القرية -->
      <div class="section village-section">
        <h3>🏘️ القرية (المستوى <span id="village-level">—</span>)</h3>
        <div>مكافأة إنتاج المزرعة: <span id="village-bonus">+0%</span></div>
        <button onclick="upgradeVillage()" id="upgrade-village">بناء القرية (800 ذهب + 20 مواد + 50 غذاء)</button>
      </div>

      <!-- الجيش -->
      <div class="section army-section">
        <h3>⚔️ الجيش (المستوى <span id="army-level">—</span>)</h3>
        <div>النقاط المكتسبة: <span id="army-points">0</span></div>
        <button onclick="upgradeArmy()" id="upgrade-army">بناء الجيش (1200 ذهب + 30 حديد + 30 غذاء)</button>
      </div>

      <!-- السوق -->
      <div class="section market-section">
        <h3>🏪 السوق (المستوى <span id="market-level">1</span>)</h3>
        <div>سعر البيع: <span id="market-rate">0.5</span> ذهب لكل وحدة</div>
        <button onclick="window.sellFood()">بيع غذاء</button>
        <button onclick="window.sellBuildingMaterials()">بيع مواد بناء</button>
        <button onclick="window.upgradeMarket()" id="upgrade-market">تطوير السوق (تكلفة: 800 ذهب)</button>
      </div>
    </div>
  </div>

  <script type="module" src="script.js"></script>
</body>
</html>
