document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initStarfield();
    initVisitorCounter();
    initPopup();
    initBalloon();
});

/* ----------------------------------------------------------
   3. Custom cursor + sparkle trail
   ---------------------------------------------------------- */
function initCursor() {
    const cursor = document.getElementById('y2k-cursor');
    if (!cursor) return;
    // タッチデバイス（スマホ・タブレット）ではスキップ
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const COLORS = ['#00f0ff', '#ff00cc', '#00ff88', '#ffd700', '#ffffff'];
    let lastSpark = 0;
    let hasMoved = false;

    // マウスが画面に入るまで非表示
    cursor.style.opacity = '0';

    document.addEventListener('mousemove', e => {
        cursor.style.left    = e.clientX + 'px';
        cursor.style.top     = e.clientY + 'px';

        // 初回 mousemove で表示
        if (!hasMoved) {
            cursor.style.opacity = '1';
            hasMoved = true;
        }

        const now = Date.now();
        if (now - lastSpark < 45) return;
        lastSpark = now;

        const spark = document.createElement('div');
        spark.className = 'y2k-spark';
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const tx = ((Math.random() - .5) * 36).toFixed(1) + 'px';
        const ty = ((Math.random() - .5) * 36).toFixed(1) + 'px';
        spark.style.left       = e.clientX + 'px';
        spark.style.top        = e.clientY + 'px';
        spark.style.background = color;
        spark.style.boxShadow  = '0 0 5px ' + color;
        spark.style.setProperty('--tx', tx);
        spark.style.setProperty('--ty', ty);
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 600);
    });

    // ウィンドウ外に出たら非表示、戻ったら表示
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

/* ----------------------------------------------------------
   2. Background starfield — 3ティア星空 + 流れ星
   ---------------------------------------------------------- */
function initStarfield() {
    const canvas = document.getElementById('y2k-stars-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const stars = [];
    const shootingStars = [];
    let raf;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
        stars.length = 0;
        // Tier 1: 小さく暗い星（多め）
        for (let i = 0; i < 220; i++) {
            stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                r: Math.random() * .8 + .2, speed: Math.random() * .08 + .02,
                phase: Math.random() * Math.PI * 2, bright: false });
        }
        // Tier 2: 中くらいの星
        for (let i = 0; i < 80; i++) {
            stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                r: Math.random() * 1.2 + .8, speed: Math.random() * .06 + .02,
                phase: Math.random() * Math.PI * 2, bright: false });
        }
        // Tier 3: 明るい大きな星（少数）
        for (let i = 0; i < 25; i++) {
            stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height,
                r: Math.random() * 1.5 + 1.5, speed: Math.random() * .04 + .01,
                phase: Math.random() * Math.PI * 2, bright: true });
        }
    }
    resize();
    window.addEventListener('resize', resize);

    function spawnShootingStar() {
        shootingStars.push({
            x: Math.random() * canvas.width * .6,
            y: Math.random() * canvas.height * .4,
            len: Math.random() * 120 + 60,
            speed: Math.random() * 8 + 6,
            opacity: 1,
            angle: Math.PI / 4 + (Math.random() - .5) * .3
        });
    }

    // 8〜18秒おきにランダムで流れ星
    setInterval(() => { if (Math.random() > .3) spawnShootingStar(); },
        8000 + Math.random() * 10000);

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const t = Date.now() * .001;

        stars.forEach(s => {
            const twinkle = Math.sin(t * (s.bright ? 1.2 : 2.0) + s.phase);
            const opacity = s.bright
                ? .55 + twinkle * .4
                : .25 + twinkle * .18;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            if (s.bright) {
                ctx.shadowColor = 'rgba(180,220,255,.9)';
                ctx.shadowBlur  = 6;
            }
            ctx.fillStyle = 'rgba(210,235,255,' + Math.max(0, opacity) + ')';
            ctx.fill();
            ctx.shadowBlur = 0;
            s.y += s.speed;
            if (s.y > canvas.height) { s.y = -2; s.x = Math.random() * canvas.width; }
        });

        // 流れ星
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            const ex = ss.x + Math.cos(ss.angle) * ss.len;
            const ey = ss.y + Math.sin(ss.angle) * ss.len;
            const grad = ctx.createLinearGradient(ss.x, ss.y, ex, ey);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(1, 'rgba(255,255,255,' + ss.opacity + ')');
            ctx.beginPath();
            ctx.moveTo(ss.x, ss.y);
            ctx.lineTo(ex, ey);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ss.x += Math.cos(ss.angle) * ss.speed;
            ss.y += Math.sin(ss.angle) * ss.speed;
            ss.opacity -= .018;
            if (ss.opacity <= 0) shootingStars.splice(i, 1);
        }

        raf = requestAnimationFrame(draw);
    }
    draw();

    window.addEventListener('screensaverShow', () => cancelAnimationFrame(raf));
    window.addEventListener('screensaverHide', () => { raf = requestAnimationFrame(draw); });
}

