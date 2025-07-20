// Moon animation with dark circle passing over glowing circle
class MoonAnimation {
    constructor() {
        this.container = null;
        this.moonCanvas = null;
        this.ctx = null;
        this.phase = 0;
        this.animationSpeed = 0.0003; // Complete cycle every ~63 seconds
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupMoon());
        } else {
            this.setupMoon();
        }
    }
    
    setupMoon() {
        const h1 = document.querySelector('h1');
        if (!h1) return;
        
        // Create container for moon
        this.container = document.createElement('div');
        this.container.className = 'moon-container';
        this.container.style.cssText = `
            width: 200px;
            height: 200px;
            display: block;
            margin: 30px auto 15px auto;
            position: relative;
        `;
        
        // Create canvas for moon
        this.moonCanvas = document.createElement('canvas');
        
        // Get device pixel ratio for sharp rendering
        const dpr = window.devicePixelRatio || 1;
        const size = 200;
        
        this.moonCanvas.width = size * dpr;
        this.moonCanvas.height = size * dpr;
        this.moonCanvas.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            position: absolute;
            top: 0;
            left: 0;
        `;
        
        this.ctx = this.moonCanvas.getContext('2d');
        this.ctx.scale(dpr, dpr);
        this.container.appendChild(this.moonCanvas);
        
        // Insert moon container before h1
        h1.parentNode.insertBefore(this.container, h1);
        
        // Add margin to h1 to create space
        h1.style.marginTop = '0';
        
        // Add responsive handling
        this.addResponsiveStyles();
        
        // Start animation
        this.animate();
    }
    
    addResponsiveStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .moon-container {
                    width: 150px !important;
                    height: 150px !important;
                    margin: 24px auto 15px auto !important;
                }
                .moon-container canvas {
                    width: 150px !important;
                    height: 150px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    drawMoon() {
        const ctx = this.ctx;
        const centerX = 100;
        const centerY = 100;
        const radius = 40;
        
        // Clear canvas
        ctx.clearRect(0, 0, 200, 200);
        
        // Save context state
        ctx.save();
        
        // Create clipping mask for glow (larger than moon to show glow around edges)
        const glowRadius = radius + 30;
        
        // Draw glow first (before clipping)
        const glowGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, glowRadius);
        glowGradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
        glowGradient.addColorStop(0.3, 'rgba(255, 255, 200, 0.4)');
        glowGradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.2)');
        glowGradient.addColorStop(0.7, 'rgba(150, 150, 255, 0.1)');
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, 200, 200);
        
        // Draw moon base (bright circle)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        const moonGradient = ctx.createRadialGradient(
            centerX - radius * 0.3, 
            centerY - radius * 0.3, 
            0,
            centerX, 
            centerY, 
            radius
        );
        moonGradient.addColorStop(0, '#fffef9');
        moonGradient.addColorStop(0.5, '#fff8dc');
        moonGradient.addColorStop(0.8, '#ffeaa7');
        moonGradient.addColorStop(1, '#f0e68c');
        ctx.fillStyle = moonGradient;
        ctx.fill();
        
        // Add subtle surface texture
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#d4d4aa';
        // Mare regions
        ctx.beginPath();
        ctx.arc(centerX + 12, centerY - 8, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX - 8, centerY + 12, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + 4, centerY + 16, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Draw edge highlight
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius - 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Calculate dark circle position based on phase
        // phase 0 = new moon (dark circle covers moon)
        // phase 0.5 = full moon (dark circle is far away)
        // phase 1 = back to new moon
        
        // Convert phase to position (left to right movement)
        let darkX;
        const darkY = centerY;
        const darkRadius = radius * 1.2;
        const travelDistance = radius * 2; // Reduced distance so moon is covered more often
        
        // Left to right movement with continuous loop
        const progress = this.phase; // 0 to 1
        darkX = centerX - travelDistance + (progress * travelDistance * 2);
        
        // Draw dark shadow circle with exact background color
        ctx.beginPath();
        ctx.arc(darkX, darkY, darkRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'oklch(14.7% 0.004 49.25)'; // Exact --color-background
        ctx.fill();
        
        // Restore context
        ctx.restore();
    }
    
    animate() {
        // Update phase continuously
        this.phase += this.animationSpeed;
        if (this.phase >= 1) {
            this.phase -= 1; // Loop back smoothly
        }
        
        // Draw moon
        this.drawMoon();
        
        // Continue animation
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize moon animation
new MoonAnimation();