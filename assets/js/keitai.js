document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('desktop-os')) return;
    document.body.classList.add('keitai');

    const pad = n => String(n).padStart(2, '0');
    const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const barClock = document.getElementById('keitai-clock');
    const standbyClock = document.getElementById('keitai-standby-clock');
    const standbyDate = document.getElementById('keitai-standby-date');

    function tick() {
        const now = new Date();
        const t = `${now.getHours()}:${pad(now.getMinutes())}`;
        if (barClock) barClock.textContent = t;
        if (standbyClock) standbyClock.textContent = t;
        if (standbyDate) standbyDate.textContent =
            `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} (${DAYS[now.getDay()]})`;
    }
    tick();
    setInterval(tick, 1000);

    const mail = document.getElementById('keitai-mail');
    if (mail) {
        let mailTimer = null;
        const hideMail = () => {
            mail.classList.remove('show');
            clearTimeout(mailTimer);
        };
        if (!sessionStorage.getItem('lb_kmail_shown')) {
            setTimeout(() => {
                mail.classList.add('show');
                sessionStorage.setItem('lb_kmail_shown', '1');
                mailTimer = setTimeout(hideMail, 10000);
            }, 9000);
        }
        mail.addEventListener('click', (e) => {
            hideMail();
            if (e.target.closest('.keitai-mail-close')) return;
            const news = document.getElementById('news');
            if (news) news.scrollIntoView({ behavior: 'smooth' });
        });
    }

    let currentApp = null;
    let savedScrollY = 0;
    function openApp(id) {
        const win = document.getElementById(id);
        if (!win || currentApp) return;
        currentApp = win;
        savedScrollY = window.scrollY;
        win.classList.add('keitai-app');
        document.body.classList.add('keitai-app-open');
        requestAnimationFrame(() => requestAnimationFrame(() => win.classList.add('keitai-app-in')));
    }
    function closeApp() {
        if (!currentApp) return;
        const win = currentApp;
        currentApp = null;
        win.classList.remove('keitai-app-in');
        document.body.classList.remove('keitai-app-open');
        window.scrollTo({ top: savedScrollY, behavior: 'instant' });
        setTimeout(() => win.classList.remove('keitai-app'), 320);
    }
    document.querySelectorAll('.desktop-icon.app-icon[data-window]').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            openApp(icon.dataset.window);
        });
    });
    document.querySelectorAll('.window .window-btn[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (btn.dataset.action === 'close' || btn.dataset.action === 'minimize') closeApp();
        });
    });

    const standby = document.getElementById('keitai-standby');
    let standbyActive = false;
    let idleTimer = null;

    function startIdle() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            standbyActive = true;
            standby.classList.add('on');
        }, 180000);
    }
    if (standby) {
        ['touchstart', 'scroll', 'click', 'keydown'].forEach(ev =>
            window.addEventListener(ev, () => {
                if (standbyActive) {
                    standbyActive = false;
                    standby.classList.remove('on');
                }
                startIdle();
            }, { passive: true }));
        startIdle();
    }

    const pull = document.getElementById('keitai-pull');
    let pullStartY = null;
    let pullDist = 0;

    function resetPull() {
        pullStartY = null;
        pullDist = 0;
        if (pull) {
            pull.style.opacity = '0';
            pull.style.transform = 'none';
            pull.classList.remove('ready');
        }
    }
    document.addEventListener('touchstart', (e) => {
        pullStartY = (window.scrollY <= 0 && !currentApp && !standbyActive)
            ? e.touches[0].clientY : null;
        pullDist = 0;
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
        if (pullStartY === null || !pull) return;
        pullDist = e.touches[0].clientY - pullStartY;
        const d = Math.min(Math.max(pullDist - 14, 0), 130);
        if (d <= 0) {
            resetPull();
            pullStartY = e.touches[0].clientY;
            return;
        }
        pull.style.opacity = String(Math.min(d / 80, 1));
        pull.style.transform = `translateY(${Math.round(d * .55)}px)`;
        const ready = d >= 90;
        pull.textContent = ready ? '↻ 離すと再起動します' : '↓ 引っ張って再起動';
        pull.classList.toggle('ready', ready);
    }, { passive: true });
    document.addEventListener('touchend', () => {
        if (pullStartY !== null && pullDist - 14 >= 90) {
            location.reload();
            return;
        }
        resetPull();
    });
});
