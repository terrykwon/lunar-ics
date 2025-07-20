// Starry background with twinkling effect
class StarryBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.numStars = 200;
        
        this.init();
    }
    
    init() {
        // Setup canvas
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        
        // Insert canvas at the beginning of body
        document.body.insertBefore(this.canvas, document.body.firstChild);
        
        // Setup resize handler
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Create stars
        this.createStars();
        
        // Start animation
        this.animate();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createStars() {
        this.stars = [];
        
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random(),
                twinkleSpeed: Math.random() * 0.005 + 0.002,
                color: this.getStarColor()
            });
        }
    }
    
    getStarColor() {
        const colors = [
            '#ffffff', // White
            '#ffe9c4', // Warm white
            '#c4e9ff', // Cool white
            '#ffd4d4', // Slight red
            '#d4d4ff'  // Slight blue
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    updateStars() {
        this.stars.forEach(star => {
            // Twinkle effect
            star.opacity += star.twinkleSpeed;
            if (star.opacity > 1) {
                star.opacity = 1;
                star.twinkleSpeed = -star.twinkleSpeed;
            } else if (star.opacity < 0) {
                star.opacity = 0;
                star.twinkleSpeed = -star.twinkleSpeed;
            }
            
            // Slow drift
            star.x += 0.05;
            if (star.x > this.canvas.width) {
                star.x = 0;
            }
        });
    }
    
    drawStars() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.stars.forEach(star => {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = star.opacity;
            this.ctx.fill();
            
            // Add glow effect for brighter stars
            if (star.opacity > 0.8) {
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
                const gradient = this.ctx.createRadialGradient(
                    star.x, star.y, 0,
                    star.x, star.y, star.radius * 2
                );
                gradient.addColorStop(0, star.color + '40');
                gradient.addColorStop(1, 'transparent');
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
            }
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    animate() {
        this.updateStars();
        this.drawStars();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StarryBackground();
});