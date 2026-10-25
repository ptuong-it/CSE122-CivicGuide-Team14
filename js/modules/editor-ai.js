/* ============================================================
   EDITOR AI ALERTS - Xử lý cảnh báo & đồng bộ AI (AI-2)
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
    if (document.body.dataset.page !== 'editor-ai-alerts') return;

    // 1. Load dữ liệu cảnh báo từ JSON
    let alerts = [];
    try {
        const data = await API.load('../../', 'assets/data/ai-alerts.json');
        // Lưu trạng thái vào LocalStorage để đánh dấu cảnh báo đã xử lý
        const savedStates = JSON.parse(localStorage.getItem('civicguide-ai-alert-states') || '{}');

        // Gộp trạng thái từ LocalStorage vào dữ liệu
        alerts = data.map(a => {
            const saved = savedStates[a.id] || {};
            return {
                ...a,
                status: saved.status || a.status, // pending / accepted / rejected
                note: saved.note || '',
                reviewedAt: saved.reviewedAt || null
            };
        });
    } catch (error) {
        console.error('Lỗi tải ai-alerts.json:', error);
        document.getElementById('alert-rows').innerHTML =
            '<tr><td colspan="4" style="text-align:center;padding:24px;color:red;">Không thể tải dữ liệu cảnh báo.</td></tr>';
        return;
    }

    // 2. State
    let selectedAlertId = alerts[0]?.id || null; // Chọn mặc định cảnh báo đầu tiên
    let currentSearch = '';
    let currentSeverity = '';

    // 3. Elements
    const els = {
        tbody: document.getElementById('alert-rows'),
        count: document.getElementById('alert-count'),
        search: document.getElementById('search-alert'),
        filterSeverity: document.getElementById('filter-severity'),
        detailPanel: document.getElementById('alert-detail-panel'),
        // Các trường chi tiết
        detailTitle: document.getElementById('detail-title'),
        detailMeta: document.getElementById('detail-meta'),
        detailBadge: document.getElementById('detail-badge'),
        detailOldText: document.getElementById('detail-old-text'),
        detailNewText: document.getElementById('detail-new-text'),
        detailSource: document.getElementById('detail-source'),
        reviewerNote: document.getElementById('reviewer-note'),
        confirmReview: document.getElementById('confirm-review'),
        // Buttons
        btnAccept: document.getElementById('btn-accept'),
        btnEdit: document.getElementById('btn-edit'),
        btnReject: document.getElementById('btn-reject'),
        btnRefresh: document.getElementById('btn-refresh')
    };

    // 4. Render KPI
    function updateKPI() {
        const unresolved = alerts.filter(a => a.status === 'pending').length;
        const highRisk = alerts.filter(a => a.severity === 'high' && a.status === 'pending').length;
        const needSync = alerts.filter(a => a.status === 'pending').length; // Tạm tính tất cả chưa xử lý là cần đồng bộ
        const reviewed = alerts.filter(a => a.status !== 'pending').length;

        document.getElementById('kpi-unresolved').textContent = unresolved;
        document.getElementById('kpi-high-risk').textContent = highRisk;
        document.getElementById('kpi-need-sync').textContent = needSync;
        document.getElementById('kpi-reviewed').textContent = reviewed;
    }

    // 5. Hàm render danh sách (bảng)
    function renderTable() {
        let filtered = alerts;

        if (currentSeverity) {
            filtered = filtered.filter(a => a.severity === currentSeverity);
        }
        if (currentSearch) {
            const q = currentSearch.toLowerCase();
            filtered = filtered.filter(a =>
                (a.code || '').toLowerCase().includes(q) ||
                (a.title || '').toLowerCase().includes(q) ||
                (a.id || '').toLowerCase().includes(q)
            );
        }

        if (filtered.length === 0) {
            els.tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--muted);">Không có cảnh báo phù hợp.</td></tr>';
        } else {
            els.tbody.innerHTML = filtered.map(a => {
                // Badge mức độ
                let severityBadge = '';
                if (a.severity === 'high') severityBadge = '<span class="badge" style="background:#fbdede;color:#c23030;">Rủi ro cao</span>';
                else if (a.severity === 'medium') severityBadge = '<span class="badge" style="background:#fde5c8;color:#9a5b10;">Trung bình</span>';
                else severityBadge = '<span class="badge" style="background:#e4e9ef;color:#5b6b7c;">Thấp</span>';

                // Badge trạng thái
                let statusBadge = '';
                if (a.status === 'pending') statusBadge = '<span class="badge" style="background:#e3f1fb;color:#1b8de6;">Chờ xử lý</span>';
                else if (a.status === 'accepted') statusBadge = '<span class="badge" style="background:#d3f0e0;color:#1e7a4a;">Đã chấp nhận</span>';
                else if (a.status === 'rejected') statusBadge = '<span class="badge" style="background:#fbdede;color:#c23030;">Đã từ chối</span>';

                return `<tr class="alert-row ${selectedAlertId === a.id ? 'selected' : ''}" data-id="${a.id}">
                    <td>
                        <b>${a.code} - ${a.title}</b><br>
                        <span class="muted" style="font-size:11px;">${a.id} · ${a.issue}</span>
                    </td>
                    <td>${a.detected.split(' · ')[0]}</td>
                    <td>${severityBadge}</td>
                    <td>${statusBadge}</td>
                </tr>`;
            }).join('');
        }

        els.count.textContent = `Hiển thị ${filtered.length} / ${alerts.length} cảnh báo`;

        // Gắn sự kiện click vào dòng
        els.tbody.querySelectorAll('.alert-row').forEach(row => {
            row.addEventListener('click', () => {
                selectedAlertId = row.dataset.id;
                renderTable(); // Re-render để highlight
                renderDetail();
            });
        });
    }

    // 6. Hàm render chi tiết cảnh báo bên phải
    function renderDetail() {
        if (!selectedAlertId) {
            els.detailPanel.style.display = 'none';
            return;
        }

        const alert = alerts.find(a => a.id === selectedAlertId);
        if (!alert) {
            els.detailPanel.style.display = 'none';
            return;
        }

        els.detailPanel.style.display = 'block';
        els.detailTitle.textContent = `${alert.id} - ${alert.title}`;
        els.detailMeta.textContent = `Phát hiện: ${alert.detected} · Mã thủ tục: ${alert.code}`;

        // Badge
        let badgeText = '';
        let badgeStyle = '';
        if (alert.status === 'pending') { badgeText = 'Đang rà soát'; badgeStyle = 'background:#e3f1fb;color:#1b8de6;'; }
        else if (alert.status === 'accepted') { badgeText = 'Đã chấp nhận'; badgeStyle = 'background:#d3f0e0;color:#1e7a4a;'; }
        else { badgeText = 'Đã từ chối'; badgeStyle = 'background:#fbdede;color:#c23030;'; }

        els.detailBadge.textContent = badgeText;
        els.detailBadge.style.cssText = badgeStyle + 'padding:4px 10px;';

        els.detailOldText.textContent = alert.oldText || '—';
        els.detailNewText.textContent = alert.newText || '—';
        els.detailSource.textContent = alert.source || '—';
        els.reviewerNote.value = alert.note || '';

        // Disable form nếu đã xử lý
        const isPending = alert.status === 'pending';
        els.reviewerNote.disabled = !isPending;
        els.confirmReview.disabled = !isPending;
        els.confirmReview.checked = false; // Reset mỗi lần chọn
        els.btnAccept.disabled = !isPending;
        els.btnEdit.disabled = !isPending;
        els.btnReject.disabled = !isPending;

        // Đổi text nút nếu đã xử lý
        if (!isPending) {
            els.btnAccept.textContent = 'Đã chấp nhận';
            els.btnReject.textContent = 'Đã từ chối';
        } else {
            els.btnAccept.textContent = 'Chấp nhận vào bản nháp';
            els.btnReject.textContent = 'Từ chối cảnh báo';
        }
    }

    // 7. Lưu trạng thái vào LocalStorage
    function saveAlertState(id, status, note) {
        // Lưu trạng thái xử lý cảnh báo AI
        const states = JSON.parse(localStorage.getItem('civicguide-ai-alert-states') || '{}');
        states[id] = {
            status,
            note,
            reviewedAt: new Date().toISOString()
        };
        localStorage.setItem('civicguide-ai-alert-states', JSON.stringify(states));

        // Phát tín hiệu cho Admin Dashboard biết có cảnh báo đã xử lý
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'civicguide-ai-alert-states',
            newValue: JSON.stringify(states)
        }));

        // Cập nhật mảng alerts trên RAM
        const alert = alerts.find(a => a.id === id);
        if (alert) {
            alert.status = status;
            alert.note = note;
            alert.reviewedAt = states[id].reviewedAt;
        }

        updateKPI();
        renderTable();
        renderDetail();
    }

    // 8. Sự kiện nút bấm
    els.btnAccept.addEventListener('click', () => {
        if (!els.confirmReview.checked) {
            if (window.showToast) window.showToast('Vui lòng tick chọn "Tôi đã đối chiếu nguồn"!', 'warning');
            return;
        }
        const note = els.reviewerNote.value.trim();
        if (confirm('Bạn có chắc muốn chấp nhận đề xuất này vào bản nháp?')) {
            saveAlertState(selectedAlertId, 'accepted', note);
            if (window.showToast) window.showToast('Đã chấp nhận vào bản nháp!', 'success');
        }
    });

    els.btnReject.addEventListener('click', () => {
        const note = els.reviewerNote.value.trim();
        if (!note) {
            if (window.showToast) window.showToast('Vui lòng nhập lý do từ chối vào ô ghi chú!', 'warning');
            els.reviewerNote.focus();
            return;
        }
        if (confirm('Bạn có chắc muốn từ chối cảnh báo này?')) {
            saveAlertState(selectedAlertId, 'rejected', note);
            if (window.showToast) window.showToast('Đã từ chối cảnh báo!', 'success');
        }
    });

    els.btnEdit.addEventListener('click', () => {
        const alert = alerts.find(a => a.id === selectedAlertId);
        if (alert) {
            window.location.href = `editor-procedure-edit.html?id=${alert.code}`;
        }
    });

    els.btnRefresh.addEventListener('click', () => {
        window.location.reload();
    });

    // 9. Sự kiện tìm kiếm & lọc
    els.search.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim();
        renderTable();
    });
    els.filterSeverity.addEventListener('change', (e) => {
        currentSeverity = e.target.value;
        renderTable();
    });

    // 10. Init
    updateKPI();
    renderTable();
    renderDetail();
});