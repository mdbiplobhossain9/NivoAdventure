/**
 * Camera class - handles viewport, following, and smooth movement
 */
class Camera {
    constructor(canvasWidth, canvasHeight, worldWidth, worldHeight) {
        // Camera position
        this.x = 0;
        this.y = 0;
        
        // Canvas dimensions
        this.width = canvasWidth;
        this.height = canvasHeight;
        
        // World boundaries
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        
        // Target to follow
        this.target = null;
        this.targetOffset = { x: 0, y: 0 };
        
        // Camera behavior settings
        this.followSpeed = 0.1;
        this.lookahead = 50; // Pixels to look ahead in direction of movement
        this.deadzone = {
            x: canvasWidth * 0.3,
            y: canvasHeight * 0.2
        };
        
        // Smooth movement
        this.velocity = { x: 0, y: 0 };
        this.smoothing = 0.8;
        
        // Shake effect
        this.shake = {
            active: false,
            intensity: 0,
            duration: 0,
            timer: 0,
            offset: { x: 0, y: 0 }
        };
        
        // Zoom
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        this.zoomSpeed = 0.05;
        this.minZoom = 0.5;
        this.maxZoom = 2.0;
        
        // Camera bounds
        this.bounds = {
            left: 0,
            right: worldWidth,
            top: 0,
            bottom: worldHeight
        };
        
        // Special effects
        this.effects = {
            flashActive: false,
            flashColor: '#ffffff',
            flashIntensity: 0,
            flashDuration: 0,
            flashTimer: 0
        };
    }

    /**
     * Set the target for the camera to follow
     * @param {Object} target - Target object with x, y properties
     * @param {number} offsetX - X offset from target center
     * @param {number} offsetY - Y offset from target center
     */
    setTarget(target, offsetX = 0, offsetY = 0) {
        this.target = target;
        this.targetOffset.x = offsetX;
        this.targetOffset.y = offsetY;
    }

    /**
     * Update camera position and effects
     * @param {number} deltaTime - Time since last frame
     */
    update(deltaTime) {
        if (this.target) {
            this.updateTargetFollowing(deltaTime);
        }
        
        this.updateZoom(deltaTime);
        this.updateShake(deltaTime);
        this.updateEffects(deltaTime);
        this.constrainToBounds();
    }

    /**
     * Update camera to follow target
     * @param {number} deltaTime - Time since last frame
     */
    updateTargetFollowing(deltaTime) {
        // Calculate target position
        const targetX = this.target.x + (this.target.width || 0) / 2 + this.targetOffset.x;
        const targetY = this.target.y + (this.target.height || 0) / 2 + this.targetOffset.y;
        
        // Calculate desired camera position (centered on target)
        let desiredX = targetX - this.width / 2;
        let desiredY = targetY - this.height / 2;
        
        // Add lookahead based on target movement
        if (this.target.velocityX !== undefined) {
            const lookaheadX = this.target.velocityX * this.lookahead;
            desiredX += lookaheadX;
        }
        
        // Apply deadzone
        const currentCenterX = this.x + this.width / 2;
        const currentCenterY = this.y + this.height / 2;
        
        const deltaX = targetX - currentCenterX;
        const deltaY = targetY - currentCenterY;
        
        // Only move camera if target is outside deadzone
        if (Math.abs(deltaX) > this.deadzone.x) {
            const moveX = deltaX - Math.sign(deltaX) * this.deadzone.x;
            desiredX = this.x + moveX;
        } else {
            desiredX = this.x;
        }
        
        if (Math.abs(deltaY) > this.deadzone.y) {
            const moveY = deltaY - Math.sign(deltaY) * this.deadzone.y;
            desiredY = this.y + moveY;
        } else {
            desiredY = this.y;
        }
        
        // Smooth camera movement
        this.velocity.x = lerp(this.velocity.x, (desiredX - this.x) * this.followSpeed, this.smoothing);
        this.velocity.y = lerp(this.velocity.y, (desiredY - this.y) * this.followSpeed, this.smoothing);
        
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }

    /**
     * Update zoom level
     * @param {number} deltaTime - Time since last frame
     */
    updateZoom(deltaTime) {
        if (Math.abs(this.zoom - this.targetZoom) > 0.01) {
            this.zoom = lerp(this.zoom, this.targetZoom, this.zoomSpeed);
        }
    }

