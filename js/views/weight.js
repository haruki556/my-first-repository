import { Store } from '../store.js?v=5';

export const WeightView = {
    title: '体重管理',
    
    async render(container) {
        const weights = Store.getWeights();
        
        let chartHtml = '<div style="height: 250px; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">データが不足しているためグラフを表示できません。</div>';
        
        if (weights.length > 1) {
            // Very simple SVG line chart
            const width = 600;
            const height = 200;
            const padding = 20;

            const minW = Math.min(...weights.map(w => w.value));
            const maxW = Math.max(...weights.map(w => w.value));
            const rangeW = (maxW - minW) || 1; // avoid div/0

            const points = weights.map((w, i) => {
                const x = padding + (i / (weights.length - 1)) * (width - padding * 2);
                const y = height - padding - ((w.value - minW) / rangeW) * (height - padding * 2);
                return `${x},${y}`;
            }).join(' ');

            chartHtml = `
                <div style="width: 100%; overflow-x: auto;">
                    <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block; overflow: visible;">
                        <!-- Grid lines -->
                        <line x1="${padding}" y1="${padding}" x2="${width-padding}" y2="${padding}" stroke="var(--border-color)" stroke-width="1" stroke-dasharray="4" />
                        <line x1="${padding}" y1="${height-padding}" x2="${width-padding}" y2="${height-padding}" stroke="var(--border-color)" stroke-width="1" stroke-dasharray="4" />
                        <!-- Labels -->
                        <text x="0" y="${padding + 4}" fill="var(--text-muted)" font-size="10">${maxW}kg</text>
                        <text x="0" y="${height-padding + 4}" fill="var(--text-muted)" font-size="10">${minW}kg</text>
                        <!-- Line -->
                        <polyline fill="none" stroke="var(--accent-primary)" stroke-width="3" points="${points}" stroke-linecap="round" stroke-linejoin="round"/>
                        <!-- Points -->
                        ${weights.map((w, i) => {
                            const x = padding + (i / (weights.length - 1)) * (width - padding * 2);
                            const y = height - padding - ((w.value - minW) / rangeW) * (height - padding * 2);
                            const d = new Date(w.date).toLocaleDateString('ja-JP', {month:'short', day:'numeric'});
                            return `
                                <circle cx="${x}" cy="${y}" r="4" fill="var(--bg-surface)" stroke="var(--accent-primary)" stroke-width="2">
                                    <title>${d} - ${w.value}kg</title>
                                </circle>
                                <text x="${x}" y="${y - 10}" fill="var(--text-secondary)" font-size="10" text-anchor="middle">${w.value}</text>
                                ${i === 0 || i === weights.length - 1 ? `<text x="${x}" y="${height}" fill="var(--text-muted)" font-size="10" text-anchor="middle">${d}</text>` : ''}
                            `;
                        }).join('')}
                    </svg>
                </div>
            `;
        } else if (weights.length === 1) {
             chartHtml = `<div style="height: 250px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); flex-direction: column;">
                <p>開始体重: <strong>${weights[0].value}kg</strong> (記録日: ${new Date(weights[0].date).toLocaleDateString('ja-JP')})</p>
                <p style="font-size: 0.875rem;">測定を続けて推移を確認しましょう！</p>
             </div>`;
        }

        const listHtml = weights.slice().reverse().map(w => {
            return `
                <div class="weight-item" data-id="${w.id}" data-value="${w.value}" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <input type="checkbox" class="weight-checkbox" value="${w.id}" style="width: 16px; height: 16px; cursor: pointer;">
                        <span style="color: var(--text-secondary);">${new Date(w.date).toLocaleDateString('ja-JP')}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span style="font-weight: 600;">${w.value} kg</span>
                        <div style="display: flex; gap: 0.25rem;">
                            <button class="weight-edit icon-button" title="編集"><i data-lucide="edit-2" style="width: 16px; height: 16px;"></i></button>
                            <button class="weight-delete icon-button text-danger" title="削除"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div style="max-width: 800px; margin: 0 auto;">
                <div class="card" style="margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3 style="color: var(--text-secondary);">体重を記録</h3>
                    </div>
                    <form id="weight-form" style="display: flex; gap: 1rem; align-items: center;">
                        <div style="position: relative; flex: 1;">
                            <input type="number" id="weight-input" step="0.1" placeholder="例: 70.5" required style="padding-right: 3rem;">
                            <span style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted);">kg</span>
                        </div>
                        <button type="submit" class="btn-primary">記録する</button>
                    </form>
                </div>

                <div class="card" style="margin-bottom: 2rem;">
                    <h3 style="margin-bottom: 1.5rem; color: var(--text-secondary);">推移グラフ</h3>
                    ${chartHtml}
                </div>

                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="color: var(--text-secondary); margin: 0;">履歴</h3>
                        <button id="delete-selected-btn" class="btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.875rem; display: none; background-color: var(--danger);"><i data-lucide="trash-2" style="width:16px; height:16px; margin-right:4px;"></i> 削除</button>
                    </div>
                    <div style="max-height: 300px; overflow-y: auto;">
                        ${weights.length > 0 ? listHtml : '<p class="text-muted">記録がありません。</p>'}
                    </div>
                </div>
            </div>
        `;

        container.querySelector('#weight-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const val = container.querySelector('#weight-input').value;
            if (val) {
                Store.addWeight(val);
                this.render(container);
                lucide.createIcons();
            }
        });

        container.querySelectorAll('.weight-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = e.currentTarget.closest('.weight-item');
                const id = parseInt(item.dataset.id);
                const currentVal = item.dataset.value;
                const newVal = prompt("正しい体重を入力してください (kg):", currentVal);
                if (newVal !== null && newVal.trim() !== '' && !isNaN(newVal)) {
                    Store.updateWeight(id, newVal);
                    this.render(container);
                    lucide.createIcons();
                }
            });
        });

        container.querySelectorAll('.weight-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (confirm("本当にこの記録を削除しますか？")) {
                    const id = parseInt(e.currentTarget.closest('.weight-item').dataset.id);
                    Store.deleteWeight(id);
                    this.render(container);
                    lucide.createIcons();
                }
            });
        });

        const checkboxes = container.querySelectorAll('.weight-checkbox');
        const bulkDeleteBtn = container.querySelector('#delete-selected-btn');

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
                if (selectedIds.length > 0 && confirm(`${selectedIds.length}件の記録を削除しますか？`)) {
                    Store.deleteWeights(selectedIds);
                    this.render(container);
                    lucide.createIcons();
                }
            });
        }
    }
};
