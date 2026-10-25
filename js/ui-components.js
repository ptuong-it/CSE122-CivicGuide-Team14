/* ============================================================
   CivicGuide - UI Components (Header, Footer, Subnav, Icons…)
   ============================================================ */

const BASE = document.body.dataset.base || '';
const P = BASE + 'pages/public/';
const C = BASE + 'pages/citizen/';

// ============================================================
// URL_() — Tạo URL tuyệt đối từ gốc project (không bao giờ cộng dồn)
// ============================================================
const URL_ = (path) => {
    let root = window.location.pathname;
    if (root.indexOf('/pages/') !== -1) {
        root = root.substring(0, root.indexOf('/pages/'));
    } else {
        root = root.substring(0, root.lastIndexOf('/'));
    }
    return root + '/' + path.replace(/^\/+/, '');
};

const SES = (() => {
    try {
        return JSON.parse(localStorage.getItem('cg-session') || sessionStorage.getItem('cg-session') || 'null');
    } catch (e) { return null; }
})();

/* ---------------- ICONS ---------------- */
const ICONS = {
    heart: '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    home: '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>',
    copy: '<rect x="8" y="3" width="12" height="14" rx="2"/><path d="M4 7v14h12"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14c2 2 6 2 8 0M9 9v.01M15 9v.01"/>',
    pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2"/>',
    id: '<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="2"/><path d="M8 17c1-2 7-2 8 0"/>',
    bag: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V5h6v3"/>',
    store: '<path d="M4 9l2-5h12l2 5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-2 0zM5 12v8h14v-8"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    nosearch: '<circle cx="11" cy="11" r="8"/><path d="M20 20l-4-4M8.500 8.500l5 5M13.500 8.500l-5 5"/>',
    shield: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
    ok: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    eyeoff: '<path d="M3 3l18 18M10 6.2A9 9 0 0 1 12 6c5 0 9 6 9 6a15 15 0 0 1-3 3.5M6.5 7.5A15 15 0 0 0 3 12s4 6 9 6a9 9 0 0 0 3-.5"/><path d="M10 10a3 3 0 0 0 4 4"/>',
    eye: '<path d="M3 12s4-6 9-6 9 6 9 6-4 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="3"/>',
    warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17v.01"/>',
    alertc: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.01"/>',
    circle: '<circle cx="12" cy="12" r="9"/>',
    fileclock: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/><path d="M14 3l5 5v2"/><circle cx="16.5" cy="17" r="4"/><path d="M16.5 15v2l1.5 1"/>',
    filecheck: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 14l2 2 4-4"/>',
    send: '<path d="M21 3L3 10l7 3 3 7z"/><path d="M10 13l11-10"/>',
    tasks: '<path d="M4 6l1.5 1.5L8 5M4 13l1.5 1.5L8 12M11 6h9M11 13h9M11 19h9"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2"/>',
    file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    upload: '<path d="M12 16V5M7 9l5-5 5 5M4 19h16"/>',
    check: '<path d="M4 12l5 5L20 6"/>'
};

function icon(n, s = 22) {
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;
}
function hydrateIcons() {
    document.querySelectorAll('[data-icon]').forEach(e => {
        e.innerHTML = icon(e.dataset.icon, +e.dataset.size || 22);
    });
}

/* ---------------- LOGOUT ---------------- */
function logout() {
    if (!confirm('Bạn có chắc muốn đăng xuất?')) return;
    localStorage.removeItem('cg-session');
    sessionStorage.removeItem('cg-session');
    location.href = URL_('pages/public/public-auth-login.html');
}

/* ---------------- HEADER (Citizen / Public) ---------------- */
function renderHeader(active = '') {
    const el = document.getElementById('site-header');
    if (!el) return;
    const a = k => active === k ? ' class="active"' : '';

    let roleHome = URL_('pages/public/public-auth-login.html');
    if (SES) {
        if (SES.role === 'editor') roleHome = URL_('pages/editor/editor-dashboard-view.html');
        else if (SES.role === 'admin') roleHome = URL_('pages/admin/admin-dashboard-view.html');
        else roleHome = URL_('pages/citizen/citizen-dashboard-view.html');
    }

    const userArea = SES
        ? `<a${a('dashboard')} href="${roleHome}">${SES.name || SES.email}</a>
           <button class="btn" id="btn-logout" style="height:26px;padding:0 10px;font-size:11px">Đăng xuất</button>`
        : `<a href="${URL_('pages/public/public-auth-login.html')}">VN · Đăng nhập</a>`;

    el.innerHTML = `<header class="site-header"><div class="container">
 <a class="logo" href="${URL_('index.html')}"><b>C</b>CivicGuide</a>
 <form class="hsearch" action="${URL_('pages/public/public-procedure-search.html')}">
   <input name="q" placeholder="Tra cứu..." aria-label="Tra cứu">
   <button aria-label="Tìm">${icon('search', 12)}</button>
 </form>
 <nav class="nav">
   <a${a('explore')} href="${URL_('index.html')}">Khám phá</a>
   <a${a('catalog')} href="${URL_('pages/public/public-service-catalog.html')}">Dịch vụ công</a>
   <a${a('checklist')} href="${SES ? URL_('pages/citizen/citizen-checklist-manage.html') : URL_('pages/public/public-auth-login.html')}">Checklist của tôi</a>
   <a${a('help')} href="${URL_('pages/public/public-help-center.html')}">Hỗ trợ</a>
   ${userArea}
   <button class="theme-btn" id="theme-toggle" aria-label="Đổi giao diện"></button>
 </nav>
</div></header>`;

    const btn = document.getElementById('btn-logout');
    if (btn) btn.onclick = logout;
}

