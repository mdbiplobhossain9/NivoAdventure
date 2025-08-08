/**
 * Background class - handles parallax scrolling backgrounds
 */
class Background {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Background layers for parallax effect
        this.layers = [];
        this.initializeLayers();
        
        // Animation properties
        this.time = 0;
        this.cloudOffset = 0;
        this.cloudSpeed = 0.02;
        
        // Color schemes for different level themes
        this.themes = {
            forest: {
                skyTop: '#87CEEB',
                skyBottom: '#98FB98',
                mountain: '#8B7355',
                tree: '#228B22',
                cloud: '#FFFFFF'
            },
            desert: {
                skyTop: '#FFE4B5',
                skyBottom: '#F0E68C',
                mountain: '#CD853F',
                tree: '#8FBC8F',
                cloud: '#F5F5DC'
            },
            cave: {
                skyTop: '#2F2F2F',
                skyBottom: '#4A4A4A',
                mountain: '#696969',
                tree: '#556B2F',
                cloud: '#778899'
            },
            sky: {
                skyTop: '#87CEFA',
                skyBottom: '#E0F6FF',
                mountain: '#B0C4DE',
                tree: '#32CD32',
                cloud: '#FFFFFF'
            }
        };
        
        this.currentTheme = 'forest';
        this.colors = this.themes[this.currentTheme];
        
