import { Store } from '../store.js?v=9';

export const ReportsView = {
    title: '活動レポート',
    currentFilter: 'all',
    editingId: null,
    
    async render(container) {
        const allReports = Store.getReports();
        const reports = this.currentFilter === 'all' 
            ? allReports 
            : allReports.filter(r => r.type === this.currentFilter);

        const reportsHtml = reports.map(r => {
            const date = new Date(r.date).toLocaleDateString('ja-JP', {
                year: 'numeric', month: 'numeric', day: 'numeric', weekday: 'short'
            });
            const typeLabels = { 'daily': '日報', 'weekly': '週報', 'monthly': '月報' };
            const badgeText = typeLabels[r.type] || '日報';
            
            const conditionEmoji = r.condition || '';
            const conditionOptionsHtml = ['🤩', '🙂', '😐', '🤨', '😴'].map(emo => 
                `<option value="${emo}" ${emo === (r.condition || '😐') ? 'selected' : ''}>${emo}</option>`
            ).join('');

            if (this.editingId === r.id) {
                let isJson = false;
                let parsed = {};
                try { parsed = JSON.parse(r.content); isJson = parsed.good !== undefined; } catch(e){}

                const editFieldsHtml = isJson ? `
                    <div style="display:flex; flex-direction:column; gap:0.75rem; margin-bottom: 0.75rem;">
                        <input type="hidden" class="edit-is-json" value="true">
                        <div>
                            <div style="font-size:0.75rem; font-weight:bold; color:var(--text-secondary); margin-bottom:2px;">良かったところ</div>
                            <textarea class="edit-good" style="width: 100%; min-height: 60px; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary); font-family: inherit;">${parsed.good}</textarea>
                        </div>
                        <div>
                            <div style="font-size:0.75rem; font-weight:bold; color:var(--text-secondary); margin-bottom:2px;">改善点</div>
                            <textarea class="edit-improve" style="width: 100%; min-height: 60px; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary); font-family: inherit;">${parsed.improve}</textarea>
                        </div>
                        <div>
                            <div style="font-size:0.75rem; font-weight:bold; color:var(--text-secondary); margin-bottom:2px;">今日感謝すること3つ</div>
                            <textarea class="edit-grateful" style="width: 100%; min-height: 60px; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary); font-family: inherit;">${parsed.grateful}</textarea>
                        </div>
                        <div>
                            <div style="font-size:0.75rem; font-weight:bold; color:var(--text-secondary); margin-bottom:2px;">明日やること</div>
                            <textarea class="edit-tomorrow" style="width: 100%; min-height: 60px; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary); font-family: inherit;">${parsed.tomorrow}</textarea>
                        </div>
                        <div>
                            <div style="font-size:0.75rem; font-weight:bold; color:var(--text-secondary); margin-bottom:2px;">自由書き込み</div>
                            <textarea class="edit-free" style="width: 100%; min-height: 60px; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary); font-family: inherit;">${parsed.free}</textarea>
                        </div>
                    </div>
                ` : `
                    <input type="hidden" class="edit-is-json" value="false">
                    <textarea class="edit-report-content" style="width: 100%; min-height: 120px; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary); margin-bottom: 0.75rem; font-family: inherit; line-height: 1.6;">${r.content}</textarea>
                `;

                return `
                    <div class="card report-item" data-id="${r.id}" style="margin-bottom: 1rem; border: 1px solid var(--primary);">
                        <div style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                            <span><i data-lucide="edit-2" style="width:14px; height:14px; margin-right:4px;"></i>レポートを編集中...</span>
                            <select class="edit-report-condition" style="padding: 0.2rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface); outline: none;">
                                ${conditionOptionsHtml}
                            </select>
                        </div>
                        ${editFieldsHtml}
                        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                            <button class="btn-secondary cancel-edit-btn" style="padding: 0.4rem 1rem; font-size: 0.875rem;">キャンセル</button>
                            <button class="btn-primary save-edit-btn" style="padding: 0.4rem 1rem; font-size: 0.875rem;">保存</button>
                        </div>
                    </div>
                `;
            }

            let displayContent = '';
            try {
                const parsed = JSON.parse(r.content);
                if (parsed.good !== undefined) {
                    displayContent = `
                        <div style="display:flex; flex-direction:column; gap:0.5rem; margin-top: 0.5rem;">
                            <div style="background:var(--bg-base); padding:0.75rem; border-radius:var(--radius-md); border-left: 3px solid var(--primary);">
                                <div style="font-weight:bold; color:var(--text-secondary); font-size:0.75rem; margin-bottom:0.25rem;"><i data-lucide="thumbs-up" style="width:12px; height:12px; margin-right:2px; vertical-align:middle;"></i>良かったところ</div>
                                <div style="font-size:0.9rem; white-space:pre-wrap;">${parsed.good || 'なし'}</div>
                            </div>
                            <div style="background:var(--bg-base); padding:0.75rem; border-radius:var(--radius-md); border-left: 3px solid var(--warning);">
                                <div style="font-weight:bold; color:var(--text-secondary); font-size:0.75rem; margin-bottom:0.25rem;"><i data-lucide="trending-up" style="width:12px; height:12px; margin-right:2px; vertical-align:middle;"></i>改善点</div>
                                <div style="font-size:0.9rem; white-space:pre-wrap;">${parsed.improve || 'なし'}</div>
                            </div>
                            <div style="background:var(--bg-base); padding:0.75rem; border-radius:var(--radius-md); border-left: 3px solid var(--danger);">
                                <div style="font-weight:bold; color:var(--text-secondary); font-size:0.75rem; margin-bottom:0.25rem;"><i data-lucide="heart" style="width:12px; height:12px; margin-right:2px; vertical-align:middle;"></i>今日感謝すること3つ</div>
                                <div style="font-size:0.9rem; white-space:pre-wrap;">${parsed.grateful || 'なし'}</div>
                            </div>
                            <div style="background:var(--bg-base); padding:0.75rem; border-radius:var(--radius-md); border-left: 3px solid var(--info);">
                                <div style="font-weight:bold; color:var(--text-secondary); font-size:0.75rem; margin-bottom:0.25rem;"><i data-lucide="target" style="width:12px; height:12px; margin-right:2px; vertical-align:middle;"></i>明日やること</div>
                                <div style="font-size:0.9rem; white-space:pre-wrap;">${parsed.tomorrow || 'なし'}</div>
                            </div>
                            ${parsed.free ? `
                            <div style="background:var(--bg-base); padding:0.75rem; border-radius:var(--radius-md); border-left: 3px solid var(--text-muted);">
                                <div style="font-weight:bold; color:var(--text-secondary); font-size:0.75rem; margin-bottom:0.25rem;"><i data-lucide="message-square" style="width:12px; height:12px; margin-right:2px; vertical-align:middle;"></i>自由書き込み</div>
                                <div style="font-size:0.9rem; white-space:pre-wrap;">${parsed.free}</div>
                            </div>` : ''}
                        </div>
                    `;
                } else {
                    displayContent = `<div style="white-space: pre-wrap; line-height: 1.6; padding-top: 0.5rem;">${r.content}</div>`;
                }
            } catch(e) {
                displayContent = `<div style="white-space: pre-wrap; line-height: 1.6; padding-top: 0.5rem;">${r.content}</div>`;
            }

            return `
                <div class="card report-item" data-id="${r.id}" style="margin-bottom: 1rem; position: relative;">
                    <button class="report-delete icon-button text-danger" title="削除" style="position: absolute; top: 0.5rem; right: 0.5rem; padding: 0.25rem;"><i data-lucide="trash-2" style="width: 18px; height: 18px;"></i></button>
                    <button class="report-edit icon-button text-primary" title="編集" style="position: absolute; top: 0.5rem; right: 2.5rem; padding: 0.25rem;"><i data-lucide="edit-2" style="width: 18px; height: 18px;"></i></button>
                    <div style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center; padding-right: 4.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" class="report-checkbox" value="${r.id}" style="width: 16px; height: 16px; cursor: pointer;">
                            <span><i data-lucide="calendar" style="width:14px; height:14px; margin-right:4px; vertical-align:middle;"></i> ${date}</span>
                        </div>
                        <span style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); padding: 0.2rem 0.5rem; border-radius: var(--radius-full); font-size: 0.75re        container.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
                <div class="card" style="position: sticky; top: 100px;">
                    <h3 style="margin-bottom: 1rem; color: var(--text-secondary);"><i data-lucide="pen-tool"></i> レポートを作成</h3>
                    <form id="report-form">
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;">
                            <div style="flex: 1; min-width: 120px;">
                                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">日付</label>
                                <input type="date" id="report-date" required style="width: 100%; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary); font-family: inherit;">
                            </div>
                            <div style="flex: 1; min-width: 120px;">
                                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">種類</label>
                                <select id="report-type" style="width: 100%; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary); outline: none; cursor: pointer;">
                                    <option value="daily">日報</option>
                                    <option value="weekly">週報</option>
                                    <option value="monthly">月報</option>
                                </select>
                            </div>
                            <div style="flex: 1; min-width: 150px;">
                                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.875rem;">コンディション</label>
                                <select id="report-condition" style="width: 100%; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary); font-size: 1.1rem; outline: none; cursor: pointer;">
                                    <option value="🤩">🤩 絶好調</option>
                                    <option value="🙂">🙂 良い</option>
                                    <option value="😐" selected>😐 普通</option>
                                    <option value="🤨">🤨 いまいち</option>
                                    <option value="😴">😴 お疲れ</option>
                                </select>
                            </div>
                        <div id="daily-report-fields" style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; width: 100%;">
                            <div>
                                <label style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: bold; color: var(--text-primary);">良かったところ</label>
                                <textarea id="field-good" rows="2" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary); resize: vertical;"></textarea>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: bold; color: var(--text-primary);">改善点</label>
                                <textarea id="field-improve" rows="2" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary); resize: vertical;"></textarea>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: bold; color: var(--text-primary);">今日感謝すること3つ</label>
                                <textarea id="field-grateful" rows="3" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary); resize: vertical;"></textarea>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: bold; color: var(--text-primary);">明日やること</label>
                                <textarea id="field-tomorrow" rows="2" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary); resize: vertical;"></textarea>
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: bold; color: var(--text-primary);">自由書き込み <span style="font-weight: normal; color: var(--text-muted);">(任意)</span></label>
                                <textarea id="field-free" rows="2" style="width: 100%; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary); resize: vertical;"></textarea>
                            </div>
                        </div>
                        <div id="general-report-fields" style="display: none; width: 100%;">
                            <textarea id="report-content" rows="8" placeholder="今週・今月達成したこと、改善点などを記入してください" style="width: 100%; margin-bottom: 1rem; resize: vertical; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface-hover); color: var(--text-primary);"></textarea>
                        </div>
                        
                        <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">保存する</button>
                    </form>
                </div>
                
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                        <h3 style="color: var(--text-secondary); margin: 0;">履歴</h3>
                        <button id="delete-selected-reports-btn" class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.875rem; display: none; background-color: var(--danger);"><i data-lucide="trash-2" style="width:16px; height:16px; margin-right:4px;"></i> 削除</button>
                    </div>
                    
                    <div style="display: flex; background: var(--bg-surface-hover); padding: 0.35rem; border-radius: 12px; margin-bottom: 1.5rem; border: 1px solid var(--border-color); width: fit-content; gap: 0.25rem; overflow-x: auto;">
                        <button class="filter-btn" data-filter="all" style="padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 600; border: none; background: ${this.currentFilter === 'all' ? 'var(--primary)' : 'transparent'}; color: ${this.currentFilter === 'all' ? '#fff' : 'var(--text-secondary)'}; box-shadow: ${this.currentFilter === 'all' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'}; border-radius: 8px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;"><i data-lucide="layers" style="width: 14px; height: 14px; margin-right: 6px; vertical-align: middle;"></i>すべて</button>
                        <button class="filter-btn" data-filter="daily" style="padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 600; border: none; background: ${this.currentFilter === 'daily' ? 'var(--primary)' : 'transparent'}; color: ${this.currentFilter === 'daily' ? '#fff' : 'var(--text-secondary)'}; box-shadow: ${this.currentFilter === 'daily' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'}; border-radius: 8px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;"><i data-lucide="sun" style="width: 14px; height: 14px; margin-right: 6px; vertical-align: middle;"></i>日報</button>
                        <button class="filter-btn" data-filter="weekly" style="padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 600; border: none; background: ${this.currentFilter === 'weekly' ? 'var(--primary)' : 'transparent'}; color: ${this.currentFilter === 'weekly' ? '#fff' : 'var(--text-secondary)'}; box-shadow: ${this.currentFilter === 'weekly' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'}; border-radius: 8px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;"><i data-lucide="calendar-days" style="width: 14px; height: 14px; margin-right: 6px; vertical-align: middle;"></i>週報</button>
                        <button class="filter-btn" data-filter="monthly" style="padding: 0.5rem 1.25rem; font-size: 0.875rem; font-weight: 600; border: none; background: ${this.currentFilter === 'monthly' ? 'var(--primary)' : 'transparent'}; color: ${this.currentFilter === 'monthly' ? '#fff' : 'var(--text-secondary)'}; box-shadow: ${this.currentFilter === 'monthly' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'}; border-radius: 8px; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;"><i data-lucide="calendar-range" style="width: 14px; height: 14px; margin-right: 6px; vertical-align: middle;"></i>月報</button>
                    </div>
                    <div style="max-height: 800px; overflow-y: auto; padding-right: 0.5rem;">
                        ${reports.length > 0 ? reportsHtml : '<p class="text-muted" style="text-align:center; padding: 2rem 0;">該当するカテゴリーのレポートはありません。</p>'}
                    </div>
                </div>
            </div>
        `;

        // Handle mobile layout (stack columns)
        const style = document.createElement('style');
        style.innerHTML = `
            @media (max-width: 768px) {
                div[style*="grid-template-columns: 1fr 1fr"] {
                    grid-template-columns: 1fr !important;
                }class="text-muted" style="text-align:center; padding: 2rem 0;">該当するカテゴリーのレポートはありません。</p>'}
                    </div>
                </div>
            </div>
        `;

        // Handle mobile layout (stack columns)
        const style = document.createElement('style');
        style.innerHTML = `
            @media (max-width: 768px) {
                div[style*="grid-template-columns: 1fr 2fr"] {
                    grid-template-columns: 1fr !important;
                }
                .card[style*="position: sticky"] {
                    position: static !important;
                }
            }
        `;
        container.appendChild(style);

        const typeSelect = container.querySelector('#report-type');
        const dailyFields = container.querySelector('#daily-report-fields');
        const generalFields = container.querySelector('#general-report-fields');

        typeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'daily') {
                dailyFields.style.display = 'flex';
                generalFields.style.display = 'none';
            } else {
                dailyFields.style.display = 'none';
                generalFields.style.display = 'block';
            }
        });

        // Set default date
        const dateInput = container.querySelector('#report-date');
        if (!dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        container.querySelector('#report-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const date = container.querySelector('#report-date').value;
            const type = container.querySelector('#report-type').value;
            const condition = container.querySelector('#report-condition').value;
            
            let content = '';
            if (type === 'daily') {
                const good = container.querySelector('#field-good').value;
                const improve = container.querySelector('#field-improve').value;
                const grateful = container.querySelector('#field-grateful').value;
                const tomorrow = container.querySelector('#field-tomorrow').value;
                const free = container.querySelector('#field-free').value;
                
                content = JSON.stringify({ good, improve, grateful, tomorrow, free });
            } else {
                content = container.querySelector('#report-content').value;
            }
            
            Store.addReport(date, type, content, condition);
            this.render(container);
            lucide.createIcons();
        });

        container.querySelectorAll('.report-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm("本当にこのレポートを削除しますか？")) {
                    const id = parseInt(e.currentTarget.closest('.report-item').dataset.id);
                    Store.deleteReport(id);
                    this.render(container);
                    lucide.createIcons();
                }
            });
        });

        // Inline editing listeners
        container.querySelectorAll('.report-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.currentTarget.closest('.report-item').dataset.id);
                this.editingId = id;
                this.render(container);
                lucide.createIcons();
            });
        });

        container.querySelectorAll('.cancel-edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.editingId = null;
                this.render(container);
                lucide.createIcons();
            });
        });

        container.querySelectorAll('.save-edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.currentTarget.closest('.report-item');
                const id = parseInt(item.dataset.id);
                const isJson = item.querySelector('.edit-is-json').value === 'true';
                const newCondition = item.querySelector('.edit-report-condition').value;
                
                let newContent = '';
                if (isJson) {
                    const good = item.querySelector('.edit-good').value;
                    const improve = item.querySelector('.edit-improve').value;
                    const grateful = item.querySelector('.edit-grateful').value;
                    const tomorrow = item.querySelector('.edit-tomorrow').value;
                    const free = item.querySelector('.edit-free').value;
                    newContent = JSON.stringify({ good, improve, grateful, tomorrow, free });
                } else {
                    newContent = item.querySelector('.edit-report-content').value;
                    if (newContent.trim() === '') return;
                }
                
                Store.updateReport(id, newContent, newCondition);
                this.editingId = null;
                this.render(container);
                lucide.createIcons();
            });
        });

        const checkboxes = container.querySelectorAll('.report-checkbox');
        const bulkDeleteBtn = container.querySelector('#delete-selected-reports-btn');

        if (bulkDeleteBtn && checkboxes.length > 0) {
            const updateBulkDeleteBtn = () => {
                const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
                bulkDeleteBtn.style.display = checkedCount > 0 ? 'inline-flex' : 'none';
                if (checkedCount > 0) {
                    bulkDeleteBtn.innerHTML = `<i data-lucide="trash-2" style="width:16px; height:16px; margin-right:4px;"></i> ${checkedCount}件を削除`;
                    lucide.createIcons();
                }
            };

            checkboxes.forEach(cb => {
                cb.addEventListener('change', updateBulkDeleteBtn);
            });

            bulkDeleteBtn.addEventListener('click', () => {
                const selectedIds = Array.from(checkboxes)
                    .filter(cb => cb.checked)
                    .map(cb => parseInt(cb.value));
                if (selectedIds.length > 0 && confirm(`${selectedIds.length}件のレポートを削除しますか？`)) {
                    Store.deleteReports(selectedIds);
                    this.render(container);
                    lucide.createIcons();
                }
            });
        }

        container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.currentTarget.dataset.filter;
                this.render(container);
                lucide.createIcons();
            });
        });
    }
};
