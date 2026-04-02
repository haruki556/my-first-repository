import { Store } from '../store.js?v=9';

export const VisionBoardView = {
    title: 'ビジョンボード',
    
    async render(container) {
        const images = Store.getVisionImages();
        
        const galleryHtml = images.map(img => `
            <div class="vision-card" data-id="${img.id}" style="position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.2); aspect-ratio: 1; transition: transform 0.2s ease;">
                <img class="vision-img" src="${img.dataUrl}" style="width: 100%; height: 100%; object-fit: cover; display: block; cursor: zoom-in;">
                <button class="vision-delete icon-button text-danger" title="削除" style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.6); padding: 0.4rem; border-radius: 50%;"><i data-lucide="trash-2" style="width: 16px; height: 16px; color: #fff;"></i></button>
            </div>
        `).join('');

        const modalHtml = `
            <div id="vision-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 9999; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.2s ease;">
                <button id="close-modal-btn" style="position: absolute; top: 1.5rem; right: 1.5rem; background: transparent; border: none; color: white; cursor: pointer; padding: 0.5rem; z-index: 10000; border-radius: 50%;"><i data-lucide="x" style="width: 32px; height: 32px;"></i></button>
                <div style="width: 90vw; height: 90vh; display: flex; justify-content: center; align-items: center;">
                    <img id="vision-modal-img" src="" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); transform: scale(0.95); transition: transform 0.2s ease;">
                </div>
            </div>
        `;

        container.innerHTML = `
            <div class="fade-in">
                ${modalHtml}
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>${this.title}</h2>
                    <div>
                        <input type="file" id="vision-upload" accept="image/*" style="display: none;">
                        <button class="btn-primary" onclick="document.getElementById('vision-upload').click()" style="display: flex; align-items: center; gap: 0.5rem;"><i data-lucide="upload"></i> 画像を追加</button>
                    </div>
                </div>
                
                <p style="color: var(--text-muted); margin-bottom: 2rem;">モチベーションを高めるための写真や画像をアップロードして、夢や目標を視覚化しましょう。</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem;">
                    ${images.length > 0 ? galleryHtml : `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 0; border: 2px dashed var(--border-color); border-radius: var(--radius-lg);">
                            <i data-lucide="image" style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 1rem;"></i>
                            <p style="color: var(--text-secondary);">画像がありません。<br>右上のボタンから最初の画像を追加してください。</p>
                        </div>
                    `}
                </div>
            </div>
        `;

        // Delete handlers
        container.querySelectorAll('.vision-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm("この画像を削除しますか？")) {
                    const id = parseInt(e.currentTarget.closest('.vision-card').dataset.id);
                    Store.deleteVisionImage(id);
                    this.render(container);
                    lucide.createIcons();
                }
            });
        });

        // Hover effect setup
        container.querySelectorAll('.vision-card').forEach(card => {
            card.addEventListener('mouseenter', () => card.style.transform = 'scale(1.03)');
            card.addEventListener('mouseleave', () => card.style.transform = 'scale(1)');
        });

        // Modal (Lightbox) handlers
        const modal = container.querySelector('#vision-modal');
        const modalImg = container.querySelector('#vision-modal-img');
        const closeBtn = container.querySelector('#close-modal-btn');

        container.querySelectorAll('.vision-img').forEach(imgEl => {
            imgEl.addEventListener('click', (e) => {
                modalImg.src = e.target.src;
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
            modalImg.style.transform = 'scale(0.95)';
            setTimeout(() => {
                modal.style.display = 'none';
                modalImg.src = '';
            }, 200);
        };

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id !== 'vision-modal-img') closeModal();
            });
        }

        // File upload and compression logic
        const uploadInput = container.querySelector('#vision-upload');
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                // Show loading state if needed on the button
                const btn = uploadInput.nextElementSibling;
                const originalBtnText = btn.innerHTML;
                btn.innerHTML = `<i data-lucide="loader" class="spin"></i> 処理中...`;
                lucide.createIcons();

                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 1200; // Resize to max 1200px
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
                        
                        // Compress to JPEG with 0.7 quality to save local storage quota
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
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
