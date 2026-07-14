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
            if (e.target.closest('a, button, input, textarea, select, .window-btn')) return;
            absolutifyWindows();
            bringToFront(win);
        });

        // Dragging logic (mouse)
        titleBar.addEventListener('mousedown', (e) => {
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
        disco: 'Winamp',
        live: 'LIVE SCHEDULE',
        news: 'news.txt',
        bio: 'biography.sys',
        contact: 'New Message'
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
            live: [560, 60],
            disco: [180, 90],
            news: [260, 50],
            bio: [340, 110],
            contact: [420, 140]
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
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
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
});
