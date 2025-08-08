/**
 * Enemy class - handles enemy AI, movement, and collision
 */
class Enemy {
    constructor(x, y, type = 'patrol') {
        // Position and dimensions
        this.x = x;
        this.y = y;
        this.width = 28;
        this.height = 32;
        
        // Physics properties
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = 0.8;
        this.maxFallSpeed = 15;
        
        // AI properties
        this.type = type;
        this.speed = 1.5;
        this.direction = 1; // 1 for right, -1 for left
        this.patrolDistance = 100;
        this.startX = x;
        this.detectionRange = 150;
        this.chaseSpeed = 2.5;
        this.isChasing = false;
        this.lastPlayerPosition = null;
        
        // Health and damage
        this.health = 50;
        this.maxHealth = 50;
        this.damage = 20;
        this.isAlive = true;
        
        // Animation properties
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        this.animationTimer = 0;
        this.currentAnimation = 'walk';
        
        // Animation definitions
        this.animations = {
            walk: { frames: 4, row: 0 },
            chase: { frames: 4, row: 1 },
            idle: { frames: 2, row: 2 },
            death: { frames: 3, row: 3 }
        };
        
        // State management
        this.isGrounded = false;
        this.canTurnAround = true;
        this.turnCooldown = 0;
        this.maxTurnCooldown = 500; // milliseconds
        
        // Death properties
        this.deathTimer = 0;
        this.deathDuration = 1000; // 1 second death animation
        this.shouldRemove = false;
    }

    /**
     * Update enemy AI, physics, and animation
     * @param {number} deltaTime - Time since last frame
     * @param {Array} platforms - Array of platform objects for collision
     * @param {Object} player - Player object for AI decisions
     */
    update(deltaTime, platforms, player) {
        if (!this.isAlive) {
            this.updateDeath(deltaTime);
            return;
        }

        this.updateAI(player);
        this.updatePhysics(deltaTime);
        this.handlePlatformCollisions(platforms);
        this.updateAnimation(deltaTime);
        this.updateTurnCooldown(deltaTime);
    }

    /**
     * Update enemy AI behavior
     * @param {Object} player - Player object
     */
    updateAI(player) {
        if (!player || player.isDead()) {
            this.isChasing = false;
            this.patrol();
            return;
        }

        const distanceToPlayer = distance(
            this.x + this.width / 2, 
            this.y + this.height / 2,
            player.x + player.width / 2, 
            player.y + player.height / 2
        );

        // Check if player is in detection range
        if (distanceToPlayer <= this.detectionRange) {
            this.isChasing = true;
            this.lastPlayerPosition = {
                x: player.x + player.width / 2,
                y: player.y + player.height / 2
            };
            this.chase(player);
        } else if (this.isChasing && distanceToPlayer > this.detectionRange * 1.5) {
            // Stop chasing if player gets too far away
            this.isChasing = false;
            this.lastPlayerPosition = null;
        }

        if (!this.isChasing) {
            this.patrol();
        }
    }

    /**
     * Handle patrol behavior
     */
    patrol() {
        this.currentAnimation = 'walk';
        const currentSpeed = this.speed;

        // Check if we've reached patrol boundaries
        const distanceFromStart = this.x - this.startX;
        
        if (distanceFromStart >= this.patrolDistance && this.direction > 0) {
            this.changeDirection();
        } else if (distanceFromStart <= -this.patrolDistance && this.direction < 0) {
            this.changeDirection();
        }

        this.velocityX = this.direction * currentSpeed;
    }

    /**
     * Handle chase behavior
     * @param {Object} player - Player object to chase
     */
    chase(player) {
        this.currentAnimation = 'chase';
        const playerCenter = player.x + player.width / 2;
        const enemyCenter = this.x + this.width / 2;

        if (playerCenter < enemyCenter) {
            this.direction = -1;
        } else if (playerCenter > enemyCenter) {
            this.direction = 1;
        }

        this.velocityX = this.direction * this.chaseSpeed;
    }

    /**
     * Change enemy direction
     */
    changeDirection() {
        if (this.canTurnAround) {
            this.direction *= -1;
            this.canTurnAround = false;
            this.turnCooldown = this.maxTurnCooldown;
        }
    }

