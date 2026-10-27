document.addEventListener('DOMContentLoaded', async () => {
    if (document.body.dataset.page !== 'admin-dashboard') return;

    try {
        const procData = await API.load('../../', 'assets/data/procedures.json');
        const allProcedures = procData.results || [];

        const appsData = await API.load('../../', 'assets/data/applications.json');
        const staticApps = appsData || [];

        const aiAlerts = await API.load('../../', 'assets/data/ai-alerts.json');
        const localApps = JSON.parse(localStorage.getItem('civicguide-applications') || '[]');
        const aiStates = JSON.parse(localStorage.getItem('civicguide-ai-alert-states') || '{}');

        const appsMap = new Map();
        [...staticApps, ...localApps].forEach(app => {
            appsMap.set(app.code, app);
        });
        const mergedApps = Array.from(appsMap.values());

        const activeProcedures = allProcedures.filter(p => p.type === 'Thủ tục').length;

        const pendingApps = mergedApps.filter(a =>
            a.status === 'Chờ tiếp nhận' ||
            a.status === 'Cần bổ sung' ||
            a.status === 'Đang soạn'
        ).length;

        const highRisk = aiAlerts.filter(a =>
            a.severity === 'high' &&
            !(aiStates[a.id] && aiStates[a.id].status !== 'pending')
        ).length;

        const needSync = aiAlerts.filter(a =>
            !(aiStates[a.id] && aiStates[a.id].status !== 'pending')
        ).length;

        document.getElementById('kpi-active-procedures').textContent = activeProcedures;
        document.getElementById('kpi-pending-apps').textContent = pendingApps;
        document.getElementById('kpi-high-risk').textContent = highRisk;
        document.getElementById('kpi-need-sync').textContent = needSync;

        const alertCountEl = document.getElementById('alert-count');
        if (alertCountEl) alertCountEl.textContent = needSync;

    } catch (e) {
        console.error('Lỗi tải dữ liệu KPI:', e);
    }

    initBarChart();
    initLineChart();
    initExportCSV();
    initRefreshBtn();
});

function initBarChart() {
    const ctx = document.getElementById('chart-bar-year');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
            datasets: [
                {
                    label: 'Năm hiện tại',
                    data: [180, 240, 340, 220, 290, 310, 220, 250, 270, 300, 350, 410],
                    backgroundColor: '#3b82f6',
                    borderRadius: 4,
                },
                {
                    label: 'Năm trước',
                    data: [100, 120, 160, 140, 220, 180, 230, 220, 240, 240, 280, 270],
                    backgroundColor: '#cbd5e1',
                    borderRadius: 4,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top', align: 'end' } },
            scales: {
                y: { beginAtZero: true, max: 500, grid: { color: '#f1f5f9' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function initLineChart() {
    const ctx = document.getElementById('chart-line-group');
    if (!ctx) return;
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'],
            datasets: [
                { label: 'Kết hôn', data: [20, 28, 35, 45, 50, 48, 45, 52, 60, 65, 70, 78], borderColor: '#64748b', tension: 0.3, borderWidth: 2, pointRadius: 0 },
                { label: 'Sinh con', data: [15, 45, 60, 58, 62, 65, 70, 75, 68, 62, 65, 85], borderColor: '#f59e0b', tension: 0.3, borderWidth: 2, pointRadius: 0 },
                { label: 'Hộ khẩu', data: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75], borderColor: '#0ea5e9', tension: 0.3, borderWidth: 2, pointRadius: 0 },
                { label: 'Doanh nghiệp', data: [12, 15, 18, 22, 25, 30, 40, 45, 55, 65, 72, 85], borderColor: '#94a3b8', tension: 0.3, borderWidth: 2, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: {
                y: { beginAtZero: true, max: 100, grid: { color: '#f1f5f9' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function initExportCSV() {
    const btn = document.getElementById('btn-export-csv');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const csvContent = "data:text/csv;charset=utf-8,\uFEFFTháng,Năm hiện tại,Năm trước\nTh1,180,100\nTh2,240,120\nTh3,340,160\nTh4,220,140\nTh5,290,220\nTh6,310,180\nTh7,220,230\nTh8,250,220\nTh9,270,240\nTh10,300,240\nTh11,350,280\nTh12,410,270";
        const link = document.createElement("a");
        link.setAttribute("href", encodeURIComponent(csvContent));
        link.setAttribute("download", `civicguide_thongke_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    });
}

function initRefreshBtn() {
    const btn = document.getElementById('btn-refresh');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const original = btn.innerHTML;
        btn.innerHTML = '⏳ Đang tải...';
        btn.disabled = true;
        setTimeout(() => {
            btn.innerHTML = original;
            btn.disabled = false;
            if (window.showToast) window.showToast('Dữ liệu đã được cập nhật mới nhất!', 'success');
        }, 1000);
    });
}