/* ============================================================
   ADMIN SYSTEM SETTINGS - Xử lý lưu/hủy cài đặt
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page !== 'admin-settings') return;

    const form = document.getElementById('settings-form');
    const btnCheckSource = document.getElementById('btn-check-source');
    const btnAddSource = document.getElementById('btn-add-source');
    
    // Các nút Lưu / Hủy (có 2 cặp: ở header và ở dưới cùng)
    const btnsCancel = [document.getElementById('btn-cancel'), document.getElementById('btn-cancel-bottom')];
    const btnsSave = [document.getElementById('btn-save-top'), document.getElementById('btn-save-bottom')];

    // 1. Lưu cài đặt
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Thu thập dữ liệu (Demo)
        const settings = {
            sourceUrl: document.getElementById('source-url').value,
            syncFrequency: document.getElementById('sync-frequency').value,
            notifyApp: document.getElementById('notify-app').checked,
            notifyChecklist: document.getElementById('notify-checklist').checked,
            notifySource: document.getElementById('notify-source').checked,
            opLog: document.getElementById('op-log').checked
        };

        // Lưu vào localStorage
        localStorage.setItem('civicguide-system-settings', JSON.stringify(settings));

        if (window.showToast) {
            window.showToast('Đã lưu cài đặt hệ thống thành công!', 'success');
        }
    });

    // 2. Hủy thay đổi
    btnsCancel.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn hủy các thay đổi chưa lưu?')) {
                form.reset();
                if (window.showToast) window.showToast('Đã hủy thay đổi', 'info');
            }
        });
    });

    // 3. Nút Kiểm tra cấu hình (Demo)
    if (btnCheckSource) {
        btnCheckSource.addEventListener('click', () => {
            const url = document.getElementById('source-url').value;
            if (!url) {
                if (window.showToast) window.showToast('Vui lòng nhập địa chỉ nguồn', 'warning');
                return;
            }
            
            btnCheckSource.disabled = true;
            btnCheckSource.textContent = 'Đang kiểm tra...';
            
            setTimeout(() => {
                btnCheckSource.disabled = false;
                btnCheckSource.textContent = 'Kiểm tra cấu hình';
                if (window.showToast) {
                    window.showToast('Nguồn hợp lệ (mô phỏng). Chưa có kết nối thực tế.', 'success');
                }
            }, 1000);
        });
    }

    // 4. Nút Thêm nguồn (Demo)
    if (btnAddSource) {
        btnAddSource.addEventListener('click', () => {
            if (window.showToast) {
                window.showToast('Chức năng thêm nguồn mới đang được phát triển (mô phỏng).', 'info');
            }
        });
    }

    // 5. Xử lý mục lục (TOC) scroll mượt
    document.querySelectorAll('.toc a').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    // Cập nhật class active
                    document.querySelectorAll('.toc a').forEach(a => a.classList.remove('on'));
                    link.classList.add('on');
                    
                    // Cuộn mượt
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // 6. Gán ID cho các section để TOC hoạt động (nếu chưa có)
    const sections = document.querySelectorAll('.settings-section');
    const ids = ['nguon-tich-hop', 'dong-bo-ai', 'chinh-sach-thong-bao', 'cai-dat-van-hanh'];
    sections.forEach((sec, i) => {
        if (!sec.id) sec.id = ids[i] || `section-${i}`;
    });
});