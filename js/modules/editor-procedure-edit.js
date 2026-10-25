document.addEventListener('DOMContentLoaded', async () => {
    if (document.body.dataset.page !== 'editor-procedure-edit') return;

    const form = document.getElementById('edit-procedure-form');
    const btnSubmit = document.getElementById('btn-submit-approval');
    const statusBadge = document.getElementById('status-badge');
    const pageTitle = document.getElementById('page-title');

    const params = new URLSearchParams(window.location.search);
    const procedureId = params.get('id') || 'P001';

    try {
        const data = await API.load('../../', 'assets/data/procedures.json');
        const procedure = data.results.find(p => p.id === procedureId);

        if (procedure) {
            document.getElementById('procedure-title').value = procedure.title || '';
            document.getElementById('procedure-category').value = procedure.field === 'Hộ tịch' ? 'Hộ tịch & gia đình' : 'Cư trú & định danh';
            document.getElementById('procedure-scope').value = 'Trong nước';
            document.getElementById('procedure-summary').value = procedure.desc || '';
            
            const documentsList = procedure.field === 'Hộ tịch' 
                ? 'Tờ khai đăng ký (theo mẫu)\nGiấy tờ tùy thân của hai bên\nGiấy xác nhận tình trạng hôn nhân'
                : 'Giấy tờ tùy thân\nĐơn đề nghị (theo mẫu)';
            document.getElementById('procedure-documents').value = documentsList;

            pageTitle.textContent = `Biên tập: ${procedure.title}`;

            // Đọc trạng thái trực tiếp từ JSON
            updateStatusBadge(procedure.status);
        } else {
            if (window.showToast) window.showToast('Không tìm thấy thủ tục này!', 'warning');
        }
    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
    }

    // Cập nhật Badge từ trạng thái
    function updateStatusBadge(status) {
        const map = {
            'published': { text: 'Đã xuất bản', color: '#1e7a4a', bg: '#d3f0e0' },
            'draft':     { text: 'Bản nháp', color: '#5b6b7c', bg: '#e4e9ef' },
            'sync':      { text: 'Cần cập nhật', color: '#9a5b10', bg: '#fde5c8' },
            'warning':   { text: 'Cảnh báo AI', color: '#c23030', bg: '#fbdede' }
        };
        const s = map[status] || map['draft'];
        statusBadge.textContent = s.text;
        statusBadge.style.backgroundColor = s.bg;
        statusBadge.style.color = s.color;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const draftData = {
            title: document.getElementById('procedure-title').value,
            category: document.getElementById('procedure-category').value,
            scope: document.getElementById('procedure-scope').value,
            summary: document.getElementById('procedure-summary').value,
            documents: document.getElementById('procedure-documents').value,
            source: document.getElementById('procedure-source').value,
            verified: document.getElementById('procedure-verified').checked,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(`civicguide-editor-draft-${procedureId}`, JSON.stringify(draftData));
        if (window.showToast) window.showToast('Đã lưu bản nháp thành công!', 'success');
    });

    btnSubmit.addEventListener('click', () => {
        const title = document.getElementById('procedure-title').value.trim();
        if (!title) {
            if (window.showToast) window.showToast('Vui lòng nhập tên thủ tục trước khi gửi!', 'warning');
            document.getElementById('procedure-title').focus();
            return;
        }

        if (confirm('Bạn có chắc muốn gửi nội dung này đến hàng đợi phê duyệt?')) {
            if (window.showToast) window.showToast('Đã gửi nội dung đến hàng đợi phê duyệt (mô phỏng).', 'success');
            statusBadge.textContent = 'Chờ duyệt';
            statusBadge.style.backgroundColor = '#fde5c8';
            statusBadge.style.color = '#9a5b10';

            setTimeout(() => {
                window.location.href = 'editor-approval-queue.html';
            }, 1500);
        }
    });
});