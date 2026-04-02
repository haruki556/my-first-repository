import { Store } from '../store.js?v=16';

export const GoalsView = {
    title: '目標設定',
    currentFilter: 'all',
    
    async render(container) {
        const categories = {
            'family': { label: '家族', color: '#ec4899', icon: 'users', bg: 'linear-gradient(135deg, #fbcfe8 0%, #f472b6 100%)' },
            'work': { label: '仕事・キャリア', color: '#3b82f6', icon: 'briefcase', bg: 'linear-gradient(135deg, #bfdbfe 0%, #60a5fa 100%)' },
            'health': { label: '健康・美容', color: '#10b981', icon: 'heart', bg: 'linear-gradient(135deg, #a7f3d0 0%, #34d399 100%)' },
            'learning': { label: '趣味・学び', color: '#f59e0b', icon: 'book-open', bg: 'linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)' },
            'finance': { label: 'お金・暮らし', color: '#8b5cf6', icon: 'coins', bg: 'linear-gradient(135deg, #ddd6fe 0%, #a78bfa 100%)' }
        };

        const allGoals = Store.getGoals();
        const goals = this.currentFilter === 'all' 
            ? allGoals 
            : allGoals.filter(g => (g.category || 'work') === this.currentFilter);

        // Sort: Incomplete first, then sort by deadline, then sort by ID descending
        goals.sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
            if (a.deadline && !b.deadline) return -1;
            if (!a.deadline && b.deadline) return 1;
            return b.id - a.id;
        });

        // Add inline styles for the modern grid layout
        const styleId = 'goals-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                .goals-header {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
                    border-radius: 20px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .goal-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }
                .goal-card {
                    background: var(--bg-surface);
                    border-radius: 16px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.05);
                    border: 1px solid var(--border-color);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    position: relative;
                    overflow: hidden;
                }
                .goal-card:hover {
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    transform: translateY(-4px);
                    border-color: var(--primary);
                }
                .goal-card.completed {
                    opacity: 0.7;
                    background: var(--bg-surface-hover);
                }
                .goal-input-modern {
                    padding: 0.8rem 1rem;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                    background: var(--bg-surface);
                    color: var(--text-primary);
                    font-size: 1rem;
                    transition: all 0.2s;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
                }
                .goal-input-modern:focus {
                    outline: none;
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }
            `;
            document.head.appendChild(style);
        }

        const goalsHtml = goals.map(g => {
            const cat = categories[g.category || 'work'];
            
            // Format deadline nicely
            let deadlineHtml = '';
            if (g.deadline) {
                const dateObj = new Date(g.deadline);
                const isOverdue = !g.completed && dateObj < new Date(new Date().setHours(0,0,0,0));
                const formattedDate = dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
                const color = isOverdue ? 'var(--danger)' : 'var(--text-secondary)';
                deadlineHtml = `
                    <div style="display: flex; align-items: center; gap: 0.4rem; color: ${color}; font-size: 0.85rem; font-weight: ${isOverdue ? 'bold' : 'normal'}; margin-top: 0.5rem; background: var(--bg-surface-hover); padding: 0.3rem 0.6rem; border-radius: 6px; width: fit-content;">
                        <i data-lucide="calendar" style="width: 14px; height: 14px;"></i> 
                        期日: ${formattedDate} ${isOverdue ? '(期限切れ)' : ''}
                    </div>
                `;
            }

            return `
                <div class="goal-card ${g.completed ? 'completed' : ''}" data-id="${g.id}">
                    <div style="position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: ${cat.color};"></div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; padding-left: 0.5rem;">
                        <div style="background: ${cat.color}15; color: ${cat.color}; padding: 0.3rem 0.8rem; border-radius: 999px; font-size: 0.75rem; font-weight: bold; display: flex; align-items: center; gap: 0.4rem;">
                            <i data-lucide="${cat.icon}" style="width: 14px; height: 14px;"></i>${cat.label}
                        </div>
                        <button class="goal-delete icon-button text-danger" title="削除" style="padding: 0.4rem; border-radius: 50%; opacity: 0; transition: opacity 0.2s;"><i data-lucide="trash-2" style="width: 18px; height: 18px;"></i></button>
                    </div>
                    
                    <div style="flex: 1; padding-left: 0.5rem;">
                        <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem; line-height: 1.4; color: var(--text-primary); ${g.completed ? 'text-decoration: line-through;' : ''}">${g.title || g.text}</h3>
                        ${g.description ? `<p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6; margin-bottom: 1rem;">${g.description}</p>` : ''}
                        ${deadlineHtml}
                    </div>
                    
                    <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px dashed var(--border-color); display: flex; justify-content: flex-end; padding-left: 0.5rem;">
                        <button class="btn-primary toggle-goal-btn" style="padding: 0.5rem 1rem; font-size: 0.9rem; font-weight: 600; border-radius: 999px; background: ${g.completed ? 'transparent' : 'var(--primary)'}; border: 2px solid ${g.completed ? 'var(--border-color)' : 'var(--primary)'}; color: ${g.completed ? 'var(--text-secondary)' : 'white'}; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s;">
                            ${g.completed ? '<i data-lucide="rotate-ccw" style="width:16px; height:16px;"></i> 未完了に戻す' : '<i data-lucide="check-circle" style="width:16px; height:16px;"></i> 達成にする'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        const filtersHtml = `
            <div class="filter-container" style="display: flex; background: var(--bg-surface-hover); padding: 0.4rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid var(--border-color); gap: 0.3rem; overflow-x: auto;">
                <button class="filter-btn" data-filter="all" style="padding: 0.6rem 1.25rem; font-size: 0.9rem; font-weight: 600; border: none; background: ${this.currentFilter === 'all' ? 'var(--primary)' : 'transparent'}; color: ${this.currentFilter === 'all' ? '#fff' : 'var(--text-secondary)'}; box-shadow: ${this.currentFilter === 'all' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'}; border-radius: 8px; cursor: pointer; transition: all 0.2s; white-space: nowrap;"><i data-lucide="layers" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;"></i>すべて表示</button>
                ${Object.entries(categories).map(([k, v]) => `
                <button class="filter-btn" data-filter="${k}" style="padding: 0.6rem 1.25rem; font-size: 0.9rem; font-weight: 600; border: none; background: ${this.currentFilter === k ? v.color : 'transparent'}; color: ${this.currentFilter === k ? '#fff' : 'var(--text-secondary)'}; box-shadow: ${this.currentFilter === k ? `0 4px 12px ${v.color}50` : 'none'}; border-radius: 8px; cursor: pointer; transition: all 0.2s; white-space: nowrap;"><i data-lucide="${v.icon}" style="width: 16px; height: 16px; margin-right: 8px; vertical-align: middle;"></i>${v.label}</button>
                `).join('')}
            </div>
        `;

        container.innerHTML = `
            <div class="fade-in">
                <style>
                    .filter-container::-webkit-scrollbar { display: none; }
                    .filter-container { -ms-overflow-style: none; scrollbar-width: none; }
                    .goal-card:hover .goal-delete { opacity: 1 !important; transform: scale(1.1); }
                </style>
                
                <div class="goals-header">
                    <div>
                        <h2 style="font-size: 2rem; font-weight: 800; display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;"><i data-lucide="target" style="color: var(--primary); width: 32px; height: 32px;"></i> ${this.title}</h2>
                        <p style="color: var(--text-secondary); margin: 0; font-size: 1.05rem;">期日を切って、計画的に目標を達成しましょう。</p>
                    </div>
                    
                    <form id="add-goal-form" style="background: var(--bg-surface); padding: 1.5rem; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid var(--border-color);">
                        <div style="display: grid; grid-template-columns: 1fr; gap: 1rem;">
                            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                <div style="flex: 3; min-width: 250px;">
                                    <label style="display: block; font-size: 0.85rem; font-weight: bold; color: var(--text-secondary); margin-bottom: 0.4rem;">目標タイトル <span style="color: var(--danger);">*</span></label>
                                    <input type="text" id="goal-input" class="goal-input-modern" placeholder="例: 今月中に5kg痩せる" required style="width: 100%;">
                                </div>
                                <div style="flex: 1; min-width: 150px;">
                                    <label style="display: block; font-size: 0.85rem; font-weight: bold; color: var(--text-secondary); margin-bottom: 0.4rem;">カテゴリー</label>
                                    <select id="goal-category" class="goal-input-modern" style="width: 100%; cursor: pointer;">
                                        ${Object.entries(categories).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
                                    </select>
                                </div>
                                <div style="flex: 1; min-width: 150px;">
                                    <label style="display: block; font-size: 0.85rem; font-weight: bold; color: var(--text-secondary); margin-bottom: 0.4rem;">達成期日 (任意)</label>
                                    <input type="date" id="goal-deadline" class="goal-input-modern" style="width: 100%; cursor: pointer; font-family: inherit;">
                                </div>
                            </div>
                            
                            <div>
                                <label style="display: block; font-size: 0.85rem; font-weight: bold; color: var(--text-secondary); margin-bottom: 0.4rem;">詳細・To Doリストなど (任意)</label>
                                <textarea id="goal-desc" class="goal-input-modern" placeholder="目標を達成するための具体的なアクションプランを書きましょう..." rows="3" style="width: 100%; resize: vertical;"></textarea>
                            </div>
                            
                            <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
                                <button type="submit" class="btn-primary" style="padding: 0.8rem 2rem; font-weight: bold; border-radius: 999px; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);"><i data-lucide="plus" style="margin-right: 8px;"></i> 目標を追加する</button>
                            </div>
                        </div>
                    </form>
                </div>

                ${filtersHtml}

                <div class="goal-grid">
                    ${goalsHtml || '<div style="grid-column: 1/-1; padding: 4rem 2rem; text-align: center; background: var(--bg-surface); border: 2px dashed var(--border-color); border-radius: 20px;"><i data-lucide="target" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 1rem;"></i><h3 style="font-size: 1.25rem; color: var(--text-primary); margin-bottom: 0.5rem;">目標がありません</h3><p style="color: var(--text-secondary);">上部のフォームから、実現したい目標を追加してください。</p></div>'}
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
            const deadlineInput = container.querySelector('#goal-deadline');
            Store.addGoal(input.value, descInput.value, catInput.value, deadlineInput.value);
            this.render(container);
            lucide.createIcons();
        });

        // Toggle and delete
        container.querySelectorAll('.toggle-goal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.closest('.goal-card').dataset.id);
                Store.toggleGoal(id);
                this.render(container);
                lucide.createIcons();
            });
        });

        container.querySelectorAll('.goal-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm('この目標を完全に削除しますか？')){
                    const id = parseInt(e.currentTarget.closest('.goal-card').dataset.id);
                    Store.deleteGoal(id);
                    this.render(container);
                    lucide.createIcons();
                }
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
