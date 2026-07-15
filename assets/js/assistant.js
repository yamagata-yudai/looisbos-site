document.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('desktop-os')) return;

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
    }

    function dismiss() {
        assistant.classList.remove('bee-visible');
        clearInterval(cycleTimer);
        clearInterval(typeTimer);
    }

    sprite.addEventListener('click', () => {
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
