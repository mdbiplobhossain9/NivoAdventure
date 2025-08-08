/**
 * Level class - manages level data, layout, and progression
 */
class Level {
    constructor(levelNumber, canvasWidth, canvasHeight) {
        this.levelNumber = levelNumber;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Level boundaries
        this.width = 2000; // Default level width
        this.height = 1000; // Default level height
        
        // Game objects
        this.platforms = [];
        this.enemies = [];
        this.collectibles = [];
        this.checkpoints = [];
        
        // Level properties
        this.playerStartX = 50;
        this.playerStartY = 400;
        this.goalX = this.width - 100;
        this.goalY = 300;
        
        // Level themes and difficulty
        this.theme = this.getLevelTheme();
        this.difficulty = this.calculateDifficulty();
        
        // Level completion
        this.completed = false;
        this.timeLimit = null; // Optional time limit in milliseconds
        this.startTime = 0;
        
        // Generate level content
        this.generateLevel();
    }

    /**
     * Get theme based on level number
     * @returns {string} Theme name
     */
    getLevelTheme() {
        const themes = ['forest', 'desert', 'cave', 'sky'];
        const themeIndex = Math.floor((this.levelNumber - 1) / 3) % themes.length;
        return themes[themeIndex];
    }

    /**
     * Calculate difficulty multiplier based on level number
     * @returns {number} Difficulty multiplier
     */
    calculateDifficulty() {
        return 1 + (this.levelNumber - 1) * 0.2;
    }

    /**
     * Generate level content based on level number and theme
     */
    generateLevel() {
        switch (this.levelNumber) {
            case 1:
                this.generateLevel1();
                break;
            case 2:
                this.generateLevel2();
                break;
            case 3:
                this.generateLevel3();
                break;
            case 4:
                this.generateLevel4();
                break;
            case 5:
                this.generateLevel5();
                break;
            default:
                this.generateProceduralLevel();
        }
        
        // Always add goal area
        this.addGoalArea();
    }

    /**
     * Generate Level 1 - Tutorial level
     */
    generateLevel1() {
        this.width = 1600;
        this.playerStartX = 50;
        this.playerStartY = 400;
        
        // Basic platforms
        this.platforms = [
            new Platform(0, 500, 300, 40, 'static'),
            new Platform(400, 450, 200, 40, 'static'),
            new Platform(700, 400, 200, 40, 'static'),
            new Platform(1000, 350, 150, 40, 'static'),
            new Platform(1250, 300, 200, 40, 'static'),
            new Platform(1500, 450, 100, 200, 'static') // Ground near goal
        ];
        
        // Simple collectibles
        this.collectibles = [
            new Collectible(120, 460, 'coin'),
            new Collectible(480, 410, 'coin'),
            new Collectible(780, 360, 'gem'),
            new Collectible(1080, 310, 'coin'),
            new Collectible(1330, 260, 'star')
        ];
        
        // One checkpoint
        this.checkpoints = [
            new Checkpoint(750, 336)
        ];
        
        // No enemies in tutorial
        this.enemies = [];
        
        this.goalX = 1520;
        this.goalY = 410;
    }

    /**
     * Generate Level 2 - Introduction to enemies
     */
    generateLevel2() {
        this.width = 1800;
        this.playerStartX = 50;
        this.playerStartY = 400;
        
        // More complex platforms
        this.platforms = [
            new Platform(0, 500, 250, 40, 'static'),
            new Platform(350, 450, 180, 40, 'static'),
            new Platform(600, 400, 40, 200, 'static'), // Tall platform
            new Platform(750, 350, 200, 40, 'static'),
            new Platform(1050, 300, 150, 40, 'static'),
            new Platform(1300, 250, 200, 40, 'moving'), // First moving platform
            new Platform(1600, 400, 100, 40, 'static')
        ];
        
        // Collectibles with health items
        this.collectibles = [
            new Collectible(100, 460, 'coin'),
            new Collectible(420, 410, 'coin'),
            new Collectible(620, 350, 'health'),
            new Collectible(820, 310, 'gem'),
            new Collectible(1120, 260, 'coin'),
            new Collectible(1380, 210, 'star'),
            new Collectible(1640, 360, 'coin')
        ];
        
        // First enemies
        this.enemies = [
            new Enemy(380, 410, 'patrol'),
            new Enemy(800, 310, 'patrol')
        ];
        
        // Multiple checkpoints
        this.checkpoints = [
            new Checkpoint(650, 336),
            new Checkpoint(1250, 186)
        ];
        
        this.goalX = 1620;
        this.goalY = 360;
    }

