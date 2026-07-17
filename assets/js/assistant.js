document.addEventListener('DOMContentLoaded', () => {
    const assistant = document.getElementById('bee-assistant');
    const balloon = document.getElementById('bee-balloon');
    const balloonText = document.getElementById('bee-balloon-text');
    const sprite = document.getElementById('bee-sprite');
    const closeBtn = document.getElementById('bee-balloon-close');
    const menuItem = document.getElementById('assistant-item');
    if (!assistant || !balloon || !balloonText || !sprite) return;

    const lines = [
        'やあ！ぼくはルイビー🐝 Looisbosの案内係だよ',
        'アイコンをダブルクリックするとウィンドウが開くよ',
        'My Pictures にメンバーの写真が入ってるよ📁',
        'ウィンドウはタイトルバーを掴んで動かせるよ',
        '3分間なにもしないとスクリーンセーバーが始まるよ',
        '新EP『Groceries』ぜったい聴いてね！🎵',
        '7/25(土)は初ワンマン "Siesta Bis" @吉祥寺DAYDREAM🎫',
        '"Teenage" のMVがYouTubeで公開中だよ！',
        'ルイボスティーはノンカフェイン。夜中でも安心🍵',
        'Looisbosの名前はルイボス（rooibos）が由来なんだ',
        'バンドは東京・白山の大学の喫茶店で生まれたんだって',
        'スタートメニューの Shut Down は押しても大丈夫…たぶん',
    ];

    let lineIndex = -1;
    let typeTimer = null;
    let cycleTimer = null;

    const desktop = document.body.classList.contains('desktop-os');
    const WANDER_DELAY_MIN = 180000;
    const WANDER_DELAY_RANGE = 120000;
    let wanderTimer = null;
    let wanderRaf = null;
    let wandering = false;

    function scheduleWander() {
        if (!desktop) return;
        clearTimeout(wanderTimer);
        wanderTimer = setTimeout(startWander, WANDER_DELAY_MIN + Math.random() * WANDER_DELAY_RANGE);
    }

    function stopWander(reschedule) {
        wandering = false;
        cancelAnimationFrame(wanderRaf);
        assistant.classList.remove('bee-walking');
        sprite.classList.remove('bee-face-right');
        assistant.style.transform = '';
        if (reschedule) scheduleWander();
    }

    function startWander() {
        if (!assistant.classList.contains('bee-visible')) {
            scheduleWander();
            return;
        }
        wandering = true;
        assistant.classList.add('bee-walking');
        const range = Math.max(window.innerWidth - 280, 200);
        const duration = 7000;
        const t0 = performance.now();
        const step = (now) => {
            if (!wandering) return;
            const p = (now - t0) / duration;
            if (p >= 1) {
                stopWander(true);
                return;
            }
            const q = p < .5 ? p * 2 : (1 - p) * 2;
            const ease = q * q * (3 - 2 * q);
            const x = -range * ease;
            const y = -Math.sin(p * Math.PI * 6) * 24 - Math.sin(p * Math.PI) * 46;
            sprite.classList.toggle('bee-face-right', p >= .5);
            assistant.style.transform = `translate(${x}px, ${y}px)`;
            wanderRaf = requestAnimationFrame(step);
        };
        wanderRaf = requestAnimationFrame(step);
    }

    function typeLine(text) {
        clearInterval(typeTimer);
        balloonText.textContent = '';
        let i = 0;
        typeTimer = setInterval(() => {
            balloonText.textContent = text.slice(0, ++i);
            if (i >= text.length) clearInterval(typeTimer);
        }, 40);
    }

    function nextLine() {
        let next;
        do {
            next = Math.floor(Math.random() * lines.length);
        } while (next === lineIndex && lines.length > 1);
        lineIndex = next;
        typeLine(lines[lineIndex]);
    }

    function hop() {
        sprite.classList.remove('bee-hop');
        void sprite.offsetWidth;
        sprite.classList.add('bee-hop');
    }

    function startCycle() {
        clearInterval(cycleTimer);
        cycleTimer = setInterval(() => {
            hop();
            nextLine();
        }, 15000);
    }

    function summon() {
        assistant.classList.add('bee-visible');
        typeLine(lines[0]);
        lineIndex = 0;
        startCycle();
        scheduleWander();
    }

    function dismiss() {
        assistant.classList.remove('bee-visible');
        clearInterval(cycleTimer);
        clearInterval(typeTimer);
        stopWander(false);
        clearTimeout(wanderTimer);
    }

    sprite.addEventListener('click', () => {
        if (wandering) stopWander(true);
        hop();
        nextLine();
        startCycle();
    });
    sprite.addEventListener('animationend', (e) => {
        if (e.animationName === 'bee-hop') sprite.classList.remove('bee-hop');
    });

    if (closeBtn) closeBtn.addEventListener('click', dismiss);

    if (menuItem) {
        menuItem.addEventListener('click', () => {
            const startMenu = document.getElementById('start-menu');
            if (startMenu) startMenu.classList.remove('open');
            if (assistant.classList.contains('bee-visible')) {
                hop();
                nextLine();
                startCycle();
            } else {
                summon();
            }
        });
    }

    setTimeout(summon, 6000);
});
