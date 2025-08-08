/**
 * Main entry point for Nivo Adventure
 * Initializes and starts the game
 */

// Global game instance
let game = null;

/**
 * Initialize the game when the page loads
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Starting Nivo Adventure...');
    
    try {
        // Create game instance
        game = new Game();
        
        // Handle window events
        setupWindowEvents();
        
        // Handle visibility changes (pause when tab is not active)
        setupVisibilityHandling();
        
        console.log('Nivo Adventure ready!');
        
    } catch (error) {
        console.error('Failed to start game:', error);
        showStartupError(error);
    }
});

/**
 * Set up window event handlers
 */
function setupWindowEvents() {
    // Handle window resize
    window.addEventListener('resize', debounce(() => {
        if (game) {
            game.handleResize();
        }
    }, 100));
    
    // Handle before unload (save game state if needed)
    window.addEventListener('beforeunload', (e) => {
        if (game && game.state === 'playing') {
            // Could save game state here
            e.preventDefault();
            e.returnValue = 'Are you sure you want to leave? Your progress will be lost.';
        }
    });
    
    // Handle orientation change on mobile
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            if (game) {
                game.handleResize();
            }
        }, 100);
    });
}

/**
 * Set up page visibility handling
 */
function setupVisibilityHandling() {
    let hidden, visibilityChange;
    
    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }
    
    if (typeof document[hidden] !== "undefined") {
        document.addEventListener(visibilityChange, () => {
            if (game) {
                if (document[hidden]) {
                    // Page is hidden - pause game
                    if (game.state === 'playing') {
                        game.pauseGame();
                    }
                    audioManager.setVolume(0.1); // Lower volume when not active
                } else {
                    // Page is visible - resume game
                    audioManager.setVolume(0.3); // Restore volume
                    // Don't auto-resume - let player manually resume
                }
            }
        });
    }
}

/**
 * Show startup error to user
 * @param {Error} error - Error that occurred during startup
 */
function showStartupError(error) {
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #ff4444;
        color: white;
        padding: 20px;
        border-radius: 10px;
        font-family: Arial, sans-serif;
        text-align: center;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    
    errorMessage.innerHTML = `
        <h2>Failed to Start Game</h2>
        <p>Nivo Adventure encountered an error during startup.</p>
        <p>Please refresh the page to try again.</p>
        <button onclick="location.reload()" style="
            background: white;
            color: #ff4444;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            margin-top: 10px;
        ">Refresh Page</button>
        <details style="margin-top: 10px; text-align: left;">
            <summary style="cursor: pointer;">Technical Details</summary>
            <pre style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 5px; overflow: auto; max-height: 200px; font-size: 12px;">${error.stack || error.message}</pre>
        </details>
    `;
    
    document.body.appendChild(errorMessage);
}

/**
 * Development and debugging functions
 */
