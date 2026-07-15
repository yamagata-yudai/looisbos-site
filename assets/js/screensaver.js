/**
 * Screensaver — ロゴがふわっと出現し、漂いながらカラーグロー
 */
class Screensaver {
    constructor(canvasId, timeoutMinutes = 3) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx       = this.canvas.getContext('2d');
        this.timeout   = timeoutMinutes * 60 * 1000;
        this.idleTimer = null;
        this.isActive  = false;
        this.raf       = null;

        // 背景の星
        this.stars = [];

        // ロゴ
        this.logo       = new Image();
        this.logo.src   = 'assets/images/logo.png';
        this.logoW      = 320;
        this.logoH      = 0;   // ロード後に計算
        this.logoReady  = false;
        this.logo.onload = () => {
            this.logoH     = this.logoW * (this.logo.naturalHeight / this.logo.naturalWidth);
            this.logoReady = true;
        };

        // ロゴのフェーズ管理
        this.phase    = 'fadein';   // 'fadein' → 'drift'
        this.opacity  = 0;
        this.scale    = 0.4;
        this.frame    = 0;

        // ドリフト
        this.lx = 0; this.ly = 0;
        this.vx = 1.4; this.vy = 1.1;

        // グロー色
        this.hue = 180;

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());

        const reset = () => this.onActivity();
        window.addEventListener('mousemove',   reset);
        window.addEventListener('mousedown',   reset);
        window.addEventListener('keydown',     reset);
        window.addEventListener('touchstart',  reset);

        this.startIdleTimer();
    }

    resize() {
        this.canvas.width  = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.buildStars();
        // ロゴ初期位置をリセット
        if (this.logoReady) {
            this.lx = (this.canvas.width  - this.logoW) / 2;
            this.ly = (this.canvas.height - this.logoH) / 2;
        }
    }

    buildStars() {
        this.stars = [];
        const n = Math.floor(this.canvas.width * this.canvas.height / 4000);
        for (let i = 0; i < n; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                r: Math.random() * 1.4 + .2,
                ph: Math.random() * Math.PI * 2
            });
        }
    }

    startIdleTimer() {
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => this.show(), this.timeout);
    }

    onActivity() {
        if (this.isActive) this.hide();
        this.startIdleTimer();
    }

    show() {
        this.isActive = true;
        this.canvas.style.display = 'block';
        this.canvas.style.opacity = '1';
        document.body.style.overflow = 'hidden';

        // 毎回フェードインからリスタート
        this.phase   = 'fadein';
        this.opacity = 0;
        this.scale   = 0.4;
        this.frame   = 0;
        this.lx = (this.canvas.width  - this.logoW) / 2;
        this.ly = (this.canvas.height - (this.logoH || 80)) / 2;
        this.hue = Math.random() * 360;

        window.dispatchEvent(new Event('screensaverShow'));
        this.animate();
    }

    hide() {
        this.isActive = false;
        cancelAnimationFrame(this.raf);
        this.canvas.style.display = 'none';
        this.canvas.style.opacity = '0';
        document.body.style.overflow = 'auto';
        window.dispatchEvent(new Event('screensaverHide'));
    }

    drawStars(t) {
        const ctx = this.ctx;
        this.stars.forEach(s => {
            const op = .2 + Math.sin(t * 1.5 + s.ph) * .18;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(210,235,255,${Math.max(0, op)})`;
            ctx.fill();
        });
    }

    animate() {
        if (!this.isActive) return;

        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;
        const t = Date.now() * .001;

        // 背景
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        this.drawStars(t);

        if (!this.logoReady) {
            this.raf = requestAnimationFrame(() => this.animate());
            return;
        }

        this.frame++;
        const FADE_FRAMES = 90;  // ~1.5秒でフェードイン

        if (this.phase === 'fadein') {
            this.opacity = Math.min(1, this.frame / FADE_FRAMES);
            this.scale   = 0.4 + this.opacity * 0.6;
            if (this.frame >= FADE_FRAMES + 20) {
                this.phase = 'drift';
                // ドリフト開始位置を中央に
                this.lx = (W - this.logoW) / 2;
                this.ly = (H - this.logoH) / 2;
            }
        }

        if (this.phase === 'drift') {
            // 移動
            this.lx += this.vx;
            this.ly += this.vy;

            // 壁で反射 + グロー色変更
            if (this.lx <= 0) {
                this.lx = 0; this.vx = Math.abs(this.vx);
                this.hue = (this.hue + 60 + Math.random() * 60) % 360;
            }
            if (this.lx + this.logoW >= W) {
                this.lx = W - this.logoW; this.vx = -Math.abs(this.vx);
                this.hue = (this.hue + 60 + Math.random() * 60) % 360;
            }
            if (this.ly <= 0) {
                this.ly = 0; this.vy = Math.abs(this.vy);
                this.hue = (this.hue + 60 + Math.random() * 60) % 360;
            }
            if (this.ly + this.logoH >= H) {
                this.ly = H - this.logoH; this.vy = -Math.abs(this.vy);
                this.hue = (this.hue + 60 + Math.random() * 60) % 360;
            }

            // グロー色をゆっくり変化
            this.hue = (this.hue + .4) % 360;
        }

        // ロゴ描画
        ctx.save();

        if (this.phase === 'fadein') {
            ctx.translate(W / 2, H / 2);
            ctx.scale(this.scale, this.scale);
            ctx.translate(-this.logoW / 2, -this.logoH / 2);
        } else {
            ctx.translate(this.lx, this.ly);
        }

        ctx.globalAlpha = this.opacity;

        // グロー (多重shadow)
        const glowColor = `hsl(${this.hue},100%,65%)`;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur  = 30;
        ctx.filter      = 'invert(1)';
        ctx.drawImage(this.logo, 0, 0, this.logoW, this.logoH);

        // さらに強いグロー（2回重ね塗り）
        ctx.shadowBlur = 60;
        ctx.drawImage(this.logo, 0, 0, this.logoW, this.logoH);

        ctx.restore();
        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;
        ctx.filter      = 'none';

        this.raf = requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('desktop-os')) return;
    window.systemScreensaver = new Screensaver('screensaver-canvas', 3);
});