    /**
     * Generate Level 3 - Moving platforms and more enemies
     */
    generateLevel3() {
        this.width = 2000;
        this.playerStartX = 50;
        this.playerStartY = 450;
        
        this.platforms = [
            new Platform(0, 500, 200, 40, 'static'),
            new Platform(300, 450, 100, 40, 'moving'),
            new Platform(500, 400, 40, 150, 'static'),
            new Platform(650, 350, 120, 40, 'crumbling'),
            new Platform(850, 300, 100, 40, 'bouncy'),
            new Platform(1050, 250, 150, 40, 'moving'),
            new Platform(1300, 350, 100, 40, 'static'),
            new Platform(1500, 300, 80, 40, 'crumbling'),
            new Platform(1700, 400, 200, 40, 'static')
        ];
        
        this.collectibles = [
            new Collectible(80, 460, 'coin'),
            new Collectible(340, 410, 'gem'),
            new Collectible(520, 350, 'health'),
            new Collectible(690, 310, 'coin'),
            new Collectible(890, 260, 'star'),
            new Collectible(1090, 210, 'gem'),
            new Collectible(1340, 310, 'coin'),
            new Collectible(1540, 260, 'health'),
            new Collectible(1780, 360, 'star')
        ];
        
        this.enemies = [
            new Enemy(320, 410, 'patrol'),
            new Enemy(680, 310, 'patrol'),
            new Enemy(1320, 310, 'chase'),
            new Enemy(1750, 360, 'patrol')
        ];
        
        this.checkpoints = [
            new Checkpoint(550, 336),
            new Checkpoint(1250, 286),
            new Checkpoint(1650, 336)
        ];
        
        this.goalX = 1820;
        this.goalY = 360;
    }

    /**
     * Generate Level 4 - Advanced mechanics
     */
    generateLevel4() {
        this.width = 2200;
        this.playerStartX = 50;
        this.playerStartY = 400;
        
        this.platforms = [
            new Platform(0, 500, 150, 40, 'static'),
            new Platform(200, 450, 80, 40, 'moving'),
            new Platform(350, 400, 100, 40, 'crumbling'),
            new Platform(550, 350, 60, 40, 'bouncy'),
            new Platform(700, 250, 120, 40, 'moving'),
            new Platform(900, 300, 80, 40, 'crumbling'),
            new Platform(1100, 200, 100, 40, 'bouncy'),
            new Platform(1300, 350, 80, 40, 'moving'),
            new Platform(1500, 250, 120, 40, 'crumbling'),
            new Platform(1750, 300, 100, 40, 'static'),
            new Platform(1950, 400, 150, 40, 'bouncy')
        ];
        
        this.collectibles = [
            new Collectible(60, 460, 'gem'),
            new Collectible(240, 410, 'coin'),
            new Collectible(390, 360, 'health'),
            new Collectible(590, 310, 'star'),
            new Collectible(740, 210, 'gem'),
            new Collectible(940, 260, 'health'),
            new Collectible(1140, 160, 'star'),
            new Collectible(1340, 310, 'gem'),
            new Collectible(1560, 210, 'coin'),
            new Collectible(1790, 260, 'health'),
            new Collectible(1990, 360, 'star')
        ];
        
        this.enemies = [
            new Enemy(220, 410, 'chase'),
            new Enemy(570, 310, 'patrol'),
            new Enemy(920, 260, 'chase'),
            new Enemy(1320, 310, 'patrol'),
            new Enemy(1770, 260, 'chase')
        ];
        
        this.checkpoints = [
            new Checkpoint(500, 286),
            new Checkpoint(1050, 136),
            new Checkpoint(1700, 236)
        ];
        
        this.goalX = 2020;
        this.goalY = 360;
    }

    /**
     * Generate Level 5 - Boss level with time limit
     */
    generateLevel5() {
        this.width = 1800;
        this.playerStartX = 50;
        this.playerStartY = 450;
        this.timeLimit = 120000; // 2 minutes
        
        this.platforms = [
            new Platform(0, 500, 200, 40, 'static'),
            new Platform(300, 400, 100, 40, 'moving'),
            new Platform(500, 350, 80, 40, 'crumbling'),
            new Platform(650, 250, 100, 40, 'bouncy'),
            new Platform(850, 300, 120, 40, 'moving'),
            new Platform(1050, 200, 80, 40, 'crumbling'),
            new Platform(1200, 350, 100, 40, 'bouncy'),
            new Platform(1400, 250, 150, 40, 'moving'),
            new Platform(1650, 400, 150, 100, 'static') // Boss arena
        ];
        
        this.collectibles = [
            new Collectible(80, 460, 'health'),
            new Collectible(340, 360, 'star'),
            new Collectible(540, 310, 'gem'),
            new Collectible(690, 210, 'health'),
            new Collectible(890, 260, 'star'),
            new Collectible(1090, 160, 'gem'),
            new Collectible(1240, 310, 'health'),
            new Collectible(1470, 210, 'star'),
            new Collectible(1720, 360, 'gem')
        ];
        
        // Boss-level enemies
        this.enemies = [
            new Enemy(320, 360, 'chase'),
            new Enemy(520, 310, 'chase'),
            new Enemy(870, 260, 'chase'),
            new Enemy(1220, 310, 'chase'),
            new Enemy(1450, 210, 'chase'),
            new Enemy(1700, 360, 'chase') // Boss enemy
        ];
        
        this.checkpoints = [
            new Checkpoint(450, 286),
            new Checkpoint(1000, 136),
            new Checkpoint(1350, 186)
        ];
        
        this.goalX = 1720;
        this.goalY = 360;
    }

