// Starry background with twinkling effect and shooting stars
class StarryBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stars = [];
        this.numStars = 150;
        this.shootingStars = [];
        this.lastShootingStarTime = 0;
        
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
    
    createShootingStar() {
        // Create shooting star at random position on top or left edge
        const startFromTop = Math.random() > 0.5;
        let startX, startY;
        
        if (startFromTop) {
            // Start from top edge
            startX = Math.random() * this.canvas.width * 0.8; // Left 80% of top edge
            startY = -10;
        } else {
            // Start from left edge
            startX = -10;
            startY = Math.random() * this.canvas.height * 0.5; // Top 50% of left edge
        }
        
        this.shootingStars.push({
            x: startX,
            y: startY,
            length: 150 + Math.random() * 200, // Much longer trail
            speed: 1.5 + Math.random() * 1.5, // Even slower speed
            opacity: 1,
            thickness: 1.5 + Math.random() * 1
        });
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
        
        // Update shooting stars
        const currentTime = Date.now();
        
        // Create new shooting star sporadically (average every 3-6 seconds)
        if (currentTime - this.lastShootingStarTime > 3000 + Math.random() * 3000) {
            this.createShootingStar();
            this.lastShootingStarTime = currentTime;
        }
        
        // Update existing shooting stars
        this.shootingStars = this.shootingStars.filter(shootingStar => {
            // Move diagonally from top left to bottom right
            shootingStar.x += shootingStar.speed;
            shootingStar.y += shootingStar.speed * 0.7; // Slightly less vertical than horizontal
            
            // Fade out
            shootingStar.opacity -= 0.005; // Even slower fade for longer trails
            
            // Remove if off screen or faded
            return shootingStar.x < this.canvas.width + shootingStar.length && 
                   shootingStar.y < this.canvas.height + shootingStar.length &&
                   shootingStar.opacity > 0;
        });
    }
    
    drawStars() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw regular stars
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
        
        // Draw shooting stars
        this.shootingStars.forEach(shootingStar => {
            this.ctx.save();
            
            // Calculate angle for the trail (now going down-right)
            const angle = Math.atan2(shootingStar.speed * 0.7, shootingStar.speed);
            
            // Draw the trail with gradient
            const gradient = this.ctx.createLinearGradient(
                shootingStar.x, shootingStar.y,
                shootingStar.x - Math.cos(angle) * shootingStar.length,
                shootingStar.y - Math.sin(angle) * shootingStar.length
            );
            
            gradient.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`);
            gradient.addColorStop(0.4, `rgba(255, 255, 220, ${shootingStar.opacity * 0.6})`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = shootingStar.thickness;
            this.ctx.lineCap = 'round';
            
            this.ctx.beginPath();
            this.ctx.moveTo(shootingStar.x, shootingStar.y);
            this.ctx.lineTo(
                shootingStar.x - Math.cos(angle) * shootingStar.length,
                shootingStar.y - Math.sin(angle) * shootingStar.length
            );
            this.ctx.stroke();
            
            // Draw bright head of shooting star
            this.ctx.globalAlpha = shootingStar.opacity;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(shootingStar.x, shootingStar.y, shootingStar.thickness * 1.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add glow to head
            const headGlow = this.ctx.createRadialGradient(
                shootingStar.x, shootingStar.y, 0,
                shootingStar.x, shootingStar.y, shootingStar.thickness * 4
            );
            headGlow.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity * 0.8})`);
            headGlow.addColorStop(0.5, `rgba(255, 255, 220, ${shootingStar.opacity * 0.3})`);
            headGlow.addColorStop(1, 'transparent');
            this.ctx.fillStyle = headGlow;
            this.ctx.beginPath();
            this.ctx.arc(shootingStar.x, shootingStar.y, shootingStar.thickness * 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
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