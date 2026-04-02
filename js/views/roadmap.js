import { Store } from '../store.js?v=12';

export const RoadmapView = {
    title: '人生ロードマップ',
    
    async render(container) {
        const roadmaps = Store.getRoadmaps();
        
        let timelineHtml = '';
        if (roadmaps.length === 0) {
            timelineHtml = `
                <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
                    <i data-lucide="map" style="width: 48px; height: 48px; opacity: 0.5; margin-bottom: 1rem;"></i>
                    <p>人生のロードマップがまだありません。<br>上のフォームから、数年後や老後に達成したい目標を追加してみましょう。</p>
                </div>
            `;
        } else {
            const itemsHtml = roadmaps.map((r, index) => {
                // Alternating left/right style for desktop, we'll use CSS to manage it cleanly.
                // We'll just build a clean vertical list with a connected line.
                return `
                    <div class="roadmap-item" style="position: relative; display: flex; gap: 1.5rem; margin-bottom: 2rem;">
                        <!-- Timeline Line & Dot -->
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div style="width: 48px; height: 48px; min-width: 48px; border-radius: 50%; background: var(--primary); color: white; display: flex; justify-content: center; align-items: center; font-weight: bold; font-size: 1.1rem; z-index: 2; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);">
                                ${r.age}歳
                            </div>
                            <!-- Vertical line connecting to next item -->
                            ${index !== roadmaps.length - 1 ? `<div style="flex: 1; width: 4px; background: var(--border-color); margin-top: 0.5rem; border-radius: 2px;"></div>` : ''}
                        </div>
                        
                        <!-- Content Card -->
                        <div class="card" style="flex: 1; border-left: 4px solid var(--primary); position: relative; padding: 1.25rem;">
                            <button class="roadmap-delete icon-button text-danger" data-id="${r.id}" title="削除" style="position: absolute; top: 0.5rem; right: 0.5rem; padding: 0.25rem;"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>
                            <p style="font-size: 1.1rem; color: var(--text-primary); margin: 0; padding-right: 2rem; white-space: pre-wrap; line-height: 1.6;">${r.text}</p>
                        </div>
                    </div>
                `;
            }).join('');

            timelineHtml = `
                <div style="max-width: 600px; margin: 0 auto; padding-top: 2rem;">
                    ${itemsHtml}
                </div>
            `;
        }

        container.innerHTML = `
            <div class="fade-in">
                <h2 style="margin-bottom: 0.5rem;">${this.title}</h2>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">30歳から100歳までの人生で達成したい壮大な目標やビジョンを描きましょう。</p>
                
                <div class="card" style="margin-bottom: 3rem; background: var(--bg-surface-hover);">
                    <h3 style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 1rem;"><i data-lucide="flag" style="width: 16px; height: 16px; margin-right: 4px;"></i> 目標を追加</h3>
                    <form id="roadmap-form" style="display: flex; gap: 1rem; align-items: flex-start; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <label style="font-weight: bold; color: var(--text-secondary);">年齢:</label>
                            <input type="number" id="roadmap-age" min="30" max="100" value="30" required style="width: 80px; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary); font-size: 1.1rem; text-align: center;">
                        </div>
                        <input type="text" id="roadmap-text" placeholder="例: 独立して自分の会社を立ち上げる" required style="flex: 1; min-width: 200px; padding: 0.75rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); background: var(--bg-surface); color: var(--text-primary);">
                        <button type="submit" class="btn-primary" style="padding: 0.75rem 1.5rem; white-space: nowrap;"><i data-lucide="plus"></i> 追加</button>
                    </form>
                </div>
                
                ${timelineHtml}
            </div>
        `;

        // Add form listener
        const form = container.querySelector('#roadmap-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const age = container.querySelector('#roadmap-age').value;
            const text = container.querySelector('#roadmap-text').value;
            Store.addRoadmapItem(age, text);
            this.render(container);
            lucide.createIcons();
        });

        // Delete listeners
        container.querySelectorAll('.roadmap-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm("この目標を削除しますか？")) {
                    const id = parseInt(e.currentTarget.dataset.id);
                    Store.deleteRoadmapItem(id);
                    this.render(container);
                    lucide.createIcons();
                }
            });
        });
    }
};
