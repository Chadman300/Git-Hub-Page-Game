// Game Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameState = {
    running: false,
    score: 0,
    wave: 1,
    gameOver: false
};

// Player Object
const player = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 20,
    height: 20,
    speed: 5,
    health: 100,
    maxHealth: 100,
    color: '#0ff',
    dx: 0,
    dy: 0
};

// Input State
const keys = {};

// Game Arrays
let playerBullets = [];
let enemies = [];
let enemyBullets = [];
let particles = [];

// Game Timing
let lastShot = 0;
let lastEnemySpawn = 0;
let lastEnemyShot = 0;
const shootCooldown = 200;
const enemySpawnRate = 2000;
const enemyShootRate = 1000;

// Event Listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ' && gameState.gameOver) {
        restartGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Player Movement
function updatePlayer() {
    // Reset velocity
    player.dx = 0;
    player.dy = 0;
    
    // WASD and Arrow key controls
    if (keys['w'] || keys['W'] || keys['ArrowUp']) player.dy = -player.speed;
    if (keys['s'] || keys['S'] || keys['ArrowDown']) player.dy = player.speed;
    if (keys['a'] || keys['A'] || keys['ArrowLeft']) player.dx = -player.speed;
    if (keys['d'] || keys['D'] || keys['ArrowRight']) player.dx = player.speed;
    
    // Normalize diagonal movement
    if (player.dx !== 0 && player.dy !== 0) {
        player.dx *= 0.707;
        player.dy *= 0.707;
    }
    
    // Update position
    player.x += player.dx;
    player.y += player.dy;
    
    // Boundary checking
    player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(canvas.height - player.height / 2, player.y));
    
    // Shooting
    if (keys[' '] && Date.now() - lastShot > shootCooldown) {
        shootPlayerBullet();
        lastShot = Date.now();
    }
}

// Player Shooting
function shootPlayerBullet() {
    playerBullets.push({
        x: player.x,
        y: player.y - player.height / 2,
        width: 4,
        height: 12,
        speed: 8,
        color: '#0ff',
        damage: 20
    });
}

// Enemy System
function spawnEnemy() {
    const types = ['basic', 'fast', 'tank'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let enemy = {
        x: Math.random() * (canvas.width - 40) + 20,
        y: -30,
        width: 30,
        height: 30,
        speed: 2,
        health: 40,
        maxHealth: 40,
        color: '#f00',
        type: type,
        shootTimer: 0
    };
    
    // Adjust properties based on type
    if (type === 'fast') {
        enemy.speed = 3.5;
        enemy.health = 20;
        enemy.maxHealth = 20;
        enemy.color = '#ff0';
        enemy.width = 20;
        enemy.height = 20;
    } else if (type === 'tank') {
        enemy.speed = 1;
        enemy.health = 80;
        enemy.maxHealth = 80;
        enemy.color = '#f0f';
        enemy.width = 40;
        enemy.height = 40;
    }
    
    enemies.push(enemy);
}

function updateEnemies() {
    // Spawn enemies
    if (Date.now() - lastEnemySpawn > enemySpawnRate / gameState.wave) {
        spawnEnemy();
        lastEnemySpawn = Date.now();
    }
    
    // Update each enemy
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        // Move enemy
        enemy.y += enemy.speed;
        
        // Slight horizontal movement for variety
        enemy.x += Math.sin(enemy.y * 0.02) * 0.5;
        
        // Enemy shooting
        enemy.shootTimer++;
        if (enemy.shootTimer > 60 / gameState.wave) {
            shootEnemyBullet(enemy);
            enemy.shootTimer = 0;
        }
        
        // Remove if off screen
        if (enemy.y > canvas.height + 50) {
            enemies.splice(i, 1);
            continue;
        }
        
        // Check collision with player
        if (checkCollision(player, enemy)) {
            damagePlayer(10);
            createExplosion(enemy.x, enemy.y, enemy.color);
            enemies.splice(i, 1);
        }
    }
}

function shootEnemyBullet(enemy) {
    // Calculate angle to player
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const angle = Math.atan2(dy, dx);
    
    // Create multiple bullets for bullet hell effect
    const bulletCount = 3;
    for (let i = 0; i < bulletCount; i++) {
        const spreadAngle = angle + (i - 1) * 0.2;
        enemyBullets.push({
            x: enemy.x,
            y: enemy.y + enemy.height / 2,
            width: 6,
            height: 6,
            speed: 4,
            angle: spreadAngle,
            color: enemy.color,
            damage: 5
        });
    }
}

