document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('sweeper-board');
    if (!board) return;

    const minesLed = document.getElementById('sweeper-mines');
    const timerLed = document.getElementById('sweeper-timer');
    const face = document.getElementById('sweeper-face');
    const flagToggle = document.getElementById('sweeper-flag-toggle');
    const msg = document.getElementById('sweeper-msg');
    const flagLabel = flagToggle.querySelector('.sweeper-flag-label') || flagToggle;

    const ICO_FLAG = '<span class="ico ico-sweeper" aria-hidden="true"></span>';
    const ICO_MINE = '<span class="ico ico-cup" aria-hidden="true"></span>';
    const ICO_WRONG = '<span class="sweeper-wrong">×</span>';

    const SIZE = 9;
    const MINES = 10;
    let cells = [];
    let started = false;
    let over = false;
    let flagMode = false;
    let revealedCount = 0;
    let flagCount = 0;
    let seconds = 0;
    let timer = null;

    const pad3 = n => String(Math.max(0, Math.min(999, n))).padStart(3, '0');

    function neighbors(i) {
        const r = Math.floor(i / SIZE);
        const c = i % SIZE;
        const out = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (!dr && !dc) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) out.push(nr * SIZE + nc);
            }
        }
        return out;
    }

    function stopTimer() {
        clearInterval(timer);
        timer = null;
    }

    function reset() {
        stopTimer();
        started = false;
        over = false;
        revealedCount = 0;
        flagCount = 0;
        seconds = 0;
        cells = [];
        face.textContent = '🙂';
        msg.textContent = '茶葉🍂を踏まずに畑を開拓しよう';
        minesLed.textContent = pad3(MINES);
        timerLed.textContent = pad3(0);
        board.innerHTML = '';
        for (let i = 0; i < SIZE * SIZE; i++) {
            const el = document.createElement('button');
            el.className = 'sweeper-cell';
            el.addEventListener('click', () => onCellClick(i));
            el.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                toggleFlag(i);
            });
            board.appendChild(el);
            cells.push({ el, mine: false, adj: 0, revealed: false, flagged: false });
        }
    }

    function placeMines(exclude) {
        const safe = new Set([exclude, ...neighbors(exclude)]);
        let placed = 0;
        while (placed < MINES) {
            const i = Math.floor(Math.random() * SIZE * SIZE);
            if (safe.has(i) || cells[i].mine) continue;
            cells[i].mine = true;
            placed++;
        }
        cells.forEach((cell, i) => {
            cell.adj = neighbors(i).filter(n => cells[n].mine).length;
        });
    }

    function onCellClick(i) {
        if (over) return;
        if (flagMode) {
            toggleFlag(i);
            return;
        }
        reveal(i);
    }

    function reveal(i) {
        const cell = cells[i];
        if (over || cell.revealed || cell.flagged) return;
        if (!started) {
            placeMines(i);
            started = true;
            timer = setInterval(() => {
                seconds++;
                timerLed.textContent = pad3(seconds);
            }, 1000);
        }
        if (cell.mine) {
            lose(i);
            return;
        }
        const queue = [i];
        while (queue.length) {
            const j = queue.pop();
            const c = cells[j];
            if (c.revealed || c.flagged) continue;
            c.revealed = true;
            revealedCount++;
            c.el.classList.add('open');
            if (c.adj > 0) {
                c.el.textContent = c.adj;
                c.el.classList.add('n' + c.adj);
            } else {
                neighbors(j).forEach(n => {
                    if (!cells[n].revealed) queue.push(n);
                });
            }
        }
        if (revealedCount === SIZE * SIZE - MINES) win();
    }

    function toggleFlag(i) {
        const cell = cells[i];
        if (over || cell.revealed) return;
        cell.flagged = !cell.flagged;
        cell.el.innerHTML = cell.flagged ? ICO_FLAG : '';
        flagCount += cell.flagged ? 1 : -1;
        minesLed.textContent = pad3(MINES - flagCount);
    }

    function lose(hit) {
        over = true;
        stopTimer();
        face.textContent = '😵';
        msg.textContent = 'BREW OVER — 渋くなりました…';
        cells.forEach((cell, i) => {
            if (cell.mine) {
                cell.el.innerHTML = ICO_MINE;
                cell.el.classList.add('open');
                if (i === hit) cell.el.classList.add('hit');
            } else if (cell.flagged) {
                cell.el.innerHTML = ICO_WRONG;
            }
        });
    }

    function win() {
        over = true;
        stopTimer();
        face.textContent = '😎';
        msg.textContent = `PERFECT BREW! ☕ ${seconds}秒で淹れ上がり`;
        cells.forEach(cell => {
            if (cell.mine && !cell.flagged) cell.el.innerHTML = ICO_FLAG;
        });
        minesLed.textContent = pad3(0);
    }

    face.addEventListener('click', reset);
    flagToggle.addEventListener('click', () => {
        flagMode = !flagMode;
        flagLabel.textContent = `フラグモード: ${flagMode ? 'ON' : 'OFF'}`;
        flagToggle.classList.toggle('on', flagMode);
    });

    reset();
});