        // Particle effects
        this.particles = [];
        this.maxParticles = 50;
        this.initializeParticles();
    }

    /**
     * Initialize background layers with different parallax speeds
     */
    initializeLayers() {
        this.layers = [
            {
                name: 'sky',
                parallaxSpeed: 0,
                elements: []
            },
            {
                name: 'clouds',
                parallaxSpeed: 0.1,
                elements: this.generateClouds()
            },
            {
                name: 'mountains',
                parallaxSpeed: 0.3,
                elements: this.generateMountains()
            },
            {
                name: 'trees',
                parallaxSpeed: 0.6,
                elements: this.generateTrees()
            },
            {
                name: 'foreground',
                parallaxSpeed: 0.9,
                elements: this.generateForegroundElements()
            }
        ];
    }

    /**
     * Generate cloud elements
     * @returns {Array} Array of cloud objects
     */
    generateClouds() {
        const clouds = [];
        const cloudCount = 8;
        
        for (let i = 0; i < cloudCount; i++) {
            clouds.push({
                x: random(0, this.canvasWidth * 2),
                y: random(50, 200),
                width: random(80, 150),
                height: random(40, 80),
                opacity: random(0.3, 0.8),
                speed: random(0.5, 1.5)
            });
        }
        
        return clouds;
    }

    /**
     * Generate mountain elements
     * @returns {Array} Array of mountain objects
     */
    generateMountains() {
        const mountains = [];
        const mountainCount = 6;
        
        for (let i = 0; i < mountainCount; i++) {
            mountains.push({
                x: (i * this.canvasWidth / mountainCount) - random(0, 100),
                y: this.canvasHeight * 0.4 + random(-50, 50),
                width: random(200, 400),
                height: random(150, 300),
                peaks: this.generateMountainPeaks()
            });
        }
        
        return mountains;
    }

    /**
     * Generate mountain peak points
     * @returns {Array} Array of peak points
     */
    generateMountainPeaks() {
        const peaks = [];
        const peakCount = randomInt(3, 7);
        
        for (let i = 0; i <= peakCount; i++) {
            peaks.push({
                x: i / peakCount,
                y: random(0.2, 0.8)
            });
        }
        
        return peaks;
    }

    /**
     * Generate tree elements
     * @returns {Array} Array of tree objects
     */
    generateTrees() {
        const trees = [];
        const treeCount = 15;
        
        for (let i = 0; i < treeCount; i++) {
            trees.push({
                x: random(0, this.canvasWidth * 1.5),
                y: this.canvasHeight * 0.7 + random(-20, 20),
                width: random(20, 60),
                height: random(80, 150),
                type: randomInt(1, 3), // Different tree types
                sway: random(0, Math.PI * 2) // For wind animation
            });
        }
        
        return trees;
    }

    /**
     * Generate foreground elements (grass, rocks, etc.)
     * @returns {Array} Array of foreground objects
     */
    generateForegroundElements() {
        const elements = [];
        const elementCount = 25;
        
        for (let i = 0; i < elementCount; i++) {
            const type = Math.random() < 0.7 ? 'grass' : 'rock';
            
            elements.push({
                x: random(0, this.canvasWidth * 1.2),
                y: this.canvasHeight * 0.85 + random(-10, 10),
                width: type === 'grass' ? random(5, 15) : random(10, 30),
                height: type === 'grass' ? random(10, 25) : random(8, 20),
                type: type,
                variant: randomInt(1, 3)
            });
        }
        
        return elements;
    }

    /**
     * Initialize background particles (falling leaves, dust, etc.)
     */
    initializeParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }
    }

    /**
     * Create a single background particle
     * @returns {Object} Particle object
     */
    createParticle() {
        const types = ['leaf', 'dust', 'pollen'];
        const type = types[randomInt(0, types.length - 1)];
        
        return {
            x: random(-50, this.canvasWidth + 50),
            y: random(-50, this.canvasHeight),
            velocityX: random(-0.5, 0.5),
            velocityY: random(0.1, 0.8),
            size: type === 'dust' ? random(1, 3) : random(3, 8),
            rotation: random(0, Math.PI * 2),
            rotationSpeed: random(-0.02, 0.02),
            type: type,
            color: this.getParticleColor(type),
            opacity: random(0.3, 0.8),
            life: random(5000, 15000),
            age: 0
        };
    }

    /**
     * Get color for particle based on type
     * @param {string} type - Particle type
     * @returns {string} Color string
     */
    getParticleColor(type) {
        switch (type) {
            case 'leaf':
                return ['#228B22', '#32CD32', '#90EE90', '#ADFF2F'][randomInt(0, 3)];
            case 'dust':
                return '#DDD';
            case 'pollen':
                return '#FFFF00';
            default:
                return '#FFFFFF';
        }
    }

    /**
     * Update background animations and effects
     * @param {number} deltaTime - Time since last frame
     * @param {Object} camera - Camera object for parallax calculation
     */
    update(deltaTime, camera) {
        this.time += deltaTime;
        this.cloudOffset += this.cloudSpeed;
        
        // Update particles
        this.updateParticles(deltaTime);
        
        // Update tree sway animation
        this.updateTreeSway(deltaTime);
        
        // Wrap cloud positions for infinite scrolling
        this.wrapClouds();
    }

    /**
     * Update background particles
     * @param {number} deltaTime - Time since last frame
     */
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.rotation += particle.rotationSpeed;
            particle.age += deltaTime;
            
            // Remove old particles
            if (particle.age >= particle.life || 
                particle.y > this.canvasHeight + 50 || 
                particle.x < -100 || 
                particle.x > this.canvasWidth + 100) {
                this.particles.splice(i, 1);
                this.particles.push(this.createParticle());
            }
        }
    }

    /**
     * Update tree swaying animation
     * @param {number} deltaTime - Time since last frame
     */
    updateTreeSway(deltaTime) {
        const treeLayer = this.layers.find(layer => layer.name === 'trees');
        if (treeLayer) {
            treeLayer.elements.forEach(tree => {
                tree.sway += 0.01;
            });
        }
    }

    /**
     * Wrap cloud positions for infinite scrolling
     */
    wrapClouds() {
        const cloudLayer = this.layers.find(layer => layer.name === 'clouds');
        if (cloudLayer) {
            cloudLayer.elements.forEach(cloud => {
                cloud.x += cloud.speed;
                if (cloud.x > this.canvasWidth + cloud.width) {
                    cloud.x = -cloud.width;
                    cloud.y = random(50, 200);
                }
            });
        }
    }

    /**
     * Set background theme
     * @param {string} theme - Theme name ('forest', 'desert', 'cave', 'sky')
     */
    setTheme(theme) {
        if (this.themes[theme]) {
            this.currentTheme = theme;
            this.colors = this.themes[theme];
        }
    }

    /**
     * Render the background with parallax scrolling
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} camera - Camera object for parallax calculation
     */
    render(ctx, camera) {
        // Clear and draw sky gradient
        this.renderSky(ctx);
        
        // Render each layer with parallax effect
        for (const layer of this.layers) {
            if (layer.name === 'sky') continue; // Already rendered
            
            ctx.save();
            
            // Apply parallax offset
            const parallaxOffset = camera.x * layer.parallaxSpeed;
            ctx.translate(-parallaxOffset, 0);
            
            this.renderLayer(ctx, layer);
            
            ctx.restore();
        }
        
        // Render particles (no parallax)
        this.renderParticles(ctx);
    }

    /**
     * Render sky gradient
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderSky(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
        gradient.addColorStop(0, this.colors.skyTop);
        gradient.addColorStop(1, this.colors.skyBottom);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Add subtle time-based color variation
        const timeVariation = Math.sin(this.time * 0.0001) * 0.1;
        ctx.globalAlpha = Math.abs(timeVariation);
        ctx.fillStyle = timeVariation > 0 ? '#FFE4B5' : '#E6E6FA';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        ctx.globalAlpha = 1;
    }

    /**
     * Render a specific background layer
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} layer - Layer object to render
     */
    renderLayer(ctx, layer) {
        switch (layer.name) {
            case 'clouds':
                this.renderClouds(ctx, layer.elements);
                break;
            case 'mountains':
                this.renderMountains(ctx, layer.elements);
                break;
            case 'trees':
                this.renderTrees(ctx, layer.elements);
                break;
            case 'foreground':
                this.renderForegroundElements(ctx, layer.elements);
                break;
        }
    }

    /**
     * Render clouds
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Array} clouds - Array of cloud objects
     */
    renderClouds(ctx, clouds) {
        for (const cloud of clouds) {
            ctx.save();
            ctx.globalAlpha = cloud.opacity;
            ctx.fillStyle = this.colors.cloud;
            
            // Draw cloud as series of circles
            const circles = 5;
            for (let i = 0; i < circles; i++) {
                const x = cloud.x + (i / circles) * cloud.width;
                const y = cloud.y + Math.sin((i + this.cloudOffset) * 2) * 5;
                const radius = cloud.height / 2 + Math.sin(i + this.cloudOffset) * 5;
                
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }

    /**
     * Render mountains
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Array} mountains - Array of mountain objects
     */
    renderMountains(ctx, mountains) {
        for (const mountain of mountains) {
            ctx.fillStyle = this.colors.mountain;
            
            ctx.beginPath();
            ctx.moveTo(mountain.x, this.canvasHeight);
            
            // Draw mountain peaks
            for (const peak of mountain.peaks) {
                const x = mountain.x + peak.x * mountain.width;
                const y = mountain.y + peak.y * mountain.height;
                ctx.lineTo(x, y);
            }
            
            ctx.lineTo(mountain.x + mountain.width, this.canvasHeight);
            ctx.closePath();
            ctx.fill();
            
            // Add snow caps on tall peaks
            ctx.fillStyle = '#FFFFFF';
            for (let i = 1; i < mountain.peaks.length - 1; i++) {
                const peak = mountain.peaks[i];
                if (peak.y < 0.4) { // Only tall peaks get snow
                    const x = mountain.x + peak.x * mountain.width;
                    const y = mountain.y + peak.y * mountain.height;
                    
                    ctx.beginPath();
                    ctx.moveTo(x - 10, y + 20);
                    ctx.lineTo(x, y);
                    ctx.lineTo(x + 10, y + 20);
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
    }

    /**
     * Render trees
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Array} trees - Array of tree objects
     */
    renderTrees(ctx, trees) {
        for (const tree of trees) {
            ctx.save();
            
            // Apply wind sway
            const swayAmount = Math.sin(tree.sway) * 2;
            ctx.translate(tree.x + tree.width / 2, tree.y + tree.height);
            ctx.rotate(swayAmount * 0.02);
            ctx.translate(-tree.width / 2, -tree.height);
            
            // Tree trunk
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(tree.width * 0.4, tree.height * 0.6, tree.width * 0.2, tree.height * 0.4);
            
            // Tree foliage
            ctx.fillStyle = this.colors.tree;
            
            switch (tree.type) {
                case 1: // Round tree
                    ctx.beginPath();
                    ctx.arc(tree.width / 2, tree.height * 0.3, tree.width * 0.4, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 2: // Triangular tree
                    ctx.beginPath();
                    ctx.moveTo(tree.width / 2, 0);
                    ctx.lineTo(tree.width * 0.1, tree.height * 0.7);
                    ctx.lineTo(tree.width * 0.9, tree.height * 0.7);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 3: // Layered tree
                    for (let layer = 0; layer < 3; layer++) {
                        const layerY = tree.height * (0.2 + layer * 0.15);
                        const layerWidth = tree.width * (0.8 - layer * 0.1);
                        
                        ctx.beginPath();
                        ctx.moveTo(tree.width / 2, layerY - tree.height * 0.1);
                        ctx.lineTo(tree.width / 2 - layerWidth / 2, layerY + tree.height * 0.1);
                        ctx.lineTo(tree.width / 2 + layerWidth / 2, layerY + tree.height * 0.1);
                        ctx.closePath();
                        ctx.fill();
                    }
                    break;
            }
            
            ctx.restore();
        }
    }

    /**
     * Render foreground elements
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Array} elements - Array of foreground objects
     */
    renderForegroundElements(ctx, elements) {
        for (const element of elements) {
            if (element.type === 'grass') {
                ctx.fillStyle = '#228B22';
                
                // Draw grass blades
                for (let i = 0; i < 3; i++) {
                    const x = element.x + i * (element.width / 3);
                    const height = element.height + Math.sin(this.time * 0.001 + i) * 2;
                    
                    ctx.fillRect(x, element.y - height, 2, height);
                }
            } else if (element.type === 'rock') {
                ctx.fillStyle = '#696969';
                
                // Draw rock as irregular shape
                ctx.beginPath();
                ctx.moveTo(element.x, element.y);
                ctx.lineTo(element.x + element.width * 0.2, element.y - element.height);
                ctx.lineTo(element.x + element.width * 0.8, element.y - element.height * 0.8);
                ctx.lineTo(element.x + element.width, element.y - element.height * 0.3);
                ctx.lineTo(element.x + element.width * 0.7, element.y);
                ctx.closePath();
                ctx.fill();
                
                // Rock highlight
                ctx.fillStyle = '#808080';
                ctx.fillRect(element.x + 2, element.y - element.height + 2, element.width * 0.3, element.height * 0.3);
            }
        }
    }

    /**
     * Render background particles
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderParticles(ctx) {
        for (const particle of this.particles) {
            ctx.save();
            
            ctx.globalAlpha = particle.opacity * (1 - particle.age / particle.life);
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation);
            
            ctx.fillStyle = particle.color;
            
            if (particle.type === 'leaf') {
                // Draw leaf shape
                ctx.beginPath();
                ctx.ellipse(0, 0, particle.size, particle.size * 1.5, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Leaf vein
                ctx.strokeStyle = '#006400';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, -particle.size * 1.5);
                ctx.lineTo(0, particle.size * 1.5);
                ctx.stroke();
            } else {
                // Draw simple circle for dust/pollen
                ctx.beginPath();
                ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }

    /**
     * Reset background to initial state
     */
    reset() {
        this.time = 0;
        this.cloudOffset = 0;
        this.particles = [];
        this.initializeParticles();
        
        // Reset all layer elements to original positions
        this.initializeLayers();
    }
}