function updateBullets() {
    // Update player bullets
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        const bullet = playerBullets[i];
        bullet.y -= bullet.speed;
        
        if (bullet.y < -20) {
            playerBullets.splice(i, 1);
            continue;
        }
        
        // Check collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (checkCollision(bullet, enemy)) {
                enemy.health -= bullet.damage;
                playerBullets.splice(i, 1);
                createParticles(bullet.x, bullet.y, bullet.color, 5);
                
                if (enemy.health <= 0) {
                    gameState.score += 10 * gameState.wave;
                    createExplosion(enemy.x, enemy.y, enemy.color);
                    enemies.splice(j, 1);
                }
                break;
            }
        }
    }
    
    // Update enemy bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        const bullet = enemyBullets[i];
        bullet.x += Math.cos(bullet.angle) * bullet.speed;
        bullet.y += Math.sin(bullet.angle) * bullet.speed;
        
        if (bullet.y > canvas.height + 20 || bullet.x < -20 || bullet.x > canvas.width + 20) {
            enemyBullets.splice(i, 1);
            continue;
        }
        
        // Check collision with player
        if (checkCollision(bullet, player)) {
            damagePlayer(bullet.damage);
            enemyBullets.splice(i, 1);
            createParticles(bullet.x, bullet.y, bullet.color, 3);
        }
    }
}

// Collision Detection
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width / 2 &&
           obj1.x + obj1.width / 2 > obj2.x &&
           obj1.y < obj2.y + obj2.height / 2 &&
           obj1.y + obj1.height / 2 > obj2.y;
}

// Damage System
function damagePlayer(damage) {
    player.health -= damage;
    if (player.health <= 0) {
        player.health = 0;
        endGame();
    }
}

// Particle System
function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 30,
            color: color,
            size: Math.random() * 3 + 2
        });
    }
}

function createExplosion(x, y, color) {
    createParticles(x, y, color, 20);
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.size *= 0.95;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Drawing Functions
function drawPlayer() {
    ctx.save();
    ctx.fillStyle = player.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = player.color;
    
    // Draw player as a triangle
    ctx.beginPath();
    ctx.moveTo(player.x, player.y - player.height / 2);
    ctx.lineTo(player.x - player.width / 2, player.y + player.height / 2);
    ctx.lineTo(player.x + player.width / 2, player.y + player.height / 2);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

function drawBullets() {
    // Player bullets
    ctx.fillStyle = '#0ff';
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#0ff';
    playerBullets.forEach(bullet => {
        ctx.fillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height);
    });
    
    // Enemy bullets
    enemyBullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.shadowColor = bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.save();
        ctx.fillStyle = enemy.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = enemy.color;
        
        // Draw enemy
        ctx.fillRect(
            enemy.x - enemy.width / 2,
            enemy.y - enemy.height / 2,
            enemy.width,
            enemy.height
        );
        
        // Draw health bar
        const healthBarWidth = enemy.width;
        const healthBarHeight = 4;
        const healthPercent = enemy.health / enemy.maxHealth;
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#300';
        ctx.fillRect(
            enemy.x - healthBarWidth / 2,
            enemy.y - enemy.height / 2 - 8,
            healthBarWidth,
            healthBarHeight
        );
        
        ctx.fillStyle = '#0f0';
        ctx.fillRect(
            enemy.x - healthBarWidth / 2,
            enemy.y - enemy.height / 2 - 8,
            healthBarWidth * healthPercent,
            healthBarHeight
        );
        
        ctx.restore();
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function drawBackground() {
    // Draw grid lines for effect
    ctx.strokeStyle = '#0a3';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.1;
    
    const gridSize = 50;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
}

// UI Update
function updateUI() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('health').textContent = Math.max(0, Math.floor(player.health));
    document.getElementById('wave').textContent = gameState.wave;
}

// Wave System
function checkWaveProgression() {
    if (gameState.score > gameState.wave * 200) {
        gameState.wave++;
    }
}

// Game Over
function endGame() {
    gameState.running = false;
    gameState.gameOver = true;
    document.getElementById('gameOver').classList.add('show');
}

// Restart Game
function restartGame() {
    // Reset player
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.health = player.maxHealth;
    
    // Reset game state
    gameState.score = 0;
    gameState.wave = 1;
    gameState.running = true;
    gameState.gameOver = false;
    
    // Clear arrays
    playerBullets = [];
    enemies = [];
    enemyBullets = [];
    particles = [];
    
    // Reset timers
    lastShot = 0;
    lastEnemySpawn = 0;
    
    document.getElementById('gameOver').classList.remove('show');
}

// Main Game Loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    if (gameState.running) {
        // Update
        updatePlayer();
        updateEnemies();
        updateBullets();
        updateParticles();
        checkWaveProgression();
        
        // Draw
        drawParticles();
        drawPlayer();
        drawEnemies();
        drawBullets();
        
        // Update UI
        updateUI();
    }
    
    requestAnimationFrame(gameLoop);
}

// Start Game
function init() {
    restartGame();
    gameLoop();
}

// Initialize game when page loads
init();
