/**
 * Screensaver - Starfield animation and idle detection
 */
class Screensaver {
    constructor(canvasId, timeoutMinutes = 3) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.timeout = timeoutMinutes * 60 * 1000;
        this.idleTimer = null;
        this.isActive = false;
        this.stars = [];
        this.numStars = 400;
        this.speed = 2;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Activity listeners
        const resetTimer = () => this.onActivity();
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('mousedown', resetTimer);
        window.addEventListener('keydown', resetTimer);
        window.addEventListener('touchstart', resetTimer);

        this.startIdleTimer();
        this.createStars();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createStars() {
        this.stars = [];
        for (let i = 0; i < this.numStars; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width - this.canvas.width / 2,
                y: Math.random() * this.canvas.height - this.canvas.height / 2,
                z: Math.random() * this.canvas.width,
                o: Math.random() // opacity/depth factor
            });
        }
    }

    startIdleTimer() {
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => this.show(), this.timeout);
    }

    onActivity() {
        if (this.isActive) {
            this.hide();
        }
        this.startIdleTimer();
    }

    show() {
        this.isActive = true;
        this.canvas.style.display = 'block';
        this.canvas.style.opacity = '1';
        this.animate();
        document.body.style.overflow = 'hidden';
    }

    hide() {
        this.isActive = false;
        this.canvas.style.display = 'none';
        this.canvas.style.opacity = '0';
        document.body.style.overflow = 'auto';
    }

    animate() {
        if (!this.isActive) return;

        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;

        this.stars.forEach(star => {
            star.z -= this.speed;
            if (star.z <= 0) {
                star.z = this.canvas.width;
                star.x = Math.random() * this.canvas.width - cx;
                star.y = Math.random() * this.canvas.height - cy;
            }

            const sx = (star.x / star.z) * cx + cx;
            const sy = (star.y / star.z) * cy + cy;
            const size = (1 - star.z / this.canvas.width) * 3;

            this.ctx.fillStyle = `rgba(255, 255, 255, ${1 - star.z / this.canvas.width})`;
            this.ctx.beginPath();
            this.ctx.arc(sx, sy, size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Screensaver with 3-minute timeout
    window.systemScreensaver = new Screensaver('screensaver-canvas', 3);
});
