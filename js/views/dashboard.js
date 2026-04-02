import { Store } from '../store.js?v=5';

export const DashboardView = {
    title: 'ダッシュボード',
    
    async render(container) {
        const tasks = Store.getTasks();
        const goals = Store.getGoals();
        
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const totalTasks = tasks.length;
        const progress = totalTasks === 0 ? 0 : Math.round((completedTasks/totalTasks)*100);

        // Daily Affirmation Logic
        const quotes = [
            "「一番の近道は、今目の前にあることを一生懸命やることだ。」",
            "「過去から学び、今日のために生き、未来に対して希望をもつ。」",
            "「何かを始めるためには、しゃべるのをやめて行動し始めなければならない。」",
            "「私は失敗したことがない。ただ、1万通りのうまく行かない方法を見つけただけだ。」",
            "「未来予測の最善の方法は、自らそれを創り出すことである。」",
            "「小さなことを重ねることが、とんでもないところに行くただひとつの道。」"
        ];
        const dateSeed = new Date().getDate();
        const dailyQuote = quotes[dateSeed % quotes.length];

        let goalsHtml = goals.map(g => `
            <div class="goal-item ${g.completed ? 'completed' : ''}" data-id="${g.id}">
                <button class="goal-toggle"><i data-lucide="${g.completed ? 'check-circle' : 'circle'}"></i></button>
                <span class="goal-text" style="${g.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${g.title || g.text}</span>
                <button class="goal-delete icon-button text-danger"><i data-lucide="trash-2"></i></button>
            </div>
        `).join('');

        if (goals.length === 0) {
            goalsHtml = '<p class="text-muted">目標が設定されていません。</p>';
        }

        container.innerHTML = `
            <div class="fade-in">
                <!-- Daily Quote Section -->
                <div class="card" style="margin-bottom: 2rem; background: linear-gradient(135deg, var(--accent-primary) 0%, #8b5cf6 100%); color: white; border: none; text-align: center; padding: 2rem 1.5rem; position: relative; overflow: hidden; border-radius: 16px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.2);">
                    <i data-lucide="quote" style="position: absolute; top: -10px; left: -10px; width: 100px; height: 100px; opacity: 0.1; color: white; transform: rotate(180deg);"></i>
                    <p style="font-size: 1.15rem; font-weight: 500; font-family: 'Hiragino Mincho ProN', 'Yu Mincho', serif; letter-spacing: 0.05em; margin: 0; line-height: 1.6; position: relative; z-index: 1;">${dailyQuote}</p>
                </div>

                <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                    
                    <!-- Overview Card -->
                    <div class="card">
                        <h3 style="margin-bottom: 1rem; color: var(--text-secondary);">今日の進捗</h3>
                        <div style="display: flex; align-items: center; gap: 1.5rem;">
                            <div style="position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: conic-gradient(var(--accent-primary) ${progress}%, var(--bg-surface-hover) 0);">
                                <div style="position: absolute; inset: 6px; background: var(--bg-surface); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;">
                                    ${progress}%
                                </div>
                            </div>
                            <div>
                                <p style="font-size: 2rem; font-weight: bold; line-height: 1;">${completedTasks}<span style="font-size: 1rem; color: var(--text-muted);">/${totalTasks}</span></p>
                                <p style="color: var(--text-secondary); font-size: 0.875rem;">完了タスク</p>
                            </div>
                        </div>
                    </div>

                    <!-- Goals Card -->
                    <div class="card" style="grid-column: 1 / -1;">
                        <h3 style="color: var(--text-secondary); margin-bottom: 1.5rem;">主要な目標 (クイック追加)</h3>
                        <form id="add-goal-form" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
                            <input type="text" id="goal-input" placeholder="新しい目標を追加..." required style="flex: 1; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary);">
                            <button type="submit" class="btn-primary" style="padding: 0 1.5rem;">追加</button>
                        </form>

                        <div id="goals-list" style="display: flex; flex-direction: column; gap: 0.5rem;">
                            ${goalsHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Event Listeners
        const form = container.querySelector('#add-goal-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = container.querySelector('#goal-input');
            Store.addGoal(input.value);
            // Re-render
            this.render(container);
            lucide.createIcons();
        });

        // Toggle and delete
        container.querySelectorAll('.goal-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.parentElement.dataset.id);
                Store.toggleGoal(id);
                this.render(container);
                lucide.createIcons();
            });
        });

        container.querySelectorAll('.goal-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.parentElement.dataset.id);
                Store.deleteGoal(id);
                this.render(container);
                lucide.createIcons();
            });
        });
    }
};
