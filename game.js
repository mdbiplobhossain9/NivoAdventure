/**
 * Game class - main game controller and state manager
 */
class Game {
    constructor() {
        // Canvas and context
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.state = 'loading'; // 'loading', 'menu', 'playing', 'paused', 'gameOver', 'levelComplete'
        this.previousState = 'menu';
        
        // Core game objects
        this.player = null;
        this.currentLevel = null;
        this.camera = null;
        this.background = null;
        this.inputManager = null;
        
        // Game properties
        this.currentLevelNumber = 1;
        this.score = 0;
        this.lives = 3;
        this.totalScore = 0;
        this.gameStartTime = 0;
        
        // Performance tracking
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        
        // Game loop
        this.animationId = null;
        this.isRunning = false;
        
        // UI elements
        this.ui = {
            healthBar: document.getElementById('healthBar'),
            healthFill: document.getElementById('healthFill'),
            score: document.getElementById('scoreValue'),
            level: document.getElementById('levelValue'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            levelCompleteScreen: document.getElementById('levelCompleteScreen'),
            startScreen: document.getElementById('startScreen'),
            finalScore: document.getElementById('finalScore'),
            levelScore: document.getElementById('levelScore')
        };
        
        // Initialize game
        this.initialize();
    }

    /**
     * Initialize the game
     */
    async initialize() {
        console.log('Initializing Nivo Adventure...');
        
        try {
            // Set up input manager
            this.inputManager = new InputManager();
            this.inputManager.autoConfigureMobileControls();
            
            // Set up audio
            audioManager.preloadSounds();
            
            // Set up UI event listeners
            this.setupUIEventListeners();
            
            // Initialize game objects
            this.setupGame();
            
            this.state = 'menu';
            console.log('Game initialized successfully!');
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to initialize game. Please refresh the page.');
        }
    }

    /**
     * Set up UI event listeners
     */
    setupUIEventListeners() {
        // Start button
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }
        
        // Restart button
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.restartGame());
        }
        
        // Next level button
        const nextLevelBtn = document.getElementById('nextLevelBtn');
        if (nextLevelBtn) {
            nextLevelBtn.addEventListener('click', () => this.nextLevel());
        }
        
        // Level restart button
        const levelRestartBtn = document.getElementById('levelRestartBtn');
        if (levelRestartBtn) {
            levelRestartBtn.addEventListener('click', () => this.restartLevel());
        }
        
        // Main menu buttons
        const mainMenuBtns = document.querySelectorAll('#mainMenuBtn');
        mainMenuBtns.forEach(btn => {
            btn.addEventListener('click', () => this.showMainMenu());
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'Escape':
                    if (this.state === 'playing') {
                        this.pauseGame();
                    } else if (this.state === 'paused') {
                        this.resumeGame();
                    }
                    break;
                case 'KeyR':
                    if (this.state === 'gameOver' || this.state === 'levelComplete') {
                        this.restartLevel();
                    }
                    break;
                case 'Enter':
                    if (this.state === 'menu') {
                        this.startGame();
                    }
                    break;
            }
        });
    }

    /**
     * Set up core game objects
     */
    setupGame() {
        // Create camera
        this.camera = new Camera(
            this.canvas.width,
            this.canvas.height,
            2000, // Default world width
            1000  // Default world height
        );
        
        // Create background
        this.background = new Background(this.canvas.width, this.canvas.height);
        
        // Create player
        this.player = new Player(50, 400);
        this.camera.setTarget(this.player);
        
        // Load first level
        this.loadLevel(this.currentLevelNumber);
        
        // Start game loop
        this.startGameLoop();
    }

    /**
     * Start the game
     */
    startGame() {
        this.state = 'playing';
        this.gameStartTime = getTimestamp();
        this.score = 0;
        this.totalScore = 0;
        this.currentLevelNumber = 1;
        this.lives = 3;
        
        this.player.reset(50, 400);
        this.loadLevel(this.currentLevelNumber);
        this.hideAllScreens();
        this.updateUI();
        
        console.log('Game started!');
    }

    /**
     * Restart the current level
     */
    restartLevel() {
        this.state = 'playing';
        this.player.reset(this.currentLevel.playerStartX, this.currentLevel.playerStartY);
        this.currentLevel.reset();
        this.camera.setWorldBounds(this.currentLevel.width, this.currentLevel.height);
        this.hideAllScreens();
        this.updateUI();
        
        console.log(`Restarted level ${this.currentLevelNumber}`);
    }

    /**
     * Restart the entire game
     */
    restartGame() {
        this.currentLevelNumber = 1;
        this.score = 0;
        this.totalScore = 0;
        this.lives = 3;
        this.startGame();
    }

    /**
     * Go to next level
     */
    nextLevel() {
        this.currentLevelNumber++;
        this.totalScore += this.score;
        this.score = 0;
        
        this.loadLevel(this.currentLevelNumber);
        this.player.reset(this.currentLevel.playerStartX, this.currentLevel.playerStartY);
        this.state = 'playing';
        this.hideAllScreens();
        this.updateUI();
        
        console.log(`Advanced to level ${this.currentLevelNumber}`);
    }

    /**
     * Load a specific level
     * @param {number} levelNumber - Level number to load
     */
    loadLevel(levelNumber) {
        this.currentLevel = new Level(levelNumber, this.canvas.width, this.canvas.height);
        this.currentLevel.startTime = getTimestamp();
        
        // Update camera bounds
        this.camera.setWorldBounds(this.currentLevel.width, this.currentLevel.height);
        
        // Update background theme
        this.background.setTheme(this.currentLevel.theme);
        
        console.log(`Loaded level ${levelNumber} (${this.currentLevel.theme} theme)`);
    }

    /**
     * Pause the game
     */
    pauseGame() {
        if (this.state === 'playing') {
            this.previousState = this.state;
            this.state = 'paused';
            console.log('Game paused');
        }
    }

    /**
     * Resume the game
     */
    resumeGame() {
        if (this.state === 'paused') {
            this.state = this.previousState;
            console.log('Game resumed');
        }
    }

    /**
     * Show main menu
     */
    showMainMenu() {
        this.state = 'menu';
        this.hideAllScreens();
        this.ui.startScreen.classList.remove('hidden');
    }

    /**
     * Start game loop
     */
    startGameLoop() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = getTimestamp();
        this.gameLoop();
    }

    /**
     * Stop game loop
     */
    stopGameLoop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Main game loop
     */
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = getTimestamp();
        this.deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        // Limit delta time to prevent large jumps
        this.deltaTime = Math.min(this.deltaTime, 50);
        
        // Update FPS counter
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            this.fps = Math.round(1000 / this.deltaTime);
        }
        
        // Update and render
        this.update(this.deltaTime);
        this.render();
        
        // Continue loop
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Update game state
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        // Update input
        this.inputManager.update();
        
        // Handle pause input
        if (this.inputManager.isJustPressed('pause')) {
            if (this.state === 'playing') {
                this.pauseGame();
            } else if (this.state === 'paused') {
                this.resumeGame();
            }
        }
        
        // Update based on current state
        switch (this.state) {
            case 'playing':
                this.updatePlaying(deltaTime);
                break;
            case 'paused':
                // Don't update game objects when paused
                break;
            case 'menu':
            case 'gameOver':
            case 'levelComplete':
                // Update background even in menu states
                this.background.update(deltaTime, this.camera);
                break;
        }
        
        // Always update camera and UI
        this.camera.update(deltaTime);
        this.updateUI();
    }

    /**
     * Update game during playing state
     * @param {number} deltaTime - Time since last frame
     */
    updatePlaying(deltaTime) {
        // Update player input
        this.updatePlayerInput();
        
        // Update game objects
        this.player.update(deltaTime, this.currentLevel.platforms);
        this.currentLevel.update(deltaTime, this.player);
        this.background.update(deltaTime, this.camera);
        
        // Handle collisions
        this.handleCollisions();
        
        // Check game conditions
        this.checkGameConditions();
    }

    /**
     * Update player input
     */
    updatePlayerInput() {
        this.player.setInput('left', this.inputManager.isPressed('left'));
        this.player.setInput('right', this.inputManager.isPressed('right'));
        this.player.setInput('jump', this.inputManager.isPressed('jump'));
    }

    /**
     * Handle all game collisions
     */
    handleCollisions() {
        // Player-Enemy collisions
        for (const enemy of this.currentLevel.enemies) {
            if (enemy.checkPlayerCollision(this.player)) {
                this.camera.startShake(5, 200);
                this.inputManager.vibrate(100);
            }
        }
        
        // Player-Collectible collisions
        for (const collectible of this.currentLevel.collectibles) {
            const collection = collectible.checkPlayerCollision(this.player);
            if (collection) {
                this.handleCollectibleCollection(collection);
            }
        }
        
        // Player-Platform collisions (already handled in player update)
        
        // Player-Checkpoint collisions (handled in checkpoint update)
    }

    /**
     * Handle collectible collection
     * @param {Object} collection - Collection data
     */
    handleCollectibleCollection(collection) {
        switch (collection.effect) {
            case 'score':
                this.score += collection.value;
                break;
            case 'health':
                this.player.heal(collection.value);
                break;
            case 'special':
                this.score += collection.value;
                // Add special effect (e.g., temporary invincibility)
                this.camera.startFlash('#ffdd00', 300);
                break;
        }
    }

    /**
     * Check game win/lose conditions
     */
    checkGameConditions() {
        // Check if player died
        if (this.player.isDead()) {
            this.lives--;
            
            if (this.lives <= 0) {
                this.gameOver();
            } else {
                this.player.respawn();
                this.camera.startShake(8, 500);
            }
        }
        
        // Check if level completed
        if (this.currentLevel.completed) {
            this.levelComplete();
        }
        
        // Check time limit
        if (this.currentLevel.isTimeUp()) {
            this.gameOver();
        }
    }

    /**
     * Handle level completion
     */
    levelComplete() {
        this.state = 'levelComplete';
        this.totalScore += this.score;
        
        // Calculate bonus points
        const timeBonus = this.calculateTimeBonus();
        const healthBonus = Math.floor(this.player.health);
        this.score += timeBonus + healthBonus;
        this.totalScore += timeBonus + healthBonus;
        
        this.showLevelCompleteScreen();
        audioManager.play('levelComplete', 0.8);
        
        console.log(`Level ${this.currentLevelNumber} completed! Score: ${this.score}`);
    }

    /**
     * Calculate time bonus for completing level quickly
     * @returns {number} Time bonus points
     */
    calculateTimeBonus() {
        if (!this.currentLevel.timeLimit) return 0;
        
        const remainingTime = this.currentLevel.getRemainingTime();
        const timeRatio = remainingTime / this.currentLevel.timeLimit;
        return Math.floor(timeRatio * 1000);
    }

    /**
     * Handle game over
     */
    gameOver() {
        this.state = 'gameOver';
        this.showGameOverScreen();
        
        console.log(`Game Over! Final Score: ${this.totalScore + this.score}`);
    }

    /**
     * Show game over screen
     */
    showGameOverScreen() {
        this.hideAllScreens();
        this.ui.gameOverScreen.classList.remove('hidden');
        this.ui.finalScore.textContent = this.totalScore + this.score;
    }

    /**
     * Show level complete screen
     */
    showLevelCompleteScreen() {
        this.hideAllScreens();
        this.ui.levelCompleteScreen.classList.remove('hidden');
        this.ui.levelScore.textContent = this.score;
    }

    /**
     * Hide all overlay screens
     */
    hideAllScreens() {
        this.ui.gameOverScreen.classList.add('hidden');
        this.ui.levelCompleteScreen.classList.add('hidden');
        this.ui.startScreen.classList.add('hidden');
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Update health bar
        const healthPercentage = (this.player.health / this.player.maxHealth) * 100;
        this.ui.healthFill.style.width = `${healthPercentage}%`;
        
        // Update score
        this.ui.score.textContent = this.score;
        
        // Update level
        this.ui.level.textContent = this.currentLevelNumber;
        
        // Update health bar color based on health level
        if (healthPercentage > 60) {
            this.ui.healthFill.style.background = 'linear-gradient(90deg, #44ff44, #88ff88)';
        } else if (healthPercentage > 30) {
            this.ui.healthFill.style.background = 'linear-gradient(90deg, #ffaa44, #ffcc88)';
        } else {
            this.ui.healthFill.style.background = 'linear-gradient(90deg, #ff4444, #ff8888)';
        }
    }

    /**
     * Render the game
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply camera transform
        this.camera.applyTransform(this.ctx);
        
        // Render background
        this.background.render(this.ctx, this.camera);
        
        // Render level if playing
        if (this.state === 'playing' || this.state === 'paused') {
            this.currentLevel.render(this.ctx, this.camera);
            this.player.render(this.ctx, this.camera);
        }
        
        // Remove camera transform
        this.camera.removeTransform(this.ctx);
        
        // Render camera effects (flash, etc.)
        this.camera.renderEffects(this.ctx);
        
        // Render pause overlay
        if (this.state === 'paused') {
            this.renderPauseOverlay();
        }
        
        // Render debug info (if enabled)
        if (false) { // Set to true for debugging
            this.renderDebugInfo();
        }
    }

    /**
     * Render pause overlay
     */
    renderPauseOverlay() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Press ESC to resume', this.canvas.width / 2, this.canvas.height / 2 + 60);
        
        this.ctx.restore();
    }

    /**
     * Render debug information
     */
    renderDebugInfo() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 120);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        
        const debugInfo = [
            `FPS: ${this.fps}`,
            `State: ${this.state}`,
            `Player: ${Math.round(this.player.x)}, ${Math.round(this.player.y)}`,
            `Camera: ${Math.round(this.camera.x)}, ${Math.round(this.camera.y)}`,
            `Health: ${this.player.health}/${this.player.maxHealth}`,
            `Score: ${this.score}`,
            `Level: ${this.currentLevelNumber}`,
            `Input: ${this.inputManager.getCurrentInputMethod()}`
        ];
        
        debugInfo.forEach((line, index) => {
            this.ctx.fillText(line, 15, 25 + index * 14);
        });
        
        this.ctx.restore();
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        console.error(message);
        alert(message); // In a real game, you'd use a proper error UI
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update canvas size if needed (for responsive design)
        const container = document.getElementById('gameContainer');
        if (container && window.innerWidth < 768) {
            // Mobile layout adjustments
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
        }
    }

    /**
     * Clean up resources
     */
    destroy() {
        this.stopGameLoop();
        
        if (this.inputManager) {
            this.inputManager.destroy();
        }
        
        audioManager.stopAll();
        
        console.log('Game destroyed');
    }

    /**
     * Get game statistics
     * @returns {Object} Game stats
     */
    getStats() {
        return {
            currentLevel: this.currentLevelNumber,
            score: this.score,
            totalScore: this.totalScore,
            lives: this.lives,
            playerHealth: this.player ? this.player.health : 0,
            gameTime: getTimestamp() - this.gameStartTime,
            levelStats: this.currentLevel ? this.currentLevel.getStats() : null
        };
    }
}
