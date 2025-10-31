let players = {};
let currentPlayer = null;
let gameInterval = null;

// أوقات الإنتاج بالثواني
const FARM_TIME = 300; // 5 دقائق
const MINE_TIME = 300; // 5 دقائق
const GOLD_TIME = 60;  // 1 دقيقة

function loadPlayers() {
    const saved = localStorage.getItem('farmGamePlayers');
    if (saved) {
        players = JSON.parse(saved);
    }
}

function savePlayers() {
    localStorage.setItem('farmGamePlayers', JSON.stringify(players));
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('register-message').innerHTML = '';
}

function showLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('login-message').innerHTML = '';
}

function register() {
    const username = document.getElementById('new-username').value.trim();
    const password = document.getElementById('new-password').value;
    const message = document.getElementById('register-message');

    if (!username || !password) {
        message.innerHTML = '<span style="color: red;">❌ الرجاء ملء جميع الحقول</span>';
        return;
    }

    if (username.length < 3) {
        message.innerHTML = '<span style="color: red;">❌ اسم المستخدم يجب أن يكون 3 أحرف على الأقل</span>';
        return;
    }

    loadPlayers(); // ✅ تحميل اللاعبين الموجودين قبل إنشاء لاعب جديد

    if (players[username]) {
        message.innerHTML = '<span style="color: red;">❌ اسم المستخدم موجود مسبقاً</span>';
        return;
    }

    players[username] = {
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

    savePlayers();
    message.innerHTML = '<span style="color: green;">✅ تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن</span>';
    
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
    
    setTimeout(showLogin, 2000);
}

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const message = document.getElementById('login-message');

    if (!username || !password) {
        message.innerHTML = '<span style="color: red;">❌ الرجاء إدخال اسم المستخدم وكلمة المرور</span>';
        return;
    }

    // ✅ تحميل جميع اللاعبين من التخزين المحلي
    loadPlayers();

    const player = players[username];
    
    if (!player || player.password !== password) {
        message.innerHTML = '<span style="color: red;">❌ اسم المستخدم أو كلمة المرور غير صحيحة</span>';
        return;
    }

    currentPlayer = player.playerData;
    currentPlayer.lastLogin = new Date().toISOString();
    
    // التأكد من وجود المؤقتات
    if (!currentPlayer.farmTimer) currentPlayer.farmTimer = FARM_TIME;
    if (!currentPlayer.mineTimer) currentPlayer.mineTimer = MINE_TIME;
    if (!currentPlayer.goldTimer) currentPlayer.goldTimer = GOLD_TIME;
    
    localStorage.setItem('lastPlayer', username);
    
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    document.getElementById('current-player').textContent = currentPlayer.name;
    
    startGameLoop();
    updateUI();
    
    message.innerHTML = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

function logout() {
    stopGameLoop();
    
    players[currentPlayer.name].playerData = currentPlayer;
    savePlayers();
    
    currentPlayer = null;
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    showLogin();
}

function startGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    gameInterval = setInterval(() => {
        // تحديث مؤقت المزرعة
        currentPlayer.farmTimer--;
        if (currentPlayer.farmTimer <= 0) {
            const production = 10 + (currentPlayer.farmLevel - 1) * 5;
            currentPlayer.food += production;
            currentPlayer.crops += production;
            currentPlayer.score += production;
            currentPlayer.farmTimer = FARM_TIME;
            showMessage(`🌱 حصلت على ${production} غذاء من المزرعة!`);
        }
        
        // تحديث مؤقت المنجم
        currentPlayer.mineTimer--;
        if (currentPlayer.mineTimer <= 0) {
            const production = 8 + (currentPlayer.mineLevel - 1) * 4;
            currentPlayer.iron += production;
            currentPlayer.minedIron += production;
            currentPlayer.score += production * 2;
            currentPlayer.mineTimer = MINE_TIME;
            showMessage(`⛏️ حصلت على ${production} حديد من المنجم!`);
        }
        
        // تحديث مؤقت الذهب
        currentPlayer.goldTimer--;
        if (currentPlayer.goldTimer <= 0) {
            const income = 5 * currentPlayer.goldLevel;
            currentPlayer.gold += income;
            currentPlayer.score += income;
            currentPlayer.goldTimer = GOLD_TIME;
            showMessage(`💰 حصلت على ${income} ذهب!`);
        }
        
        updateUI();
    }, 1000);
}