    /**
     * Generate procedural level for levels beyond 5
     */
    generateProceduralLevel() {
        this.width = 1600 + (this.levelNumber * 200);
        this.playerStartX = 50;
        this.playerStartY = 450;
        
        // Generate platforms procedurally
        this.generateProceduralPlatforms();
        this.generateProceduralCollectibles();
        this.generateProceduralEnemies();
        this.generateProceduralCheckpoints();
        
        this.goalX = this.width - 100;
        this.goalY = 350;
    }

    /**
     * Generate platforms procedurally
     */
    generateProceduralPlatforms() {
        this.platforms = [];
        
        // Starting platform
        this.platforms.push(new Platform(0, 500, 200, 40, 'static'));
        
        let currentX = 250;
        const platformTypes = ['static', 'moving', 'crumbling', 'bouncy'];
        
        while (currentX < this.width - 200) {
            const width = random(80, 200);
            const height = 40;
            const x = currentX;
            const y = random(200, 450);
            
            // Higher chance of special platforms at higher levels
            const specialChance = Math.min(0.6, this.levelNumber * 0.1);
            const type = Math.random() < specialChance ? 
                platformTypes[randomInt(1, platformTypes.length - 1)] : 'static';
            
            this.platforms.push(new Platform(x, y, width, height, type));
            
            currentX += width + random(50, 150);
        }
        
        // End platform
        this.platforms.push(new Platform(this.width - 200, 450, 200, 40, 'static'));
    }

    /**
     * Generate collectibles procedurally
     */
    generateProceduralCollectibles() {
        this.collectibles = [];
        const collectibleCount = Math.min(15, 5 + this.levelNumber);
        const types = ['coin', 'gem', 'health', 'star'];
        
        for (let i = 0; i < collectibleCount; i++) {
            const platform = this.platforms[randomInt(1, this.platforms.length - 2)];
            const x = platform.x + random(20, platform.width - 40);
            const y = platform.y - 30;
            
            // Higher value items at higher levels
            const typeIndex = Math.random() < (this.levelNumber * 0.1) ? 
                randomInt(1, types.length - 1) : 0;
            const type = types[typeIndex];
            
            this.collectibles.push(new Collectible(x, y, type));
        }
    }

    /**
     * Generate enemies procedurally
     */
    generateProceduralEnemies() {
        this.enemies = [];
        const enemyCount = Math.min(10, 2 + Math.floor(this.levelNumber * 1.5));
        
        for (let i = 0; i < enemyCount; i++) {
            const platform = this.platforms[randomInt(1, this.platforms.length - 2)];
            const x = platform.x + random(30, platform.width - 60);
            const y = platform.y - 35;
            
            // More chase enemies at higher levels
            const type = Math.random() < (this.levelNumber * 0.15) ? 'chase' : 'patrol';
            
            this.enemies.push(new Enemy(x, y, type));
        }
    }

