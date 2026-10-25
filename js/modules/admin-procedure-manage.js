document.addEventListener('DOMContentLoaded', async () => {
    if (document.body.dataset.page !== 'admin-procedures') return;

    // 1. Load dữ liệu (đã có sẵn status, aiStatus, updatedDate)
    let allProcedures = [];
    try {
        const data = await API.load('../../', 'assets/data/procedures.json');
        allProcedures = data.results || [];
    } catch (error) {
        console.error('Lỗi tải procedures.json:', error);
        document.getElementById('proc-rows').innerHTML = 
            '<tr><td colspan="7" style="text-align:center;padding:24px;color:red;">Không thể tải dữ liệu.</td></tr>';
        return;
    }

    // 2. Render KPI
    document.getElementById('kpi-total').textContent = allProcedures.length;
    document.getElementById('kpi-draft').textContent = allProcedures.filter(p => p.status === 'draft').length;
    document.getElementById('kpi-sync').textContent = allProcedures.filter(p => p.status === 'sync').length;
    document.getElementById('kpi-ai').textContent = allProcedures.filter(p => p.status === 'warning').length;

    let currentFilter = 'all';
    let currentSearch = '';

    function renderTable() {
        let filtered = allProcedures;
        if (currentFilter !== 'all') filtered = filtered.filter(p => p.status === currentFilter);
        if (currentSearch) {
            const q = currentSearch.toLowerCase();
            filtered = filtered.filter(p =>
                (p.title || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q)
            );
        }

        const tbody = document.getElementById('proc-rows');
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--muted);">Không có thủ tục phù hợp.</td></tr>';
        } else {
            tbody.innerHTML = filtered.map(p => {
                let statusBadge = '';
                if (p.status === 'published') statusBadge = '<span class="badge" style="background:#d3f0e0;color:#1e7a4a;">Đang hoạt động</span>';
                else if (p.status === 'draft') statusBadge = '<span class="badge" style="background:#e4e9ef;color:#5b6b7c;">Bản nháp</span>';
                else if (p.status === 'sync') statusBadge = '<span class="badge" style="background:#fde5c8;color:#9a5b10;">Cần cập nhật</span>';
                else if (p.status === 'warning') statusBadge = '<span class="badge" style="background:#fbdede;color:#c23030;">Cảnh báo AI</span>';

                let aiBadge = '<span style="color:var(--muted);font-size:11.5px;">—</span>';
                if (p.aiStatus === 'synced') aiBadge = '<span style="color:#1e7a4a;font-size:11.5px;font-weight:600;">● Đồng bộ</span>';
                else if (p.aiStatus === 'warning') aiBadge = '<span style="color:#9a5b10;font-size:11.5px;font-weight:600;">● Cần rà soát</span>';

                let actions = '';
                if (p.status === 'sync' || p.status === 'warning') {
                    actions = `<a href="editor-aialert-manage.html?id=${p.id}" class="link" style="color:#c23030;">Giải quyết AI</a>`;
                } else {
                    actions = `<a href="../editor/editor-procedure-edit.html?id=${p.id}" class="link">Sửa</a>`;
                }

                return `<tr>
                    <td><b>${p.id}</b></td>
                    <td>${p.title}</td>
                    <td>${p.event || '—'}</td>
                    <td>${statusBadge}</td>
                    <td>${p.updatedDate}</td>
                    <td>${aiBadge}</td>
                    <td>${actions}</td>
                </tr>`;
            }).join('');
        }
        document.getElementById('proc-count').textContent = `Hiển thị ${filtered.length} / ${allProcedures.length} thủ tục`;
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.filter-btn').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-outline'); });
            btn.classList.add('btn-primary'); btn.classList.remove('btn-outline');
            currentFilter = btn.dataset.filter;
            renderTable();
        };
    });

    document.getElementById('proc-search').oninput = (e) => {
        currentSearch = e.target.value.trim();
        renderTable();
    };

    renderTable();
});