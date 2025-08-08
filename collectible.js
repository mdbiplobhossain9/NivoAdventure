/**
 * Collectible class - handles coins, gems, and other collectible items
 */
class Collectible {
    constructor(x, y, type = 'coin', value = 10) {
        // Position and dimensions
        this.x = x;
        this.y = y;
        this.originalY = y;
        this.width = 24;
        this.height = 24;
        
        // Type and value properties
        this.type = type;
        this.value = value;
        this.collected = false;
        
        // Animation properties
        this.animationFrame = 0;
        this.animationSpeed = 0.15;
        this.animationTimer = 0;
        this.bobOffset = 0;
        this.bobSpeed = 0.05;
        this.bobHeight = 8;
        
        // Visual effects
        this.rotation = 0;
        this.rotationSpeed = 0.1;
        this.glowIntensity = 0;
        this.glowDirection = 1;
        this.glowSpeed = 0.03;
        
        // Collection animation
        this.collectionAnimation = {
            active: false,
            scale: 1,
            alpha: 1,
            duration: 500, // milliseconds
            timer: 0
        };
        
        // Different types of collectibles
        this.types = {
            coin: {
                color: '#ffdd00',
                glowColor: '#ffff88',
                frames: 8,
                value: 10,
                sound: 'collect'
            },
            gem: {
                color: '#00ddff',
                glowColor: '#88ffff',
                frames: 6,
                value: 50,
                sound: 'collect'
            },
            health: {
                color: '#ff4444',
                glowColor: '#ff8888',
                frames: 4,
                value: 25,
                sound: 'collect'
            },
            star: {
                color: '#ffaa00',
                glowColor: '#ffdd88',
                frames: 8,
                value: 100,
                sound: 'collect'
            }
        };
        
        // Set properties based on type
        this.updateTypeProperties();
        
        // Magnetic effect properties
        this.magneticRange = 60;
        this.magneticSpeed = 3;
        this.isBeingAttracted = false;
    }

    /**
     * Update collectible properties based on type
     */
    updateTypeProperties() {
        if (this.types[this.type]) {
            const typeData = this.types[this.type];
            this.value = typeData.value;
            this.maxFrames = typeData.frames;
        }
    }

    /**
     * Update collectible animation and effects
     * @param {number} deltaTime - Time since last frame
     * @param {Object} player - Player object for magnetic attraction
     */
    update(deltaTime, player = null) {
        if (this.collected && !this.collectionAnimation.active) {
            return;
        }

        this.updateAnimation(deltaTime);
        this.updateBobbing(deltaTime);
        this.updateRotation(deltaTime);
        this.updateGlow(deltaTime);
        
        if (player && !this.collected) {
            this.updateMagneticAttraction(player, deltaTime);
        }
        
        if (this.collectionAnimation.active) {
            this.updateCollectionAnimation(deltaTime);
        }
    }

    /**
     * Update frame animation
     * @param {number} deltaTime - Time since last frame
     */
    updateAnimation(deltaTime) {
        this.animationTimer += deltaTime;
        
        if (this.animationTimer >= this.animationSpeed) {
            this.animationFrame++;
            if (this.animationFrame >= this.maxFrames) {
                this.animationFrame = 0;
            }
            this.animationTimer = 0;
        }
    }

    /**
     * Update bobbing motion
     * @param {number} deltaTime - Time since last frame
     */
    updateBobbing(deltaTime) {
        this.bobOffset += this.bobSpeed;
        this.y = this.originalY + Math.sin(this.bobOffset) * this.bobHeight;
    }

    /**
     * Update rotation
     * @param {number} deltaTime - Time since last frame
     */
    updateRotation(deltaTime) {
        this.rotation += this.rotationSpeed;
        if (this.rotation >= Math.PI * 2) {
            this.rotation = 0;
        }
    }

    /**
     * Update glow effect
     * @param {number} deltaTime - Time since last frame
     */
    updateGlow(deltaTime) {
        this.glowIntensity += this.glowDirection * this.glowSpeed;
        
        if (this.glowIntensity >= 1) {
            this.glowIntensity = 1;
            this.glowDirection = -1;
        } else if (this.glowIntensity <= 0.3) {
            this.glowIntensity = 0.3;
            this.glowDirection = 1;
        }
    }

