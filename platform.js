/**
 * Platform class - handles static and moving platforms
 */
class Platform {
    constructor(x, y, width, height, type = 'static') {
        // Position and dimensions
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.originalX = x;
        this.originalY = y;
        
        // Platform type and behavior
        this.type = type; // 'static', 'moving', 'crumbling', 'bouncy'
        this.color = this.getPlatformColor();
        
        // Movement properties (for moving platforms)
        this.moveSpeed = 1;
        this.moveDistance = 100;
        this.moveDirection = 1; // 1 or -1
        this.moveAxis = 'horizontal'; // 'horizontal' or 'vertical'
        this.moveTimer = 0;
        
        // Crumbling platform properties
        this.crumbleTimer = 0;
        this.crumbleDelay = 1000; // milliseconds before crumbling
        this.isCrumbling = false;
        this.isPlayerOn = false;
        this.crumbleParticles = [];
        
        // Bouncy platform properties
        this.bounceForce = 20;
        this.bounceAnimation = {
            active: false,
            scale: 1,
            timer: 0,
            duration: 200
        };
        
        // Visual properties
        this.texture = this.generateTexture();
        this.shadowOffset = 4;
    }

    /**
     * Get color based on platform type
     * @returns {string} Color string
     */
    getPlatformColor() {
        switch (this.type) {
            case 'moving':
                return '#4488ff';
            case 'crumbling':
                return '#aa6644';
            case 'bouncy':
                return '#44ff88';
            default:
                return '#666666';
        }
    }

    /**
     * Generate simple texture pattern for platform
     * @returns {Object} Texture data
     */
    generateTexture() {
        return {
            pattern: 'brick',
            detail: Math.random() > 0.5 ? 'moss' : 'cracks'
        };
    }

    /**
     * Update platform behavior and animations
     * @param {number} deltaTime - Time since last frame
     * @param {Object} player - Player object for interaction
     */
    update(deltaTime, player = null) {
        switch (this.type) {
            case 'moving':
                this.updateMovement(deltaTime);
                break;
            case 'crumbling':
                this.updateCrumbling(deltaTime, player);
                break;
            case 'bouncy':
                this.updateBouncy(deltaTime);
                break;
        }
        
        this.updateCrumbleParticles(deltaTime);
    }

    /**
     * Update moving platform behavior
     * @param {number} deltaTime - Time since last frame
     */
    updateMovement(deltaTime) {
        if (this.moveAxis === 'horizontal') {
            this.x += this.moveDirection * this.moveSpeed;
            
            if (this.x >= this.originalX + this.moveDistance) {
                this.x = this.originalX + this.moveDistance;
                this.moveDirection = -1;
            } else if (this.x <= this.originalX - this.moveDistance) {
                this.x = this.originalX - this.moveDistance;
                this.moveDirection = 1;
            }
        } else {
            this.y += this.moveDirection * this.moveSpeed;
            
            if (this.y >= this.originalY + this.moveDistance) {
                this.y = this.originalY + this.moveDistance;
                this.moveDirection = -1;
            } else if (this.y <= this.originalY - this.moveDistance) {
                this.y = this.originalY - this.moveDistance;
                this.moveDirection = 1;
            }
        }
    }

    /**
     * Update crumbling platform behavior
     * @param {number} deltaTime - Time since last frame
     * @param {Object} player - Player object
     */
    updateCrumbling(deltaTime, player) {
        const wasPlayerOn = this.isPlayerOn;
        this.isPlayerOn = false;
        
        // Check if player is on platform
        if (player && checkCollision(player, this)) {
            const playerBottom = player.y + player.height;
            const platformTop = this.y;
            
            if (playerBottom <= platformTop + 10 && player.velocityY >= 0) {
                this.isPlayerOn = true;
            }
        }
        
        // Start crumbling timer when player steps on
        if (this.isPlayerOn && !wasPlayerOn && !this.isCrumbling) {
            this.crumbleTimer = 0;
        }
        
        // Update crumble timer
        if (this.isPlayerOn && !this.isCrumbling) {
            this.crumbleTimer += deltaTime;
            
            if (this.crumbleTimer >= this.crumbleDelay) {
                this.startCrumbling();
            }
        }
    }

    /**
     * Start the crumbling process
     */
    startCrumbling() {
        this.isCrumbling = true;
        this.createCrumbleParticles();
    }

    /**
     * Create particles for crumbling effect
     */
    createCrumbleParticles() {
        const particleCount = 15;
        
        for (let i = 0; i < particleCount; i++) {
            this.crumbleParticles.push({
                x: this.x + random(0, this.width),
                y: this.y + random(0, this.height),
                velocityX: random(-3, 3),
                velocityY: random(-2, 1),
                size: random(2, 6),
                life: random(1000, 2000),
                age: 0,
                color: this.color
            });
        }
    }

