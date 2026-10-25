/* ============================================================
   EDITOR DASHBOARD - Load data, tính KPI, render tasks
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
    if (document.body.dataset.page !== 'editor-dashboard') return;

    // ==========================================
    // 1. LOAD DỮ LIỆU TỪ JSON
    // ==========================================
    let procedures = [];
    let aiAlerts = [];
    
    try {
        const procData = await API.load('../../', 'assets/data/procedures.json');
        procedures = procData.results || [];
        
        aiAlerts = await API.load('../../', 'assets/data/ai-alerts.json');
    } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
        document.getElementById('task-list').innerHTML = '<li style="color:red;">Không thể tải dữ liệu.</li>';
        return;
    }

    // ==========================================
    // 2. TÍNH TOÁN KPI (ĐỘNG)
    // ==========================================
    
    // "Thủ tục đã biên tập": Tổng số thủ tục (vì trong bản demo, editor được coi là quản lý tất cả)
    document.getElementById('kpi-edited').textContent = procedures.length;
    
    // "Bản nháp": Đếm các thủ tục có status = 'draft'
    const drafts = procedures.filter(p => p.status === 'draft').length;
    document.getElementById('kpi-drafts').textContent = drafts;
    
    // "Chờ phê duyệt": Đếm các thủ tục có status = 'sync'
    const pending = procedures.filter(p => p.status === 'sync').length;
    document.getElementById('kpi-pending').textContent = pending;
    
    // "Cảnh báo AI mới": Đếm các cảnh báo có status = 'pending' trong ai-alerts.json
    const newAlerts = aiAlerts.filter(a => a.status === 'pending').length;
    document.getElementById('kpi-ai-alerts').textContent = newAlerts;

    // ==========================================
    // 3. RENDER "VIỆC CẦN LÀM"
    // ==========================================
    const taskList = document.getElementById('task-list');
    let tasksHTML = '';

    // Ưu tiên 1: Cảnh báo AI chưa xử lý
    const pendingAlerts = aiAlerts.filter(a => a.status === 'pending').slice(0, 2);
    pendingAlerts.forEach(alert => {
        tasksHTML += `
            <li style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--line);">
                <span class="badge" style="background:#fbdede;color:#c23030;font-size:10px;margin-bottom:6px;display:inline-block;">
                    ${alert.severity === 'high' ? 'Ưu tiên cao' : 'Cảnh báo AI'}
                </span><br>
                <a href="editor-aialert-manage.html" style="font-weight:600;font-size:13px;">Rà soát: ${alert.title}</a>
                <small style="display:block;margin-top:4px;color:var(--muted);font-size:11px;">${alert.issue}</small>
            </li>
        `;
    });

    // Ưu tiên 2: Thủ tục đang chờ duyệt (status = sync)
    const pendingProcs = procedures.filter(p => p.status === 'sync').slice(0, 1);
    pendingProcs.forEach(proc => {
        tasksHTML += `
            <li style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--line);">
                <span class="badge" style="background:#fde5c8;color:#9a5b10;font-size:10px;margin-bottom:6px;display:inline-block;">Chờ duyệt</span><br>
                <a href="editor-approval-queue.html" style="font-weight:600;font-size:13px;">${proc.title} — Cập nhật nội dung</a>
                <small style="display:block;margin-top:4px;color:var(--muted);font-size:11px;">Mã: ${proc.id}</small>
            </li>
        `;
    });

    // Ưu tiên 3: Bản nháp
    const draftProcs = procedures.filter(p => p.status === 'draft').slice(0, 1);
    draftProcs.forEach(proc => {
        tasksHTML += `
            <li style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--line);">
                <span class="badge" style="background:#e3f1fb;color:#1b8de6;font-size:10px;margin-bottom:6px;display:inline-block;">Bản nháp</span><br>
                <a href="editor-procedure-edit.html?id=${proc.id}" style="font-weight:600;font-size:13px;">Tiếp tục biên tập: ${proc.title}</a>
                <small style="display:block;margin-top:4px;color:var(--muted);font-size:11px;">Cập nhật: ${proc.updatedDate}</small>
            </li>
        `;
    });

    if (!tasksHTML) {
        tasksHTML = '<li style="color: var(--muted);">Không có việc cần làm. Bạn đã xử lý hết! 🎉</li>';
    }
    taskList.innerHTML = tasksHTML;

    // ==========================================
    // 4. RENDER "CẬP NHẬT GẦN ĐÂY"
    // ==========================================
    const recentList = document.getElementById('recent-list');
    
    // Lấy 3 thủ tục có ngày cập nhật gần nhất (giả lập bằng cách lấy 3 thủ tục đầu tiên)
    const recentProcs = procedures.slice(0, 3);
    
    let recentHTML = '';
    recentProcs.forEach(proc => {
        recentHTML += `
            <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--line);">
                <strong style="font-size: 13px;">${proc.title}</strong>
                <p class="text-muted" style="font-size: 11.5px; margin-top: 4px;">
                    Cập nhật: ${proc.updatedDate || '12/12/2024'} · Trạng thái: ${proc.status}
                </p>
            </div>
        `;
    });
    
    recentList.innerHTML = recentHTML;
});