    /**
     * Update magnetic attraction to player
     * @param {Object} player - Player object
     * @param {number} deltaTime - Time since last frame
     */
    updateMagneticAttraction(player, deltaTime) {
        const playerCenter = player.getCenter();
        const collectibleCenter = this.getCenter();
        const dist = distance(
            collectibleCenter.x, collectibleCenter.y,
            playerCenter.x, playerCenter.y
        );

        if (dist <= this.magneticRange) {
            this.isBeingAttracted = true;
            
            // Calculate direction to player
            const dx = playerCenter.x - collectibleCenter.x;
            const dy = playerCenter.y - collectibleCenter.y;
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            
            if (magnitude > 0) {
                // Normalize and apply attraction
                const normalizedDx = dx / magnitude;
                const normalizedDy = dy / magnitude;
                
                // Increase attraction speed as player gets closer
                const attractionMultiplier = (this.magneticRange - dist) / this.magneticRange;
                const speed = this.magneticSpeed * attractionMultiplier * 2;
                
                this.x += normalizedDx * speed;
                this.y += normalizedDy * speed;
            }
        } else {
            this.isBeingAttracted = false;
        }
    }

    /**
     * Update collection animation
     * @param {number} deltaTime - Time since last frame
     */
    updateCollectionAnimation(deltaTime) {
        this.collectionAnimation.timer += deltaTime;
        const progress = this.collectionAnimation.timer / this.collectionAnimation.duration;
        
        if (progress >= 1) {
            this.collectionAnimation.active = false;
            return;
        }

        // Scale up and fade out
        this.collectionAnimation.scale = 1 + progress * 2;
        this.collectionAnimation.alpha = 1 - progress;
        
        // Float upward
        this.y -= 2;
    }

    /**
     * Check collision with player and handle collection
     * @param {Object} player - Player object
     * @returns {Object|null} Collection result or null if no collision
     */
    checkPlayerCollision(player) {
        if (this.collected || !player) return null;

        if (checkCollision(this, player)) {
            return this.collect();
        }

        return null;
    }

    /**
     * Collect this item
     * @returns {Object} Collection result with type, value, and effect
     */
    collect() {
        if (this.collected) return null;

        this.collected = true;
        this.collectionAnimation.active = true;
        this.collectionAnimation.timer = 0;
        this.collectionAnimation.scale = 1;
        this.collectionAnimation.alpha = 1;

        // Play collection sound
        const typeData = this.types[this.type];
        if (typeData && typeData.sound) {
            audioManager.play(typeData.sound, 0.6);
        }

        return {
            type: this.type,
            value: this.value,
            effect: this.getCollectionEffect()
        };
    }

    /**
     * Get the effect of collecting this item
     * @returns {string} Effect type ('score', 'health', 'special')
     */
    getCollectionEffect() {
        switch (this.type) {
            case 'health':
                return 'health';
            case 'star':
                return 'special';
            default:
                return 'score';
        }
    }

    /**
     * Render the collectible with effects
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} camera - Camera object for offset calculation
     */
    render(ctx, camera) {
        if (this.collected && !this.collectionAnimation.active) {
            return;
        }

        // Calculate screen position
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;

        // Don't render if off-screen
        if (screenX + this.width < 0 || screenX > ctx.canvas.width ||
            screenY + this.height < 0 || screenY > ctx.canvas.height) {
            return;
        }

        ctx.save();

        // Apply collection animation transformations
        if (this.collectionAnimation.active) {
            ctx.globalAlpha = this.collectionAnimation.alpha;
            ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
            ctx.scale(this.collectionAnimation.scale, this.collectionAnimation.scale);
            ctx.translate(-this.width / 2, -this.height / 2);
        } else {
            ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
            ctx.rotate(this.rotation);
            ctx.translate(-this.width / 2, -this.height / 2);
        }

        // Draw glow effect
        this.drawGlow(ctx);
        
        // Draw main collectible
        this.drawCollectible(ctx);

        // Draw magnetic attraction effect
        if (this.isBeingAttracted && !this.collectionAnimation.active) {
            this.drawMagneticEffect(ctx);
        }

        ctx.restore();
    }

