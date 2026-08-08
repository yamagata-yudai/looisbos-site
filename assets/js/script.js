document.addEventListener('DOMContentLoaded', () => {

    // Startup Sequence Logic with Skip Functionality
    const startupOverlay = document.getElementById('startup-overlay');
    const biosScreen = document.getElementById('bios-screen');
    const xpLoadScreen = document.getElementById('xp-load-screen');

    const skipStartup = () => {
        if (startupOverlay) {
            startupOverlay.style.transition = 'opacity 0.3s ease-out';
            startupOverlay.style.opacity = '0';
            setTimeout(() => {
                startupOverlay.style.display = 'none';
            }, 300);
        }
    };

    if (startupOverlay) {
        // Always show startup sequence (no localStorage check)
        // Add skip prompt
        const skipPrompt = document.createElement('p');
        skipPrompt.textContent = 'Press any key or click to skip...';
        skipPrompt.style.cssText = 'position: absolute; bottom: 20px; right: 20px; color: #888; font-size: 0.9rem; animation: blink 1.5s infinite;';
        biosScreen.appendChild(skipPrompt);

        // Skip handler
        const skipHandler = () => {
            skipStartup();
            document.removeEventListener('keydown', skipHandler);
            document.removeEventListener('click', skipHandler);
        };
        document.addEventListener('keydown', skipHandler);
        document.addEventListener('click', skipHandler);

        // Step 1: BIOS Screen for 2 seconds
        setTimeout(() => {
            biosScreen.style.display = 'none';
            xpLoadScreen.style.display = 'flex';

            // Step 2: XP Loading Screen for 3 seconds
            setTimeout(() => {
                skipStartup();
            }, 3000);
        }, 2000);
    }

    // Custom Cursor
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Window Management (Drag & Drop, Z-index)
    let activeWindow = null;
    let isDragging = false;
    let initialRect = null;
    let offsetX, offsetY;
    let windowsAbsolutified = false;

    const windows = document.querySelectorAll('.window');
    const container = document.querySelector('.container');

    function bringToFront(win) {
        windows.forEach(w => w.classList.remove('window-active'));
        win.classList.add('window-active');
        if (container && win.parentNode === container) {
            container.appendChild(win);
        }
        if (typeof updateTaskbar === 'function') updateTaskbar();
    }

    function absolutifyWindows() {
        if (windowsAbsolutified || !container) return;

        const containerRect = container.getBoundingClientRect();
        const currentHeight = container.offsetHeight;

        // Freeze container height
        container.style.minHeight = currentHeight + 'px';
        container.style.position = 'relative';

        const winData = [];
        windows.forEach(win => {
            const rect = win.getBoundingClientRect();
            winData.push({
                win: win,
                width: rect.width,
                left: rect.left - containerRect.left,
                top: rect.top - containerRect.top
            });
        });

        winData.forEach(data => {
            data.win.style.width = data.width + 'px';
            data.win.style.position = 'absolute';
            data.win.style.left = data.left + 'px';
            data.win.style.top = data.top + 'px';
            data.win.style.margin = '0';
        });

        windowsAbsolutified = true;
    }

    windows.forEach(win => {
        const titleBar = win.querySelector('.title-bar');

        // Bring to front on click (skip if clicking a link or button to avoid blocking navigation)
        win.addEventListener('mousedown', (e) => {
            if (!desktopOS) return;
            if (e.target.closest('a, button, input, textarea, select, .window-btn')) return;
            absolutifyWindows();
            bringToFront(win);
        });

        // Dragging logic (mouse)
        titleBar.addEventListener('mousedown', (e) => {
            if (!desktopOS) return;
            if (e.target.closest('a, button, .window-btn')) return;
            absolutifyWindows();
            activeWindow = win;
            bringToFront(win);
            isDragging = true;
            const rect = win.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            document.body.style.userSelect = 'none';
        });

        // Dragging logic (touch)
        titleBar.addEventListener('touchstart', (e) => {
            if (!desktopOS) return;
            if (e.target.closest('a, button, .window-btn')) return;
            absolutifyWindows();
            const touch = e.touches[0];
            activeWindow = win;
            bringToFront(win);
            isDragging = true;
            const rect = win.getBoundingClientRect();
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });
    });

    document.addEventListener('mousemove', (e) => {
        if (activeWindow && isDragging) {
            const containerRect = container.getBoundingClientRect();
            const x = e.clientX - containerRect.left - offsetX;
            const y = e.clientY - containerRect.top - offsetY;
            activeWindow.style.left = `${x}px`;
            activeWindow.style.top = `${y}px`;
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (activeWindow && isDragging) {
            const touch = e.touches[0];
            const containerRect = container.getBoundingClientRect();
            const x = touch.clientX - containerRect.left - offsetX;
            const y = touch.clientY - containerRect.top - offsetY;
            activeWindow.style.left = `${x}px`;
            activeWindow.style.top = `${y}px`;
            e.preventDefault();
        }
    });

    function stopDragging() {
        activeWindow = null;
        isDragging = false;
        document.body.style.userSelect = 'auto';
    }

    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchend', stopDragging);

    // Window Manager (Desktop OS mode)
    const desktopOS = window.matchMedia('(min-width: 769px)').matches;
    const taskButtons = document.querySelector('.task-buttons');
    const taskbarTitles = {
        hero: 'Looisbos.exe',
        mycomputer: 'マイ コンピュータ',
        disco: 'Winamp',
        live: 'LIVE SCHEDULE',
        news: 'news.txt',
        bio: 'biography.sys',
        contact: 'New Message',
        pictures: 'My Pictures',
        podcast: 'podcast.exe',
        trash: 'ごみ箱',
        sweeper: 'Rooibosweeper'
    };
    const winState = {};
    windows.forEach(win => {
        winState[win.id] = { isOpen: true, isMinimized: false };
    });

    function updateTaskbar() {
        if (!taskButtons || !desktopOS) return;
        windows.forEach(win => {
            const st = winState[win.id];
            let btn = taskButtons.querySelector(`[data-window="${win.id}"]`);
            if (!st.isOpen) {
                if (btn) btn.remove();
                return;
            }
            if (!btn) {
                btn = document.createElement('button');
                btn.className = 'task-btn';
                btn.dataset.window = win.id;
                btn.textContent = taskbarTitles[win.id] || win.id;
                btn.addEventListener('click', () => {
                    if (winState[win.id].isMinimized) {
                        restoreWindow(win.id);
                    } else if (win.classList.contains('window-active')) {
                        minimizeWindow(win.id);
                    } else {
                        bringToFront(win);
                        updateTaskbar();
                    }
                });
                taskButtons.appendChild(btn);
            }
            btn.classList.toggle('task-btn-active',
                win.classList.contains('window-active') && !st.isMinimized);
        });
    }

    function openWindow(id) {
        const win = document.getElementById(id);
        if (!win || !winState[id]) return;
        winState[id].isOpen = true;
        winState[id].isMinimized = false;
        win.classList.remove('win-closed', 'win-min');
        bringToFront(win);
        updateTaskbar();
    }

    function closeWindow(id) {
        const win = document.getElementById(id);
        if (!win || !winState[id]) return;
        winState[id].isOpen = false;
        win.classList.add('win-closed');
        win.classList.remove('window-active', 'win-maximized');
        updateTaskbar();
    }

    function minimizeWindow(id) {
        const win = document.getElementById(id);
        if (!win || !winState[id]) return;
        winState[id].isMinimized = true;
        win.classList.add('win-min');
        win.classList.remove('window-active');
        updateTaskbar();
    }

    function restoreWindow(id) {
        const win = document.getElementById(id);
        if (!win || !winState[id]) return;
        winState[id].isMinimized = false;
        win.classList.remove('win-min');
        bringToFront(win);
        updateTaskbar();
    }

    function toggleMaximize(id) {
        const win = document.getElementById(id);
        if (!win) return;
        win.classList.toggle('win-maximized');
        bringToFront(win);
        updateTaskbar();
    }

    if (desktopOS) {
        document.body.classList.add('desktop-os');

        const cascade = {
            hero: [110, 24],
            mycomputer: [220, 200],
            live: [560, 60],
            disco: [180, 90],
            news: [260, 50],
            bio: [340, 110],
            contact: [420, 140],
            pictures: [500, 40],
            podcast: [300, 60],
            trash: [600, 130],
            sweeper: [740, 90]
        };
        const areaW = window.innerWidth;
        windows.forEach(win => {
            const pos = cascade[win.id] || [140, 80];
            const winW = win.id === 'hero' ? 460 : 560;
            const left = Math.max(10, Math.min(pos[0], areaW - winW - 30));
            win.style.position = 'absolute';
            win.style.left = left + 'px';
            win.style.top = pos[1] + 'px';
            win.style.margin = '0';
        });
        windowsAbsolutified = true;

        windows.forEach(win => {
            if (win.id !== 'hero' && win.id !== 'live') closeWindow(win.id);
        });
        bringToFront(document.getElementById('live'));
        updateTaskbar();

        windows.forEach(win => {
            win.querySelectorAll('.window-btn[data-action]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = btn.dataset.action;
                    if (action === 'close') closeWindow(win.id);
                    else if (action === 'minimize') minimizeWindow(win.id);
                    else if (action === 'maximize') toggleMaximize(win.id);
                });
            });
        });
    }

    document.querySelectorAll('.xp-tabs').forEach(tabs => {
        const buttons = tabs.querySelectorAll('.xp-tab');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => {
                    const on = b === btn;
                    b.classList.toggle('xp-tab-active', on);
                    b.setAttribute('aria-selected', String(on));
                    const panel = document.getElementById(b.dataset.tab);
                    if (panel) {
                        panel.classList.toggle('xp-tab-panel-active', on);
                        panel.hidden = !on;
                    }
                });
            });
        });
    });

    const newsToggles = {};
    document.querySelectorAll('.news-item').forEach((item, index) => {
        const date = item.querySelector('.news-date');
        const title = item.querySelector('.news-title');
        const body = item.querySelector('.news-excerpt');
        if (!date || !title || !body) return;

        const head = document.createElement('div');
        head.className = 'news-head';
        head.setAttribute('role', 'button');
        head.setAttribute('tabindex', '0');
        head.setAttribute('aria-expanded', 'false');

        const mark = document.createElement('span');
        mark.className = 'news-mark';
        mark.textContent = '▶';

        item.insertBefore(head, item.firstChild);
        head.append(mark, date, title);

        const setOpen = (open) => {
            item.classList.toggle('news-open', open);
            head.setAttribute('aria-expanded', String(open));
            mark.textContent = open ? '▼' : '▶';
        };
        if (item.id) newsToggles[item.id] = setOpen;

        head.addEventListener('click', () => {
            const open = !item.classList.contains('news-open');
            setOpen(open);
            if (open && item.id) history.replaceState(null, '', '#' + item.id);
        });
        head.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                head.click();
            }
        });

        if (index === 0) setOpen(true);
    });

    function focusWindow(id) {
        const target = id && document.getElementById(id);
        if (!target || !winState[id]) return false;
        if (desktopOS) {
            openWindow(id);
        } else {
            const top = target.getBoundingClientRect().top + window.scrollY - 48;
            window.scrollTo({ top: Math.max(top, 0), behavior: 'instant' });
        }
        return true;
    }

    function focusNewsItem(id) {
        if (!newsToggles[id]) return false;
        focusWindow('news');
        newsToggles[id](true);
        requestAnimationFrame(() => {
            document.getElementById(id).scrollIntoView({ block: 'nearest', behavior: 'instant' });
        });
        return true;
    }

    function focusWindowFromHash() {
        const id = decodeURIComponent(location.hash).replace(/^#/, '');
        return focusNewsItem(id) || focusWindow(id);
    }

    focusWindowFromHash();
    window.addEventListener('hashchange', focusWindowFromHash);
    if (!desktopOS) window.addEventListener('load', focusWindowFromHash);

    // Start Menu & Shut Down
    const startMenu = document.getElementById('start-menu');
    const startBtn = document.getElementById('start-btn');
    if (startMenu && startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (!startMenu.contains(e.target)) startMenu.classList.remove('open');
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') startMenu.classList.remove('open');
        });

        startMenu.querySelectorAll('.start-menu-item[data-window]').forEach(item => {
            item.addEventListener('click', () => {
                const id = item.dataset.window;
                startMenu.classList.remove('open');
                if (desktopOS) {
                    openWindow(id);
                } else {
                    const target = document.getElementById(id);
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        startMenu.querySelectorAll('a.start-menu-item').forEach(link => {
            link.addEventListener('click', () => startMenu.classList.remove('open'));
        });

        const shutdownItem = document.getElementById('shutdown-item');
        const shutdownScreen = document.getElementById('shutdown-screen');
        if (shutdownItem && shutdownScreen) {
            shutdownItem.addEventListener('click', () => {
                startMenu.classList.remove('open');
                shutdownScreen.classList.add('on');
            });
            const restartBtn = document.getElementById('shutdown-restart');
            if (restartBtn) restartBtn.addEventListener('click', () => location.reload());
        }
    }

    // Winamp Player Logic
    const audio = document.getElementById('winamp-audio');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const statusText = document.querySelector('.winamp-status');
    const discoItems = document.querySelectorAll('.disco-item');
    let currentTrackIndex = 0;

    // Dummy track data
    const tracks = [
        { name: "Science Children", file: "assets/audio/science_children.mp3" },
        { name: "rooms - Thinking about", file: "assets/audio/thinking_about.mp3" },
        { name: "vase - amanda", file: "assets/audio/amanda.mp3" },
        { name: "chairs - The bus", file: "assets/audio/the_bus.mp3" }
    ];

    function updateTrack(index) {
        currentTrackIndex = index;
        discoItems.forEach((item, i) => {
            item.classList.toggle('active', i === index);
            if (i === index) {
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
        statusText.textContent = `Playing: ${tracks[index].name}`;
        // audio.src = tracks[index].file;
    }

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            playBtn.style.display = 'none';
            pauseBtn.style.display = 'flex';
            statusText.textContent = `Playing: ${tracks[currentTrackIndex].name}`;
            const visualizer = document.getElementById('visualizer-bar');
            visualizer.style.animation = 'winampVisualizer 0.5s infinite alternate';
        });
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            pauseBtn.style.display = 'none';
            playBtn.style.display = 'flex';
            statusText.textContent = "Paused";
            const visualizer = document.getElementById('visualizer-bar');
            visualizer.style.animation = 'none';
        });
    }

    nextBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
        updateTrack(currentTrackIndex);
    });

    prevBtn.addEventListener('click', () => {
        currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
        updateTrack(currentTrackIndex);
    });

    // Add visualizer animation style
    const winampStyle = document.createElement('style');
    winampStyle.innerHTML = `
        @keyframes winampVisualizer {
            from { opacity: 0.3; background-size: 20px 100%; }
            to { opacity: 0.8; background-size: 5px 100%; }
        }
    `;
    document.head.appendChild(winampStyle);

    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav) nav.classList.remove('active');
            if (menuToggle) menuToggle.classList.remove('active');
        });
    });

    // Smooth Scroll for Anchor Links (Optional, if needed for older browsers or specific behavior)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            if (document.body.classList.contains('desktop-os')) return;
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Fade in elements on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.section-title, .news-item, .contact-form').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Add visible class styling dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Desktop Icon Click / Double Click Logic
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    desktopIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            if (!desktopOS || !icon.dataset.window) return;
            e.preventDefault();
            desktopIcons.forEach(i => i.classList.remove('icon-selected'));
            icon.classList.add('icon-selected');
        });
        icon.addEventListener('dblclick', (e) => {
            e.preventDefault();
            const href = icon.getAttribute('href');
            if (desktopOS && icon.dataset.window) {
                openWindow(icon.dataset.window);
                icon.classList.remove('icon-selected');
            } else if (href && href.startsWith('#')) {
                const targetWindow = document.querySelector(href);
                if (targetWindow) {
                    targetWindow.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                window.open(href, '_blank');
            }
        });
    });

    // Form Submission - Let Formspree handle it
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        // No e.preventDefault() here so Formspree can receive the POST request
        // Unless we want to use AJAX, but standard POST is easier for now.
    }

    const trashDialog = document.getElementById('trash-dialog');
    const trashDialogMsg = document.getElementById('trash-dialog-msg');
    if (trashDialog) {
        const closeDialog = () => trashDialog.classList.remove('open');
        document.querySelectorAll('.trash-item').forEach(item => {
            item.addEventListener('click', () => {
                trashDialogMsg.textContent = item.dataset.msg;
                trashDialog.classList.add('open');
            });
        });
        document.getElementById('trash-dialog-ok').addEventListener('click', closeDialog);
        document.getElementById('trash-dialog-x').addEventListener('click', closeDialog);
        trashDialog.addEventListener('click', (e) => {
            if (e.target === trashDialog) closeDialog();
        });

        const emptyBtn = document.getElementById('trash-empty-btn');
        const trashStatus = document.getElementById('trash-status');
        const trashList = document.getElementById('trash-list');
        let emptying = false;
        if (emptyBtn) {
            emptyBtn.addEventListener('click', () => {
                if (emptying) return;
                emptying = true;
                trashStatus.textContent = '削除しています…';
                trashList.classList.add('trash-emptying');
                setTimeout(() => {
                    trashStatus.textContent = '……やっぱり戻しておこう。';
                    trashList.classList.remove('trash-emptying');
                    setTimeout(() => {
                        trashStatus.textContent = '';
                        emptying = false;
                    }, 3500);
                }, 2600);
            });
        }
    }

    const trayPanels = {
        'tray-volume': document.getElementById('tray-volume-panel'),
        'tray-tea': document.getElementById('tray-tea-panel')
    };
    Object.entries(trayPanels).forEach(([btnId, panel]) => {
        const btn = document.getElementById(btnId);
        if (!btn || !panel) return;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasOpen = panel.classList.contains('open');
            Object.values(trayPanels).forEach(p => p && p.classList.remove('open'));
            if (!wasOpen) panel.classList.add('open');
        });
    });
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.tray-panel')) {
            Object.values(trayPanels).forEach(p => p && p.classList.remove('open'));
        }
    });

    const volSlider = document.getElementById('tray-volume-slider');
    const volLabel = document.getElementById('tray-volume-label');
    if (volSlider && volLabel) {
        const volText = (v) =>
            v == 0 ? 'ミュート（反省中）'
            : v < 25 ? '深夜の宅録モード'
            : v < 55 ? '喫茶店のBGMくらい'
            : v < 85 ? 'ライブハウスの後方くらい'
            : v < 100 ? '最前列'
            : '近所から苦情が来るやつ';
        volSlider.addEventListener('input', () => {
            volLabel.textContent = volText(Number(volSlider.value));
        });
    }

    const teaStockEl = document.getElementById('tray-tea-stock');
    const teaBtn = document.getElementById('tray-tea-drink');
    if (teaStockEl && teaBtn) {
        let tea = parseInt(localStorage.getItem('lb_tea') || '3', 10);
        if (isNaN(tea) || tea < 0 || tea > 3) tea = 3;
        const renderTea = () => {
            teaStockEl.textContent = tea > 0 ? '☕'.repeat(tea) + `　残り${tea}杯分` : '在庫切れ。次の物販で補充します…';
            teaBtn.textContent = tea > 0 ? '1杯いれる' : '茶葉を補充する';
        };
        teaBtn.addEventListener('click', () => {
            tea = tea > 0 ? tea - 1 : 3;
            localStorage.setItem('lb_tea', String(tea));
            renderTea();
        });
        renderTea();
    }

    document.querySelectorAll('.sticky-note').forEach(note => {
        note.addEventListener('mousedown', (e) => {
            if (!desktopOS) return;
            const rect = note.getBoundingClientRect();
            const dx = e.clientX - rect.left;
            const dy = e.clientY - rect.top;
            note.style.right = 'auto';
            const move = (ev) => {
                note.style.left = (ev.clientX - dx) + 'px';
                note.style.top = (ev.clientY - dy) + 'px';
            };
            const up = () => {
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', up);
            };
            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', up);
            e.preventDefault();
        });
    });

    document.querySelectorAll('.open-window-link').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const id = el.dataset.window;
            if (focusWindow(id)) history.replaceState(null, '', '#' + id);
        });
    });

    // Photo Viewer (Windows Picture and Fax Viewer)
    const photoViewer = document.getElementById('photo-viewer');
    const viewerImg = document.getElementById('viewer-img');
    const viewerCaption = document.getElementById('viewer-caption');
    const photoThumbs = Array.from(document.querySelectorAll('.photo-thumb'));
    let viewerIndex = 0;
    let slideshowTimer = null;

    function showPhoto(index) {
        viewerIndex = (index + photoThumbs.length) % photoThumbs.length;
        const thumb = photoThumbs[viewerIndex];
        viewerImg.src = thumb.dataset.full;
        viewerImg.alt = thumb.querySelector('img').alt;
        viewerCaption.textContent = `${viewerIndex + 1} / ${photoThumbs.length} — ${thumb.dataset.name}`;
    }

    function openViewer(index) {
        showPhoto(index);
        photoViewer.classList.add('open');
    }

    function closeViewer() {
        photoViewer.classList.remove('open');
        stopSlideshow();
    }

    function stopSlideshow() {
        if (slideshowTimer) {
            clearInterval(slideshowTimer);
            slideshowTimer = null;
        }
    }

    if (photoViewer && photoThumbs.length) {
        photoThumbs.forEach((thumb, i) => {
            thumb.addEventListener('click', () => openViewer(i));
        });

        document.getElementById('viewer-close-btn').addEventListener('click', closeViewer);
        document.getElementById('viewer-prev').addEventListener('click', () => { stopSlideshow(); showPhoto(viewerIndex - 1); });
        document.getElementById('viewer-next').addEventListener('click', () => { stopSlideshow(); showPhoto(viewerIndex + 1); });

        photoViewer.addEventListener('click', (e) => {
            if (e.target === photoViewer) closeViewer();
        });

        document.addEventListener('keydown', (e) => {
            if (!photoViewer.classList.contains('open')) return;
            if (e.key === 'Escape') closeViewer();
            else if (e.key === 'ArrowLeft') { stopSlideshow(); showPhoto(viewerIndex - 1); }
            else if (e.key === 'ArrowRight') { stopSlideshow(); showPhoto(viewerIndex + 1); }
        });

        const slideshowBtn = document.getElementById('slideshow-btn');
        if (slideshowBtn) {
            slideshowBtn.addEventListener('click', () => {
                openViewer(0);
                slideshowTimer = setInterval(() => showPhoto(viewerIndex + 1), 3500);
            });
        }
    }
});
