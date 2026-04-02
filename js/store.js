import { db, doc, getDoc, setDoc, onSnapshot } from './firebase-config.js?v=11';

// Store logic for localStorage
const STORE_KEY = 'astra_app_data';
const PIN_KEY = 'astra_app_sync_pin';

export const Store = {
    state: {
        goals: [],
        tasks: [],
        reports: [],
        weights: [],
        visionImages: [],
        habits: [],
        pomodoros: [],
        pomodoroBgm: 'jfKfPfyJRdk', // Default Lofi Girl video ID
        roadmaps: [],
        theme: 'dark' // dark or light
    },
    userPIN: null,

    async init() {
        // 1. Get Secret PIN for device syncing
        this.userPIN = localStorage.getItem(PIN_KEY);
        if (!this.userPIN) {
            this.userPIN = prompt("🔒 データを保護・全端末で共有するための「秘密のパスワード（PIN）」を決めて入力してください。\n※スマホで開く時もこの同じパスワードを使うと、完全にデータが同期されます！");
            if (!this.userPIN) this.userPIN = "default_user_" + Math.floor(Math.random() * 10000);
            localStorage.setItem(PIN_KEY, this.userPIN);
            alert("🔑 パスワードを保存しました！スマホなど別の端末から開いた時の最初にも、表示される画面に同じパスワードを入力してください。");
        }

        // 2. Fetch from Firebase
        try {
            console.log("Fetching from cloud...");
            const docRef = doc(db, "users", this.userPIN);
            const docSnap = await getDoc(docRef);
            
            // Backup local images before cloud overwrite
            const saved = localStorage.getItem(STORE_KEY);
            let localData = saved ? JSON.parse(saved) : null;
            let backupImages = localData ? (localData.visionImages || []) : [];

            if (docSnap.exists()) {
                // Cloud has data
                const cloudData = docSnap.data();
                this.state = { ...this.state, ...cloudData };
                // Restore local images since cloud cannot hold them
                this.state.visionImages = backupImages;
                
                try {
                    localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
                } catch(e) {}
            } else {
                // Cloud is empty. Migrate local data if exists
                if (localData) {
                    this.state = { ...this.state, ...localData };
                    
                    const payload = { ...this.state };
                    delete payload.visionImages; // Prevent 1MiB limit crash
                    await setDoc(docRef, payload);
                    
                    console.log("Migrated local data to cloud.");
                } else {
                    // Setup demo data if empty entirely
                    this.state.goals = [{ id: 1, title: '自己管理アプリを完成させる', description: 'モダンで美しいUIで構築し、定期的に振り返る習慣をつける。', category: 'work', completed: false }];
                    this.state.tasks = [
                        { id: 1, title: '実装計画の作成', status: 'done', createdAt: new Date().toISOString() },
                        { id: 2, title: 'デザインの実装', status: 'in-progress', createdAt: new Date().toISOString() },
                        { id: 3, title: 'クラウドストレージ連携', status: 'todo', createdAt: new Date().toISOString() }
                    ];
                    await this.save();
                }
            }

            // --- REAL TIME SYNC ---
            onSnapshot(docRef, (docRealtime) => {
                if (docRealtime.exists()) {
                    const data = docRealtime.data();
                    
                    // Backup images
                    const currentSaved = localStorage.getItem(STORE_KEY);
                    const currentLocal = currentSaved ? JSON.parse(currentSaved) : null;
                    const imgs = currentLocal ? (currentLocal.visionImages || []) : [];
                    
                    this.state = { ...this.state, ...data, visionImages: imgs };
                    
                    try {
                        localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
                    } catch(e) {}
                    
                    // Dispatch event so UI can re-render seamlessly
                    window.dispatchEvent(new Event('store-updated'));
                }
            });

        } catch (e) {
            console.error("Cloud Sync Error. Falling back to Local Storage.", e);
            const saved = localStorage.getItem(STORE_KEY);
            if (saved) {
                this.state = { ...this.state, ...JSON.parse(saved) };
            }
        }
    },

    async save() {
        // Local Cache (Fallback)
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(this.state));
        } catch(e) {
            console.error("Local storage quota exceeded or failed", e);
        }
        
        // Cloud Save
        try {
            if (this.userPIN) {
                const docRef = doc(db, "users", this.userPIN);
                const payload = { ...this.state };
                delete payload.visionImages; // Prevent 1MiB limit crash
                await setDoc(docRef, payload);
            }
        } catch(e) {
            console.error("Failed to save to cloud", e);
        }
    },

    // Theme
    getTheme() { return this.state.theme; },
    setTheme(theme) {
        this.state.theme = theme;
        this.save();
    },

    // Tasks API
    getTasks() { return this.state.tasks; },
    addTask(title, dueDate = null) {
        const newTask = {
            id: Date.now(),
            title,
            dueDate,
            status: 'todo', // todo | in-progress | done
            createdAt: new Date().toISOString()
        };
        this.state.tasks.push(newTask);
        this.save();
        return newTask;
    },
    updateTaskStatus(id, newStatus) {
        const task = this.state.tasks.find(t => t.id === id);
        if (task) {
            task.status = newStatus;
            this.save();
        }
    },
    deleteTask(id) {
        this.state.tasks = this.state.tasks.filter(t => t.id !== id);
        this.save();
    },

    // Goals API
    getGoals() { return this.state.goals; },
    addGoal(title, description = '', category = 'work') {
        this.state.goals.push({ id: Date.now(), title, description, category, completed: false });
        this.save();
    },
    toggleGoal(id) {
        const goal = this.state.goals.find(g => g.id === id);
        if (goal) {
            goal.completed = !goal.completed;
            this.save();
        }
    },
    deleteGoal(id) {
        this.state.goals = this.state.goals.filter(g => g.id !== id);
        this.save();
    },

    // Reports API
    getReports() { return this.state.reports; },
    addReport(date, type, content, condition = '😐') {
        this.state.reports.unshift({
            id: Date.now(),
            date,
            type,
            content,
            condition,
            createdAt: new Date().toISOString()
        });
        this.save();
    },
    deleteReport(id) {
        this.state.reports = this.state.reports.filter(r => r.id !== id);
        this.save();
    },
    deleteReports(ids) {
        this.state.reports = this.state.reports.filter(r => !ids.includes(r.id));
        this.save();
    },
    updateReport(id, newContent, newCondition) {
        const report = this.state.reports.find(r => r.id === id);
        if (report) {
            report.content = newContent;
            if (newCondition) report.condition = newCondition;
            this.save();
        }
    },

    // Weight API
    getWeights() { return this.state.weights; },
    addWeight(val) {
        this.state.weights.push({
            id: Date.now(),
            date: new Date().toISOString(),
            value: parseFloat(val)
        });
        // Sort by date ascending
        this.state.weights.sort((a,b) => new Date(a.date) - new Date(b.date));
        this.save();
    },
    updateWeight(id, val) {
        const weight = this.state.weights.find(w => w.id === id);
        if (weight) {
            weight.value = parseFloat(val);
            this.save();
        }
    },
    deleteWeight(id) {
        this.state.weights = this.state.weights.filter(w => w.id !== id);
        this.save();
    },
    deleteWeights(ids) {
        this.state.weights = this.state.weights.filter(w => !ids.includes(w.id));
        this.save();
    },

    // Vision API
    getVisionImages() { return this.state.visionImages || []; },
    addVisionImage(dataUrl) {
        if (!this.state.visionImages) this.state.visionImages = [];
        this.state.visionImages.push({
            id: Date.now(),
            dataUrl,
            createdAt: new Date().toISOString()
        });
        this.save();
    },
    deleteVisionImage(id) {
        if (!this.state.visionImages) return;
        this.state.visionImages = this.state.visionImages.filter(img => img.id !== id);
        this.save();
    },

    // Habits API
    getHabits() { return this.state.habits || []; },
    addHabit(title, icon = 'target', color = '#3b82f6') {
        if (!this.state.habits) this.state.habits = [];
        this.state.habits.push({ 
            id: Date.now(), 
            title, 
            icon, 
            color, 
            completedDates: [], 
            createdAt: new Date().toISOString() 
        });
        this.save();
    },
    toggleHabit(id, dateString) {
        if (!this.state.habits) return;
        const habit = this.state.habits.find(h => h.id === id);
        if (habit) {
            if (habit.completedDates.includes(dateString)) {
                habit.completedDates = habit.completedDates.filter(d => d !== dateString);
            } else {
                habit.completedDates.push(dateString);
            }
            this.save();
        }
    },
    deleteHabit(id) {
        if (!this.state.habits) return;
        this.state.habits = this.state.habits.filter(h => h.id !== id);
        this.save();
    },

    // Pomodoro API
    getPomodoros() { return this.state.pomodoros || []; },
    addPomodoro(durationMinutes, mode) {
        if (!this.state.pomodoros) this.state.pomodoros = [];
        this.state.pomodoros.push({
            id: Date.now(),
            date: new Date().toISOString(),
            duration: durationMinutes,
            mode: mode // 'work' or 'break'
        });
        this.save();
    },
    getPomodoroBgm() { return this.state.pomodoroBgm || 'jfKfPfyJRdk'; },
    setPomodoroBgm(videoId) {
        this.state.pomodoroBgm = videoId;
        this.save();
    },

    // Roadmap API
    getRoadmaps() { return this.state.roadmaps || []; },
    addRoadmapItem(age, text) {
        if (!this.state.roadmaps) this.state.roadmaps = [];
        this.state.roadmaps.push({
            id: Date.now(),
            age: parseInt(age),
            text: text,
            createdAt: new Date().toISOString()
        });
        // Always keep it sorted by age
        this.state.roadmaps.sort((a, b) => a.age - b.age);
        this.save();
    },
    deleteRoadmapItem(id) {
        if (!this.state.roadmaps) return;
        this.state.roadmaps = this.state.roadmaps.filter(r => r.id !== id);
        this.save();
    }
};
