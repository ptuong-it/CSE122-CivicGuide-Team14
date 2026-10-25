/* ============================================================
   EDITOR PROCEDURE MANAGE - Load JSON, Filter, Search
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
    if (document.body.dataset.page !== 'editor-procedures') return;

    // 1. Load dữ liệu từ JSON
    let allProcedures = [];
    try {
        const data = await API.load('../../', 'assets/data/procedures.json');
        allProcedures = data.results || [];
    } catch (error) {
        console.error('Lỗi tải procedures.json:', error);
        document.getElementById('editor-rows').innerHTML = 
            '<tr><td colspan="5" style="text-align:center;padding:24px;color:red;">Không thể tải dữ liệu thủ tục.</td></tr>';
        return;
    }

    // 2. Đọc thêm trạng thái từ LocalStorage (nếu có lưu bản nháp)
    // (Vì editor-procedure-edit.js có lưu nháp vào LocalStorage)
    const getStatusFromLocal = (id) => {
        const draft = localStorage.getItem(`civicguide-editor-draft-${id}`);
        if (draft) return 'draft'; // Nếu có bản nháp đã lưu
        return null;
    };

    // 3. Render KPI
    // Bản nháp: Những thủ tục có status = 'draft' hoặc có bản nháp LocalStorage
    // Chờ duyệt: Những thủ tục có status = 'sync'
    // Cần chỉnh sửa: Những thủ tục có status = 'warning'
    let drafts = 0, pending = 0, revision = 0;
    
    allProcedures.forEach(p => {
        const localStatus = getStatusFromLocal(p.id);
        const finalStatus = localStatus || p.status; // Ưu tiên LocalStorage

        if (finalStatus === 'draft') drafts++;
        else if (finalStatus === 'sync') pending++;
        else if (finalStatus === 'warning') revision++;
    });

    document.getElementById('kpi-drafts').textContent = drafts;
    document.getElementById('kpi-pending').textContent = pending;
    document.getElementById('kpi-revision').textContent = revision;

    // 4. Hàm render bảng
    function renderTable(searchTerm = '') {
        let filtered = allProcedures;

        // Lọc theo tìm kiếm
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                (p.title || '').toLowerCase().includes(q) ||
                (p.id || '').toLowerCase().includes(q)
            );
        }

        const tbody = document.getElementById('editor-rows');

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--muted);">Không có thủ tục phù hợp.</td></tr>';
        } else {
            tbody.innerHTML = filtered.map(p => {
                // Lấy trạng thái (ưu tiên LocalStorage nếu có)
                const localStatus = getStatusFromLocal(p.id);
                const status = localStatus || p.status;

                // Badge trạng thái
                let statusBadge = '';
                if (status === 'draft') {
                    statusBadge = '<span class="badge" style="background:#e4e9ef;color:#5b6b7c;">Bản nháp</span>';
                } else if (status === 'sync') {
                    statusBadge = '<span class="badge" style="background:#e3f1fb;color:#1b8de6;">Đang chờ duyệt</span>';
                } else if (status === 'warning') {
                    statusBadge = '<span class="badge" style="background:#fbdede;color:#c23030;">Cần cập nhật</span>';
                } else {
                    statusBadge = '<span class="badge" style="background:#d3f0e0;color:#1e7a4a;">Đã xuất bản</span>';
                }

                // Nút thao tác
                let actionBtn = `<a href="editor-procedure-edit.html?id=${p.id}" class="link">Biên tập</a>`;
                if (status === 'draft') {
                    actionBtn = `<a href="editor-procedure-edit.html?id=${p.id}" class="link">Tiếp tục sửa</a>`;
                } else if (status === 'sync') {
                    actionBtn = `<a href="editor-procedure-edit.html?id=${p.id}" class="link">Xem</a>`;
                } else if (status === 'warning') {
                    actionBtn = `<a href="editor-procedure-edit.html?id=${p.id}" class="link" style="color:#c23030;">Cập nhật</a>`;
                }

                return `<tr>
                    <td><b>${p.title}</b></td>
                    <td>${p.field || '—'}</td>
                    <td>${p.updatedDate || '12/12/2024'}</td>
                    <td>${statusBadge}</td>
                    <td>${actionBtn}</td>
                </tr>`;
            }).join('');
        }

        document.getElementById('editor-count').textContent =
            `Hiển thị ${filtered.length} / ${allProcedures.length} thủ tục`;
    }

    // 5. Gắn sự kiện tìm kiếm
    document.getElementById('editor-search').addEventListener('input', (e) => {
        renderTable(e.target.value.trim());
    });

    // 6. Render lần đầu
    renderTable();
});