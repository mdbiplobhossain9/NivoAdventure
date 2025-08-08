/**
 * Input Manager - handles keyboard, mouse, and touch input
 */
class InputManager {
    constructor() {
        // Key states
        this.keys = {};
        this.previousKeys = {};
        
        // Mouse/touch states
        this.mousePosition = { x: 0, y: 0 };
        this.touchActive = false;
        this.touches = [];
        
        // Mobile control states
        this.mobileControls = {
            left: false,
            right: false,
            jump: false
        };
        
        // Input mapping
        this.keyMap = {
            // Movement keys
            'ArrowLeft': 'left',
            'KeyA': 'left',
            'ArrowRight': 'right',
            'KeyD': 'right',
            'ArrowUp': 'jump',
            'KeyW': 'jump',
            'Space': 'jump',
            
            // Menu/UI keys
            'Enter': 'confirm',
            'Escape': 'pause',
            'KeyR': 'restart'
        };
        
        this.setupEventListeners();
        this.setupMobileControls();
    }

    /**
     * Set up keyboard and mouse event listeners
     */
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mouse events
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Touch events
        window.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        window.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        window.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Prevent context menu on touch devices
        window.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Prevent default behavior for game keys
        window.addEventListener('keydown', (e) => {
            if (this.keyMap[e.code] || e.code === 'Space') {
                e.preventDefault();
            }
        });
    }

    /**
     * Set up mobile control buttons
     */
    setupMobileControls() {
        // Get mobile control elements
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const jumpBtn = document.getElementById('jumpBtn');
        
        if (!leftBtn || !rightBtn || !jumpBtn) return;
        
        // Left button
        this.setupMobileButton(leftBtn, 'left');
        
        // Right button  
        this.setupMobileButton(rightBtn, 'right');
        
        // Jump button
        this.setupMobileButton(jumpBtn, 'jump');
    }

    /**
     * Set up individual mobile button
     * @param {HTMLElement} button - Button element
     * @param {string} action - Action name
     */
    setupMobileButton(button, action) {
        // Touch events
        button.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mobileControls[action] = true;
            button.classList.add('active');
        }, { passive: false });
        
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.mobileControls[action] = false;
            button.classList.remove('active');
        }, { passive: false });
        
        // Mouse events for desktop testing
        button.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.mobileControls[action] = true;
            button.classList.add('active');
        });
        
        button.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.mobileControls[action] = false;
            button.classList.remove('active');
        });
        
        button.addEventListener('mouseleave', (e) => {
            this.mobileControls[action] = false;
            button.classList.remove('active');
        });
    }

    /**
     * Handle keyboard key down
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        const action = this.keyMap[event.code];
        if (action) {
            this.keys[action] = true;
        }
    }

    /**
     * Handle keyboard key up
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyUp(event) {
        const action = this.keyMap[event.code];
        if (action) {
            this.keys[action] = false;
        }
    }

    /**
     * Handle mouse movement
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseMove(event) {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            this.mousePosition.x = event.clientX - rect.left;
            this.mousePosition.y = event.clientY - rect.top;
        }
    }

    /**
     * Handle mouse button down
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseDown(event) {
        // Handle mouse input if needed for UI interactions
        event.preventDefault();
    }

    /**
     * Handle mouse button up
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseUp(event) {
        // Handle mouse input if needed for UI interactions
        event.preventDefault();
    }

    /**
     * Handle touch start
     * @param {TouchEvent} event - Touch event
     */
    handleTouchStart(event) {
        event.preventDefault();
        this.touchActive = true;
        this.touches = Array.from(event.touches);
        
        // Handle swipe gestures for movement
        this.handleTouchGestures(event);
    }

    /**
     * Handle touch movement
     * @param {TouchEvent} event - Touch event
     */
    handleTouchMove(event) {
        event.preventDefault();
        this.touches = Array.from(event.touches);
        
        // Handle swipe gestures for movement
        this.handleTouchGestures(event);
    }

    /**
     * Handle touch end
     * @param {TouchEvent} event - Touch event
     */
    handleTouchEnd(event) {
        event.preventDefault();
        
        if (event.touches.length === 0) {
            this.touchActive = false;
            this.touches = [];
            
            // Reset swipe-based movement
            this.resetSwipeControls();
        } else {
            this.touches = Array.from(event.touches);
        }
    }

    /**
     * Handle touch gestures for movement
     * @param {TouchEvent} event - Touch event
     */
    handleTouchGestures(event) {
        if (this.touches.length === 0) return;
        
        const touch = this.touches[0];
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        // Simple swipe detection
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Horizontal swipe detection
        if (Math.abs(touchX - centerX) > 50) {
            if (touchX < centerX - 50) {
                this.keys.left = true;
                this.keys.right = false;
            } else if (touchX > centerX + 50) {
                this.keys.right = true;
                this.keys.left = false;
            }
        }
        
        // Tap to jump (upper half of screen)
        if (touchY < centerY) {
            this.keys.jump = true;
        }
    }

    /**
     * Reset swipe-based controls
     */
    resetSwipeControls() {
        // Only reset swipe controls if mobile buttons aren't being used
        if (!this.mobileControls.left && !this.mobileControls.right) {
            this.keys.left = false;
            this.keys.right = false;
        }
        
        if (!this.mobileControls.jump) {
            this.keys.jump = false;
        }
    }

    /**
     * Update input state (call once per frame)
     */
    update() {
        // Store previous key states
        this.previousKeys = { ...this.keys };
        
        // Merge mobile controls with keyboard input
        this.keys.left = this.keys.left || this.mobileControls.left;
        this.keys.right = this.keys.right || this.mobileControls.right;
        this.keys.jump = this.keys.jump || this.mobileControls.jump;
    }

    /**
     * Check if a key is currently pressed
     * @param {string} action - Action name
     * @returns {boolean} True if key is pressed
     */
    isPressed(action) {
        return !!this.keys[action];
    }

    /**
     * Check if a key was just pressed this frame
     * @param {string} action - Action name
     * @returns {boolean} True if key was just pressed
     */
    isJustPressed(action) {
        return !!this.keys[action] && !this.previousKeys[action];
    }

    /**
     * Check if a key was just released this frame
     * @param {string} action - Action name
     * @returns {boolean} True if key was just released
     */
    isJustReleased(action) {
        return !this.keys[action] && !!this.previousKeys[action];
    }

    /**
     * Get current mouse/touch position
     * @returns {Object} Position object with x, y coordinates
     */
    getMousePosition() {
        return { ...this.mousePosition };
    }

    /**
     * Check if touch is active
     * @returns {boolean} True if touch is active
     */
    isTouchActive() {
        return this.touchActive;
    }

    /**
     * Get movement input as a value (-1 to 1)
     * @returns {number} Movement value
     */
    getMovementInput() {
        let movement = 0;
        
        if (this.isPressed('left')) movement -= 1;
        if (this.isPressed('right')) movement += 1;
        
        return movement;
    }

    /**
     * Show mobile controls
     */
    showMobileControls() {
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.style.display = 'block';
        }
    }

    /**
     * Hide mobile controls
     */
    hideMobileControls() {
        const mobileControls = document.getElementById('mobileControls');
        if (mobileControls) {
            mobileControls.style.display = 'none';
        }
    }

    /**
     * Enable/disable mobile controls based on device
     */
    autoConfigureMobileControls() {
        if (isTouchDevice()) {
            this.showMobileControls();
        } else {
            this.hideMobileControls();
        }
    }

    /**
     * Reset all input states
     */
    reset() {
        this.keys = {};
        this.previousKeys = {};
        this.mobileControls = {
            left: false,
            right: false,
            jump: false
        };
        this.touchActive = false;
        this.touches = [];
        
        // Remove active states from mobile buttons
        const buttons = document.querySelectorAll('.control-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
    }

    /**
     * Set up key binding
     * @param {string} key - Key code
     * @param {string} action - Action name
     */
    setKeyBinding(key, action) {
        this.keyMap[key] = action;
    }

    /**
     * Remove key binding
     * @param {string} key - Key code
     */
    removeKeyBinding(key) {
        delete this.keyMap[key];
    }

    /**
     * Get all current key bindings
     * @returns {Object} Key bindings object
     */
    getKeyBindings() {
        return { ...this.keyMap };
    }

    /**
     * Check if device supports touch
     * @returns {boolean} True if touch is supported
     */
    isTouchSupported() {
        return isTouchDevice();
    }

    /**
     * Get input method being used
     * @returns {string} Input method ('keyboard', 'touch', 'mouse')
     */
    getCurrentInputMethod() {
        if (this.touchActive || Object.values(this.mobileControls).some(v => v)) {
            return 'touch';
        } else if (Object.values(this.keys).some(v => v)) {
            return 'keyboard';
        } else {
            return 'mouse';
        }
    }

    /**
     * Vibrate device (if supported)
     * @param {number|Array} pattern - Vibration pattern in milliseconds
     */
    vibrate(pattern = 100) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    /**
     * Clean up event listeners
     */
    destroy() {
        // Remove event listeners
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        window.removeEventListener('mousemove', this.handleMouseMove);
        window.removeEventListener('mousedown', this.handleMouseDown);
        window.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('touchstart', this.handleTouchStart);
        window.removeEventListener('touchmove', this.handleTouchMove);
        window.removeEventListener('touchend', this.handleTouchEnd);
        window.removeEventListener('contextmenu', (e) => e.preventDefault());
    }
}
