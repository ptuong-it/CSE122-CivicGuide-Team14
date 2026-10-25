/* ============================================================
   CIVICGUIDE AUTO TEST SUITE
   Chạy trong DevTools Console: testSuite.run()
   ============================================================ */

const testSuite = {
    results: [],
    
    log(name, passed, detail = '') {
        const icon = passed ? '✅' : '❌';
        const msg = `${icon} ${name}${detail ? ' — ' + detail : ''}`;
        console.log(`%c${msg}`, `color: ${passed ? '#1e7a4a' : '#c23030'}; font-weight: bold;`);
        this.results.push({ name, passed, detail });
    },

    // ==========================================
    // TEST 1: LocalStorage có đúng key không
    // ==========================================
    testStorage() {
        console.log('\n📦 TEST 1: Kiểm tra LocalStorage');
        
        const session = localStorage.getItem('cg-session');
        this.log('Có key cg-session', !!session);
        
        if (session) {
            try {
                const parsed = JSON.parse(session);
                this.log('cg-session có trường role', !!parsed.role, `role = ${parsed.role}`);
                this.log('cg-session có trường name', !!parsed.name, `name = ${parsed.name}`);
            } catch (e) {
                this.log('cg-session parse được JSON', false, e.message);
            }
        }
        
        const apps = localStorage.getItem('civicguide-applications');
        this.log('Có key civicguide-applications', !!apps);
        
        if (apps) {
            try {
                const parsed = JSON.parse(apps);
                this.log('civicguide-applications là mảng', Array.isArray(parsed), `có ${parsed.length} hồ sơ`);
            } catch (e) {
                this.log('civicguide-applications parse được', false, e.message);
            }
        }
    },

    // ==========================================
    // TEST 2: Fetch JSON có thành công không
    // ==========================================
    async testJSON() {
        console.log('\n📄 TEST 2: Kiểm tra tải JSON');
        
        const base = document.body.dataset.base || (window.BASE || '');
        const files = [
            'procedures.json',
            'applications.json',
            'users.json',
            'ai-alerts.json',
            'notifications.json',
            'checklist-templates.json'
        ];
        
        for (const file of files) {
            try {
                const res = await fetch(`${base}assets/data/${file}`);
                this.log(`Tải được ${file}`, res.ok, `status: ${res.status}`);
                
                if (res.ok) {
                    const data = await res.json();
                    if (file === 'applications.json' || file === 'ai-alerts.json') {
                        this.log(`${file} đủ số lượng (≥15)`, data.length >= 15, `có ${data.length} bản ghi`);
                    } else if (file === 'users.json') {
                        this.log(`${file} đủ số lượng (≥15)`, data.users.length >= 15, `có ${data.users.length} users`);
                    } else if (file === 'procedures.json') {
                        this.log(`${file} đủ số lượng (≥15)`, (data.results || []).length >= 15, `có ${data.results?.length || 0} thủ tục`);
                    } else if (file === 'notifications.json') {
                        this.log(`${file} có dữ liệu`, Array.isArray(data) && data.length > 0, `có ${data.length} thông báo`);
                    } else if (file === 'checklist-templates.json') {
                        this.log(`${file} có cấu trúc hợp lệ`, !!data.checklists, `có ${data.checklists?.length || 0} checklist mẫu`);
                    }
                }
            } catch (e) {
                this.log(`Tải được ${file}`, false, e.message);
            }
        }
    },

    // ==========================================
    // TEST 3: Header/Sidebar đã render chưa
    // ==========================================
    testUIRender() {
        console.log('\n🎨 TEST 3: Kiểm tra UI Render');
        
        const header = document.getElementById('app-header') || document.getElementById('site-header');
        if (header) {
            const hasLogo = !!header.querySelector('.logo');
            const hasNav = !!header.querySelector('.nav');
            this.log('Header có logo', hasLogo);
            this.log('Header có nav menu', hasNav);
        } else {
            this.log('Tìm thấy Header', false, 'Trang này có thể không có header');
        }
        
        const sidebar = document.getElementById('app-sidebar');
        if (sidebar) {
            const links = sidebar.querySelectorAll('nav a');
            this.log('Sidebar có menu', links.length > 0, `${links.length} menu items`);
        }
    },

    // ==========================================
    // TEST 4: KPI đã có số liệu chưa
    // ==========================================
    testKPI() {
        console.log('\n📊 TEST 4: Kiểm tra KPI');
        
        const kpiElements = document.querySelectorAll('.kpi-value');
        if (kpiElements.length === 0) {
            this.log('Trang này có KPI', false, 'Bỏ qua test này');
            return;
        }
        
        kpiElements.forEach((el, idx) => {
            const value = el.textContent.trim();
            const isFilled = value !== '--' && value !== '' && value !== 'Đang tải...';
            this.log(`KPI #${idx + 1} có số liệu`, isFilled, `giá trị: "${value}"`);
        });
    },

    // ==========================================
    // TEST 5: Bảng dữ liệu có render chưa
    // ==========================================
    testTable() {
        console.log('\n📋 TEST 5: Kiểm tra Table');
        
        const tables = document.querySelectorAll('table tbody');
        if (tables.length === 0) {
            this.log('Trang này có bảng', false, 'Bỏ qua');
            return;
        }
        
        tables.forEach((tbody, idx) => {
            const rows = tbody.querySelectorAll('tr');
            const hasLoading = tbody.innerHTML.includes('Đang tải');
            const hasError = tbody.innerHTML.includes('Không thể');
            
            this.log(`Bảng #${idx + 1} có dữ liệu`, rows.length > 0 && !hasLoading && !hasError, `${rows.length} dòng`);
        });
    },

    // ==========================================
    // TEST 6: Nút bấm có hoạt động không
    // ==========================================
    testButtons() {
        console.log('\n🔘 TEST 6: Kiểm tra nút bấm');
        
        const buttons = document.querySelectorAll('button:not([disabled])');
        let activeButtons = 0;
        
        buttons.forEach(btn => {
            // Kiểm tra có event listener bằng cách check onclick
            if (btn.onclick || btn.getAttribute('onclick')) {
                activeButtons++;
            }
        });
        
        this.log('Có ít nhất 1 nút có event', activeButtons > 0, `${activeButtons}/${buttons.length} nút có onclick`);
    },

    // ==========================================
    // TEST 7: Kiểm tra toàn bộ link không bị 404
    // ==========================================
    async testLinks() {
        console.log('\n🔗 TEST 7: Kiểm tra Links (có thể chậm)');
        
        const links = document.querySelectorAll('a[href]');
        const internalLinks = Array.from(links).filter(a => {
            const href = a.getAttribute('href');
            return href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('javascript');
        });
        
        let brokenCount = 0;
        const checked = new Set();
        
        for (const link of internalLinks.slice(0, 10)) { // Chỉ check 10 link đầu để tránh chậm
            const href = link.getAttribute('href');
            if (checked.has(href)) continue;
            checked.add(href);
            
            try {
                const res = await fetch(href, { method: 'HEAD' });
                if (!res.ok) {
                    brokenCount++;
                    console.warn(`⚠️ Link hỏng: ${href} (status: ${res.status})`);
                }
            } catch (e) {
                brokenCount++;
                console.warn(`⚠️ Link lỗi: ${href}`);
            }
        }
        
        this.log('Không có link hỏng', brokenCount === 0, `${brokenCount} link hỏng`);
    },

    // ==========================================
    // RUN ALL TESTS
    // ==========================================
    async run() {
        console.clear();
        console.log('%c🧪 CIVICGUIDE AUTO TEST SUITE', 'color: #1b8de6; font-size: 16px; font-weight: bold;');
        console.log('─'.repeat(60));
        
        const startTime = Date.now();
        this.results = [];
        
        try {
            this.testStorage();
            await this.testJSON();
            this.testUIRender();
            this.testKPI();
            this.testTable();
            this.testButtons();
            await this.testLinks();
        } catch (e) {
            console.error('Lỗi khi chạy test:', e);
        }
        
        const duration = Date.now() - startTime;
        const passed = this.results.filter(r => r.passed).length;
        const failed = this.results.filter(r => !r.passed).length;
        const total = this.results.length;
        
        console.log('\n' + '═'.repeat(60));
        console.log(`%c📊 KẾT QUẢ: ${passed}/${total} PASS — ${failed} FAIL`, 
            `color: ${failed === 0 ? '#1e7a4a' : '#c23030'}; font-size: 14px; font-weight: bold;`);
        console.log(`⏱️ Thời gian: ${duration}ms`);
        
        if (failed > 0) {
            console.log('\n❌ CÁC TEST FAIL:');
            this.results.filter(r => !r.passed).forEach(r => {
                console.log(`   • ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
            });
        }
        
        return { passed, failed, total };
    }
};