/* ---------------- FOOTER ---------------- */
function renderFooter() {
    const el = document.getElementById('site-footer');
    if (!el) return;
    el.innerHTML = `<footer class="site-footer"><div class="container">
 <div>© 2026 CivicGuide · Hệ thống hỗ trợ thủ tục hành chính<br>Sản phẩm minh họa · Không phải cổng thông tin chính thức</div>
 <nav>
   <a href="${URL_('pages/public/public-help-center.html')}">Trung tâm trợ giúp</a>·
   <a href="${URL_('pages/public/shared-terms-privacy.html')}">Điều khoản &amp; quyền riêng tư</a>·
   <a href="${URL_('pages/public/public-contact-support.html')}">Liên hệ hỗ trợ</a>
 </nav>
</div></footer>`;
}

/* ---------------- SUBNAV (Citizen) ---------------- */
function renderSubnav(active) {
    const el = document.getElementById('subnav');
    if (!el) return;
    const T = [
        ['overview', 'Tổng quan', 'citizen-dashboard-view'],
        ['checklist', 'Checklist của tôi', 'citizen-checklist-manage'],
        ['saved', 'Thủ tục đã lưu', 'citizen-procedure-saved'],
        ['apps', 'Hồ sơ của tôi', 'citizen-application-track'],
        ['notif', 'Thông báo', 'citizen-notification-list'],
        ['account', 'Tài khoản & bảo mật', 'citizen-account-settings']
    ];
    el.innerHTML = `<div class="subnav"><div class="container"><span>CÁ NHÂN</span>${T.map(t => `<a href="${URL_('pages/citizen/' + t[2] + '.html')}" class="${t[0] === active ? 'on' : ''}">${t[1]}</a>`).join('')}</div></div>`;
}

/* ---------------- TOAST ---------------- */
function showToast(m) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('role', 'status');
    t.textContent = m;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
}

/* ============================================================
   ADMIN / EDITOR LAYOUT
   ============================================================ */
function renderAppHeader() {
    const el = document.getElementById('app-header');
    if (!el) return;
    const roleLabel = { editor: 'Biên tập viên', admin: 'Quản trị viên' }[SES?.role] || '';
    const home = SES?.role === 'admin'
        ? URL_('pages/admin/admin-dashboard-view.html')
        : URL_('pages/editor/editor-dashboard-view.html');

    el.innerHTML = `<header class="site-header"><div class="container">
      <a class="logo" href="${home}"><b>C</b>CivicGuide</a>
      <span class="tag" style="margin-left:8px">${roleLabel}</span>
      <nav class="nav" style="margin-left:auto">
        <span class="muted" style="font-weight:600">${SES?.name || SES?.email || ''}</span>
        <button class="btn" id="app-logout" style="height:26px;padding:0 10px;font-size:11px">Đăng xuất</button>
        <button class="theme-btn" id="theme-toggle" aria-label="Đổi giao diện"></button>
      </nav>
    </div></header>`;

    const btn = document.getElementById('app-logout');
    if (btn) {
        btn.onclick = () => {
            if (!confirm('Bạn có chắc muốn đăng xuất?')) return;
            localStorage.removeItem('cg-session');
            sessionStorage.removeItem('cg-session');
            location.href = URL_('pages/public/public-auth-login.html');
        };
    }
    const tb = document.getElementById('theme-toggle');
    if (tb) tb.onclick = () => {
        const r = document.documentElement;
        const t = r.dataset.theme === 'dark' ? 'light' : 'dark';
        r.dataset.theme = t;
        localStorage.setItem('cg-theme', t);
    };
}

function renderSidebar(active = '') {
    const el = document.getElementById('app-sidebar');
    if (!el) return;

    const editorNav = [
        ['editor-dashboard', 'Tổng quan', URL_('pages/editor/editor-dashboard-view.html')],
        ['editor-procedures', 'Quản lý thủ tục', URL_('pages/editor/editor-procedure-manage.html')],
        ['editor-ai-alerts', 'Cảnh báo AI', URL_('pages/editor/editor-aialert-manage.html')],
        ['editor-approvals', 'Hàng đợi phê duyệt', URL_('pages/editor/editor-approval-queue.html')]
    ];
    const adminNav = [
        ['admin-dashboard', 'Tổng quan', URL_('pages/admin/admin-dashboard-view.html')],
        ['admin-procedures', 'Quản lý thủ tục', URL_('pages/admin/admin-procedure-manage.html')],
        ['admin-users', 'Người dùng & phân quyền', URL_('pages/admin/admin-user-manage.html')],
        ['admin-settings', 'Cài đặt hệ thống', URL_('pages/admin/admin-system-settings.html')]
    ];
    const items = SES?.role === 'admin' ? adminNav : editorNav;

    el.innerHTML = `<aside class="app-sidebar"><nav>
      ${items.map(it => `<a href="${it[2]}" class="${it[0] === active ? 'active' : ''}">${it[1]}</a>`).join('')}
    </nav></aside>`;
}