/* Đăng nhập / Đăng ký / Đặt lại mật khẩu (dữ liệu giả lập, lưu localStorage) */
const HOME = { citizen: 'pages/citizen/citizen-dashboard-view.html', editor: 'pages/editor/editor-dashboard-view.html', admin: 'pages/admin/admin-dashboard-view.html' };
const $ = s => document.querySelector(s);
const localUsers = () => { try { return JSON.parse(localStorage.getItem('cg-users') || '[]') } catch (e) { return [] } };
function bindEye() { document.querySelectorAll('.eye').forEach(b => b.onclick = () => { const i = b.parentElement.querySelector('input'); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; b.innerHTML = icon(show ? 'eye' : 'eyeoff', 18) }) }
function showRules(p, ul, st) {
    const r = V.pwRules(p); ul.innerHTML = r.map(x => `<li class="${x[1] ? 'ok' : ''}">${x[0]}</li>`).join('');
    if (st) { const n = r.filter(x => x[1]).length; st.className = 'strength' + (n === 3 ? ' ok' : ''); st.textContent = n === 3 ? 'Độ mạnh: Tốt · Đã đáp ứng yêu cầu' : 'Độ mạnh: Chưa đạt · Còn thiếu ' + (3 - n) + ' yêu cầu' }
}
const page = document.body.dataset.page;
document.addEventListener('DOMContentLoaded', async () => {
    bindEye();
    if (page === 'login') {
        const f = $('#login-form'), data = await API.load(BASE, 'assets/data/users.json');
        f.onsubmit = e => {
            e.preventDefault(); const id = f.id.value, pw = f.pw.value; let ok = true;
            V.setErr(f.id, V.emailOrPhone(id) ? '' : 'Nhập email hoặc số điện thoại hợp lệ.'); V.setErr(f.pw, pw ? '' : 'Nhập mật khẩu.');
            if (!V.emailOrPhone(id) || !pw) return;
            const ov = JSON.parse(localStorage.getItem('cg-pw') || '{}'); const u = [...data.users, ...localUsers()].find(x => x.email === id.trim() && (ov[x.id] || x.password) === pw);
            if (!u) { $('#login-fail').hidden = false; return }
            const s = JSON.stringify({ id: u.id, name: u.display || u.name, full: u.name, role: u.role }); (f.remember.checked ? localStorage : sessionStorage).setItem('cg-session', s);
            location.href = BASE + HOME[u.role]
        };
    }
    if (page === 'register') {
        const f = $('#reg-form'), upd = () => { showRules(f.pw.value, $('#rules')); const ok = V.pwOk(f.pw.value); $('#pw-ok').hidden = !ok; $('#rules').hidden = ok };
        f.pw.oninput = upd; upd();
        f.onsubmit = e => {
            e.preventDefault(); let bad = 0; const chk = (i, c, m) => { V.setErr(i, c ? '' : m); if (!c) bad++ };
            chk(f.name, V.required(f.name.value), 'Nhập họ và tên.'); chk(f.email, V.email(f.email.value), 'Email chưa hợp lệ.');
            chk(f.phone, !f.phone.value || V.phone(f.phone.value), 'Số điện thoại chưa hợp lệ.');
            chk(f.pw, V.pwOk(f.pw.value), 'Mật khẩu chưa đáp ứng yêu cầu.'); chk(f.pw2, V.match(f.pw.value, f.pw2.value), 'Hai mật khẩu chưa khớp.');
            $('#terms-err').textContent = f.terms.checked ? '' : 'Cần đồng ý với điều khoản để tiếp tục.'; if (!f.terms.checked) bad++;
            if (bad) return; const list = localUsers();
            if (list.some(u => u.email === f.email.value.trim())) { V.setErr(f.email, 'Email này đã được đăng ký.'); return }
            list.push({ id: 'U' + (100 + list.length), name: f.name.value.trim(), display: f.display.value.trim() || f.name.value.trim(), email: f.email.value.trim(), password: f.pw.value, role: 'citizen' });
            localStorage.setItem('cg-users', JSON.stringify(list)); location.href = 'public-auth-login.html'
        };
    }
    if (page === 'reset') {
        const f = $('#reset-form'), upd = () => { showRules(f.pw.value, $('#rules'), $('#strength')); const m = f.pw2.value && V.match(f.pw.value, f.pw2.value); $('#match').textContent = m ? '✓ Hai mật khẩu khớp nhau.' : f.pw2.value ? '✗ Hai mật khẩu chưa khớp.' : ''; $('#match').style.color = m ? '#1e7a4a' : '#c23030' };
        f.pw.oninput = f.pw2.oninput = upd; upd();
        f.onsubmit = e => { e.preventDefault(); if (!V.pwOk(f.pw.value) || !V.match(f.pw.value, f.pw2.value)) { upd(); return } $('#done').hidden = false; $('#done-btn').hidden = false; f.querySelector('button.btn-primary').disabled = true; $('#done').scrollIntoView({ behavior: 'smooth', block: 'center' }) };
    }
});