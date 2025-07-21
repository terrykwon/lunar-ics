// Moon animation with dark circle passing over glowing circle
class MoonAnimation {
    constructor() {
        this.container = null;
        this.moonCanvas = null;
        this.ctx = null;
        this.phase = 0;
        this.animationSpeed = 0.0008; // Complete cycle every ~21 seconds
        
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
        // Find the existing moon container
        this.container = document.getElementById('moonContainer');
        if (!this.container) return;
        
        // Create canvas for moon
        this.moonCanvas = document.createElement('canvas');
        
        // Get device pixel ratio for sharp rendering
        const dpr = window.devicePixelRatio || 1;
        
        // Get container dimensions
        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;
        
        // Set canvas size to match container
        this.moonCanvas.width = containerWidth * dpr;
        this.moonCanvas.height = containerHeight * dpr;
        this.moonCanvas.style.cssText = `
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
        `;
        
        this.ctx = this.moonCanvas.getContext('2d');
        this.ctx.scale(dpr, dpr);
        this.container.appendChild(this.moonCanvas);
        
        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
        
        // Start animation
        this.animate();
    }
    
    handleResize() {
        const dpr = window.devicePixelRatio || 1;
        const containerWidth = this.container.offsetWidth;
        const containerHeight = this.container.offsetHeight;
        
        this.moonCanvas.width = containerWidth * dpr;
        this.moonCanvas.height = containerHeight * dpr;
        this.ctx.scale(dpr, dpr);
    }
    
    drawMoon() {
        const ctx = this.ctx;
        const canvasWidth = this.container.offsetWidth;
        const canvasHeight = this.container.offsetHeight;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const radius = Math.min(canvasWidth, canvasHeight) * 0.2; // 40% of container size
        
        // Clear canvas
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        // Save context state
        ctx.save();
        
        // Create clipping mask for glow (larger than moon to show glow around edges)
        const glowRadius = radius + (radius * 0.75);
        
        // Draw glow first (before clipping)
        const glowGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, glowRadius);
        glowGradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
        glowGradient.addColorStop(0.3, 'rgba(255, 255, 200, 0.4)');
        glowGradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.2)');
        glowGradient.addColorStop(0.7, 'rgba(150, 150, 255, 0.1)');
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
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
        // Mare regions (scale with moon size)
        ctx.beginPath();
        ctx.arc(centerX + radius * 0.3, centerY - radius * 0.2, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX - radius * 0.2, centerY + radius * 0.3, radius * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + radius * 0.1, centerY + radius * 0.4, radius * 0.125, 0, Math.PI * 2);
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
        const travelDistance = radius * 3.2; // Reduced distance so moon is covered more often
        
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