/**
 * Checkpoint class - handles save points in levels
 */
class Checkpoint {
    constructor(x, y) {
        // Position and dimensions
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 64;
        
        // State
        this.activated = false;
        this.wasPlayerNear = false;
        
        // Animation properties
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
        this.animationTimer = 0;
        this.glowIntensity = 0;
        this.glowDirection = 1;
        this.glowSpeed = 0.02;
        
        // Particle effects
        this.particles = [];
        this.maxParticles = 10;
        this.particleSpawnTimer = 0;
        this.particleSpawnRate = 100; // milliseconds
        
        // Activation properties
        this.activationRange = 40;
        this.activationAnimation = {
            active: false,
            scale: 1,
            duration: 800,
            timer: 0
        };
        
        // Visual effects
        this.pulseScale = 1;
        this.pulseSpeed = 0.05;
        this.flagWaveOffset = 0;
        this.flagWaveSpeed = 0.08;
    }

    /**
     * Update checkpoint state and animations
     * @param {number} deltaTime - Time since last frame
     * @param {Object} player - Player object to check for activation
     */
    update(deltaTime, player) {
        this.updateAnimation(deltaTime);
        this.updateGlow(deltaTime);
        this.updatePulse(deltaTime);
        this.updateFlagWave(deltaTime);
        
        if (this.activated) {
            this.updateParticles(deltaTime);
            this.spawnParticles(deltaTime);
        }
        
        if (this.activationAnimation.active) {
            this.updateActivationAnimation(deltaTime);
        }
        
        // Check for player activation
        if (player && !this.activated) {
            this.checkPlayerActivation(player);
        }
    }

    /**
     * Update base animation
     * @param {number} deltaTime - Time since last frame
     */
    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime;
        