/* ----------------------------------------------------------
   8. Visitor counter (localStorage)
   ---------------------------------------------------------- */
function initVisitorCounter() {
    const el = document.getElementById('y2k-visitor-count');
    if (!el) return;
    let count = parseInt(localStorage.getItem('lb_visits') || '8471', 10);
    count = isNaN(count) ? 8472 : count + 1;
    if (count > 9999999) count = 1;
    localStorage.setItem('lb_visits', String(count));
    el.textContent = String(count).padStart(7, '0');

    const todayEl = document.getElementById('y2k-visitor-today');
    if (!todayEl) return;
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    let todayCount;
    if (localStorage.getItem('lb_visits_today_date') === todayStr) {
        todayCount = parseInt(localStorage.getItem('lb_visits_today_count') || '0', 10) + 1;
        if (isNaN(todayCount) || todayCount > 9999) todayCount = 1;
    } else {
        todayCount = 1;
        localStorage.setItem('lb_visits_today_date', todayStr);
    }
    localStorage.setItem('lb_visits_today_count', String(todayCount));
    todayEl.textContent = String(todayCount).padStart(4, '0');
}

/* ----------------------------------------------------------
   10. Fake popup — 自動表示 + ドラッグ
   ---------------------------------------------------------- */
function initPopup() {
    const popup = document.getElementById('y2k-popup');
    if (!popup) return;

    // 起動アニメーション終了後 (~5s) + 2s の計 7s 後に表示
    // sessionStorage で1回のみ表示
    if (!sessionStorage.getItem('lb_popup_shown')) {
        setTimeout(() => {
            popup.classList.add('visible');
            sessionStorage.setItem('lb_popup_shown', '1');
        }, 7000);
    }

    // 閉じるボタン
    popup.querySelectorAll('.y2k-popup-close').forEach(btn => {
        btn.addEventListener('click', () => popup.classList.remove('visible'));
    });

    // PCのみドラッグ有効（スマホは中央固定のまま）
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouch) {
        const titleBar = popup.querySelector('.title-bar');
        let dragging = false, dx = 0, dy = 0;

        titleBar.addEventListener('mousedown', e => {
            if (e.target.closest('.window-btn')) return;
            dragging = true;
            popup.style.transform = 'none';
            const rect = popup.getBoundingClientRect();
            dx = e.clientX - rect.left;
            dy = e.clientY - rect.top;
            e.preventDefault();
        });

        document.addEventListener('mousemove', e => {
            if (!dragging) return;
            popup.style.left = (e.clientX - dx) + 'px';
            popup.style.top  = (e.clientY - dy) + 'px';
        });

        document.addEventListener('mouseup', () => { dragging = false; });
    }
}

/* ----------------------------------------------------------
   11. Tray balloon — リリース通知
   ---------------------------------------------------------- */
function initBalloon() {
    const balloon = document.getElementById('y2k-balloon');
    if (!balloon) return;

    let hideTimer = null;
    const hide = () => {
        balloon.classList.remove('show');
        if (hideTimer) clearTimeout(hideTimer);
    };

    if (!sessionStorage.getItem('lb_balloon_shown')) {
        setTimeout(() => {
            balloon.classList.add('show');
            sessionStorage.setItem('lb_balloon_shown', '1');
            hideTimer = setTimeout(hide, 8000);
        }, 12000);
    }

    const closeBtn = balloon.querySelector('.y2k-balloon-close');
    if (closeBtn) closeBtn.addEventListener('click', hide);
}
