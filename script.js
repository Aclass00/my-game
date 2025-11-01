* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    direction: rtl;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
}

#login-screen {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    padding: 20px;
}

#login-form, #register-form {
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    text-align: center;
    width: 100%;
    max-width: 400px;
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
}

#login-form h2, #register-form h2 {
    color: #2c3e50;
    margin-bottom: 30px;
    font-size: 28px;
}

input {
    width: 100%;
    padding: 15px;
    margin: 10px 0;
    border: 2px solid #ddd;
    border-radius: 10px;
    font-size: 16px;
    transition: border-color 0.3s;
}

input:focus {
    outline: none;
    border-color: #667eea;
}

button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 15px 25px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    margin: 10px 5px;
    font-size: 16px;
    font-weight: bold;
    transition: transform 0.2s, box-shadow 0.2s;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

button:active {
    transform: translateY(0);
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

#login-message, #register-message {
    margin-top: 20px;
    padding: 10px;
    border-radius: 5px;
    font-weight: bold;
}

#game-screen {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    animation: slideIn 0.5s ease-out;
    position: relative;
}

/* إشعار الإنتاج أثناء الغياب */
#offline-notification {
    position: fixed;
    top: 20px;
    left: 20px;
    background: linear-gradient(135deg, #4caf50, #8bc34a);
    color: white;
    padding: 20px 30px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 1000;
    animation: slideInLeft 0.5s ease-out;
    max-width: 350px;
    font-weight: bold;
}

#offline-notification .close-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(255,255,255,0.3);
    border: none;
    color: white;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    line-height: 25px;
    padding: 0;
    margin: 0;
}

#offline-notification .close-btn:hover {
    background: rgba(255,255,255,0.5);
}

#offline-notification h4 {
    margin: 0 0 10px 0;
    font-size: 18px;
}

#offline-notification p {
    margin: 5px 0;
    font-size: 14px;
}

@keyframes slideInLeft {
    from { transform: translateX(-100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutLeft {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(-100%); opacity: 0; }
}

@keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
}

#player-info {
    background: rgba(255, 255, 255, 0.95);
    padding: 15px 25px;
    border-radius: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
}

#player-info span {
    font-size: 18px;
    font-weight: bold;
    color: #2c3e50;
}

#leaderboard {
    background: rgba(255, 255, 255, 0.95);
    padding: 25px;
    border-radius: 15px;
    margin-bottom: 20px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
}

#leaderboard h2 {
    color: #2c3e50;
    margin-bottom: 20px;
    text-align: center;
    font-size: 24px;
}

.leaderboard-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    margin: 8px 0;
    background: #f8f9fa;
    border-radius: 10px;
    transition: transform 0.2s;
}

.leaderboard-item:hover {
    transform: translateX(-5px);
}

.current-player {
    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
    border: 2px solid #2196f3;
    box-shadow: 0 3px 10px rgba(33, 150, 243, 0.3);
}

.rank {
    font-weight: bold;
    color: #ff9800;
    font-size: 18px;
    min-width: 30px;
}

.name {
    flex-grow: 1;
    text-align: right;
    margin: 0 15px;
    font-weight: bold;
}

.score {
    font-weight: bold;
    color: #4caf50;
    font-size: 16px;
}

#resources {
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    padding: 25px;
    border-radius: 15px;
    margin-bottom: 20px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

#resources h3 {
    color: #2c3e50;
    margin-bottom: 15px;
    text-align: center;
    font-size: 22px;
}

#resources div {
    display: inline-block;
    background: rgba(255, 255, 255, 0.9);
    padding: 10px 20px;
    margin: 5px;
    border-radius: 25px;
    font-weight: bold;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.section {
    background: rgba(255, 255, 255, 0.95);
    padding: 25px;
    margin: 15px 0;
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
    transition: transform 0.2s;
}

.section:hover {
    transform: translateY(-2px);
}

.section h3 {
    color: #2c3e50;
    margin-bottom: 15px;
    font-size: 20px;
}

.section div {
    margin: 10px 0;
    color: #555;
}

.progress-bar {
    background: #e0e0e0;
    border-radius: 10px;
    height: 25px;
    overflow: hidden;
    margin: 10px 0;
    position: relative;
}

.progress-fill {
    background: linear-gradient(135deg, #4caf50, #8bc34a);
    height: 100%;
    transition: width 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 12px;
}

.progress-fill.mine {
    background: linear-gradient(135deg, #ff9800, #ffc107);
}

.progress-fill.gold {
    background: linear-gradient(135deg, #9e9e9e, #bdbdbd);
}

/* ستايلات خاصة بالمباني الجديدة */
.factory-section {
    border-right: 4px solid #ff5722;
}

.factory-section h3 {
    color: #ff5722;
}

.village-section {
    border-right: 4px solid #4caf50;
}

.village-section h3 {
    color: #4caf50;
}

.army-section {
    border-right: 4px solid #f44336;
}

.army-section h3 {
    color: #f44336;
}

.market-section {
    border-right: 4px solid #2196f3;
}

.market-section h3 {
    color: #2196f3;
}

.section button {
    width: 100%;
    margin: 5px 0;
}

@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

@media (max-width: 768px) {
    #game-screen {
        padding: 10px;
    }
    
    #player-info {
        flex-direction: column;
        gap: 10px;
        text-align: center;
    }
    
    #resources div {
        display: block;
        text-align: center;
        margin: 8px 0;
    }
    
    .section {
        padding: 20px;
    }
    
    button {
        width: 100%;
        margin: 5px 0;
    }
}