    /**
     * Update turn cooldown timer
     * @param {number} deltaTime - Time since last frame
     */
    updateTurnCooldown(deltaTime) {
        if (this.turnCooldown > 0) {
            this.turnCooldown -= deltaTime;
            if (this.turnCooldown <= 0) {
                this.canTurnAround = true;
            }
        }
    }

    /**
     * Update physics (gravity, movement)
     * @param {number} deltaTime - Time since last frame
     */
    updatePhysics(deltaTime) {
        // Apply gravity
        if (!this.isGrounded) {
            this.velocityY += this.gravity;
        }

        // Limit fall speed
        this.velocityY = clamp(this.velocityY, -20, this.maxFallSpeed);

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;
    }

    /**
     * Handle collisions with platforms
     * @param {Array} platforms - Array of platform objects
     */
    handlePlatformCollisions(platforms) {
        this.isGrounded = false;
        let hitWall = false;

        for (const platform of platforms) {
            if (checkCollision(this, platform)) {
                // Determine collision direction
                const overlapX = Math.min(this.x + this.width - platform.x, platform.x + platform.width - this.x);
                const overlapY = Math.min(this.y + this.height - platform.y, platform.y + platform.height - this.y);

                if (overlapX < overlapY) {
                    // Horizontal collision (hit wall)
                    if (this.x < platform.x) {
                        this.x = platform.x - this.width;
                    } else {
                        this.x = platform.x + platform.width;
                    }
                    this.velocityX = 0;
                    hitWall = true;
                } else {
                    // Vertical collision
                    if (this.y < platform.y) {
                        // Landing on top
                        this.y = platform.y - this.height;
                        this.velocityY = 0;
                        this.isGrounded = true;
                    } else {
                        // Hit from below
                        this.y = platform.y + platform.height;
                        this.velocityY = 0;
                    }
                }
            }
        }

        // Change direction if hit wall while patrolling
        if (hitWall && !this.isChasing) {
            this.changeDirection();
        }

        // Check for edge detection (prevent falling off platforms)
        if (this.isGrounded && !this.isChasing) {
            this.checkForEdges(platforms);
        }
    }

    /**
     * Check if enemy is at the edge of a platform and turn around
     * @param {Array} platforms - Array of platform objects
     */
    checkForEdges(platforms) {
        const futureX = this.x + (this.direction * 20); // Look ahead
        const futureY = this.y + this.height + 10; // Look below feet
        
        let foundGround = false;
        for (const platform of platforms) {
            if (futureX + this.width > platform.x && 
                futureX < platform.x + platform.width &&
                futureY > platform.y && 
                futureY < platform.y + platform.height) {
                foundGround = true;
                break;
            }
        }

        if (!foundGround) {
            this.changeDirection();
        }
    }

    /**
     * Update animation based on enemy state
     * @param {number} deltaTime - Time since last frame
     */
    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime;
        
