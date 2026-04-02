import { Store } from '../store.js?v=11';

export const GoalsView = {
    title: '目標設定',
    currentFilter: 'all',
    
    async render(container) {
        const categories = {
            'family': { label: '家族', color: '#ec4899', icon: 'users' },
            'work': { label: '仕事・キャリア', color: '#3b82f6', icon: 'briefcase' },
            'health': { label: '健康・美容', color: '#10b981', icon: 'heart' },
            'learning': { label: '趣味・学び', color: '#f59e0b', icon: 'book-open' },
            'finance': { label: 'お金・暮らし', color: '#8b5cf6', icon: 'coins' }
        };

        const allGoals = Store.getGoals();
        const goals = this.currentFilter === 'all' 
            ? allGoals 
            : allGoals.filter(g => (g.category || 'work') === this.currentFilter);

        const goalsHtml = goals.map(g => {
            const cat = categories[g.category || 'work'];
            return `
                <div class="card goal-item" data-id="${g.id}" style="margin-bottom: 1rem; position: relative; border-left: 4px solid ${cat.color};">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; padding-right: 2.5rem;">
                        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <span style="background: ${cat.color}20; color: ${cat.color}; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 0.3rem;"><i data-lucide="${cat.icon}" style="width: 12px; height: 12px;"></i>${cat.label}</span>
                            </div>
                            <span class="goal-text" style="font-weight: 600; font-size: 1.1rem; ${g.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}; margin-top: 0.5rem;">${g.title || g.text}</span>
                        </div>
                    </div>
                    ${g.description ? `<div style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1rem; ${g.completed ? 'opacity: 0.5;' : ''}">${g.description}</div>` : ''}
                    
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn-primary toggle-goal-btn" style="padding: 0.4rem 0.8rem; font-size: 0.875rem; background: ${g.completed ? 'var(--bg-surface)' : 'var(--primary)'}; border: 1px solid ${g.completed ? 'var(--border-color)' : 'var(--primary)'}; color: ${g.completed ? 'var(--text-primary)' : 'white'};">
                            ${g.completed ? '<i data-lucide="rotate-ccw" style="width:16px; height:16px;"></i> 未完了に戻す' : '<i data-lucide="check-circle" style="width:16px; height:16px;"></i> 達成！'}
                        </button>
                    </div>
                    <button class="goal-delete icon-button text-danger" title="削除" style="position: absolute; top: 0.5rem; right: 0.5rem; padding: 0.25rem;"><i data-lucide="trash-2" style="width: 18px; height: 18px;"></i></button>
                </div>
            `;
        }).join('');

        const filtersHtml = `
            <div class="filter-container" style="display: flex; background: var(--bg-surface-hover); padding: 0.35rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid var(--border-color); gap: 0.25rem; overflow-x: auto;">
                <button class="filter-btn" data-filter="all" style="padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 600; border: none; background: ${this.currentFilter === 'all' ? 'var(--primary)' : 'transparent'}; color: ${this.currentFilter === 'all' ? '#fff' : 'var(--text-secondary)'}; box-shadow: ${this.currentFilter === 'all' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'}; border-radius: 8px; cursor: pointer; transition: all 0.2s; white-space: nowrap;"><i data-lucide="layers" style="width: 14px; height: 14px; margin-right: 6px; vertical-align: middle;"></i>すべて</button>
                ${Object.entries(categories).map(([k, v]) => `
                <button class="filter-btn" data-filter="${k}" style="padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 600; border: none; background: ${this.currentFilter === k ? v.color : 'transparent'}; color: ${this.currentFilter === k ? '#fff' : 'var(--text-secondary)'}; box-shadow: ${this.currentFilter === k ? `0 4px 12px ${v.color}40` : 'none'}; border-radius: 8px; cursor: pointer; transition: all 0.2s; white-space: nowrap;"><i data-lucide="${v.icon}" style="width: 14px; height: 14px; margin-right: 6px; vertical-align: middle;"></i>${v.label}</button>
                `).join('')}
            </div>
        `;

        container.innerHTML = `
            <div class="fade-in">
                <style>
                    .filter-container::-webkit-scrollbar { display: none; }
                    .filter-container { -ms-overflow-style: none; scrollbar-width: none; }
                </style>
                <h2 style="margin-bottom: 2rem;">${this.title}</h2>
                
                <form id="add-goal-form" class="card" style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem; color: var(--text-secondary);">新しい目標を追加</h3>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <input type="text" id="goal-input" placeholder="目標のタイトル..." required style="flex: 2; min-width: 250px; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary); font-size: 1rem;">
                            <select id="goal-category" style="flex: 1; min-width: 150px; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary); outline: none; font-size: 0.95rem; cursor: pointer;">
                                ${Object.entries(categories).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
                            </select>
                        </div>
                        <textarea id="goal-desc" placeholder="詳細（具体的なステップや理由など）..." rows="3" style="padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary); font-family: inherit; resize: vertical; margin-bottom: 0.5rem;"></textarea>
                        
                        <div style="display: flex; justify-content: flex-end;">
                            <button type="submit" class="btn-primary" style="padding: 0.75rem 1.5rem; font-weight: 600;"><i data-lucide="plus"></i> 追加</button>
                        </div>
                    </div>
                </form>

                ${filtersHtml}

                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${goalsHtml || '<p class="text-muted" style="text-align:center; padding: 2rem 0;">該当するカテゴリーの目標はありません。</p>'}
                </div>
            </div>
        `;

        // Add event
        const form = container.querySelector('#add-goal-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = container.querySelector('#goal-input');
            const descInput = container.querySelector('#goal-desc');
            const catInput = container.querySelector('#goal-category');
            Store.addGoal(input.value, descInput.value, catInput.value);
            this.render(container);
            lucide.createIcons();
        });

        // Toggle and delete
        container.querySelectorAll('.toggle-goal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.closest('.goal-item').dataset.id);
                Store.toggleGoal(id);
                this.render(container);
                lucide.createIcons();
            });
        });

        container.querySelectorAll('.goal-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.closest('.goal-item').dataset.id);
                Store.deleteGoal(id);
                this.render(container);
                lucide.createIcons();
            });
        });

        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.currentTarget.dataset.filter;
                this.render(container);
                lucide.createIcons();
            });
        });
    }
};