    /**
     * Draw glow effect around collectible
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawGlow(ctx) {
        const typeData = this.types[this.type];
        if (!typeData) return;

        ctx.save();
        ctx.globalAlpha = this.glowIntensity * 0.5;
        ctx.shadowColor = typeData.glowColor;
        ctx.shadowBlur = 15;
        
        ctx.fillStyle = typeData.glowColor;
        ctx.fillRect(-2, -2, this.width + 4, this.height + 4);
        
        ctx.restore();
    }

    /**
     * Draw the main collectible sprite
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawCollectible(ctx) {
        const typeData = this.types[this.type];
        if (!typeData) return;

        ctx.fillStyle = typeData.color;

        switch (this.type) {
            case 'coin':
                this.drawCoin(ctx);
                break;
            case 'gem':
                this.drawGem(ctx);
                break;
            case 'health':
                this.drawHealth(ctx);
                break;
            case 'star':
                this.drawStar(ctx);
                break;
            default:
                this.drawCoin(ctx);
        }
    }

    /**
     * Draw coin sprite
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawCoin(ctx) {
        // Outer ring
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, this.width / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner detail
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, this.width / 2 - 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Center symbol
        ctx.fillStyle = '#ffdd00';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', this.width / 2, this.height / 2);
    }

    /**
     * Draw gem sprite
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawGem(ctx) {
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 2);
        ctx.lineTo(this.width - 4, this.height / 2);
        ctx.lineTo(this.width / 2, this.height - 2);
        ctx.lineTo(4, this.height / 2);
        ctx.closePath();
        ctx.fill();
        
        // Inner reflection
        ctx.fillStyle = '#88ddff';
        ctx.beginPath();
        ctx.moveTo(this.width / 2, 6);
        ctx.lineTo(this.width - 8, this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.closePath();
        ctx.fill();
    }

    /**
     * Draw health item sprite
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawHealth(ctx) {
        // Cross shape
        const crossWidth = 4;
        const crossHeight = this.height - 8;
        const crossX = this.width / 2 - crossWidth / 2;
        const crossY = 4;
        
        // Vertical bar
        ctx.fillRect(crossX, crossY, crossWidth, crossHeight);
        
        // Horizontal bar
        ctx.fillRect(4, this.height / 2 - crossWidth / 2, this.width - 8, crossWidth);
        
        // White highlights
        ctx.fillStyle = '#ff8888';
        ctx.fillRect(crossX + 1, crossY + 1, 1, crossHeight - 2);
        ctx.fillRect(5, this.height / 2 - crossWidth / 2 + 1, this.width - 10, 1);
    }

    /**
     * Draw star sprite
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawStar(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const outerRadius = this.width / 2 - 2;
        const innerRadius = outerRadius * 0.5;
        const spikes = 5;

        ctx.beginPath();
        
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        
        // Inner glow
        ctx.fillStyle = '#ffdd88';
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Draw magnetic attraction effect
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawMagneticEffect(ctx) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        // Pulsing circle
        const pulseRadius = 15 + Math.sin(getTimestamp() * 0.01) * 5;
        ctx.beginPath();
        ctx.arc(this.width / 2, this.height / 2, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    /**
     * Get collectible's collision rectangle
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
     * Get collectible's center position
     * @returns {Object} Object with x, y coordinates
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    /**
     * Check if collectible is collected
     * @returns {boolean} True if collected
     */
    isCollected() {
        return this.collected && !this.collectionAnimation.active;
    }

    /**
     * Reset collectible to initial state
     */
    reset() {
        this.collected = false;
        this.collectionAnimation.active = false;
        this.y = this.originalY;
        this.bobOffset = 0;
        this.rotation = 0;
        this.glowIntensity = 0.3;
        this.glowDirection = 1;
        this.isBeingAttracted = false;
    }
}