    /**
     * Update screen shake effect
     * @param {number} deltaTime - Time since last frame
     */
    updateShake(deltaTime) {
        if (!this.shake.active) {
            this.shake.offset.x = 0;
            this.shake.offset.y = 0;
            return;
        }
        
        this.shake.timer += deltaTime;
        
        if (this.shake.timer >= this.shake.duration) {
            this.shake.active = false;
            this.shake.offset.x = 0;
            this.shake.offset.y = 0;
            return;
        }
        
        // Calculate shake intensity (decreases over time)
        const progress = this.shake.timer / this.shake.duration;
        const currentIntensity = this.shake.intensity * (1 - progress);
        
        // Generate random offset
        this.shake.offset.x = (Math.random() - 0.5) * 2 * currentIntensity;
        this.shake.offset.y = (Math.random() - 0.5) * 2 * currentIntensity;
    }

    /**
     * Update special effects
     * @param {number} deltaTime - Time since last frame
     */
    updateEffects(deltaTime) {
        // Update flash effect
        if (this.effects.flashActive) {
            this.effects.flashTimer += deltaTime;
            
            if (this.effects.flashTimer >= this.effects.flashDuration) {
                this.effects.flashActive = false;
                this.effects.flashIntensity = 0;
            } else {
                const progress = this.effects.flashTimer / this.effects.flashDuration;
                this.effects.flashIntensity = 1 - progress;
            }
        }
    }

    /**
     * Constrain camera to world bounds
     */
    constrainToBounds() {
        // Apply shake offset before constraining
        let finalX = this.x + this.shake.offset.x;
        let finalY = this.y + this.shake.offset.y;
        
        // Constrain to bounds
        finalX = clamp(finalX, this.bounds.left, this.bounds.right - this.width);
        finalY = clamp(finalY, this.bounds.top, this.bounds.bottom - this.height);
        
        // Store final position
        this.x = finalX - this.shake.offset.x;
        this.y = finalY - this.shake.offset.y;
    }

    /**
     * Start screen shake effect
     * @param {number} intensity - Shake intensity in pixels
     * @param {number} duration - Shake duration in milliseconds
     */
    startShake(intensity, duration) {
        this.shake.active = true;
        this.shake.intensity = intensity;
        this.shake.duration = duration;
        this.shake.timer = 0;
    }

    /**
     * Start flash effect
     * @param {string} color - Flash color
     * @param {number} duration - Flash duration in milliseconds
     */
    startFlash(color = '#ffffff', duration = 200) {
        this.effects.flashActive = true;
        this.effects.flashColor = color;
        this.effects.flashDuration = duration;
        this.effects.flashTimer = 0;
        this.effects.flashIntensity = 1;
    }

    /**
     * Set zoom level
     * @param {number} zoom - Target zoom level
     * @param {boolean} immediate - Whether to zoom immediately
     */
    setZoom(zoom, immediate = false) {
        this.targetZoom = clamp(zoom, this.minZoom, this.maxZoom);
        
        if (immediate) {
            this.zoom = this.targetZoom;
        }
    }

    /**
     * Zoom in
     * @param {number} factor - Zoom factor
     */
    zoomIn(factor = 0.1) {
        this.setZoom(this.targetZoom + factor);
    }

    /**
     * Zoom out
     * @param {number} factor - Zoom factor
     */
    zoomOut(factor = 0.1) {
        this.setZoom(this.targetZoom - factor);
    }

    /**
     * Reset zoom to default
     */
    resetZoom() {
        this.setZoom(1.0);
    }

    /**
     * Set camera position directly
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.velocity.x = 0;
        this.velocity.y = 0;
    }

    /**
     * Move camera by offset
     * @param {number} deltaX - X offset
     * @param {number} deltaY - Y offset
     */
    move(deltaX, deltaY) {
        this.x += deltaX;
        this.y += deltaY;
    }

    /**
     * Set world bounds
     * @param {number} width - World width
     * @param {number} height - World height
     */
    setWorldBounds(width, height) {
        this.worldWidth = width;
        this.worldHeight = height;
        this.bounds.right = width;
        this.bounds.bottom = height;
    }