        if (this.animationTimer >= this.animationSpeed) {
            this.animationFrame++;
            const maxFrames = this.animations[this.currentAnimation].frames;
            if (this.animationFrame >= maxFrames) {
                this.animationFrame = 0;
            }
            this.animationTimer = 0;
        }
    }

    /**
     * Update death animation and removal
     * @param {number} deltaTime - Time since last frame
     */
    updateDeath(deltaTime) {
        this.currentAnimation = 'death';
        this.deathTimer += deltaTime;
        
        if (this.deathTimer >= this.deathDuration) {
            this.shouldRemove = true;
        }
    }

    /**
     * Take damage and handle death
     * @param {number} damage - Amount of damage to take
     * @returns {boolean} True if enemy died from this damage
     */
    takeDamage(damage) {
        if (!this.isAlive) return false;

        this.health -= damage;
        this.health = Math.max(0, this.health);

        if (this.health <= 0) {
            this.die();
            return true;
        }

        return false;
    }

    /**
     * Handle enemy death
     */
    die() {
        this.isAlive = false;
        this.velocityX = 0;
        this.deathTimer = 0;
        audioManager.play('enemyDeath', 0.5);
    }

    /**
     * Check collision with player and apply damage
     * @param {Object} player - Player object
     * @returns {boolean} True if collision occurred and damage was applied
     */
    checkPlayerCollision(player) {
        if (!this.isAlive || !player || player.isDead()) return false;

        if (checkCollision(this, player)) {
            // Check if player is jumping on enemy (from above)
            const playerBottom = player.y + player.height;
            const enemyTop = this.y;
            
            if (playerBottom <= enemyTop + 10 && player.velocityY > 0) {
                // Player jumped on enemy
                this.takeDamage(this.maxHealth); // Kill enemy
                player.velocityY = -8; // Bounce player up
                return false; // No damage to player
            } else {
                // Enemy damages player
                return player.takeDamage(this.damage);
            }
        }

        return false;
    }

    /**
     * Render the enemy with animation
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} camera - Camera object for offset calculation
     */
    render(ctx, camera) {
        // Calculate screen position
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        // Don't render if off-screen
        if (screenX + this.width < 0 || screenX > ctx.canvas.width ||
            screenY + this.height < 0 || screenY > ctx.canvas.height) {
            return;
        }

        ctx.save();

        // Flip sprite based on direction
        if (this.direction === -1) {
            ctx.scale(-1, 1);
            ctx.translate(-screenX - this.width, 0);
        } else {
            ctx.translate(screenX, 0);
        }

        // Draw simple enemy sprite
        this.drawSimpleSprite(ctx, screenY);

        ctx.restore();

        // Debug: Draw detection range (comment out for production)
        if (false) { // Set to true for debugging
            ctx.strokeStyle = this.isChasing ? 'red' : 'yellow';
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(screenX + this.width / 2, screenY + this.height / 2, this.detectionRange, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }
    }

    /**
     * Draw a simple sprite representation
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} screenY - Screen Y position
     */
    drawSimpleSprite(ctx, screenY) {
        if (!this.isAlive) {
            // Death animation - fade out
            ctx.globalAlpha = 1 - (this.deathTimer / this.deathDuration);
        }

        // Body color based on state
        let bodyColor = '#ff4444'; // Default red
        if (this.isChasing) {
            bodyColor = '#ff8800'; // Orange when chasing
        } else if (this.currentAnimation === 'idle') {
            bodyColor = '#666666'; // Gray when idle
        }

        // Body
        ctx.fillStyle = bodyColor;
        ctx.fillRect(4, screenY + 8, 20, 20);
        
        // Eyes
        ctx.fillStyle = this.isChasing ? '#ffff00' : '#ffffff';
        ctx.fillRect(8, screenY + 12, 3, 3);
        ctx.fillRect(17, screenY + 12, 3, 3);
        
        // Mouth (angry expression when chasing)
        ctx.fillStyle = '#000000';
        if (this.isChasing) {
            ctx.fillRect(10, screenY + 20, 8, 2);
        } else {
            ctx.fillRect(12, screenY + 20, 4, 2);
        }
        
        // Spikes or details
        ctx.fillStyle = '#333333';
        ctx.fillRect(2, screenY + 4, 24, 4);
        ctx.fillRect(6, screenY + 28, 16, 4);
        
        // Animation effect for walking
        if (this.currentAnimation === 'walk' || this.currentAnimation === 'chase') {
            const bobOffset = Math.sin(this.animationFrame * 2) * 1;
            ctx.fillStyle = '#222222';
            ctx.fillRect(0, screenY + 30 + bobOffset, 8, 2);
            ctx.fillRect(20, screenY + 30 - bobOffset, 8, 2);
        }

        ctx.globalAlpha = 1.0;
    }

    /**
     * Get enemy's collision rectangle
     * @returns {Object} Rectangle object with x, y, width, height
     */
    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    /**
     * Get enemy's center position
     * @returns {Object} Object with x, y coordinates
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    /**
     * Check if enemy should be removed from the game
     * @returns {boolean} True if enemy should be removed
     */
    shouldBeRemoved() {
        return this.shouldRemove;
    }

    /**
     * Reset enemy to initial state
     */
    reset() {
        this.x = this.startX;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = this.maxHealth;
        this.isAlive = true;
        this.isChasing = false;
        this.direction = 1;
        this.deathTimer = 0;
        this.shouldRemove = false;
        this.canTurnAround = true;
        this.turnCooldown = 0;
        this.lastPlayerPosition = null;
    }
}
