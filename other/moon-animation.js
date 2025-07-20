// Moon animation with realistic waxing and waning phases
class MoonAnimation {
    constructor() {
        this.container = null;
        this.moonCanvas = null;
        this.ctx = null;
        this.phase = 0;
        this.glowIntensity = 0.5;
        this.glowDirection = 1;
        
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
            position: absolute;
            width: 200px;
            height: 200px;
            left: -120px;
            top: 50%;
            transform: translateY(-50%);
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
        
        // Make h1 relative positioned if not already
        h1.style.position = 'relative';
        h1.appendChild(this.container);
        
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
                    position: static !important;
                    display: inline-block !important;
                    margin-right: 10px !important;
                    vertical-align: middle !important;
                    transform: none !important;
                }
                h1 {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
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
        
        // Draw glow
        const glowRadius = radius + 20 + (this.glowIntensity * 10);
        const gradient = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, glowRadius);
        gradient.addColorStop(0, `rgba(255, 255, 200, ${this.glowIntensity * 0.3})`);
        gradient.addColorStop(0.4, `rgba(255, 255, 200, ${this.glowIntensity * 0.2})`);
        gradient.addColorStop(0.7, `rgba(200, 200, 255, ${this.glowIntensity * 0.1})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 200, 200);
        
        // Draw moon base (lit part)
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
        moonGradient.addColorStop(0, '#fffef0');
        moonGradient.addColorStop(0.6, '#fff8dc');
        moonGradient.addColorStop(1, '#f0e68c');
        ctx.fillStyle = moonGradient;
        ctx.fill();
        
        // Draw moon surface details
        ctx.globalAlpha = 0.1;
        this.drawCraters(ctx, centerX, centerY, radius);
        ctx.globalAlpha = 1;
        
        // Draw shadow for moon phases
        this.drawPhase(ctx, centerX, centerY, radius);
        
        // Draw edge highlight
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }
    
    drawCraters(ctx, centerX, centerY, radius) {
        // Simple crater representation
        const craters = [
            { x: 0.3, y: -0.2, r: 0.15 },
            { x: -0.2, y: 0.3, r: 0.1 },
            { x: 0.1, y: 0.4, r: 0.12 },
            { x: -0.4, y: -0.1, r: 0.08 }
        ];
        
        ctx.fillStyle = '#d4d4aa';
        craters.forEach(crater => {
            ctx.beginPath();
            ctx.arc(
                centerX + crater.x * radius,
                centerY + crater.y * radius,
                crater.r * radius,
                0,
                Math.PI * 2
            );
            ctx.fill();
        });
    }
    
    drawPhase(ctx, centerX, centerY, radius) {
        // Phase: 0 = new moon, 0.25 = first quarter, 0.5 = full moon, 0.75 = last quarter
        const phase = this.phase;
        
        ctx.save();
        
        // Clip to moon circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.clip();
        
        // Full moon - no shadow
        if (Math.abs(phase - 0.5) < 0.02) {
            ctx.restore();
            return;
        }
        
        // New moon - full shadow
        if (phase < 0.02 || phase > 0.98) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(centerX - radius - 5, centerY - radius - 5, radius * 2 + 10, radius * 2 + 10);
            ctx.restore();
            return;
        }
        
        // Calculate illumination based on phase
        let illuminated;
        if (phase < 0.5) {
            // Waxing: right side lit, left side dark
            illuminated = phase * 2; // 0 to 1
            
            // Draw left shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(centerX - radius - 5, centerY - radius - 5, radius + 5, radius * 2 + 10);
            
            // Draw curved shadow/light boundary
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radius * (1 - illuminated * 2), radius, 0, -Math.PI/2, Math.PI/2);
            ctx.fillStyle = illuminated < 0.5 ? 'rgba(0, 0, 0, 0.9)' : '#fff8dc';
            ctx.fill();
        } else {
            // Waning: left side lit, right side dark
            illuminated = (phase - 0.5) * 2; // 0 to 1
            
            // Draw right shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(centerX, centerY - radius - 5, radius + 5, radius * 2 + 10);
            
            // Draw curved shadow/light boundary
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radius * (illuminated * 2 - 1), radius, 0, -Math.PI/2, Math.PI/2);
            ctx.fillStyle = illuminated < 0.5 ? '#fff8dc' : 'rgba(0, 0, 0, 0.9)';
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    animate() {
        // Update phase (complete cycle every 60 seconds)
        this.phase += 0.0003;
        if (this.phase > 1) this.phase = 0;
        
        // Update glow pulsing (slower)
        this.glowIntensity += 0.002 * this.glowDirection;
        if (this.glowIntensity > 1 || this.glowIntensity < 0.3) {
            this.glowDirection *= -1;
        }
        
        // Draw moon
        this.drawMoon();
        
        // Continue animation
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize moon animation
new MoonAnimation();