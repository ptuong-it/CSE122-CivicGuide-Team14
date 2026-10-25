/* ============================================================
   ADMIN USER MANAGEMENT - Load, filter, detail, invite
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
    if (document.body.dataset.page !== 'admin-users') return;

    // ==========================================
    // 1. LOAD DATA
    // ==========================================
    let users = [];
    try {
        const data = await API.load('../../', 'assets/data/users.json');
        users = data.users.map(u => ({ ...u, status: 'active', joined: '03/10/2026' }));
    } catch (e) {
        console.error('Failed to load users:', e);
        return;
    }

    // ==========================================
    // 2. STATE
    // ==========================================
    let selectedUserId = null;
    let searchTerm = '';
    let filterRole = '';
    let filterStatus = '';
    let currentPage = 1;
    const PAGE_SIZE = 5;

    // ==========================================
    // 3. CONSTANTS
    // ==========================================
    const roleLabel = { citizen: 'Công dân', editor: 'Biên tập viên', admin: 'Quản trị viên' };
    const roleColor = { citizen: '#1b8de6', editor: '#9a5b10', admin: '#6b3fa0' };
    const permissionsByRole = {
        citizen: ['Xem checklist của mình', 'Nộp hồ sơ', 'Theo dõi hồ sơ'],
        editor: ['Soạn & lưu bản nháp', 'Rà soát cảnh báo AI', 'Gửi nội dung duyệt'],
        admin: ['Duyệt nội dung', 'Cấp quyền', 'Cài đặt hệ thống', 'Quản lý phân quyền']
    };

    // ==========================================
    // 4. ELEMENTS
    // ==========================================
    const els = {
        kpiCitizen: document.getElementById('kpi-citizen'),
        kpiEditor: document.getElementById('kpi-editor'),
        kpiAdmin: document.getElementById('kpi-admin'),
        tbody: document.getElementById('user-tbody'),
        userCount: document.getElementById('user-count'),
        paginationInfo: document.getElementById('pagination-info'),
        paginationBtns: document.getElementById('pagination-btns'),
        searchInput: document.getElementById('search-input'),
        filterRole: document.getElementById('filter-role'),
        filterStatus: document.getElementById('filter-status'),
        userDetail: document.getElementById('user-detail'),
        closeDetail: document.getElementById('close-detail'),
        detailName: document.getElementById('detail-name'),
        detailEmail: document.getElementById('detail-email'),
        detailRole: document.getElementById('detail-role'),
        detailAccess: document.getElementById('detail-access'),
        permissionsList: document.getElementById('permissions-list'),
        btnSavePerm: document.getElementById('btn-save-perm'),
        btnInvite: document.getElementById('btn-invite'),
        inviteEmail: document.getElementById('invite-email'),
        inviteRole: document.getElementById('invite-role'),
        btnSendInvite: document.getElementById('btn-send-invite'),
        btnCancelInvite: document.getElementById('btn-cancel-invite')
    };

    // ==========================================
    // 5. KPI UPDATE
    // ==========================================
    function updateKPI() {
        const counts = { citizen: 0, editor: 0, admin: 0 };
        users.forEach(u => counts[u.role]++);
        els.kpiCitizen.textContent = counts.citizen;
        els.kpiEditor.textContent = counts.editor;
        els.kpiAdmin.textContent = counts.admin;
    }

    // ==========================================
    // 6. RENDER TABLE
    // ==========================================
    function renderTable() {
        let filtered = users;
        if (searchTerm) {
            const q = searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                (u.display || '').toLowerCase().includes(q)
            );
        }
        if (filterRole) filtered = filtered.filter(u => u.role === filterRole);
        if (filterStatus) filtered = filtered.filter(u => u.status === filterStatus);

        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        currentPage = Math.min(currentPage, totalPages);
        const start = (currentPage - 1) * PAGE_SIZE;
        const slice = filtered.slice(start, start + PAGE_SIZE);

        if (slice.length === 0) {
            els.tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--muted);">Không có người dùng phù hợp.</td></tr>';
        } else {
            els.tbody.innerHTML = slice.map(u => {
                const statusBadge = u.status === 'active'
                    ? '<span class="badge" style="background:#d3f0e0;color:#1e7a4a;font-size:10px;">Hoạt động</span>'
                    : '<span class="badge" style="background:#fbdede;color:#c23030;font-size:10px;">Tạm khóa</span>';
                return `<tr class="user-row ${selectedUserId === u.id ? 'selected' : ''}" data-id="${u.id}">
                    <td><b>${u.display || u.name}</b></td>
                    <td style="color: var(--text);">${u.email}</td>
                    <td><span style="color: ${roleColor[u.role]}; font-weight: 600; font-size: 11.5px;">${roleLabel[u.role]}</span></td>
                    <td>${statusBadge}</td>
                    <td><button class="btn btn-outline btn-sm" data-id="${u.id}" style="font-size:10px;height:24px;">Xem</button></td>
                </tr>`;
            }).join('');
        }

        // Update info
        els.userCount.textContent = `${total} / ${users.length}`;
        els.paginationInfo.textContent = total === 0
            ? 'Không có kết quả'
            : `Hiển thị ${start + 1}–${Math.min(start + PAGE_SIZE, total)} / ${total} người dùng`;

        // Pagination
        let pagerHTML = `<button class="btn btn-outline btn-sm" data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} style="font-size:11px;height:26px;">‹</button>`;
        for (let i = 1; i <= totalPages; i++) {
            pagerHTML += `<button class="btn ${i === currentPage ? 'btn-primary' : 'btn-outline'} btn-sm" data-page="${i}" style="font-size:11px;height:26px;min-width:26px;">${i}</button>`;
        }
        pagerHTML += `<button class="btn btn-outline btn-sm" data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''} style="font-size:11px;height:26px;">›</button>`;
        els.paginationBtns.innerHTML = pagerHTML;

        // Bind events
        els.tbody.querySelectorAll('.user-row').forEach(row => {
            row.addEventListener('click', () => showDetail(row.dataset.id));
        });
        els.tbody.querySelectorAll('[data-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                showDetail(btn.dataset.id);
            });
        });
        els.paginationBtns.querySelectorAll('[data-page]').forEach(btn => {
            btn.onclick = () => {
                const p = parseInt(btn.dataset.page);
                if (p >= 1 && p <= totalPages) {
                    currentPage = p;
                    renderTable();
                }
            };
        });
    }

    // ==========================================
    // 7. SHOW DETAIL
    // ==========================================
    function showDetail(userId) {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        selectedUserId = userId;

        els.userDetail.style.display = 'block';
        els.detailName.textContent = user.display || user.name;
        els.detailEmail.textContent = user.email;
        els.detailRole.textContent = roleLabel[user.role];
        els.detailAccess.checked = user.status === 'active';

        const perms = permissionsByRole[user.role] || [];
        els.permissionsList.innerHTML = perms.map((p, i) => `
            <label class="perm-checkbox">
                <input type="checkbox" ${i < 3 ? 'checked' : ''}>
                <span>${p}</span>
            </label>
        `).join('');

        renderTable();
    }

    // ==========================================
    // 8. EVENTS
    // ==========================================
    els.searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.trim();
        currentPage = 1;
        renderTable();
    });
    els.filterRole.addEventListener('change', (e) => {
        filterRole = e.target.value;
        currentPage = 1;
        renderTable();
    });
    els.filterStatus.addEventListener('change', (e) => {
        filterStatus = e.target.value;
        currentPage = 1;
        renderTable();
    });

    els.closeDetail.onclick = () => {
        selectedUserId = null;
        els.userDetail.style.display = 'none';
        renderTable();
    };

    els.btnSavePerm.onclick = () => {
        const user = users.find(u => u.id === selectedUserId);
        if (!user) return;
        user.status = els.detailAccess.checked ? 'active' : 'locked';
        if (window.showToast) window.showToast('Đã lưu phân quyền cho ' + (user.display || user.name), 'success');
        renderTable();
    };

    els.btnInvite.onclick = () => {
        els.inviteEmail.focus();
        els.inviteEmail.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    els.btnSendInvite.onclick = () => {
        const email = els.inviteEmail.value.trim();
        const role = els.inviteRole.value;
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            if (window.showToast) window.showToast('Vui lòng nhập email hợp lệ', 'warning');
            return;
        }
        users.push({
            id: 'U' + Date.now(),
            name: email.split('@')[0],
            display: email.split('@')[0],
            email,
            role,
            status: 'active',
            joined: new Date().toLocaleDateString('vi-VN')
        });
        els.inviteEmail.value = '';
        if (window.showToast) window.showToast('Đã gửi lời mời đến ' + email, 'success');
        updateKPI();
        renderTable();
    };

    els.btnCancelInvite.onclick = () => {
        els.inviteEmail.value = '';
    };

    // ==========================================
    // 9. INIT
    // ==========================================
    updateKPI();
    renderTable();
});