if (typeof window !== 'undefined') {
    // Expose game instance for debugging
    window.game = game;
    
    // Debugging shortcuts (only in development)
    window.addEventListener('keydown', (e) => {
        // Only enable debug shortcuts if game exists and debug mode is on
        if (!game || !window.DEBUG_MODE) return;
        
        switch (e.code) {
            case 'F1':
                e.preventDefault();
                console.log('Game Stats:', game.getStats());
                break;
            case 'F2':
                e.preventDefault();
                if (game.currentLevel) {
                    console.log('Level Stats:', game.currentLevel.getStats());
                }
                break;
            case 'F3':
                e.preventDefault();
                console.log('Player Position:', {
                    x: game.player.x,
                    y: game.player.y,
                    health: game.player.health
                });
                break;
            case 'F4':
                e.preventDefault();
                console.log('Camera Position:', {
                    x: game.camera.x,
                    y: game.camera.y,
                    zoom: game.camera.zoom
                });
                break;
            case 'F5':
                e.preventDefault();
                // Skip to next level
                if (game.state === 'playing') {
                    game.currentLevel.completed = true;
                }
                break;
        }
    });
    
    // Console commands for debugging
    window.debugCommands = {
        skipLevel: () => {
            if (game && game.currentLevel) {
                game.currentLevel.completed = true;
                console.log('Level marked as complete');
            }
        },
        
        addHealth: (amount = 50) => {
            if (game && game.player) {
                game.player.heal(amount);
                console.log(`Added ${amount} health`);
            }
        },
        
        addScore: (amount = 1000) => {
            if (game) {
                game.score += amount;
                console.log(`Added ${amount} score`);
            }
        },
        
        teleportPlayer: (x, y) => {
            if (game && game.player) {
                game.player.x = x;
                game.player.y = y;
                console.log(`Teleported player to (${x}, ${y})`);
            }
        },
        
        setLevel: (levelNumber) => {
            if (game) {
                game.currentLevelNumber = levelNumber;
                game.loadLevel(levelNumber);
                game.player.reset(game.currentLevel.playerStartX, game.currentLevel.playerStartY);
                console.log(`Loaded level ${levelNumber}`);
            }
        },
        
        toggleGodMode: () => {
            if (game && game.player) {
                game.player.invulnerable = !game.player.invulnerable;
                console.log(`God mode: ${game.player.invulnerable ? 'ON' : 'OFF'}`);
            }
        }
    };
    
    // Enable debug mode in development
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        window.DEBUG_MODE = true;
        console.log('Debug mode enabled. Use F1-F5 for debug shortcuts.');
        console.log('Available commands:', Object.keys(window.debugCommands));
    }
}

/**
 * Service Worker registration for offline support (optional)
 */
if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

/**
 * Performance monitoring
 */
if (window.performance && window.performance.mark) {
    window.addEventListener('load', () => {
        performance.mark('game-start');
        
        // Log performance metrics after game loads
        setTimeout(() => {
            const navigation = performance.getEntriesByType('navigation')[0];
            console.log('Page Load Performance:', {
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                totalTime: navigation.loadEventEnd - navigation.fetchStart
            });
        }, 2000);
    });
}

/**
 * Error handling for uncaught errors
 */
window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    
    // If the game is running, try to handle the error gracefully
    if (game && game.state === 'playing') {
        try {
            game.pauseGame();
            console.log('Game paused due to error');
        } catch (e) {
            console.error('Failed to pause game after error:', e);
        }
    }
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault(); // Prevent default browser behavior
});

/**
 * Initialize analytics (if needed)
 */
function initAnalytics() {
    // Add analytics code here if needed
    // Example: Google Analytics, custom tracking, etc.
}

/**
 * Initialize social features (if needed)
 */
function initSocialFeatures() {
    // Add social media integration here if needed
    // Example: Facebook, Twitter sharing, leaderboards, etc.
}

/**
 * Feature detection and polyfills
 */
function checkBrowserSupport() {
    const required = {
        canvas: !!document.createElement('canvas').getContext,
        audioContext: !!(window.AudioContext || window.webkitAudioContext),
        requestAnimationFrame: !!window.requestAnimationFrame,
        localStorage: !!window.localStorage
    };
    
    const missing = Object.keys(required).filter(feature => !required[feature]);
    
    if (missing.length > 0) {
        console.warn('Missing browser features:', missing);
        
        // Show compatibility warning
        const warning = document.createElement('div');
        warning.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ff8800;
                color: white;
                padding: 10px;
                text-align: center;
                z-index: 1000;
                font-family: Arial, sans-serif;
            ">
                Your browser may not support all features of this game.
                For the best experience, please use a modern browser.
                <button onclick="this.parentElement.remove()" style="
                    background: transparent;
                    border: 1px solid white;
                    color: white;
                    padding: 5px 10px;
                    margin-left: 10px;
                    cursor: pointer;
                ">Dismiss</button>
            </div>
        `;
        document.body.appendChild(warning);
    }
    
    return missing.length === 0;
}

// Check browser support on load
document.addEventListener('DOMContentLoaded', checkBrowserSupport);

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game };
}

console.log('Nivo Adventure main script loaded');