    /**
     * Update crumble particles
     * @param {number} deltaTime - Time since last frame
     */
    updateCrumbleParticles(deltaTime) {
        for (let i = this.crumbleParticles.length - 1; i >= 0; i--) {
            const particle = this.crumbleParticles[i];
            
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.velocityY += 0.2; // gravity
            particle.age += deltaTime;
            
            if (particle.age >= particle.life) {
                this.crumbleParticles.splice(i, 1);
            }
        }
    }

    /**
     * Update bouncy platform animation
     * @param {number} deltaTime - Time since last frame
     */
    updateBouncy(deltaTime) {
        if (this.bounceAnimation.active) {
            this.bounceAnimation.timer += deltaTime;
            const progress = this.bounceAnimation.timer / this.bounceAnimation.duration;
            
            if (progress >= 1) {
                this.bounceAnimation.active = false;
                this.bounceAnimation.scale = 1;
            } else {
                // Bounce scale effect
                this.bounceAnimation.scale = 1 - Math.sin(progress * Math.PI) * 0.2;
            }
        }
    }

    /**
     * Handle player collision and platform-specific effects
     * @param {Object} player - Player object
     * @returns {Object} Collision data with side and special effects
     */
    handlePlayerCollision(player) {
        if (!checkCollision(this, player)) {
            return null;
        }

        // Determine collision side
        const overlapX = Math.min(player.x + player.width - this.x, this.x + this.width - player.x);
        const overlapY = Math.min(player.y + player.height - this.y, this.y + this.height - player.y);
        
        let collisionSide = 'none';
        let platformEffect = null;

        if (overlapX < overlapY) {
            // Horizontal collision
            if (player.x < this.x) {
                collisionSide = 'left';
                player.x = this.x - player.width;
                player.velocityX = 0;
            } else {
                collisionSide = 'right';
                player.x = this.x + this.width;
                player.velocityX = 0;
            }
        } else {
            // Vertical collision
            if (player.y < this.y) {
                // Player landing on top
                collisionSide = 'top';
                player.y = this.y - player.height;
                
                // Apply platform-specific effects
                if (this.type === 'bouncy') {
                    player.velocityY = -this.bounceForce;
                    this.triggerBounce();
                } else {
                    player.velocityY = 0;
                }
                
                player.isGrounded = true;
                player.canDoubleJump = false;
                player.hasDoubleJumped = false;
                
                // Moving platform - move player with platform
                if (this.type === 'moving') {
                    if (this.moveAxis === 'horizontal') {
                        player.x += this.moveDirection * this.moveSpeed;
                    }
                }
            } else {
                // Player hit from below
                collisionSide = 'bottom';
                player.y = this.y + this.height;
                player.velocityY = 0;
            }
        }

        return {
            side: collisionSide,
            effect: platformEffect,
            platform: this
        };
    }

    /**
     * Trigger bounce animation
     */
    triggerBounce() {
        this.bounceAnimation.active = true;
        this.bounceAnimation.timer = 0;
        this.bounceAnimation.scale = 1;
        audioManager.play('jump', 0.8); // Reuse jump sound for bounce
    }

    /**
     * Check if platform should be rendered (not crumbled)
     * @returns {boolean} True if platform should be rendered
     */
    shouldRender() {
        return !this.isCrumbling || this.crumbleParticles.length > 0;
    }

    /**
     * Check if platform provides collision (not fully crumbled)
     * @returns {boolean} True if platform provides collision
     */
    providesCollision() {
        return !this.isCrumbling;
    }