    /**
     * Generate checkpoints procedurally
     */
    generateProceduralCheckpoints() {
        this.checkpoints = [];
        const checkpointCount = Math.max(2, Math.floor(this.width / 600));
        
        for (let i = 1; i <= checkpointCount; i++) {
            const targetX = (this.width / (checkpointCount + 1)) * i;
            
            // Find nearest platform
            let nearestPlatform = this.platforms[0];
            let minDistance = Math.abs(nearestPlatform.x - targetX);
            
            for (const platform of this.platforms) {
                const distance = Math.abs(platform.x - targetX);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestPlatform = platform;
                }
            }
            
            const x = nearestPlatform.x + nearestPlatform.width / 2 - 16;
            const y = nearestPlatform.y - 64;
            
            this.checkpoints.push(new Checkpoint(x, y));
        }
    }

    /**
     * Add goal area at the end of the level
     */
    addGoalArea() {
        // Goal platform if not exists
        const goalPlatform = this.platforms.find(p => 
            p.x + p.width >= this.goalX - 50 && p.x <= this.goalX + 50
        );
        
        if (!goalPlatform) {
            this.platforms.push(new Platform(this.goalX - 50, this.goalY + 50, 100, 40, 'static'));
        }
    }

    /**
     * Update level state and game objects
     * @param {number} deltaTime - Time since last frame
     * @param {Object} player - Player object
     */
    update(deltaTime, player) {
        // Update platforms
        for (const platform of this.platforms) {
            platform.update(deltaTime, player);
        }
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime, this.platforms, player);
            
            if (enemy.shouldBeRemoved()) {
                this.enemies.splice(i, 1);
            }
        }
        
        // Update collectibles
        for (const collectible of this.collectibles) {
            collectible.update(deltaTime, player);
        }
        
        // Update checkpoints
        for (const checkpoint of this.checkpoints) {
            checkpoint.update(deltaTime, player);
        }
        
        // Check level completion
        this.checkLevelCompletion(player);
    }

    /**
     * Check if level is completed
     * @param {Object} player - Player object
     */
    checkLevelCompletion(player) {
        if (this.completed) return;
        
        const playerCenter = player.getCenter();
        const goalDistance = distance(playerCenter.x, playerCenter.y, this.goalX, this.goalY);
        
        if (goalDistance <= 50) {
            this.completed = true;
        }
    }

    /**
     * Check if level time limit is exceeded
     * @returns {boolean} True if time limit exceeded
     */
    isTimeUp() {
        if (!this.timeLimit) return false;
        
        const elapsed = getTimestamp() - this.startTime;
        return elapsed >= this.timeLimit;
    }

    /**
     * Get remaining time in milliseconds
     * @returns {number} Remaining time or null if no limit
     */
    getRemainingTime() {
        if (!this.timeLimit) return null;
        
        const elapsed = getTimestamp() - this.startTime;
        return Math.max(0, this.timeLimit - elapsed);
    }

    /**
     * Render level elements
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} camera - Camera object
     */
    render(ctx, camera) {
        // Render platforms
        for (const platform of this.platforms) {
            if (platform.shouldRender()) {
                platform.render(ctx, camera);
            }
        }
        
        // Render checkpoints
        for (const checkpoint of this.checkpoints) {
            checkpoint.render(ctx, camera);
        }
        
        // Render collectibles
        for (const collectible of this.collectibles) {
            if (!collectible.isCollected()) {
                collectible.render(ctx, camera);
            }
        }
        
        // Render enemies
        for (const enemy of this.enemies) {
            enemy.render(ctx, camera);
        }
        
        // Render goal area
        this.renderGoal(ctx, camera);
    }

    /**
     * Render goal area
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} camera - Camera object
     */
    renderGoal(ctx, camera) {
        const screenX = this.goalX - camera.x;
        const screenY = this.goalY - camera.y;
        
        if (screenX < -50 || screenX > ctx.canvas.width + 50) return;
        
        ctx.save();
        
        // Goal flag
        ctx.fillStyle = '#ffdd00';
        ctx.fillRect(screenX - 2, screenY - 60, 4, 60);
        
        // Flag
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(screenX + 2, screenY - 60, 30, 20);
        
        // Goal area indicator
        ctx.strokeStyle = '#ffdd00';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(screenX - 25, screenY - 70, 50, 70);
        ctx.setLineDash([]);
        
        // Goal text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GOAL', screenX, screenY - 75);
        
        ctx.restore();
    }

    /**
     * Reset level to initial state
     */
    reset() {
        this.completed = false;
        this.startTime = getTimestamp();
        
        // Reset all platforms
        for (const platform of this.platforms) {
            platform.reset();
        }
        
        // Reset all enemies
        for (const enemy of this.enemies) {
            enemy.reset();
        }
        
        // Reset all collectibles
        for (const collectible of this.collectibles) {
            collectible.reset();
        }
        
        // Reset all checkpoints
        for (const checkpoint of this.checkpoints) {
            checkpoint.reset();
        }
    }

    /**
     * Get level statistics
     * @returns {Object} Level stats
     */
    getStats() {
        const totalCollectibles = this.collectibles.length;
        const collectedCount = this.collectibles.filter(c => c.isCollected()).length;
        const activeCheckpoints = this.checkpoints.filter(c => c.isActivated()).length;
        const remainingEnemies = this.enemies.filter(e => e.isAlive).length;
        
        return {
            levelNumber: this.levelNumber,
            theme: this.theme,
            completed: this.completed,
            collectibles: {
                total: totalCollectibles,
                collected: collectedCount,
                percentage: totalCollectibles > 0 ? (collectedCount / totalCollectibles) * 100 : 0
            },
            checkpoints: {
                total: this.checkpoints.length,
                activated: activeCheckpoints
            },
            enemies: {
                total: this.enemies.length,
                remaining: remainingEnemies
            },
            timeLimit: this.timeLimit,
            remainingTime: this.getRemainingTime()
        };
    }
}
