import { Store } from '../store.js?v=15';

export const HabitsView = {
    title: '習慣トラッカー',
    
    // Helper to get formatted last 7 days
    getLast7Days() {
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dates.push({
                dateString: `${y}-${m}-${day}`,
                display: `${m}/${day}`,
                isToday: i === 0
            });
        }
        return dates;
    },

    // Helper to calculate current streak
    calculateStreak(completedDates, todayStr) {
        if (!completedDates || completedDates.length === 0) return 0;
        let streak = 0;
        let checkDate = new Date();
        
        while (true) {
            const y = checkDate.getFullYear();
            const m = String(checkDate.getMonth() + 1).padStart(2, '0');
            const day = String(checkDate.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${day}`;
            
            if (completedDates.includes(dateStr)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                // If today is missed but yesterday was tracked, it still counts as an ongoing streak (hasn't broken until tomorrow)
                if (streak === 0 && dateStr === todayStr) {
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }
            }
        }
        return streak;
    },

    async render(container) {
        const habits = Store.getHabits();
        const last7Days = this.getLast7Days();
        const todayStr = last7Days[6].dateString;

        const habitsHtml = habits.map(h => {
             const daysHtml = last7Days.map(d => {
                 const isCompleted = h.completedDates.includes(d.dateString);
                 return `
                     <div class="habit-day" data-id="${h.id}" data-date="${d.dateString}" 
                          style="width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;
                          background: ${isCompleted ? h.color : 'var(--bg-surface-hover)'}; 
                          border: 1px solid ${isCompleted ? h.color : 'var(--border-color)'}; 
                          opacity: ${d.isToday ? '1' : '0.7'}; 
                          box-shadow: ${isCompleted ? `0 2px 8px ${h.color}40` : 'none'};"
                          title="${d.display}">
                         ${isCompleted ? '<i data-lucide="check" style="color: white; width: 20px; height: 20px;"></i>' : ''}
                     </div>
                 `;
             }).join('');

             const currentStreak = this.calculateStreak(h.completedDates, todayStr);

             return `
                <div class="card habit-item" data-id="${h.id}" style="margin-bottom: 1rem; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 48px; height: 48px; border-radius: 12px; background: ${h.color}20; color: ${h.color}; display: flex; justify-content: center; align-items: center;">
                                <i data-lucide="${h.icon}" style="width: 24px; height: 24px;"></i>
                            </div>
                            <div>
                                <h4 style="font-size: 1.15rem; margin: 0;">${h.title}</h4>
                                <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 0.25rem; margin-top: 0.25rem;">
                                    <i data-lucide="flame" style="width: 14px; height: 14px; color: var(--warning);"></i> 連続 ${currentStreak} 日
                                </div>
                            </div>
                        </div>
                        <button class="habit-delete icon-button text-danger" title="削除" style="padding: 0.25rem;"><i data-lucide="trash-2" style="width: 18px; height: 18px;"></i></button>
                    </div>
                    
                    <div style="display: flex; flex-direction: column;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem; padding: 0 2px;">
                            ${last7Days.map(d => `<span style="font-size: 0.75rem; color: var(--text-muted); width: 36px; text-align: center; ${d.isToday ? 'font-weight:bold; color:var(--text-primary);' : ''}">${d.isToday ? '今日' : d.display.split('/')[1]}</span>`).join('')}
                        </div>
                        <div style="display: flex; justify-content: space-between; gap: 0.2rem;">
                            ${daysHtml}
                        </div>
                    </div>
                </div>
             `;
        }).join('');

        container.innerHTML = `
            <div class="fade-in">
                <style>
                    .habit-day:hover { transform: scale(1.05); }
                    .habit-day:active { transform: scale(0.95); }
                </style>
                <h2 style="margin-bottom: 2rem;">${this.title}</h2>
                
                <form id="add-habit-form" class="card" style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1rem; color: var(--text-secondary);">新しい習慣を追加</h3>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <input type="text" id="habit-title" placeholder="習慣の名前（例: 水を2L飲む）..." required style="flex: 2; min-width: 200px; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary);">
                        <select id="habit-icon" style="flex: 1; min-width: 100px; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary); outline: none;">
                            <option value="target">🎯 目標</option>
                            <option value="droplets">💧 水分</option>
                            <option value="book-open">📚 読書</option>
                            <option value="dumbbell">💪 運動</option>
                            <option value="moon">🌙 睡眠</option>
                            <option value="utensils">🍽 食事</option>
                            <option value="code">💻 学習</option>
                            <option value="heart">❤️ 健康</option>
                        </select>
                        <select id="habit-color" style="flex: 1; min-width: 100px; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary); outline: none;">
                            <option value="#3b82f6" style="color:#3b82f6;">🔵 ブルー</option>
                            <option value="#10b981" style="color:#10b981;">🟢 グリーン</option>
                            <option value="#f59e0b" style="color:#f59e0b;">🟠 オレンジ</option>
                            <option value="#ec4899" style="color:#ec4899;">🔴 ピンク</option>
                            <option value="#8b5cf6" style="color:#8b5cf6;">🟣 パープル</option>
                        </select>
                        <button type="submit" class="btn-primary" style="padding: 0 1.5rem;"><i data-lucide="plus"></i> 追加</button>
                    </div>
                </form>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
                    ${habitsHtml || '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);"><i data-lucide="calendar-check" style="width:48px;height:48px;opacity:0.3;margin-bottom:1rem;"></i><br>習慣が登録されていません。<br>上から新しい習慣を追加して、毎日記録しましょう！</div>'}
                </div>
            </div>
        `;

        // Add form listener
        const form = container.querySelector('#add-habit-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = container.querySelector('#habit-title').value;
            const icon = container.querySelector('#habit-icon').value;
            const color = container.querySelector('#habit-color').value;
            Store.addHabit(title, icon, color);
            this.render(container);
            lucide.createIcons();
        });

        // Toggle listener (clicks on the day boxes)
        container.querySelectorAll('.habit-day').forEach(box => {
            box.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.dataset.id);
                const dateString = e.currentTarget.dataset.date;
                Store.toggleHabit(id, dateString);
                this.render(container);
                lucide.createIcons();
            });
        });

        // Delete listener
        container.querySelectorAll('.habit-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm("この習慣を削除してもよろしいですか？（履歴もすべて消去されます）")) {
                    const id = parseInt(e.currentTarget.closest('.habit-item').dataset.id);
                    Store.deleteHabit(id);
                    this.render(container);
                    lucide.createIcons();
                }
            });
        });
    }
};
