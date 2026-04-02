import { Store } from '../store.js?v=15';

export const VisionBoardView = {
    title: 'ビジョンボード',
    
    async render(container) {
        const images = Store.getVisionImages();
        
        // Use inline CSS for masonry layout and micro-animations
        const styleId = 'vision-board-styles';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                .vision-header-container {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%);
                    border-radius: 24px;
                    padding: 2rem 2.5rem;
                    margin-bottom: 2.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                }
                .vision-gallery {
                    column-count: 1;
                    column-gap: 1.5rem;
                    width: 100%;
                }
                @media (min-width: 600px) { .vision-gallery { column-count: 2; } }
                @media (min-width: 900px) { .vision-gallery { column-count: 3; } }
                @media (min-width: 1200px) { .vision-gallery { column-count: 4; } }
                
                .vision-card {
                    display: inline-block;
                    width: 100%;
                    margin-bottom: 1.5rem;
                    position: relative;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
                    cursor: zoom-in;
                    background: var(--bg-surface-hover);
                }
                .vision-card:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 15px 35px rgba(0,0,0,0.15);
                }
                .vision-card img {
                    width: 100%;
                    height: auto;
                    display: block;
                }
                .vision-card::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 60%, rgba(0,0,0,0.5) 100%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }
                .vision-card:hover::after {
                    opacity: 1;
                }
                .vision-delete {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: rgba(255, 255, 255, 0.15) !important;
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transform: translateY(-10px);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 10;
                    cursor: pointer;
                }
                .vision-card:hover .vision-delete {
                    opacity: 1;
                    transform: translateY(0);
                }
                .vision-delete:hover {
                    background: rgba(239, 68, 68, 0.9) !important;
                    border-color: rgba(239, 68, 68, 1);
                    transform: scale(1.15) !important;
                }
                
                .vision-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 6rem 2rem;
                    background: var(--bg-surface);
                    border: 2px dashed var(--border-color);
                    border-radius: 24px;
                    text-align: center;
                    transition: all 0.3s ease;
                }
                .vision-empty:hover {
                    border-color: var(--primary);
                    background: var(--bg-surface-hover);
                }
            `;
            document.head.appendChild(style);
        }

        const galleryHtml = images.map(img => `
            <div class="vision-card" data-id="${img.id}">
                <img class="vision-img" src="${img.dataUrl}" alt="Vision entry">
                <button class="vision-delete" title="削除">
                    <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                </button>
            </div>
        `).join('');

        const modalHtml = `
            <div id="vision-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 9999; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s ease;">
                <button id="close-modal-btn" style="position: absolute; top: 2rem; right: 2rem; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); color: white; cursor: pointer; padding: 0.75rem; z-index: 10000; border-radius: 50%; transition: all 0.2s;"><i data-lucide="x" style="width: 24px; height: 24px;"></i></button>
                <div style="width: 90vw; height: 90vh; display: flex; justify-content: center; align-items: center;">
                    <img id="vision-modal-img" src="" style="max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); transform: scale(0.9); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                </div>
            </div>
        `;

        container.innerHTML = `
            <div class="fade-in">
                ${modalHtml}
                
                <div class="vision-header-container">
                    <div>
                        <h2 style="font-size: 2rem; font-weight: 800; background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.75rem;"><i data-lucide="image" style="color: var(--primary);"></i> ビジョンボード</h2>
                        <p style="color: var(--text-secondary); font-size: 1.05rem; max-width: 500px; margin: 0;">なりたい自分、叶えたい目標、行きたい場所。モチベーションを高めるインスピレーションを集めましょう。</p>
                    </div>
                    <div style="flex-shrink: 0;">
                        <input type="file" id="vision-upload" accept="image/*" style="display: none;">
                        <button class="btn-primary" onclick="document.getElementById('vision-upload').click()" style="padding: 0.875rem 1.5rem; font-size: 1.05rem; display: flex; align-items: center; gap: 0.5rem; border-radius: 999px; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);"><i data-lucide="plus" style="width: 20px; height: 20px;"></i> 写真を追加</button>
                    </div>
                </div>
                
                <div class="vision-gallery">
                    ${images.length > 0 ? galleryHtml : `
                        <div class="vision-empty" style="grid-column: 1 / -1; width: 100%;">
                            <div style="background: var(--bg-surface-hover); padding: 1.5rem; border-radius: 50%; border: 1px solid var(--border-color); margin-bottom: 1.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                                <i data-lucide="camera" style="width: 48px; height: 48px; color: var(--primary);"></i>
                            </div>
                            <h3 style="font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-primary);">ビジョンボードは空です</h3>
                            <p style="color: var(--text-secondary); max-width: 400px; margin-bottom: 2rem;">お気に入りの画像をアップロードして、あなた専用のインスピレーションボードを作り始めましょう。</p>
                            <button class="btn-primary" onclick="document.getElementById('vision-upload').click()" style="padding: 0.75rem 2rem; border-radius: 999px;"><i data-lucide="upload" style="margin-right: 8px;"></i>最初の画像をアップロード</button>
                        </div>
                    `}
                </div>
            </div>
        `;

        // Delete handlers
        container.querySelectorAll('.vision-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // Lightboxが同時に開かないようにする
                if(confirm("この画像を削除しますか？")) {
                    const id = parseInt(e.currentTarget.closest('.vision-card').dataset.id);
                    Store.deleteVisionImage(id);
                    this.render(container);
                    lucide.createIcons();
                }
            });
        });

        // Modal (Lightbox) handlers
        const modal = container.querySelector('#vision-modal');
        const modalImg = container.querySelector('#vision-modal-img');
        const closeBtn = container.querySelector('#close-modal-btn');

        container.querySelectorAll('.vision-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Deleteボタンクリック以外の場合にズーム
                if(e.target.closest('.vision-delete')) return;
                
                const imgEl = card.querySelector('.vision-img');
                modalImg.src = imgEl.src;
                modal.style.display = 'flex';
                // Trigger reflow to animate opacity and transform
                setTimeout(() => {
                    modal.style.opacity = '1';
                    modalImg.style.transform = 'scale(1)';
                }, 10);
            });
        });

        const closeModal = () => {
            modal.style.opacity = '0';
            modalImg.style.transform = 'scale(0.9)';
            setTimeout(() => {
                modal.style.display = 'none';
                modalImg.src = '';
            }, 300);
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id !== 'vision-modal-img') closeModal();
            });
        }

        // Close modal on escape key
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });

        // File upload and compression logic
        const uploadInput = container.querySelector('#vision-upload');
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const btn = document.querySelector('.vision-header-container .btn-primary');
                if (btn) {
                    btn.innerHTML = `<i data-lucide="loader" class="spin"></i> 処理中...`;
                    lucide.createIcons();
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 1200; 
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                            }
                        } else {
                            if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                            }
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        Store.addVisionImage(dataUrl);
                        this.render(container);
                        lucide.createIcons();
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            });
        }
    }
};
