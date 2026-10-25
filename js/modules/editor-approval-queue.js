/* ============================================================
   EDITOR APPROVAL QUEUE - So sánh phiên bản và xử lý duyệt
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page !== 'editor-approval-queue') return;

    // Dữ liệu mẫu (Mô phỏng dữ liệu đang chờ duyệt)
    const queueData = [
        {
            id: 'P003',
            title: 'Giấy phép kinh doanh',
            submittedBy: 'Nguyễn Minh',
            submittedDate: '13/12/2024',
            isHighRisk: true,
            currentVersion: 'v2.0',
            currentDate: '12/12/2024',
            proposedVersion: 'v2.1',
            proposedDate: '13/12/2024',
            currentDocs: [
                '1. Đơn đề nghị đăng ký hộ kinh doanh',
                '2. Bản sao căn cước công dân của chủ hộ',
                '3. Giấy tờ chứng minh địa điểm kinh doanh',
                '4. Nộp hồ sơ bản giấy trực tiếp tại cơ quan đăng ký kinh doanh.'
            ],
            proposedDocs: [
                '1. Đơn đề nghị đăng ký hộ kinh doanh',
                '2. Bản sao căn cước công dân của chủ hộ',
                '3. Giấy tờ chứng minh địa điểm kinh doanh',
                '4. Bổ sung giấy xác nhận đáp ứng điều kiện kinh doanh theo ngành nghề.'
            ],
            currentMeta: 'Thời gian xử lý: 05 ngày làm việc | Nộp hồ sơ: Trực tiếp tại cơ quan tiếp nhận',
            proposedMeta: 'Thời gian xử lý: 03 ngày làm việc | Nộp hồ sơ: Trực tiếp hoặc trực tuyến'
        }
    ];

    const listContainer = document.getElementById('approval-list');
    const queueCount = document.getElementById('queue-count');

    // Cập nhật số lượng
    queueCount.textContent = `${queueData.length} bản chờ phê duyệt`;

    if (queueData.length === 0) {
        listContainer.innerHTML = '<div class="card" style="text-align:center; padding: 40px; color: var(--muted);">Hiện không có bản nào cần duyệt.</div>';
        return;
    }

    // Render từng item so sánh
    listContainer.innerHTML = queueData.map(item => `
        <div class="card" style="margin-bottom: 32px; padding: 24px;">
            <!-- Header của Item -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 20px;">
                <div>
                    <h2 style="font-size: 20px; margin-bottom: 6px;">${item.id} · ${item.title}</h2>
                    <p class="text-muted" style="font-size: 12.5px;">
                        Nộp bởi: <b>${item.submittedBy}</b> · ${item.submittedDate}
                        ${item.isHighRisk ? '<span class="danger-risk" style="margin-left: 12px;">■ Cập nhật có rủi ro cao</span>' : ''}
                    </p>
                </div>
                <a href="#" class="btn btn-outline" onclick="event.preventDefault(); window.showToast('Đang mở lịch sử thay đổi...', 'info');">
                    Xem lịch sử
                </a>
            </div>

            <!-- Khu vực so sánh 2 bên -->
            <div class="diff-container">
                <!-- Bản hiện hành (Trái) -->
                <div class="diff-card current">
                    <div class="diff-header">
                        <div>
                            <div class="diff-title">Phiên bản hiện hành · ${item.currentVersion}</div>
                            <div class="diff-date">${item.currentDate}</div>
                        </div>
                        <span class="badge" style="background:#e4e9ef;color:#5b6b7c;">Đã xuất bản</span>
                    </div>
                    <h3 style="font-size: 14px; margin-bottom: 12px;">Tài liệu cần thiết</h3>
                    <ul class="diff-list">
                        ${item.currentDocs.map(doc => `<li>${doc}</li>`).join('')}
                    </ul>
                    <div class="diff-meta">
                        <p>${item.currentMeta.split('|')[0]}</p>
                        <p>${item.currentMeta.split('|')[1]}</p>
                    </div>
                </div>

                <!-- Bản đề xuất (Phải) -->
                <div class="diff-card proposed">
                    <div class="diff-header">
                        <div>
                            <div class="diff-title">Phiên bản đề xuất · ${item.proposedVersion}</div>
                            <div class="diff-date">${item.proposedDate}</div>
                        </div>
                        <span class="badge" style="background:#e3f1fb;color:#1b8de6;">Mới</span>
                    </div>
                    <h3 style="font-size: 14px; margin-bottom: 12px;">Tài liệu cần thiết</h3>
                    <ul class="diff-list">
                        ${item.proposedDocs.map((doc, index) => {
        // Nếu dòng này khác với bản cũ -> highlight màu xanh
        const isChanged = doc !== item.currentDocs[index];
        return `<li class="${isChanged ? 'added' : ''}">${doc}</li>`;
    }).join('')}
                    </ul>
                    <div class="diff-meta" style="background: #dbeafe; border-left: 3px solid #3b82f6;">
                        <p style="color: #1e3a8a; font-weight: 600;">${item.proposedMeta.split('|')[0]}</p>
                        <p style="color: #1e3a8a; font-weight: 600;">${item.proposedMeta.split('|')[1]}</p>
                    </div>
                </div>
            </div>

            <!-- Ghi chú & Hành động -->
            <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--line);">
                <div style="margin-bottom: 16px;">
                    <label class="lbl" for="note-${item.id}">Ghi chú người duyệt</label>
                    <textarea class="input" id="note-${item.id}" rows="2" style="height: auto; padding: 10px;" placeholder="Nhập ghi chú hoặc lý do từ chối..."></textarea>
                </div>
                <div class="acts" style="justify-content: flex-end; margin: 0;">
                    <button class="btn btn-outline" style="color: #c23030; border-color: #fbdede;" onclick="handleAction('${item.id}', 'reject')">
                        Từ chối cập nhật
                    </button>
                    <button class="btn btn-outline" onclick="handleAction('${item.id}', 'request_change')">
                        Yêu cầu chỉnh sửa
                    </button>
                    <button class="btn btn-primary" onclick="handleAction('${item.id}', 'approve')">
                        Phê duyệt & Xuất bản
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Hàm xử lý khi bấm nút
    window.handleAction = function (id, action) {
        const note = document.getElementById(`note-${id}`).value.trim();
        let actionName = '';
        let newStatus = '';

        if (action === 'approve') {
            actionName = 'Phê duyệt & Xuất bản';
            newStatus = 'Đã duyệt';
            if (!confirm(`Bạn có chắc muốn ${actionName} cho thủ tục ${id}?`)) return;
        } else if (action === 'reject') {
            actionName = 'Từ chối';
            newStatus = 'Bị từ chối';
            if (!note) {
                alert('Vui lòng nhập lý do từ chối vào ô "Ghi chú người duyệt"!');
                document.getElementById(`note-${id}`).focus();
                return;
            }
            if (!confirm(`Bạn có chắc muốn ${actionName} cập nhật này?`)) return;
        } else if (action === 'request_change') {
            actionName = 'Yêu cầu chỉnh sửa';
            newStatus = 'Cần chỉnh sửa';
            if (!note) {
                alert('Vui lòng nhập nội dung cần chỉnh sửa vào ô "Ghi chú người duyệt"!');
                document.getElementById(`note-${id}`).focus();
                return;
            }
            if (!confirm(`Bạn có chắc muốn ${actionName}?`)) return;
        }

        // ==========================================
        // ĐỒNG BỘ LOCALSTORAGE: Ghi lại trạng thái mới
        // ==========================================
        const apps = JSON.parse(localStorage.getItem('civicguide-applications') || '[]');
        const appIndex = apps.findIndex(a => a.code === id);

        if (appIndex >= 0) {
            apps[appIndex].status = newStatus;
            apps[appIndex].note = note;
            apps[appIndex].reviewedAt = new Date().toISOString();
            localStorage.setItem('civicguide-applications', JSON.stringify(apps));
        } else {
            // Nếu chưa có trong LocalStorage → tạo mới
            apps.push({
                code: id,
                status: newStatus,
                note: note,
                reviewedAt: new Date().toISOString()
            });
            localStorage.setItem('civicguide-applications', JSON.stringify(apps));
        }

        // Phát tín hiệu cho các tab khác biết có thay đổi
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'civicguide-applications',
            newValue: JSON.stringify(apps)
        }));

        // Hiện toast
        if (window.showToast) {
            window.showToast(`Đã ${actionName} thành công cho thủ tục ${id}!`, 'success');
        }

        // Xóa item khỏi hàng đợi trên RAM
        const itemIndex = queueData.findIndex(q => q.id === id);
        if (itemIndex > -1) queueData.splice(itemIndex, 1);

        // Nếu hết hàng đợi
        if (queueData.length === 0) {
            document.getElementById('queue-count').textContent = '0 bản chờ phê duyệt';
            listContainer.innerHTML = '<div class="card" style="text-align:center; padding: 40px; color: #1e7a4a; background: #d3f0e0; font-weight: 600;">Đã xử lý hết hàng đợi! 🎉</div>';
        } else {
            setTimeout(() => window.location.reload(), 1500);
        }
    };
});