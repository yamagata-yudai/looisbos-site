document.addEventListener('DOMContentLoaded', () => {
    initCursor();
    initStarfield();
    initVisitorCounter();
    initPopup();
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
   2. Subtle background starfield
   ---------------------------------------------------------- */
function initStarfield() {
    const canvas = document.getElementById('y2k-stars-bg');
    if (!canvas) return;
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const ctx = canvas.getContext('2d');
    const stars = [];
    let raf;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 160; i++) {
        stars.push({
            x:     Math.random() * window.innerWidth,
            y:     Math.random() * window.innerHeight,
            r:     Math.random() * 1.3 + .2,
            speed: Math.random() * .22 + .05,
            phase: Math.random() * Math.PI * 2
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const t = Date.now() * .001;
        stars.forEach(s => {
            const opacity = .28 + Math.sin(t * .7 + s.phase) * .22;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(200,230,255,' + opacity + ')';
            ctx.fill();
            s.y += s.speed;
            if (s.y > canvas.height) {
                s.y = 0;
                s.x = Math.random() * canvas.width;
            }
        });
        raf = requestAnimationFrame(draw);
    }
    draw();

    // スクリーンセーバー起動中は停止
    window.addEventListener('screensaverShow', () => cancelAnimationFrame(raf));
    window.addEventListener('screensaverHide', () => draw());
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

    // タイトルバーでドラッグ
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
