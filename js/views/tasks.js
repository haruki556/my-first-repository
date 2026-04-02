import { Store } from '../store.js?v=11';

export const TasksView = {
    title: 'タスク管理',
    
    async render(container) {
        const tasks = Store.getTasks();
        
        const renderTaskColumn = (status, title, icon, color) => {
            const columnTasks = tasks.filter(t => t.status === status);
            const html = columnTasks.map(t => {
                let dueDateHtml = '';
                if (t.dueDate) {
                    const due = new Date(t.dueDate);
                    const now = new Date();
                    now.setHours(0,0,0,0);
                    const isOverdue = due < now && t.status !== 'done';
                    dueDateHtml = `<div style="font-size: 0.75rem; color: ${isOverdue ? 'var(--danger)' : 'var(--text-muted)'}; margin-top: 0.25rem;"><i data-lucide="calendar" style="width:12px; height:12px; vertical-align:middle; margin-right:2px;"></i>${due.toLocaleDateString('ja-JP')}</div>`;
                }
                
                return `
                <div class="task-card" data-id="${t.id}" style="background: var(--bg-surface-hover); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 0.75rem; border: 1px solid var(--border-color); display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <span style="${t.status === 'done' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${t.title}</span>
                        ${dueDateHtml}
                    </div>
                    <div style="display:flex; gap:0.25rem; flex-shrink: 0; margin-left: 0.5rem; align-items: center;">
                        ${status !== 'todo' ? `<button class="icon-button move-btn" data-status="todo" title="Move to Todo"><i data-lucide="arrow-left"></i></button>` : ''}
                        ${status !== 'in-progress' ? `<button class="icon-button move-btn" data-status="in-progress" title="Move to In Progress"><i data-lucide="${status === 'done' ? 'arrow-left' : 'arrow-right'}"></i></button>` : ''}
                        ${status !== 'done' ? `<button class="icon-button move-btn" data-status="done" title="Move to Done"><i data-lucide="arrow-right"></i></button>` : ''}
                        <button class="icon-button delete-btn text-danger"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
            `;
            }).join('');
            
            return `
                <div class="task-column" style="flex: 1; min-width: 250px; background: var(--bg-base); padding: 1rem; border-radius: var(--radius-lg); border: 1px solid var(--border-color);">
                    <h3 style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; color: ${color};"><i data-lucide="${icon}"></i> ${title} <span style="margin-left:auto; background:var(--bg-surface); padding:0.1rem 0.5rem; border-radius:var(--radius-full); font-size:0.8rem; color:var(--text-secondary);">${columnTasks.length}</span></h3>
                    <div class="task-list">
                        ${html || `<p style="color: var(--text-muted); text-align: center; font-size: 0.875rem;">タスクなし</p>`}
                    </div>
                    ${status === 'todo' ? `
                    <form id="add-task-form" style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                        <input type="text" id="task-input" placeholder="新しいタスク..." required style="padding: 0.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary);">
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="date" id="task-due" style="padding: 0.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary); flex: 1;">
                            <button type="submit" class="btn-primary" style="padding: 0.5rem; display: flex; align-items: center; justify-content: center;"><i data-lucide="plus"></i></button>
                        </div>
                    </form>` : ''}
                </div>
            `;
        }

        container.innerHTML = `
            <div style="display: flex; gap: 1.5rem; overflow-x: auto; padding-bottom: 1rem; min-height: 70vh;">
                ${renderTaskColumn('todo', '未着手', 'circle', 'var(--text-secondary)')}
                ${renderTaskColumn('in-progress', '進行中', 'clock', 'var(--warning)')}
                ${renderTaskColumn('done', '完了', 'check-circle', 'var(--success)')}
            </div>
        `;

        // Add task event
        const addForm = container.querySelector('#add-task-form');
        if (addForm) {
            addForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = container.querySelector('#task-input');
                const dueInput = container.querySelector('#task-due');
                Store.addTask(input.value, dueInput.value || null);
                this.render(container);
                lucide.createIcons();
            });
        }

        // Action events
        container.querySelectorAll('.task-card').forEach(card => {
            const id = parseInt(card.dataset.id);
            
            card.querySelectorAll('.move-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    Store.updateTaskStatus(id, btn.dataset.status);
                    this.render(container);
                    lucide.createIcons();
                });
            });

            card.querySelector('.delete-btn').addEventListener('click', () => {
                Store.deleteTask(id);
                this.render(container);
                lucide.createIcons();
            });
        });

    }
};