    /**
     * Render the platform with effects
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

        // Render crumble particles
        this.renderCrumbleParticles(ctx, camera);

        // Don't render platform if fully crumbled
        if (this.isCrumbling && this.crumbleParticles.length === 0) {
            return;
        }

        ctx.save();

        // Apply bounce animation scaling
        if (this.bounceAnimation.active) {
            ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
            ctx.scale(1, this.bounceAnimation.scale);
            ctx.translate(-this.width / 2, -this.height / 2);
        } else {
            ctx.translate(screenX, screenY);
        }

        // Draw shadow
        this.drawShadow(ctx);
        
        // Draw main platform
        this.drawPlatform(ctx);
        
        // Draw type-specific details
        this.drawTypeSpecificDetails(ctx);

        ctx.restore();
    }

    /**
     * Draw platform shadow
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawShadow(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.shadowOffset, this.shadowOffset, this.width, this.height);
    }

    /**
     * Draw main platform body
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawPlatform(ctx) {
        // Main platform color
        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Highlight edge
        ctx.fillStyle = this.getLighterColor(this.color);
        ctx.fillRect(0, 0, this.width, 2);
        ctx.fillRect(0, 0, 2, this.height);
        
        // Shadow edge
        ctx.fillStyle = this.getDarkerColor(this.color);
        ctx.fillRect(0, this.height - 2, this.width, 2);
        ctx.fillRect(this.width - 2, 0, 2, this.height);
    }

    /**
     * Draw type-specific visual details
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawTypeSpecificDetails(ctx) {
        switch (this.type) {
            case 'moving':
                this.drawMovingPlatformDetails(ctx);
                break;
            case 'crumbling':
                this.drawCrumblingPlatformDetails(ctx);
                break;
            case 'bouncy':
                this.drawBouncyPlatformDetails(ctx);
                break;
            default:
                this.drawStaticPlatformDetails(ctx);
        }
    }

    /**
     * Draw moving platform visual indicators
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawMovingPlatformDetails(ctx) {
        // Arrow indicators
        ctx.fillStyle = '#ffffff';
        const arrowSize = 4;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        if (this.moveAxis === 'horizontal') {
            // Left arrow
            ctx.beginPath();
            ctx.moveTo(centerX - 10, centerY);
            ctx.lineTo(centerX - 10 + arrowSize, centerY - arrowSize);
            ctx.lineTo(centerX - 10 + arrowSize, centerY + arrowSize);
            ctx.closePath();
            ctx.fill();
            
            // Right arrow
            ctx.beginPath();
            ctx.moveTo(centerX + 10, centerY);
            ctx.lineTo(centerX + 10 - arrowSize, centerY - arrowSize);
            ctx.lineTo(centerX + 10 - arrowSize, centerY + arrowSize);
            ctx.closePath();
            ctx.fill();
        }
    }

    /**
     * Draw crumbling platform visual indicators
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawCrumblingPlatformDetails(ctx) {
        // Cracks
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 1;
        
        // Random crack pattern
        const seed = this.x + this.y; // Use position as seed for consistent cracks
        const cracks = Math.floor((seed % 7) + 3);
        
        for (let i = 0; i < cracks; i++) {
            const startX = ((seed + i * 17) % 100) / 100 * this.width;
            const startY = ((seed + i * 23) % 100) / 100 * this.height;
            const endX = startX + ((seed + i * 13) % 20) - 10;
            const endY = startY + ((seed + i * 19) % 20) - 10;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // Warning color if about to crumble
        if (this.isPlayerOn && this.crumbleTimer > this.crumbleDelay * 0.7) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(0, 0, this.width, this.height);
        }
    }

    /**
     * Draw bouncy platform visual indicators
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawBouncyPlatformDetails(ctx) {
        // Spring coils
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        const springWidth = 8;
        const springHeight = this.height - 4;
        const coils = 5;
        
        for (let s = 0; s < Math.floor(this.width / 20); s++) {
            const springX = 10 + s * 20;
            
            ctx.beginPath();
            ctx.moveTo(springX, 2);
            
            for (let i = 0; i <= coils; i++) {
                const y = 2 + (i / coils) * springHeight;
                const x = springX + (i % 2 === 0 ? -springWidth / 2 : springWidth / 2);
                ctx.lineTo(x, y);
            }
            
            ctx.stroke();
        }
    }

    /**
     * Draw static platform visual details
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawStaticPlatformDetails(ctx) {
        // Simple brick pattern
        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 1;
        
        const brickWidth = 32;
        const brickHeight = 16;
        
        for (let y = 0; y < this.height; y += brickHeight) {
            for (let x = 0; x < this.width; x += brickWidth) {
                const offset = Math.floor(y / brickHeight) % 2 === 0 ? 0 : brickWidth / 2;
                ctx.strokeRect(x + offset, y, brickWidth, brickHeight);
            }
        }
    }

    /**
     * Render crumble particles
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} camera - Camera object for offset calculation
     */
    renderCrumbleParticles(ctx, camera) {
        for (const particle of this.crumbleParticles) {
            const screenX = particle.x - camera.x;
            const screenY = particle.y - camera.y;
            
            ctx.save();
            ctx.globalAlpha = 1 - (particle.age / particle.life);
            ctx.fillStyle = particle.color;
            ctx.fillRect(screenX, screenY, particle.size, particle.size);
            ctx.restore();
        }
    }

    /**
     * Get a lighter version of a color
     * @param {string} color - Original color
     * @returns {string} Lighter color
     */
    getLighterColor(color) {
        // Simple implementation - in a real game you'd use proper color manipulation
        const colorMap = {
            '#666666': '#888888',
            '#4488ff': '#66aaff',
            '#aa6644': '#cc8866',
            '#44ff88': '#66ffaa'
        };
        return colorMap[color] || '#888888';
    }

    /**
     * Get a darker version of a color
     * @param {string} color - Original color
     * @returns {string} Darker color
     */
    getDarkerColor(color) {
        // Simple implementation - in a real game you'd use proper color manipulation
        const colorMap = {
            '#666666': '#444444',
            '#4488ff': '#2266dd',
            '#aa6644': '#884422',
            '#44ff88': '#22dd66'
        };
        return colorMap[color] || '#444444';
    }

    /**
     * Get platform's collision rectangle
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
     * Reset platform to initial state
     */
    reset() {
        this.x = this.originalX;
        this.y = this.originalY;
        this.moveDirection = 1;
        this.crumbleTimer = 0;
        this.isCrumbling = false;
        this.isPlayerOn = false;
        this.crumbleParticles = [];
        this.bounceAnimation.active = false;
        this.bounceAnimation.scale = 1;
    }
}
