import { Store } from '../store.js?v=12';

export const PomodoroView = {
    title: '集中タイマー',
    timerId: null,
    timeLeft: 25 * 60, // Total seconds
    totalTime: 25 * 60,
    isRunning: false,
    mode: 'work', // 'work' or 'break'
    
    // Clean up interval when navigating away
    destroy() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.isRunning = false;
        // Optionally reset timer state on leave so it's fresh when coming back
        this.mode = 'work';
        this.timeLeft = 25 * 60;
        this.totalTime = 25 * 60;
    },

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },

    async render(container) {
        const history = Store.getPomodoros();
        const videoId = Store.getPomodoroBgm();
        // Get today's work sessions
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysWork = history.filter(p => p.mode === 'work' && p.date.startsWith(todayStr));
        const totalMinutesToday = todaysWork.reduce((acc, curr) => acc + curr.duration, 0);

        const progressPercent = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        const strokeDasharray = 283; // 2 * pi * r (r=45)
        const strokeDashoffset = strokeDasharray - (strokeDasharray * progressPercent) / 100;

        const primaryColor = this.mode === 'work' ? 'var(--accent-primary)' : 'var(--success)';
        const bgGradient = this.mode === 'work' ? 'var(--bg-surface-hover)' : 'rgba(16, 185, 129, 0.1)';

        container.innerHTML = `
            <div class="fade-in" style="display: flex; flex-direction: column; align-items: center; max-width: 600px; margin: 0 auto;">
                <h2 style="margin-bottom: 2rem; align-self: flex-start;">${this.title}</h2>
                
                <div class="card" style="width: 100%; display: flex; flex-direction: column; align-items: center; padding: 3rem 2rem; background: ${bgGradient}; border-radius: var(--radius-xl); transition: background 0.5s ease;">
                    
                    <!-- Mode toggles -->
                    <div style="display: flex; gap: 1rem; margin-bottom: 3rem; background: var(--bg-base); padding: 0.5rem; border-radius: var(--radius-full);">
                        <button id="mode-work" style="padding: 0.5rem 1.5rem; border-radius: var(--radius-full); font-weight: bold; transition: all 0.2s; ${this.mode === 'work' ? 'background: var(--accent-primary); color: white;' : 'color: var(--text-secondary);'}">
                            <i data-lucide="brain" style="width:16px; height:16px; margin-right:4px; vertical-align:middle;"></i> 集中 (25分)
                        </button>
                        <button id="mode-break" style="padding: 0.5rem 1.5rem; border-radius: var(--radius-full); font-weight: bold; transition: all 0.2s; ${this.mode === 'break' ? 'background: var(--success); color: white;' : 'color: var(--text-secondary);'}">
                            <i data-lucide="coffee" style="width:16px; height:16px; margin-right:4px; vertical-align:middle;"></i> 休憩 (5分)
                        </button>
                    </div>

                    <!-- Circular Timer -->
                    <div style="position: relative; width: 280px; height: 280px; display: flex; justify-content: center; align-items: center; margin-bottom: 3rem;">
                        <svg width="280" height="280" viewBox="0 0 100 100" style="transform: rotate(-90deg); position: absolute; inset: 0;">
                            <!-- Background circle -->
                            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--bg-base)" stroke-width="6" />
                            <!-- Progress circle -->
                            <circle cx="50" cy="50" r="45" fill="none" stroke="${primaryColor}" stroke-width="6" 
                                stroke-linecap="round" 
                                stroke-dasharray="${strokeDasharray}" 
                                stroke-dashoffset="${strokeDashoffset}" 
                                style="transition: stroke-dashoffset 1s linear, stroke 0.5s ease;" />
                        </svg>
                        <div style="position: absolute; display: flex; flex-direction: column; align-items: center;">
                            <span style="font-size: 4rem; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; margin-bottom: 0.5rem; color: var(--text-primary); text-shadow: 0 4px 10px rgba(0,0,0,0.1);">${this.formatTime(this.timeLeft)}</span>
                            <span style="font-size: 1rem; color: var(--text-secondary); font-weight: 500;">
                                ${this.mode === 'work' ? (this.isRunning ? '集中しています...' : 'さあ、始めましょう') : (this.isRunning ? 'リラックス中...' : '休憩しましょう')}
                            </span>
                        </div>
                    </div>

                    <!-- Controls -->
                    <div style="display: flex; gap: 1.5rem;">
                        <button id="timer-reset" class="icon-button" style="width: 50px; height: 50px; background: var(--bg-base); color: var(--text-secondary);" title="リセット">
                            <i data-lucide="rotate-ccw"></i>
                        </button>
                        <button id="timer-toggle" style="width: 80px; height: 80px; border-radius: 50%; border: none; background: ${primaryColor}; color: white; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 10px 20px ${primaryColor}40; transition: transform 0.1s ease;">
                            <i data-lucide="${this.isRunning ? 'pause' : 'play'}" style="width: 36px; height: 36px; margin-left: ${this.isRunning ? '0' : '4px'};"></i>
                        </button>
                    </div>
                </div>

                <!-- Stats summary -->
                <div style="width: 100%; margin-top: 2rem; display: flex; gap: 1.5rem;">
                    <div class="card" style="flex: 1; text-align: center;">
                        <p style="color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.875rem;">今日の集中セッション</p>
                        <p style="font-size: 1.5rem; font-weight: bold; color: var(--text-primary);"><i data-lucide="check-circle" style="color: var(--success); width:20px; vertical-align:middle;"></i> ${todaysWork.length} 回</p>
                    </div>
                    <div class="card" style="flex: 1; text-align: center;">
                        <p style="color: var(--text-secondary); margin-bottom: 0.5rem; font-size: 0.875rem;">今日の集中時間</p>
                        <p style="font-size: 1.5rem; font-weight: bold; color: var(--text-primary);"><i data-lucide="clock" style="color: var(--info); width:20px; vertical-align:middle;"></i> ${totalMinutesToday} 分</p>
                    </div>
                </div>

                <!-- BGM Youtube Widget -->
                <div style="width: 100%; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
                    <h3 style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 1rem;"><i data-lucide="music" style="width:16px; margin-right:4px;"></i> 作業用BGM (YouTube)</h3>
                    <form id="bgm-form" style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                        <input type="text" id="bgm-url" placeholder="YouTubeのURL..." value="https://www.youtube.com/watch?v=${videoId}" style="flex:1; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary); font-size: 0.875rem;">
                        <button type="submit" class="btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.875rem; border-radius: var(--radius-md);">BGMを変更</button>
                    </form>
                    <div style="border-radius: var(--radius-lg); overflow: hidden; height: 180px; background: #000; position: relative;">
                        <iframe id="youtube-bgm-player" width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=0&controls=1" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                    </div>
                    <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">※集中時間中に再生ボタンを押すとBGMが同時に再生開始されます。</p>
                </div>
            </div>
        `;

        // Event Listeners
        const toggleBtn = container.querySelector('#timer-toggle');
        const resetBtn = container.querySelector('#timer-reset');
        const workModeBtn = container.querySelector('#mode-work');
        const breakModeBtn = container.querySelector('#mode-break');

        // Apply scale effect on click
        toggleBtn.addEventListener('mousedown', () => toggleBtn.style.transform = 'scale(0.95)');
        toggleBtn.addEventListener('mouseup', () => toggleBtn.style.transform = 'scale(1)');
        toggleBtn.addEventListener('mouseleave', () => toggleBtn.style.transform = 'scale(1)');

        toggleBtn.addEventListener('click', () => {
            const player = container.querySelector('#youtube-bgm-player');
            
            if (this.isRunning) {
                // Pause Time
                clearInterval(this.timerId);
                this.timerId = null;
                this.isRunning = false;
                
                // Update UI without full render
                toggleBtn.innerHTML = '<i data-lucide="play" style="width: 36px; height: 36px; margin-left: 4px;"></i>';
                const statusText = container.querySelector('span[style*="font-size: 1rem; color: var(--text-secondary)"]');
                if (statusText) statusText.textContent = this.mode === 'work' ? 'さあ、始めましょう' : '休憩しましょう';
                lucide.createIcons();

                // Pause BGM
                if (player && player.contentWindow) {
                    player.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                }
            } else {
                // Start Time
                this.isRunning = true;

                // Update UI without full render
                toggleBtn.innerHTML = '<i data-lucide="pause" style="width: 36px; height: 36px; margin-left: 0;"></i>';
                const statusText = container.querySelector('span[style*="font-size: 1rem; color: var(--text-secondary)"]');
                if (statusText) statusText.textContent = this.mode === 'work' ? '集中しています...' : 'リラックス中...';
                lucide.createIcons();

                // Play BGM (Only if work mode)
                if (player && player.contentWindow && this.mode === 'work') {
                    player.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
                }

                this.timerId = setInterval(() => {
                    if (this.timeLeft > 0) {
                        this.timeLeft--;
                        // Partial DOM update
                        const timeSpan = container.querySelector('span[style*="font-size: 4rem"]');
                        if (timeSpan) timeSpan.textContent = this.formatTime(this.timeLeft);
                        
                        const progressPercent = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
                        const strokeDashoffset = 283 - (283 * progressPercent) / 100;
                        const progressCircle = container.querySelector('svg circle:nth-child(2)');
                        if (progressCircle) progressCircle.setAttribute('stroke-dashoffset', strokeDashoffset);
                    } else {
                        // Finished
                        clearInterval(this.timerId);
                        this.timerId = null;
                        this.isRunning = false;

                        // Save history
                        if (this.mode === 'work') {
                            Store.addPomodoro(25, 'work');
                        } else {
                            Store.addPomodoro(5, 'break');
                        }

                        // Auto-switch mode
                        this.mode = this.mode === 'work' ? 'break' : 'work';
                        this.totalTime = this.mode === 'work' ? 25 * 60 : 5 * 60;
                        this.timeLeft = this.totalTime;

                        // Desktop Notification (if supported)
                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification(this.mode === 'work' ? "休憩終了！作業を再開しましょう。" : "作業お疲れ様でした！5分間休憩しましょう。");
                        } else if ("Notification" in window && Notification.permission !== "denied") {
                            Notification.requestPermission();
                        }

                        this.render(container);
                        lucide.createIcons();
                    }
                }, 1000);
            }
        });

        resetBtn.addEventListener('click', () => {
            clearInterval(this.timerId);
            this.timerId = null;
            this.isRunning = false;
            this.timeLeft = this.totalTime;
            this.render(container);
            lucide.createIcons();
        });

        const bgmForm = container.querySelector('#bgm-form');
        if (bgmForm) {
            bgmForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const url = container.querySelector('#bgm-url').value;
                function extractVideoID(url) {
                    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
                    const match = url.match(regExp);
                    return (match && match[7].length === 11) ? match[7] : false;
                }
                const newId = extractVideoID(url);
                if (newId) {
                    Store.setPomodoroBgm(newId);
                    // Pause current timer and render to show new video
                    clearInterval(this.timerId);
                    this.timerId = null;
                    this.isRunning = false;
                    this.render(container);
                    lucide.createIcons();
                } else {
                    alert("有効なYouTubeのURLを入力してください。");
                }
            });
        }

        const switchMode = (newMode, minutes) => {
            if (this.isRunning) {
                if(!confirm("タイマーが動いています。モードを切り替えてリセットしますか？")) return;
            }
            clearInterval(this.timerId);
            this.timerId = null;
            this.isRunning = false;
            this.mode = newMode;
            this.totalTime = minutes * 60;
            this.timeLeft = this.totalTime;
            this.render(container);
            lucide.createIcons();
        };

        workModeBtn.addEventListener('click', () => switchMode('work', 25));
        breakModeBtn.addEventListener('click', () => switchMode('break', 5));
    }
};
