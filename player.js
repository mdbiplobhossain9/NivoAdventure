/**
 * Player class - handles player character movement, animation, and physics
 */
class Player {
    constructor(x, y) {
        // Position and dimensions
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 48;
        
        // Physics properties
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpPower = 15;
        this.gravity = 0.8;
        this.friction = 0.85;
        this.maxFallSpeed = 15;
        
        // Movement states
        this.isGrounded = false;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.facing = 1; // 1 for right, -1 for left
        
        // Health system
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.invulnerable = false;
        this.invulnerabilityTime = 1000; // 1 second in milliseconds
        this.lastDamageTime = 0;
        
        // Animation properties
        this.animationFrame = 0;
        this.animationSpeed = 0.15;
        this.animationTimer = 0;
        this.currentAnimation = 'idle';
        
        // Sprite dimensions for animation
        this.spriteWidth = 32;
        this.spriteHeight = 48;
        
        // Animation definitions
        this.animations = {
            idle: { frames: 4, row: 0 },
            walk: { frames: 6, row: 1 },
            jump: { frames: 4, row: 2 },
            fall: { frames: 2, row: 3 }
        };
        
        // Input states
        this.keys = {
            left: false,
            right: false,
            jump: false,
            jumpPressed: false
        };
        
        // Checkpoint system
        this.checkpointX = x;
        this.checkpointY = y;
        this.lastCheckpointHealth = this.maxHealth;
    }

    /**
     * Update player physics and animation
     * @param {number} deltaTime - Time since last frame
     * @param {Array} platforms - Array of platform objects for collision
     */
    update(deltaTime, platforms) {
        this.handleInput();
        this.updatePhysics(deltaTime);
        this.handlePlatformCollisions(platforms);
        this.updateAnimation(deltaTime);
        this.updateInvulnerability();
        this.constrainToWorld();
    }

    /**
     * Handle player input for movement
     */
    handleInput() {
        // Horizontal movement
        if (this.keys.left) {
            this.velocityX -= this.speed * 0.3;
            this.facing = -1;
        }
        if (this.keys.right) {
            this.velocityX += this.speed * 0.3;
            this.facing = 1;
        }

        // Jumping (with double jump)
        if (this.keys.jumpPressed && !this.keys.jump) {
            if (this.isGrounded) {
                this.jump();
                this.canDoubleJump = true;
                this.hasDoubleJumped = false;
            } else if (this.canDoubleJump && !this.hasDoubleJumped) {
                this.jump();
                this.hasDoubleJumped = true;
                this.canDoubleJump = false;
            }
        }
        
        this.keys.jump = this.keys.jumpPressed;
    }

    /**
     * Perform jump action
     */
    jump() {
        this.velocityY = -this.jumpPower;
        this.isGrounded = false;
        audioManager.play('jump', 0.5);
    }

    /**
     * Update physics (gravity, friction, velocity)
     * @param {number} deltaTime - Time since last frame
     */
    updatePhysics(deltaTime) {
        // Apply gravity
        if (!this.isGrounded) {
            this.velocityY += this.gravity;
        }

        // Apply friction when grounded
        if (this.isGrounded) {
            this.velocityX *= this.friction;
        } else {
            this.velocityX *= 0.98; // Air resistance
        }

        // Limit velocities
        this.velocityX = clamp(this.velocityX, -this.speed, this.speed);
        this.velocityY = clamp(this.velocityY, -this.jumpPower * 1.2, this.maxFallSpeed);

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

        for (const platform of platforms) {
            if (checkCollision(this, platform)) {
                // Determine collision direction
                const overlapX = Math.min(this.x + this.width - platform.x, platform.x + platform.width - this.x);
                const overlapY = Math.min(this.y + this.height - platform.y, platform.y + platform.height - this.y);

                if (overlapX < overlapY) {
                    // Horizontal collision
                    if (this.x < platform.x) {
                        // Hit from left
                        this.x = platform.x - this.width;
                        this.velocityX = 0;
                    } else {
                        // Hit from right
                        this.x = platform.x + platform.width;
                        this.velocityX = 0;
                    }
                } else {
                    // Vertical collision
                    if (this.y < platform.y) {
                        // Landing on top
                        this.y = platform.y - this.height;
                        this.velocityY = 0;
                        this.isGrounded = true;
                        this.canDoubleJump = false;
                        this.hasDoubleJumped = false;
                    } else {
                        // Hit from below
                        this.y = platform.y + platform.height;
                        this.velocityY = 0;
                    }
                }
            }
        }
    }