        if (this.animationTimer >= this.animationSpeed) {
            this.animationFrame++;
            if (this.animationFrame >= 8) {
                this.animationFrame = 0;
            }
            this.animationTimer = 0;
        }
    }

    /**
     * Update glow effect
     * @param {number} deltaTime - Time since last frame
     */
    updateGlow(deltaTime) {
        if (!this.activated) return;
        
        this.glowIntensity += this.glowDirection * this.glowSpeed;
        
        if (this.glowIntensity >= 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0.4) {
            this.glowIntensity = 0.4;
            this.glowDirection = 1;
        }
    }

    /**
     * Update pulse effect
     * @param {number} deltaTime - Time since last frame
     */
    updatePulse(deltaTime) {
        if (!this.activated) return;
        
        this.pulseScale = 1 + Math.sin(getTimestamp() * this.pulseSpeed) * 0.1;
    }

    /**
     * Update flag wave animation
     * @param {number} deltaTime - Time since last frame
     */
    updateFlagWave(deltaTime) {
        this.flagWaveOffset += this.flagWaveSpeed;
        if (this.flagWaveOffset >= Math.PI * 2) {
            this.flagWaveOffset = 0;
        }
    }

    /**
     * Update activation animation
     * @param {number} deltaTime - Time since last frame
     */
    updateActivationAnimation(deltaTime) {
        this.activationAnimation.timer += deltaTime;
        const progress = this.activationAnimation.timer / this.activationAnimation.duration;
        
        if (progress >= 1) {
            this.activationAnimation.active = false;
            this.activationAnimation.scale = 1;
            return;
        }

        // Scale effect during activation
        this.activationAnimation.scale = 1 + Math.sin(progress * Math.PI * 4) * 0.2;
    }

    /**
     * Check if player is close enough to activate checkpoint
     * @param {Object} player - Player object
     */
    checkPlayerActivation(player) {
        const playerCenter = player.getCenter();
        const checkpointCenter = this.getCenter();
        const dist = distance(
            playerCenter.x, playerCenter.y,
            checkpointCenter.x, checkpointCenter.y
        );

        const isPlayerNear = dist <= this.activationRange;

        // Activate if player enters range
        if (isPlayerNear && !this.wasPlayerNear) {
            this.activate(player);
        }

        this.wasPlayerNear = isPlayerNear;
    }

    /**
     * Activate the checkpoint
     * @param {Object} player - Player object to set checkpoint for
     */
    activate(player) {
        if (this.activated) return;

        this.activated = true;
        this.activationAnimation.active = true;
        this.activationAnimation.timer = 0;
        this.activationAnimation.scale = 1;

        // Set player's checkpoint
        player.setCheckpoint(this.x + this.width / 2 - player.width / 2, this.y + this.height - player.height);

        // Create initial burst of particles
        this.createActivationParticles();
    }

    /**
     * Create particles for activation effect
     */
    createActivationParticles() {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        for (let i = 0; i < 15; i++) {
            this.particles.push(new CheckpointParticle(
                centerX + random(-10, 10),
                centerY + random(-10, 10),
                random(-2, 2),
                random(-4, -1),
                '#ffdd00',
                random(800, 1200)
            ));
        }
    }

    /**
     * Spawn ongoing particles when activated
     * @param {number} deltaTime - Time since last frame
     */
    spawnParticles(deltaTime) {
        this.particleSpawnTimer += deltaTime;
        
        if (this.particleSpawnTimer >= this.particleSpawnRate) {
            if (this.particles.length < this.maxParticles) {
                const centerX = this.x + this.width / 2;
                const topY = this.y + 10;
                
                this.particles.push(new CheckpointParticle(
                    centerX + random(-5, 5),
                    topY,
                    random(-0.5, 0.5),
                    random(-1, -0.5),
                    '#88ddff',
                    random(1500, 2000)
                ));
            }
            this.particleSpawnTimer = 0;
        }
    }

    /**
     * Update all particles
     * @param {number} deltaTime - Time since last frame
     */
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Render the checkpoint with all effects
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

        // Apply activation animation scale
        if (this.activationAnimation.active) {
            ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
            ctx.scale(this.activationAnimation.scale, this.activationAnimation.scale);
            ctx.translate(-this.width / 2, -this.height / 2);
        } else if (this.activated) {
            ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
            ctx.scale(this.pulseScale, this.pulseScale);
            ctx.translate(-this.width / 2, -this.height / 2);
        } else {
            ctx.translate(screenX, screenY);
        }

        // Draw glow effect if activated
        if (this.activated) {
            this.drawGlow(ctx);
        }

        // Draw checkpoint pole and flag
        this.drawCheckpoint(ctx);

        ctx.restore();

        // Draw particles (not affected by scaling)
        this.renderParticles(ctx, camera);

        // Draw activation range (debug - comment out for production)
        if (false) { // Set to true for debugging
            ctx.strokeStyle = this.activated ? 'green' : 'blue';
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(screenX + this.width / 2, screenY + this.height / 2, this.activationRange, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }
    }

    /**
     * Draw glow effect
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawGlow(ctx) {
        ctx.save();
        ctx.globalAlpha = this.glowIntensity * 0.6;
        ctx.shadowColor = '#88ddff';
        ctx.shadowBlur = 20;
        
        ctx.fillStyle = '#88ddff';
        ctx.fillRect(-5, -5, this.width + 10, this.height + 10);
        
        ctx.restore();
    }

    /**
     * Draw the main checkpoint structure
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawCheckpoint(ctx) {
        // Pole
        ctx.fillStyle = this.activated ? '#dddddd' : '#888888';
        ctx.fillRect(this.width / 2 - 2, 0, 4, this.height);

        // Base
        ctx.fillStyle = this.activated ? '#bbbbbb' : '#666666';
        ctx.fillRect(this.width / 2 - 8, this.height - 8, 16, 8);

        // Flag
        this.drawFlag(ctx);

        // Orb on top (if activated)
        if (this.activated) {
            this.drawOrb(ctx);
        }
    }

    /**
     * Draw the flag with wave animation
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawFlag(ctx) {
        const flagWidth = 20;
        const flagHeight = 12;
        const flagX = this.width / 2 + 2;
        const flagY = 8;

        ctx.fillStyle = this.activated ? '#00ff88' : '#888888';
        
        // Create wavy flag effect
        ctx.beginPath();
        ctx.moveTo(flagX, flagY);
        
        const segments = 5;
        for (let i = 0; i <= segments; i++) {
            const x = flagX + (i / segments) * flagWidth;
            const wave = Math.sin(this.flagWaveOffset + i * 0.5) * 2;
            const y = flagY + wave;
            ctx.lineTo(x, y);
        }
        
        for (let i = segments; i >= 0; i--) {
            const x = flagX + (i / segments) * flagWidth;
            const wave = Math.sin(this.flagWaveOffset + i * 0.5) * 2;
            const y = flagY + flagHeight + wave;
            ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.fill();

        // Flag details
        if (this.activated) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(flagX + 2, flagY + 2, 4, 2);
            ctx.fillRect(flagX + 2, flagY + 6, 4, 2);
        }
    }

    /**
     * Draw the glowing orb on top
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawOrb(ctx) {
        const orbX = this.width / 2;
        const orbY = 4;
        const orbRadius = 4;

        // Outer glow
        ctx.save();
        ctx.globalAlpha = this.glowIntensity;
        ctx.shadowColor = '#88ddff';
        ctx.shadowBlur = 10;
        
        ctx.fillStyle = '#88ddff';
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbRadius + 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();

        // Inner orb
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = '#88ddff';
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbRadius - 1, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Render all particles
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} camera - Camera object for offset calculation
     */
    renderParticles(ctx, camera) {
        for (const particle of this.particles) {
            particle.render(ctx, camera);
        }
    }

    /**
     * Get checkpoint's collision rectangle
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
     * Get checkpoint's center position
     * @returns {Object} Object with x, y coordinates
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    /**
     * Check if checkpoint is activated
     * @returns {boolean} True if activated
     */
    isActivated() {
        return this.activated;
    }

    /**
     * Reset checkpoint to initial state
     */
    reset() {
        this.activated = false;
        this.wasPlayerNear = false;
        this.particles = [];
        this.activationAnimation.active = false;
        this.glowIntensity = 0;
        this.glowDirection = 1;
        this.pulseScale = 1;
        this.flagWaveOffset = 0;
    }
}

/**
 * Particle class for checkpoint effects
 */
class CheckpointParticle {
    constructor(x, y, velocityX, velocityY, color, lifetime) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.color = color;
        this.lifetime = lifetime;
        this.age = 0;
        this.size = random(2, 4);
        this.gravity = 0.1;
    }

    /**
     * Update particle physics and lifetime
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += this.gravity;
        this.age += deltaTime;
    }

    /**
     * Render the particle
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} camera - Camera object for offset calculation
     */
    render(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        ctx.save();
        
        // Fade out over lifetime
        const alpha = 1 - (this.age / this.lifetime);
        ctx.globalAlpha = alpha;
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, this.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Check if particle should be removed
     * @returns {boolean} True if particle is dead
     */
    isDead() {
        return this.age >= this.lifetime;
    }
}
