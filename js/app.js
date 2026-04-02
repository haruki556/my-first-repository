import { Store } from './store.js?v=11';
import { Router } from './router.js?v=11';
import { DashboardView } from './views/dashboard.js?v=11';
import { HabitsView } from './views/habits.js?v=11';
import { PomodoroView } from './views/pomodoro.js?v=11';
import { TasksView } from './views/tasks.js?v=11';
import { ReportsView } from './views/reports.js?v=11';
import { VisionBoardView } from './views/visionboard.js?v=11';
import { WeightView } from './views/weight.js?v=11';
import { GoalsView } from './views/goals.js?v=11';
import { RoadmapView } from './views/roadmap.js?v=11';

const routes = {
    '/': DashboardView,
    '/goals': GoalsView,
    '/habits': HabitsView,
    '/pomodoro': PomodoroView,
    '/tasks': TasksView,
    '/reports': ReportsView,
    '/roadmap': RoadmapView,
    '/visionboard': VisionBoardView,
    '/weight': WeightView
};

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize Store
    await Store.init();

    // Theme logic
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = themeBtn.querySelector('i');

    const toggleTheme = () => {
        const isDark = Store.getTheme() === 'dark';
        if (isDark) {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            Store.setTheme('light');
            themeIcon.setAttribute('data-lucide', 'moon');
        } else {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            Store.setTheme('dark');
            themeIcon.setAttribute('data-lucide', 'sun');
        }
        lucide.createIcons();
    };

    // Set initial theme
    if (Store.getTheme() === 'light') {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        themeIcon.setAttribute('data-lucide', 'moon');
    }

    themeBtn.addEventListener('click', toggleTheme);

    // Initialize Icons
    lucide.createIcons();

    // Initialize Router
    const router = new Router(routes, document.getElementById('view-container'));
    router.init();
});