    /**
     * Update animation based on player state
     * @param {number} deltaTime - Time since last frame
     */
    updateAnimation(deltaTime) {
        // Determine current animation
        let newAnimation = 'idle';
        
        if (!this.isGrounded) {
            newAnimation = this.velocityY < 0 ? 'jump' : 'fall';
        } else if (Math.abs(this.velocityX) > 0.5) {
            newAnimation = 'walk';
        }

        // Update animation if changed
        if (newAnimation !== this.currentAnimation) {
            this.currentAnimation = newAnimation;
            this.animationFrame = 0;
            this.animationTimer = 0;
        }

        // Update animation frame
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
     * Update invulnerability status
     */
    updateInvulnerability() {
        if (this.invulnerable) {
            const currentTime = getTimestamp();
            if (currentTime - this.lastDamageTime >= this.invulnerabilityTime) {
                this.invulnerable = false;
            }
        }
    }

    /**
     * Constrain player to world boundaries
     */
    constrainToWorld() {
        // Prevent going through left and right boundaries
        this.x = clamp(this.x, 0, 2000 - this.width); // Assuming world width of 2000
        
        // Handle falling off the world (death)
        if (this.y > 1000) { // Assuming world height of 1000
            this.takeDamage(this.health); // Kill player
        }
    }

    /**
     * Take damage and handle invulnerability
     * @param {number} damage - Amount of damage to take
     * @returns {boolean} True if damage was applied
     */
    takeDamage(damage) {
        if (this.invulnerable) return false;

        this.health -= damage;
        this.health = Math.max(0, this.health);
        
        if (this.health > 0) {
            this.invulnerable = true;
            this.lastDamageTime = getTimestamp();
            audioManager.play('hit', 0.7);
        }

        return true;
    }

    /**
     * Heal the player
     * @param {number} amount - Amount of health to restore
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    /**
     * Check if player is dead
     * @returns {boolean} True if player health is 0 or below
     */
    isDead() {
        return this.health <= 0;
    }

    /**
     * Set checkpoint position and health
     * @param {number} x - Checkpoint x position
     * @param {number} y - Checkpoint y position
     */
    setCheckpoint(x, y) {
        this.checkpointX = x;
        this.checkpointY = y;
        this.lastCheckpointHealth = this.health;
        audioManager.play('checkpoint', 0.6);
    }

    /**
     * Respawn at last checkpoint
     */
    respawn() {
        this.x = this.checkpointX;
        this.y = this.checkpointY;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = this.lastCheckpointHealth;
        this.invulnerable = true;
        this.lastDamageTime = getTimestamp();
        this.isGrounded = false;
    }

    /**
     * Reset player to initial state
     * @param {number} x - Starting x position
     * @param {number} y - Starting y position
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.velocityX = 0;
        this.velocityY = 0;
        this.health = this.maxHealth;
        this.invulnerable = false;
        this.isGrounded = false;
        this.facing = 1;
        this.checkpointX = x;
        this.checkpointY = y;
        this.lastCheckpointHealth = this.maxHealth;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
    }

    /**
     * Render the player with animation
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

        // Apply invulnerability flashing effect
        if (this.invulnerable) {
            const flashInterval = 100; // Flash every 100ms
            const currentTime = getTimestamp();
            const timeSinceDamage = currentTime - this.lastDamageTime;
            if (Math.floor(timeSinceDamage / flashInterval) % 2 === 0) {
                ctx.globalAlpha = 0.5;
            }
        }

        // Flip sprite based on facing direction
        if (this.facing === -1) {
            ctx.scale(-1, 1);
            ctx.translate(-screenX - this.width, 0);
        } else {
            ctx.translate(screenX, 0);
        }

        // Draw simple colored rectangle as player sprite (placeholder)
        // In a real game, you would draw sprite frames here
        this.drawSimpleSprite(ctx, screenY);

        ctx.restore();
    }

    /**
     * Draw a simple sprite representation
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {number} screenY - Screen Y position
     */
    drawSimpleSprite(ctx, screenY) {
        const animation = this.animations[this.currentAnimation];
        
        // Body
        ctx.fillStyle = this.invulnerable && Math.floor(getTimestamp() / 100) % 2 ? '#ff6666' : '#4488ff';
        ctx.fillRect(8, screenY + 16, 16, 24);
        
        // Head
        ctx.fillStyle = '#ffcc88';
        ctx.fillRect(10, screenY + 4, 12, 12);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(12, screenY + 7, 2, 2);
        ctx.fillRect(18, screenY + 7, 2, 2);
        
        // Arms (animated based on walking)
        ctx.fillStyle = '#ffcc88';
        const armOffset = this.currentAnimation === 'walk' ? 
            Math.sin(this.animationFrame * 0.5) * 2 : 0;
        ctx.fillRect(4, screenY + 18 + armOffset, 4, 12);
        ctx.fillRect(24, screenY + 18 - armOffset, 4, 12);
        
        // Legs (animated based on walking)
        ctx.fillStyle = '#2266aa';
        const legOffset = this.currentAnimation === 'walk' ? 
            Math.sin(this.animationFrame * 0.7) * 3 : 0;
        ctx.fillRect(10, screenY + 32, 4, 12 + legOffset);
        ctx.fillRect(18, screenY + 32, 4, 12 - legOffset);
        
        // Jump/fall indicator
        if (this.currentAnimation === 'jump' || this.currentAnimation === 'fall') {
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(6, screenY + 2, 4, 4);
            ctx.fillRect(22, screenY + 2, 4, 4);
        }
    }

    /**
     * Get player's collision rectangle
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
     * Get player's center position
     * @returns {Object} Object with x, y coordinates
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    /**
     * Set input state for a specific key
     * @param {string} key - Key name ('left', 'right', 'jump')
     * @param {boolean} pressed - Whether the key is pressed
     */
    setInput(key, pressed) {
        if (key === 'jump') {
            this.keys.jumpPressed = pressed;
        } else {
            this.keys[key] = pressed;
        }
    }
}