    /**
     * Set custom bounds
     * @param {number} left - Left bound
     * @param {number} top - Top bound
     * @param {number} right - Right bound
     * @param {number} bottom - Bottom bound
     */
    setBounds(left, top, right, bottom) {
        this.bounds.left = left;
        this.bounds.top = top;
        this.bounds.right = right;
        this.bounds.bottom = bottom;
    }

    /**
     * Check if a point is visible on screen
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if point is visible
     */
    isPointVisible(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    /**
     * Check if a rectangle is visible on screen
     * @param {Object} rect - Rectangle with x, y, width, height
     * @returns {boolean} True if rectangle is visible
     */
    isRectVisible(rect) {
        return rect.x < this.x + this.width &&
               rect.x + rect.width > this.x &&
               rect.y < this.y + this.height &&
               rect.y + rect.height > this.y;
    }

    /**
     * Convert world coordinates to screen coordinates
     * @param {number} worldX - World X coordinate
     * @param {number} worldY - World Y coordinate
     * @returns {Object} Screen coordinates
     */
    worldToScreen(worldX, worldY) {
        return {
            x: (worldX - this.x - this.shake.offset.x) * this.zoom,
            y: (worldY - this.y - this.shake.offset.y) * this.zoom
        };
    }

    /**
     * Convert screen coordinates to world coordinates
     * @param {number} screenX - Screen X coordinate
     * @param {number} screenY - Screen Y coordinate
     * @returns {Object} World coordinates
     */
    screenToWorld(screenX, screenY) {
        return {
            x: (screenX / this.zoom) + this.x + this.shake.offset.x,
            y: (screenY / this.zoom) + this.y + this.shake.offset.y
        };
    }

    /**
     * Get camera's center position in world coordinates
     * @returns {Object} Center position
     */
    getCenter() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        };
    }

    /**
     * Get camera bounds in world coordinates
     * @returns {Object} Camera bounds
     */
    getBounds() {
        return {
            left: this.x,
            top: this.y,
            right: this.x + this.width,
            bottom: this.y + this.height
        };
    }

    /**
     * Apply camera transform to rendering context
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    applyTransform(ctx) {
        ctx.save();
        
        // Apply zoom
        if (this.zoom !== 1.0) {
            ctx.scale(this.zoom, this.zoom);
        }
        
        // Apply camera offset and shake
        ctx.translate(
            -this.x - this.shake.offset.x,
            -this.y - this.shake.offset.y
        );
    }

    /**
     * Remove camera transform from rendering context
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    removeTransform(ctx) {
        ctx.restore();
    }

    /**
     * Render camera effects (flash, etc.)
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderEffects(ctx) {
        // Render flash effect
        if (this.effects.flashActive && this.effects.flashIntensity > 0) {
            ctx.save();
            ctx.globalAlpha = this.effects.flashIntensity * 0.5;
            ctx.fillStyle = this.effects.flashColor;
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.restore();
        }
    }

    /**
     * Smoothly move camera to a specific position
     * @param {number} x - Target X position
     * @param {number} y - Target Y position
     * @param {number} duration - Duration in milliseconds
     */
    panTo(x, y, duration = 1000) {
        // This would require animation system - simplified version
        this.setPosition(x - this.width / 2, y - this.height / 2);
    }

    /**
     * Reset camera to default state
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        this.shake.active = false;
        this.shake.offset.x = 0;
        this.shake.offset.y = 0;
        this.effects.flashActive = false;
        this.effects.flashIntensity = 0;
    }

    /**
     * Get camera state for saving/loading
     * @returns {Object} Camera state
     */
    getState() {
        return {
            x: this.x,
            y: this.y,
            zoom: this.zoom,
            targetZoom: this.targetZoom
        };
    }

    /**
     * Restore camera state
     * @param {Object} state - Camera state to restore
     */
    setState(state) {
        this.x = state.x || 0;
        this.y = state.y || 0;
        this.zoom = state.zoom || 1.0;
        this.targetZoom = state.targetZoom || 1.0;
        this.velocity.x = 0;
        this.velocity.y = 0;
    }
}
