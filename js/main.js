document.addEventListener('DOMContentLoaded', () => {
    // Citizen/Public
    renderHeader(document.body.dataset.nav);
    renderFooter();
    if (document.getElementById('subnav')) renderSubnav(document.body.dataset.tab);
    hydrateIcons();

    // Admin/Editor  ← THÊM
    if (document.getElementById('app-header')) renderAppHeader();
    if (document.getElementById('app-sidebar')) renderSidebar(document.body.dataset.page);

    // Theme
    const root = document.documentElement;
    const s = localStorage.getItem('cg-theme');
    if (s) root.dataset.theme = s;
    const tb = document.getElementById('theme-toggle');
    if (tb) tb.onclick = () => {
        const t = root.dataset.theme === 'dark' ? 'light' : 'dark';
        root.dataset.theme = t;
        localStorage.setItem('cg-theme', t);
    };
});