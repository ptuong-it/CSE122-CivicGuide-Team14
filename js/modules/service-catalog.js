/* ============================================================
   SERVICE CATALOG - Load và render danh mục dịch vụ công
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
    if (document.body.dataset.page !== 'service-catalog') return;

    const groupsEl = document.getElementById('groups');
    const countEl = document.getElementById('catalog-count');
    const subtitleEl = document.getElementById('catalog-subtitle');

    try {
        // 1. Load dữ liệu từ procedures.json
        const data = await API.load('../../', 'assets/data/procedures.json');
        
        // 2. Kiểm tra dữ liệu có tồn tại không (TRÁNH CRASH)
        if (!data || !data.groups || !Array.isArray(data.groups)) {
            throw new Error('Dữ liệu groups không hợp lệ');
        }

        const groups = data.groups;
        const totalProcedures = data.results ? data.results.length : 0;

        // 3. Cập nhật subtitle & count
        subtitleEl.textContent = `${totalProcedures} thủ tục được sắp xếp theo những sự kiện quan trọng trong cuộc sống.`;
        countEl.textContent = `${groups.length} nhóm · ${totalProcedures} thủ tục`;

        // 4. Render danh mục
        if (groups.length === 0) {
            groupsEl.innerHTML = '<div class="card" style="text-align:center;padding:40px;color:var(--muted);">Chưa có danh mục nào.</div>';
            return;
        }

        groupsEl.innerHTML = groups.map(g => `
            <section class="card cat-card">
                <div class="head">
                    <span>${window.icon ? window.icon(g.icon || 'info') : '📁'}</span>
                    <div>
                        <h3>${g.name || 'Chưa đặt tên'}</h3>
                        <span class="muted">${g.count || 0} thủ tục</span>
                    </div>
                </div>
                ${(g.items || []).map(item => `
                    <div class="row">
                        <h3>${item}</h3>
                        <a class="link" href="public-procedure-search.html?q=${encodeURIComponent(item.toLowerCase())}">Xem →</a>
                    </div>
                `).join('')}
                <a class="link" href="public-procedure-search.html">Xem tất cả trong nhóm →</a>
            </section>
        `).join('');

        // 5. Cập nhật icon nếu có dùng data-icon
        if (window.hydrateIcons) window.hydrateIcons();

    } catch (error) {
        console.error('Lỗi tải danh mục:', error);
        groupsEl.innerHTML = `
            <div class="card" style="text-align:center;padding:40px;color:#c23030;">
                <b>Không thể tải danh mục</b>
                <p class="muted" style="margin-top:8px;">${error.message}</p>
                <button class="btn btn-primary" style="margin-top:16px;" onclick="location.reload()">Thử lại</button>
            </div>
        `;
        subtitleEl.textContent = 'Không thể tải danh mục thủ tục';
        countEl.textContent = '0 nhóm';
    }
});