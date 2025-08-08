/**
 * Utility functions for the game
 */

/**
 * Check collision between two rectangles
 * @param {Object} rect1 - First rectangle with x, y, width, height
 * @param {Object} rect2 - Second rectangle with x, y, width, height
 * @returns {boolean} True if rectangles are colliding
 */
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

/**
 * Check collision on a specific side
 * @param {Object} rect1 - Moving rectangle
 * @param {Object} rect2 - Static rectangle
 * @param {string} side - Side to check ('top', 'bottom', 'left', 'right')
 * @returns {boolean} True if collision on specified side
 */
function checkCollisionSide(rect1, rect2, side) {
    const buffer = 5; // Small buffer for more accurate collision detection
    
    switch(side) {
        case 'top':
            return rect1.y <= rect2.y + rect2.height && 
                   rect1.y + rect1.height > rect2.y + rect2.height - buffer &&
                   rect1.x < rect2.x + rect2.width && 
                   rect1.x + rect1.width > rect2.x;
        case 'bottom':
            return rect1.y + rect1.height >= rect2.y && 
                   rect1.y < rect2.y + buffer &&
                   rect1.x < rect2.x + rect2.width && 
                   rect1.x + rect1.width > rect2.x;
        case 'left':
            return rect1.x <= rect2.x + rect2.width && 
                   rect1.x + rect1.width > rect2.x + rect2.width - buffer &&
                   rect1.y < rect2.y + rect2.height && 
                   rect1.y + rect1.height > rect2.y;
        case 'right':
            return rect1.x + rect1.width >= rect2.x && 
                   rect1.x < rect2.x + buffer &&
                   rect1.y < rect2.y + rect2.height && 
                   rect1.y + rect1.height > rect2.y;
        default:
            return false;
    }
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation between two values
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

/**
 * Calculate distance between two points
 * @param {number} x1 - First point x
 * @param {number} y1 - First point y
 * @param {number} x2 - Second point x
 * @param {number} y2 - Second point y
 * @returns {number} Distance between points
 */
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Generate a random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
function random(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if a point is inside a rectangle
 * @param {number} x - Point x coordinate
 * @param {number} y - Point y coordinate
 * @param {Object} rect - Rectangle with x, y, width, height
 * @returns {boolean} True if point is inside rectangle
 */
function pointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height;
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 */
function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Convert radians to degrees
 * @param {number} radians - Angle in radians
 * @returns {number} Angle in degrees
 */
function toDegrees(radians) {
    return radians * 180 / Math.PI;
}

/**
 * Easing function for smooth animations
 * @param {number} t - Time parameter (0-1)
 * @returns {number} Eased value
 */
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Round a number to specified decimal places
 * @param {number} num - Number to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded number
 */
function roundTo(num, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}

/**
 * Check if device supports touch
 * @returns {boolean} True if touch is supported
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get the current timestamp in milliseconds
 * @returns {number} Current timestamp
 */
function getTimestamp() {
    return performance.now();
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