function stopGameLoop() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
}

function upgradeFarm() {
    if (!currentPlayer) return;
    const cost = 50 + (currentPlayer.farmLevel - 1) * 20;
    
    if (currentPlayer.gold >= cost) {
        currentPlayer.gold -= cost;
        currentPlayer.farmLevel++;
        currentPlayer.score += 100;
        
        updateUI();
        showMessage(`🚀 تم تطوير المزرعة إلى المستوى ${currentPlayer.farmLevel}!`);
    } else {
        showMessage(`❌ تحتاج ${cost} ذهب لتطوير المزرعة`);
    }
}

function upgradeMine() {
    if (!currentPlayer) return;
    const cost = 50 + (currentPlayer.mineLevel - 1) * 20;
    
    if (currentPlayer.gold >= cost) {
        currentPlayer.gold -= cost;
        currentPlayer.mineLevel++;
        currentPlayer.score += 100;
        
        updateUI();
        showMessage(`⚡ تم تطوير المنجم إلى المستوى ${currentPlayer.mineLevel}!`);
    } else {
        showMessage(`❌ تحتاج ${cost} ذهب لتطوير المنجم`);
    }
}

function upgradeGold() {
    if (!currentPlayer) return;
    const cost = 30 + (currentPlayer.goldLevel - 1) * 15;
    
    if (currentPlayer.gold >= cost) {
        currentPlayer.gold -= cost;
        currentPlayer.goldLevel++;
        currentPlayer.score += 80;
        
        updateUI();
        showMessage(`💎 تم تطوير الدخل إلى المستوى ${currentPlayer.goldLevel}!`);
    } else {
        showMessage(`❌ تحتاج ${cost} ذهب لتطوير الدخل`);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateUI() {
    if (!currentPlayer) return;
    
    document.getElementById('gold').textContent = currentPlayer.gold;
    document.getElementById('food').textContent = currentPlayer.food;
    document.getElementById('iron').textContent = currentPlayer.iron;
    document.getElementById('crops').textContent = currentPlayer.crops;
    document.getElementById('mined-iron').textContent = currentPlayer.minedIron;
    document.getElementById('score').textContent = currentPlayer.score;
    
    document.getElementById('farm-level').textContent = currentPlayer.farmLevel;
    document.getElementById('mine-level').textContent = currentPlayer.mineLevel;
    document.getElementById('level').textContent = Math.max(currentPlayer.farmLevel, currentPlayer.mineLevel, currentPlayer.goldLevel);
    
    const farmProgress = ((FARM_TIME - currentPlayer.farmTimer) / FARM_TIME) * 100;
    const mineProgress = ((MINE_TIME - currentPlayer.mineTimer) / MINE_TIME) * 100;
    const goldProgress = ((GOLD_TIME - currentPlayer.goldTimer) / GOLD_TIME) * 100;
    
    updateLeaderboard();
}

function updateLeaderboard() {
    loadPlayers(); // ✅ تحديث البيانات من التخزين المحلي قبل العرض

    const playersArray = Object.values(players).map(p => p.playerData);
    const leaderboard = document.getElementById('players-list');
    
    leaderboard.innerHTML = playersArray
        .sort((a, b) => b.score - a.score)
        .map((player, index) => `
            <div class="leaderboard-item ${player.name === currentPlayer.name ? 'current-player' : ''}">
                <span class="rank">${index + 1}</span>
                <span class="name">${player.name}</span>
                <span class="score">${player.score} نقطة</span>
            </div>
        `)
        .join('');
}

function showMessage(msg) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = msg;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.95);
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 1000;
        font-weight: bold;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

function checkLastPlayer() {
    const lastPlayer = localStorage.getItem('lastPlayer');
    if (lastPlayer && players[lastPlayer]) {
        document.getElementById('username').value = lastPlayer;
    }
}

// تهيئة اللعبة عند تحميل الصفحة
window.addEventListener('DOMContentLoaded', function() {
    loadPlayers();
    checkLastPlayer();
});

// حفظ بيانات اللاعب كل 30 ثانية
setInterval(() => {
    if (currentPlayer) {
        players[currentPlayer.name].playerData = currentPlayer;
        savePlayers();
    }
}, 30000);
