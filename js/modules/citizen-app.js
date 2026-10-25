/* Khu công dân: dashboard, checklist, thủ tục đã lưu, hồ sơ của tôi */
const $ = s => document.querySelector(s), page = document.body.dataset.page;
if (!SES) location.replace(BASE + 'pages/public/public-auth-login.html');
else if (SES.role !== 'citizen') location.replace(BASE + 'pages/shared/shared-error-403.html');
const KEY = 'cg-ck-ket-hon';
const getDone = d => { try { const v = JSON.parse(localStorage.getItem(KEY)); if (v && v.length === d.items.length) return v } catch (e) { } return d.items.map(i => i.done) };
const saveStamp = () => { const n = new Date(); localStorage.setItem(KEY + '-t', n.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ', ' + n.toLocaleDateString('vi-VN')) };
function progress(done) {
    const n = done.filter(Boolean).length, p = Math.round(n / done.length * 100);
    document.querySelectorAll('[data-prog-text]').forEach(e => e.textContent = e.dataset.progText.replace('N', n).replace('T', done.length));
    document.querySelectorAll('[data-pct]').forEach(e => e.textContent = p + '%'); document.querySelectorAll('.progress i').forEach(e => e.style.width = p + '%')
}
function drawChecklist(d, done, big) {
    $('#ck-list').innerHTML = d.items.map((it, i) => big ? `<label class="ck-big"><input type="checkbox" data-i="${i}" ${done[i] ? 'checked' : ''}><div><b>${it.t2}</b><span>${it.n2}</span></div><em class="${done[i] ? 'ok-t' : 'todo-t'}">${done[i] ? 'Đã hoàn thành' : 'Cần chuẩn bị'}</em></label>`
        : `<label class="ck"><input type="checkbox" data-i="${i}" ${done[i] ? 'checked' : ''}><div><b>${it.t}</b><span>${it.n}</span></div></label>`).join('');
    progress(done);
    document.querySelectorAll('#ck-list input').forEach(c => c.onchange = () => { done[+c.dataset.i] = c.checked; localStorage.setItem(KEY, JSON.stringify(done)); drawChecklist(d, done, big) });
}
document.addEventListener('DOMContentLoaded', async () => {
    if (!SES || SES.role !== 'citizen') return;
    const d = await API.load(BASE, 'assets/data/checklist-templates.json');
    if (page === 'dashboard') {
        $('#greet').textContent = SES.full || SES.name;
        const done = getDone(d.checklists[0]); progress(done)
    }
    if (page === 'ckhome' || page === 'checklist') {
        const c = d.checklists[0], done = getDone(c); drawChecklist(c, done, page === 'ckhome');
        $('#save').onclick = () => { localStorage.setItem(KEY, JSON.stringify(done)); saveStamp(); showToast('Đã lưu tiến độ'); const s = $('#stamp'); if (s) s.textContent = 'Bản minh họa · Cập nhật lúc ' + localStorage.getItem(KEY + '-t') + '.' };
        $('#pdf').onclick = () => window.print();
        const t = localStorage.getItem(KEY + '-t'); if (t && $('#stamp')) $('#stamp').textContent = 'Bản minh họa · Cập nhật lúc ' + t + '.';
    }
    if (page === 'saved') {
        let removed = JSON.parse(localStorage.getItem('cg-saved-removed') || '[]'), tab = 'all', q = '';
        const L = { prep: 'Đang chuẩn bị', new: 'Chưa bắt đầu', ref: 'Chỉ tham khảo' };
        const draw = () => {
            const all = d.saved.filter(x => !removed.includes(x.id)), cnt = k => all.filter(x => x.status === k).length;
            const list = all.filter(x => (tab === 'all' || x.status === tab) && x.title.toLowerCase().includes(q));
            $('#pills').innerHTML = [['all', 'Tất cả', all.length], ['prep', 'Đang chuẩn bị', cnt('prep')], ['new', 'Chưa bắt đầu', cnt('new')], ['ref', 'Chỉ tham khảo', cnt('ref')]].map(p => `<button class="btn ${tab === p[0] ? 'on' : ''}" data-t="${p[0]}">${p[1]} (${p[2]})</button>`).join('');
            $('#list').innerHTML = list.map(x => `<section class="card saved-card"><div class="saved-head"><h2>${x.title}</h2><span class="st">${x.label}</span></div><p class="muted">Hộ tịch · Lưu ngày ${x.saved}</p>
   ${x.flag ? '<div class="alert alert-info" style="margin:16px 0 0"><span>' + icon('info', 18) + '</span><div><b>Có nội dung cập nhật</b>Hướng dẫn xác minh giấy tờ đã được rà soát. Đọc phần thay đổi trước khi tiếp tục.</div></div>' : ''}
   <div class="field-2 kv" style="margin-top:14px"><div><small>Nguồn cần đối chiếu</small><b style="margin-top:14px">Cổng Dịch vụ công Quốc gia · dichvucong.gov.vn</b></div><div><small>Cập nhật nội dung minh họa</small><b style="margin-top:14px">${x.upd} · Nhóm biên tập CivicGuide</b></div></div>
   <p class="muted" style="margin-top:14px">${x.note}</p><div class="acts"><a class="btn btn-primary" href="${x.status === 'ref' ? BASE + 'pages/public/public-procedure-detail.html?id=' + x.id : 'citizen-checklist-manage.html'}">${x.btn}</a><a class="btn" href="${BASE}pages/public/public-procedure-detail.html?id=${x.id}">Xem thủ tục</a><button class="btn-ghost" data-un="${x.id}">Bỏ lưu</button></div></section>`).join('') || '<div class="card"><h2>Chưa có thủ tục nào</h2><p class="muted">Lưu thủ tục từ trang chi tiết để xem lại tại đây.</p></div>';
            $('#count').textContent = `Hiển thị ${list.length} / ${all.length} thủ tục đã lưu · Trang 1 / 1`;
            document.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; draw() });
            document.querySelectorAll('[data-un]').forEach(b => b.onclick = () => { removed.push(b.dataset.un); localStorage.setItem('cg-saved-removed', JSON.stringify(removed)); showToast('Đã bỏ lưu. Checklist và hồ sơ vẫn được giữ.'); draw() })
        };
        $('#q').oninput = e => { q = e.target.value.toLowerCase(); draw() }; draw();
    }
    if (page === 'apps') {
        const CS = localStorage.getItem('cg-case') || 'need'; const apps = (await API.load(BASE, 'assets/data/applications.json')).concat(JSON.parse(localStorage.getItem('cg-apps-extra') || '[]')).map(a => a.code === 'CG-2026-001248' ? Object.assign({}, a, { href: 'citizen-application-detail.html', status: { need: 'Cần bổ sung', review: 'Chờ kiểm tra', done: 'Đã hoàn thành' }[CS], next: { need: 'Bổ sung thông tin cư trú', review: 'Chờ kiểm tra bổ sung', done: 'Xem kết quả mẫu' }[CS], due: CS === 'need' ? 'Trước 07/10/2026' : '' }) : a); let tab = 'all', q = '', st = '';
        const draw = () => {
            const list = apps.filter(a => (tab === 'all' || a.kind === tab) && (!st || a.status === st) && (a.code + a.title).toLowerCase().includes(q));
            const n = k => apps.filter(a => a.kind === k).length;
            $('#pills').innerHTML = [['all', 'Tất cả', apps.length], ['sent', 'Đã gửi', n('sent')], ['draft', 'Bản nháp', n('draft')]].map(p => `<button class="btn ${tab === p[0] ? 'on' : ''}" data-t="${p[0]}">${p[1]} (${p[2]})</button>`).join('');
            $('#rows').innerHTML = list.map(a => `<tr><td><b>${a.code}</b><b>${a.title}</b></td><td>${a.sent}</td><td style="${a.status === 'Cần bổ sung' ? 'color:var(--warn)' : ''}">${a.status}</td><td>${a.next}${a.due ? '<br>' + a.due : ''}</td><td><a href="${a.href || '#'}">${a.action}</a></td></tr>`).join('') || '<tr><td colspan="5" class="muted">Không có hồ sơ phù hợp bộ lọc.</td></tr>';
            $('#count').textContent = `Hiển thị ${list.length} / ${apps.length} hồ sơ · Mã và trạng thái đều là minh họa`;
            document.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; draw() })
        };
        $('#q').oninput = e => { q = e.target.value.toLowerCase(); draw() }; $('#st').onchange = e => { st = e.target.value; draw() }; draw();
    }
});

/* ===== Nộp hồ sơ (4 màn hình trong citizen-application-create.html) ===== */
if (page === 'create') document.addEventListener('DOMContentLoaded', () => {
    if (!SES || SES.role !== 'citizen') return;
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const DOC = [['Tờ khai đăng ký kết hôn', 'Tờ khai đăng ký kết hôn'], ['Căn cước / hộ chiếu của hai bên', 'Định danh của hai bên'], ['Thông tin tình trạng hôn nhân', 'Thông tin tình trạng hôn nhân'], ['Thông tin cư trú', 'Thông tin cư trú']];
    const DEF = () => ({ a: { name: 'Nguyễn An', dob: '15/05/1998', nat: 'Việt Nam', id: 'CCCD-MAU-AN', addr: '12 đường Hoa, phường Minh Hòa (địa chỉ hư cấu)' }, b: { name: 'Trần Bình', dob: '22/08/1996', nat: 'Việt Nam', id: 'CCCD-MAU-BINH', addr: '18 đường Lá, phường Minh Hòa (địa chỉ hư cấu)' }, c: { email: 'an.nguyen@example.invalid', phone: '', office: 'UBND phường Minh Hòa (minh họa)', form: '' }, files: [{ n: 'to_khai_ket_hon_mau.pdf', s: '420 KB' }, { n: 'dinh_danh_hai_ben_mau.pdf', s: '1,2 MB' }, { n: 'tinh_trang_hon_nhan_mau.pdf', s: '680 KB' }, null], extra: [] });
    let st; try { st = JSON.parse(localStorage.getItem('cg-draft')) } catch (e) { } st = st || DEF();
    let step = 1, errs = false, done = null;
    const persist = () => localStorage.setItem('cg-draft', JSON.stringify(st));
    const IC = n => icon(n, 22);
    const UP = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 16V5M7 9l5-5 5 5M4 19h16"/></svg>';
    const missing = () => st.files.filter(f => !f).length;
    const fld = (g, k, label, o = {}) => `<div class="field"><label class="lbl">${label}${o.opt ? '' : ' *'}</label>${o.sel ? `<select class="input" data-g="${g}" data-k="${k}"><option value="">${o.ph}</option>${o.sel.map(x => `<option>${x}</option>`).join('')}</select>` : `<input class="input" data-g="${g}" data-k="${k}" ${o.opt ? 'data-opt' : ''} placeholder="${o.ph || ''}">`}${o.hint ? `<div class="hint">${o.hint}</div>` : ''}<div class="err"></div></div>`;
    const person = (g, t) => `<section class="card"><h2 style="font-size:19px;margin-bottom:18px">${t}</h2><div class="field-2">${fld(g, 'name', 'Họ và tên')}${fld(g, 'dob', 'Ngày sinh')}${fld(g, 'nat', 'Quốc tịch', { sel: ['Việt Nam', 'Khác (cần xác minh)'], ph: 'Chọn quốc tịch' })}${fld(g, 'id', 'Giấy tờ định danh', { hint: g === 'a' ? 'Mã giả dùng trong thiết kế, không phải số căn cước thật.' : '' })}</div>${fld(g, 'addr', 'Địa chỉ cư trú')}</section>`;
    const side = () => `<aside><section class="card kv"><h2>${step === 2 ? 'Thông tin bản nháp' : 'Tóm tắt bản nháp'}</h2>${step === 2 ? '' : '<span class="st st-gray">Chưa gửi</span><small>Thủ tục</small><b>P001 · Đăng ký kết hôn</b>'}<small>Hai bên</small><b>${esc(st.a.name)} &amp; ${esc(st.b.name)}</b>${step === 2 ? `<small>Cơ quan dự kiến</small><b>${esc(st.c.office)}</b><small>Hình thức đã chọn</small><b>${esc(st.c.form || 'Chưa chọn')}${st.c.form ? ' (mô phỏng)' : ''}</b><span class="st st-gray" style="margin-top:14px">Chưa gửi</span>` : '<small>Trường hợp</small><b>Trong nước</b><p class="muted" style="margin-top:12px">Bản nháp chưa có mã hồ sơ. Mã được tạo ở bước gửi minh họa.</p>'}</section>`;
    const V1 = () => `<div class="alert alert-info"><span>${icon('info', 16)}</span><div><b>Chuẩn bị hồ sơ minh họa</b>Giao diện minh họa, không gửi hồ sơ đến cơ quan nhà nước. Hãy xác nhận giấy tờ, thời hạn và lệ phí với cơ quan tiếp nhận trước khi thực hiện.</div></div>
 <div class="layout" style="grid-template-columns:1fr 260px"><div>${person('a', 'Thông tin người yêu cầu')}${person('b', 'Thông tin bên còn lại')}
 <section class="card"><h2 style="font-size:19px;margin-bottom:18px">Liên hệ &amp; cơ quan tiếp nhận</h2><div class="field-2">${fld('c', 'email', 'Email nhận thông báo', { hint: 'Email giả dành cho bản minh họa.' })}${fld('c', 'phone', 'Số điện thoại (không bắt buộc)', { opt: 1, ph: 'Nhập số điện thoại' })}</div>
 ${fld('c', 'office', 'Cơ quan dự kiến tiếp nhận', { sel: ['UBND phường Minh Hòa (minh họa)', 'UBND phường Phú Lâm (minh họa)'], ph: 'Chọn cơ quan', hint: 'Tên cơ quan hư cấu. Khi thực hiện thật, chọn cơ quan có thẩm quyền.' })}
 ${fld('c', 'form', 'Hình thức thực hiện', { sel: ['Trực tuyến', 'Trực tiếp'], ph: 'Chọn hình thức' })}
 <div class="alert alert-ok" style="margin:0"><span>${icon('ok', 16)}</span><div><b>Các thông tin mẫu đã được điền</b>Rà soát tên và ngày sinh của hai bên. Một trường bắt buộc vẫn cần được chọn.</div></div></section>
 <div class="acts" style="margin:0 0 18px"><button class="btn" id="draft">Lưu bản nháp</button><a class="btn" href="citizen-checklist-manage.html">Quay lại checklist</a><button class="btn btn-primary" id="next">Tiếp tục: Giấy tờ</button></div></div>
 ${side()}<section class="card side-list"><h2>Lưu ý khi điền</h2><p style="font-size:12px;margin-bottom:12px">Thông tin cần khớp với giấy tờ của hai bên. Không nhập dữ liệu thật vào bản thiết kế.</p><p style="font-size:12px;margin-bottom:14px">Các trường có dấu * là bắt buộc. Giấy tờ định danh không được hiển thị đầy đủ ở màn hình theo dõi.</p><a class="btn btn-block" href="../public/public-procedure-detail.html?id=P001">Xem hướng dẫn thủ tục</a></section>
 <div class="alert alert-info"><span>${icon('info', 16)}</span><div><b>Bạn có thể lưu và tiếp tục sau</b>Lưu bản nháp không tương đương nộp hồ sơ. Thông tin chỉ được mô phỏng trong thiết kế.</div></div></aside></div>`;
    const slot = (i) => { const f = st.files[i], t = DOC[i][0]; return f ? `<div class="doc-title">${t}<span class="st st-ok">Đã đính kèm</span></div><div class="file-row"><a href="#" data-view="${i}">${esc(f.n)}</a><span>PDF · ${f.s}</span><button class="btn" data-view="${i}">Xem</button><button class="btn" data-pick="${i}">Thay tệp</button></div>` : `<div class="doc-title">${t}<span class="st st-bad">Chưa có tài liệu</span></div><div class="upload">${UP}<b>Thêm tài liệu ${t.toLowerCase()}</b><p>PDF, JPG, PNG · Tối đa 10 MB mỗi tệp</p><button class="btn" data-pick="${i}">Chọn tệp</button></div><p style="color:#c23030;font-size:11.5px;margin-bottom:14px">Thiếu mục này trong kịch bản minh họa. Hỏi cơ quan tiếp nhận về tài liệu thực tế cần cung cấp.</p>` };
    const V2 = () => `<div class="layout" style="grid-template-columns:1fr 280px"><div>${missing() ? `<div class="alert alert-warn"><span>${icon('warn', 16)}</span><div><b>Còn thiếu ${missing()} mục tài liệu</b>Thêm thông tin cư trú theo danh sách minh họa trước khi sang bước kiểm tra. Không tải giấy tờ cá nhân thật.</div></div>` : ''}
 <section class="card"><h2 style="font-size:19px;margin-bottom:16px">Tài liệu đính kèm · ${4 - missing()} / 4 mục</h2>${DOC.map((_, i) => slot(i)).join('')}</section>
 <section class="card"><h2 style="font-size:19px">Tài liệu bổ sung (không bắt buộc)</h2>${st.extra.map((f, j) => `<div class="file-row"><a href="#">${esc(f.n)}</a><span>${f.s}</span><button class="btn" data-rm="${j}">Gỡ</button></div>`).join('')}<div class="upload">${UP}<b>Thêm giấy tờ khác nếu được yêu cầu</b><p>Đính kèm ghi chú để cơ quan dễ đối chiếu · PDF, JPG, PNG</p><button class="btn" data-pick="x">Chọn tệp</button></div></section>
 <div class="acts" style="margin:0"><button class="btn" id="back">Quay lại: Thông tin</button><button class="btn" id="draft">Lưu bản nháp</button><button class="btn btn-primary" id="next" ${missing() ? 'disabled' : ''}>Tiếp tục: Kiểm tra</button></div></div>
 ${side()}<section class="card"><h2>Tệp cần rõ và đầy đủ</h2><p style="font-size:12px;margin:12px 0">• PDF, JPG hoặc PNG, tối đa 10 MB mỗi tệp.</p><p style="font-size:12px;margin:12px 0">• Quét đủ các trang, không cắt góc, không che nội dung cần đối chiếu.</p><p style="font-size:12px;margin:12px 0">• Không dùng tệp có mật khẩu. Đặt tên mô tả loại giấy tờ.</p><p style="font-size:12px">• Các tệp có hậu tố “mau” đều là tài liệu hư cấu.</p></section>
 <div class="alert alert-info"><span>${icon('info', 16)}</span><div><b>Danh sách mang tính minh họa</b>Yêu cầu về bản chính, bản sao và dữ liệu được tra cứu sẽ do nơi tiếp nhận xác nhận.</div></div><a class="btn btn-block" href="../public/public-procedure-detail.html?id=P001">Xem thành phần hồ sơ</a></aside></div>`;
    const V3 = () => {
        const a = st.a, b = st.b, c = st.c; return `<div class="alert alert-ok"><span>${icon('ok', 16)}</span><div><b>Đã hoàn thiện 4 / 4 mục tài liệu</b>Thông tin cư trú đã được thêm. Tài liệu cần được cơ quan tiếp nhận kiểm tra; trạng thái này không xác nhận hồ sơ hợp lệ.</div></div>
 <div class="layout" style="grid-template-columns:1fr 260px"><div>
 <section class="card"><div class="saved-head"><h2 style="font-size:19px">Thông tin hai bên</h2><button class="btn" data-go="1">Sửa thông tin</button></div><p class="muted" style="margin-bottom:16px">Bản tóm tắt chỉ đọc · Tất cả thông tin là hư cấu</p><div class="kv2"><div><small>Người yêu cầu</small><b>${esc(a.name)} · ${esc(a.dob)}</b></div><div><small>Bên còn lại</small><b>${esc(b.name)} · ${esc(b.dob)}</b></div><div><small>Giấy tờ định danh</small><b>${esc(a.id)}</b></div><div><small>Giấy tờ định danh</small><b>${esc(b.id)}</b></div><div class="full"><small>Cư trú của ${esc(a.name)}</small><b>${esc(a.addr)}</b></div><div class="full"><small>Cư trú của ${esc(b.name)}</small><b>${esc(b.addr)}</b></div></div></section>
 <section class="card"><h2 style="font-size:19px;margin-bottom:16px">Liên hệ &amp; tiếp nhận</h2><div class="kv2"><div class="full"><small>Email liên hệ</small><b>${esc(c.email)}</b></div><div class="full"><small>Cơ quan dự kiến tiếp nhận</small><b>${esc(c.office)}</b></div><div><small>Thủ tục</small><b>P001 · Đăng ký kết hôn</b></div><div><small>Hình thức</small><b>${esc(c.form)} (mô phỏng)</b></div></div></section>
 <section class="card"><h2 style="font-size:19px">Tài liệu sẽ gửi</h2>${st.files.map((f, i) => `<div class="row"><div><h3>${esc(f.n)}</h3><p>${DOC[i][1]} · ${f.s}</p></div><a class="link" href="#" data-view="${i}">Xem tệp</a></div>`).join('')}<button class="btn" style="margin-top:12px" data-go="2">Sửa tài liệu</button></section>
 <section class="card"><h2 style="font-size:19px;margin-bottom:12px">Xác nhận trước khi gửi</h2>
 <label class="ck"><input type="checkbox" class="cf" checked><div><b>Tôi đã kiểm tra thông tin hai bên và tài liệu</b></div></label>
 <label class="ck"><input type="checkbox" class="cf" checked><div><b>Tôi đồng ý với Điều khoản &amp; quyền riêng tư</b><span>Thông tin chỉ dùng để minh họa quy trình trong thiết kế.</span></div></label>
 <label class="ck"><input type="checkbox" class="cf" checked><div><b>Tôi hiểu đây không phải thao tác nộp hồ sơ thật</b><span>Khi thực hiện thực tế, tôi sẽ kiểm tra yêu cầu và sử dụng kênh chính thức.</span></div></label><div class="err" id="cerr"></div>
 <div class="acts"><button class="btn" data-go="2">Quay lại: Giấy tờ</button><button class="btn btn-primary" id="send">Gửi hồ sơ minh họa</button></div></section></div>
 <aside><section class="card kv"><h2>Sẵn sàng gửi</h2><span class="tag" style="background:#d3f0e0;color:#1e7a4a">Đã kiểm tra thông tin</span><small>Số mục tài liệu</small><b>4 mục · 4 tệp mẫu</b><small>Người chuẩn bị</small><b>${esc(a.name)}</b><p class="muted" style="margin-top:12px">Sau khi gửi minh họa, bạn sẽ nhận được mã hồ sơ và bản xác nhận trong thiết kế.</p></section>
 <div class="alert alert-info"><span>${icon('info', 16)}</span><div><b>Không gửi đến cơ quan nhà nước</b>Giao diện minh họa, không gửi hồ sơ đến cơ quan nhà nước. Hãy xác nhận giấy tờ, thời hạn và lệ phí với cơ quan tiếp nhận trước khi thực hiện.</div></div>
 <section class="card side-list"><h2>Điều gì xảy ra tiếp theo?</h2><div class="row"><div><h3>Nhận xác nhận minh họa</h3><p>Lưu mã và tải bản xác nhận mẫu.</p></div></div><div class="row"><div><h3>Theo dõi tiến độ</h3><p>Xem các mốc và phản hồi trong kịch bản.</p></div></div><a class="btn btn-block" href="../public/public-procedure-detail.html?id=P001">Xem hướng dẫn gửi hồ sơ</a></section></aside></div>`};
    const V4 = () => `<div class="success"><span>${icon('ok', 36)}</span><h2>Hồ sơ minh họa của bạn đã được ghi nhận</h2><p>Không có dữ liệu nào được gửi tới cơ quan nhà nước. Đây không phải biên nhận hành chính chính thức.</p><small>Đã gửi · Chờ tiếp nhận</small></div>
 <div class="layout" style="grid-template-columns:1fr 280px"><section class="card"><h2 style="font-size:19px;margin-bottom:16px">Bản xác nhận gửi mẫu</h2><div class="kv2"><div><small>Mã hồ sơ</small><b>${done.code}</b></div><div style="text-align:right"><button class="btn" id="copy">Sao chép mã</button></div><div><small>Thủ tục</small><b>P001 · Đăng ký kết hôn</b></div><div><small>Thời điểm gửi mẫu</small><b>${done.time}</b></div><div><small>Người yêu cầu</small><b>${esc(st.a.name)}</b></div><div><small>Bên còn lại</small><b>${esc(st.b.name)}</b></div><div class="full"><small>Nơi dự kiến tiếp nhận</small><b>${esc(st.c.office)}</b></div><div><small>Tài liệu</small><b>4 mục · 4 tệp mẫu</b></div><div><small>Liên hệ</small><b>${esc(st.c.email)}</b></div></div>
 <div class="alert alert-info" style="margin:18px 0"><span>${icon('info', 18)}</span><div><b>Giữ lại mã hồ sơ</b>Dùng mã này để đối chiếu các màn hình theo dõi, thông báo và hỗ trợ trong thiết kế.</div></div><div class="acts" style="margin:0"><a class="btn btn-primary" href="citizen-application-track.html">Theo dõi hồ sơ</a><button class="btn" onclick="window.print()">Tải bản xác nhận PDF</button></div></section>
 <aside><section class="card side-list"><h2>Các bước tiếp theo</h2><div class="row"><div><h3>1. Chờ kiểm tra hồ sơ</h3><p>Trạng thái ban đầu: Đã gửi, chờ tiếp nhận.</p></div></div><div class="row"><div><h3>2. Kiểm tra thông báo</h3><p>Theo dõi yêu cầu bổ sung và các mốc xử lý.</p></div></div><div class="row"><div><h3>3. Thực hiện theo hướng dẫn</h3><p>Xác nhận việc có mặt và xuất trình bản chính với nơi tiếp nhận.</p></div></div></section>
 <section class="card"><h2>Bạn cần hỗ trợ?</h2><p class="muted" style="margin:12px 0 14px">Khi gửi yêu cầu hỗ trợ, chọn mã hồ sơ để cung cấp đúng ngữ cảnh.</p><a class="btn btn-block" href="#">Liên hệ hỗ trợ</a></section></aside></div>
 <div class="acts"><a class="btn" href="citizen-application-track.html">Về Hồ sơ của tôi</a><a class="btn" href="citizen-checklist-manage.html">Xem Checklist của tôi</a></div>`;
    const META = [null, ['Bước 1: Thông tin', 'Đăng ký kết hôn · Điền thông tin hai bên và nơi dự kiến tiếp nhận.'], ['Bước 2: Giấy tờ', 'Đăng ký kết hôn · Đính kèm tài liệu mẫu và kiểm tra danh sách chuẩn bị.'], ['Bước 3: Kiểm tra & gửi', 'Đăng ký kết hôn · Đọc lại thông tin trước khi gửi hồ sơ minh họa.']];
    function bindFields() { document.querySelectorAll('[data-g]').forEach(el => { el.value = st[el.dataset.g][el.dataset.k] || ''; el.oninput = el.onchange = () => { st[el.dataset.g][el.dataset.k] = el.value; V.setErr(el, '') } }) }
    function render() {
        const fin = step === 4;
        $('#crumb').innerHTML = `<a href="../../index.html">Trang chủ</a> › <a href="citizen-application-track.html">Hồ sơ của tôi</a> › ${fin ? 'Gửi hồ sơ thành công' : 'Nộp hồ sơ · ' + META[step][0]}`;
        $('#ttl').textContent = fin ? 'Gửi hồ sơ thành công' : 'Nộp hồ sơ · ' + META[step][0];
        $('#sub').textContent = fin ? 'Xác nhận gửi trong kịch bản minh họa · Đăng ký kết hôn' : META[step][1];
        const S = ['Thông tin', 'Giấy tờ', 'Kiểm tra & gửi'];
        $('#steps').hidden = fin; $('#steps').innerHTML = S.map((t, i) => `<div class="step ${i + 1 < step ? 'done' : ''} ${i + 1 === step ? 'on' : ''}"><i>${i + 1 < step ? '✓' : i + 1}</i>${t}</div>`).join('');
        $('#view').innerHTML = [null, V1, V2, V3, V4][step](); hydrateIcons(); wire(); window.scrollTo(0, 0)
    }
    const go = n => { persist(); step = n; errs = false; render() };
    function validate() {
        let ok = true; const chk = (el, m) => { V.setErr(el, m); if (m) ok = false };
        document.querySelectorAll('[data-g]').forEach(el => {
            const v = el.value.trim();
            if (el.dataset.k === 'phone') { chk(el, v && !V.phone(v) ? 'Số điện thoại chưa hợp lệ.' : ''); return }
            if (!v) return chk(el, el.tagName === 'SELECT' ? 'Vui lòng chọn ' + (el.dataset.k === 'form' ? 'hình thức' : 'thông tin này') + ' trước khi tiếp tục.' : 'Vui lòng nhập thông tin này.');
            chk(el, el.dataset.k === 'email' && !V.email(v) ? 'Email chưa hợp lệ.' : '')
        });
        if (!ok) { const e = document.querySelector('.invalid'); e && e.focus() } return ok
    }
    const fi = document.createElement('input'); fi.type = 'file'; fi.accept = '.pdf,.jpg,.jpeg,.png'; fi.hidden = true; document.body.appendChild(fi); let target = null;
    fi.onchange = () => {
        const f = fi.files[0]; fi.value = ''; if (!f) return;
        if (!/\.(pdf|jpe?g|png)$/i.test(f.name)) return showToast('Chỉ nhận tệp PDF, JPG hoặc PNG.');
        if (f.size > 10 * 1024 * 1024) return showToast('Tệp vượt quá 10 MB.');
        const s = f.size < 1048576 ? Math.max(1, Math.round(f.size / 1024)) + ' KB' : (f.size / 1048576).toFixed(1).replace('.', ',') + ' MB';/* chỉ ghi tên + dung lượng, không đọc nội dung tệp */
        target === 'x' ? st.extra.push({ n: f.name, s }) : st.files[target] = { n: f.name, s }; persist(); render()
    };
    function wire() {
        const q = s => document.querySelectorAll(s);
        if (step === 1) bindFields();
        q('[data-pick]').forEach(b => b.onclick = () => { target = b.dataset.pick === 'x' ? 'x' : +b.dataset.pick; fi.click() });
        q('[data-rm]').forEach(b => b.onclick = () => { st.extra.splice(+b.dataset.rm, 1); persist(); render() });
        q('[data-view]').forEach(b => b.onclick = e => { e.preventDefault(); showToast('Bản minh họa: không mở nội dung tệp thật.') });
        q('[data-go]').forEach(b => b.onclick = () => go(+b.dataset.go));
        const d = $('#draft'); if (d) d.onclick = () => { persist(); showToast('Đã lưu bản nháp') };
        const bk = $('#back'); if (bk) bk.onclick = () => go(1);
        const nx = $('#next'); if (nx) nx.onclick = () => { if (step === 1) { if (validate()) go(2) } else if (step === 2 && !missing()) go(3) };
        const sd = $('#send'); if (sd) sd.onclick = () => {
            if ([...document.querySelectorAll('.cf')].some(c => !c.checked)) { $('#cerr').textContent = 'Cần tick đủ 3 xác nhận trước khi gửi.'; return }
            const extra = JSON.parse(localStorage.getItem('civicguide-applications') || '[]'), n = new Date(), p = x => String(x).padStart(2, '0');
            const code = 'CG-2026-00' + (1249 + extra.length); const date = `${p(n.getDate())}/${p(n.getMonth() + 1)}/${n.getFullYear()}`;
            done = { code, time: `${date} · ${p(n.getHours())}:${p(n.getMinutes())}` };
            extra.push({ code, title: 'Đăng ký kết hôn', sent: date, status: 'Chờ tiếp nhận', kind: 'sent', next: 'Chờ kiểm tra hồ sơ', due: '', action: 'Theo dõi →', month: `${p(n.getMonth() + 1)}/${n.getFullYear()}` });
            localStorage.setItem('cg-apps-extra', JSON.stringify(extra)); localStorage.removeItem('cg-draft'); st = DEF(); step = 4; render()
        };
        const cp = $('#copy'); if (cp) cp.onclick = () => { (navigator.clipboard ? navigator.clipboard.writeText(done.code) : Promise.reject()).then(() => showToast('Đã sao chép mã hồ sơ'), () => showToast('Mã hồ sơ: ' + done.code)) }
    }
    render();
});

/* ===== Theo dõi hồ sơ / Bổ sung thành công / Nhận kết quả (citizen-application-detail.html) ===== */
if (page === 'detail') document.addEventListener('DOMContentLoaded', () => {
    if (!SES || SES.role !== 'citizen') return;
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    let cs = localStorage.getItem('cg-case') || 'need', view = new URLSearchParams(location.search).get('view') || (cs === 'done' ? 'result' : 'track'), pick = null, rate = 0;
    const sent = () => JSON.parse(localStorage.getItem('cg-supp-sent') || 'null') || { n: 'thong_tin_cu_tru_ro_net_mau.pdf', s: '780 KB', t: '04/10/2026 · 09:40' };
    const ic = (k, n) => `<span class="ic ${k}">${icon(n, 22)}</span>`;
    const tl = a => `<ul class="tl">${a.map(i => `<li>${i[0] === 'ok' ? ic('', 'ok') : i[0] === 'warn' ? ic('warn', 'alertc') : ic('todo', 'circle')}<div><small>${i[1]}</small><b>${i[2]}</b><p>${i[3]}</p></div>${i[4] ? `<span class="st st-warn">${i[4]}</span>` : ''}</li>`).join('')}</ul>`;
    const info = (badge, cls) => `<section class="card kv"><h2>Thông tin hồ sơ</h2><span class="st ${cls}">${badge}</span><small>Mã hồ sơ</small><b>CG-2026-001248</b><small>Hai bên</small><b>Nguyễn An &amp; Trần Bình</b><small>Ngày gửi</small><b>01/10/2026 09:15</b><small>Cơ quan trong kịch bản</small><b>UBND phường Minh Hòa (minh họa)</b><small>Bộ phận</small><b>Tiếp nhận hộ tịch (minh họa)</b><small>Thời hạn / lệ phí thực tế</small><b>Xác minh với cơ quan tiếp nhận.</b></section>`;
    const base = [['ok', '01/10/2026 · 09:15', 'Đã gửi hồ sơ', 'Bản gửi mẫu gồm 4 mục tài liệu.'], ['ok', '01/10/2026 · 10:00', 'Đã tiếp nhận để kiểm tra', 'Đối chiếu thông tin và tài liệu trong kịch bản.']];
    const docs = () => {
        const l = cs === 'need' ? ['thong_tin_cu_tru_mau.pdf', 'Thông tin cư trú · 540 KB · Cần bản rõ hơn'] : [sent().n, 'Thông tin cư trú · ' + sent().s + ' · Bổ sung 04/10/2026 · Chờ kiểm tra'];
        return [['to_khai_ket_hon_mau.pdf', 'Tờ khai · 420 KB · Gửi 01/10/2026'], ['dinh_danh_hai_ben_mau.pdf', 'Định danh hai bên · 1,2 MB · Gửi 01/10/2026'], ['tinh_trang_hon_nhan_mau.pdf', 'Tình trạng hôn nhân · 680 KB · Gửi 01/10/2026'], l]
    };
    const docRows = () => docs().map(d => `<div class="row"><div><h3>${esc(d[0])}</h3><p>${d[1]}</p></div><a class="link" href="#" data-view>Xem tệp</a></div>`).join('');
    const track = () => {
        const need = cs === 'need';
        const steps = need ? [...base, ['warn', '02/10/2026 · 14:30', 'Yêu cầu bổ sung', 'Bản chụp thông tin cư trú chưa rõ; cần tải lại.', 'Hiện tại'], ['todo', 'Chưa thực hiện', 'Tiếp tục xử lý', 'Sau khi tiếp nhận tài liệu bổ sung.'], ['todo', 'Chưa thực hiện', 'Nhận kết quả', 'Theo hướng dẫn của nơi tiếp nhận.']]
            : [...base, ['ok', '02/10/2026 · 14:30', 'Yêu cầu bổ sung', 'Bản chụp thông tin cư trú chưa rõ; cần tải lại.'], ['ok', '04/10/2026 · 09:40', 'Đã gửi bổ sung', 'Bản rõ hơn đã được ghi nhận, chờ kiểm tra.', 'Hiện tại'], ['todo', 'Chưa thực hiện', 'Tiếp tục xử lý', 'Sau khi kiểm tra tài liệu bổ sung.'], ['todo', 'Chưa thực hiện', 'Nhận kết quả', 'Theo hướng dẫn của nơi tiếp nhận.']];
        const f = pick;
        return `<div class="alert ${need ? 'alert-warn' : 'alert-info'}" style="padding:14px 16px"><span>${icon(need ? 'warn' : 'info', 18)}</span><div><b>${need ? 'Cần bổ sung thông tin cư trú' : 'Đã gửi bổ sung · Chờ kiểm tra'}</b>${need ? 'Tài liệu thong_tin_cu_tru_mau.pdf bị mờ. Trong kịch bản minh họa, vui lòng tải lại trước 07/10/2026 để tiếp tục xử lý.' : 'Bản rõ hơn của thông tin cư trú đã được ghi nhận. Hãy theo dõi Thông báo để xem bước tiếp theo.'}</div></div>
  <div class="layout" style="grid-template-columns:1fr 270px"><div><section class="card"><h2 style="font-size:19px">Tiến độ xử lý</h2>${tl(steps)}</section>
  ${need ? `<section class="card"><h2 style="font-size:19px;margin-bottom:12px">Bổ sung tài liệu</h2><p style="font-size:12.5px;margin-bottom:12px">Yêu cầu mẫu: cung cấp bản chụp rõ nét toàn bộ thông tin cư trú, không cắt góc. Các tài liệu còn lại được giữ nguyên trong hồ sơ.</p><div class="kv"><small style="margin:0">Tài liệu cần thay</small><b>thong_tin_cu_tru_mau.pdf · 540 KB</b></div>
  ${f ? `<div class="file-row" style="margin:14px 0"><a href="#" data-view>${esc(f.n)}</a><span>${f.s}</span><button class="btn" id="pick">Đổi tệp</button></div>` : `<div class="upload"><span>${icon('upload', 22)}</span><b>Tải lại thông tin cư trú</b><p>PDF, JPG, PNG · Tối đa 10 MB mỗi tệp</p><button class="btn" id="pick">Chọn tệp</button></div><div class="alert alert-warn"><span>${icon('warn', 16)}</span><div><b>Chưa có tài liệu bổ sung</b>Chọn tệp mới trước khi gửi bổ sung. Không sử dụng giấy tờ cá nhân thật trong bản minh họa.</div></div>`}
  <div class="acts" style="margin:0"><button class="btn btn-primary" id="sendsupp" ${f ? '' : 'disabled'}>Gửi bổ sung minh họa</button><a class="btn" href="#" data-view>Hỏi về yêu cầu này</a></div></section>` : ''}
  <section class="card"><h2 style="font-size:19px">Tài liệu đã gửi</h2>${docRows()}</section></div>
  <aside>${info(need ? 'Cần bổ sung' : 'Chờ kiểm tra', need ? 'st-warn' : '')}<div class="alert alert-info"><span>${icon('info', 16)}</span><div><b>Các mốc chỉ là minh họa</b>Mã hồ sơ, thời hạn bổ sung và trạng thái không đại diện cho hồ sơ hành chính thật.</div></div>
  <section class="card"><h2>Hành động liên quan</h2><a class="btn btn-block" href="citizen-notification-list.html">Xem Thông báo</a><a class="btn btn-block" style="margin-top:10px" href="#" data-view>Liên hệ hỗ trợ</a><a class="btn btn-block" style="margin-top:10px" href="../public/public-procedure-detail.html?id=P001">Xem hướng dẫn kết hôn</a></section></aside></div>`};
    const success = () => {
        const s = sent(); return `<div class="alert alert-ok" style="padding:14px 16px"><span>${icon('ok', 18)}</span><div><b>Đã ghi nhận tài liệu bổ sung</b>Bản rõ hơn của thông tin cư trú đã được lưu vào hồ sơ mẫu lúc ${s.t.replace(' · ', ', ').split(', ').reverse().join(', ')}. Đây không phải biên nhận của cơ quan nhà nước.</div></div>
  <div class="layout" style="grid-template-columns:1fr 270px"><div><section class="card"><h2 style="font-size:19px;margin-bottom:16px">Bản ghi nhận bổ sung</h2><div style="display:flex;gap:14px;align-items:center;margin-bottom:6px"><span class="ok-t">${icon('ok', 30)}</span><h2 style="margin:0;font-size:17px">Đã gửi bổ sung · Chờ kiểm tra</h2></div><p class="muted" style="margin-bottom:18px">Mốc tiếp theo: kiểm tra bản rõ hơn và tiếp tục xử lý mẫu.</p>
  <div class="kv2"><div><small>Mã bản ghi mẫu</small><b>BS-CG-2026-001248-01</b></div><div><small>Thời điểm gửi bổ sung</small><b>${s.t}</b></div><div class="full"><small>Người gửi</small><b style="font-weight:400">Nguyễn An · Cho hồ sơ của Nguyễn An &amp; Trần Bình</b></div>
  <div class="full" style="display:flex;justify-content:space-between;gap:12px"><div><small>Tài liệu bổ sung</small><b style="font-weight:400">${esc(s.n)} · PDF · ${s.s}</b></div><a class="link" href="#" data-view>Xem tệp mẫu</a></div><div class="full"><small>Ghi chú đã gửi: “Bản mẫu rõ hơn, đủ toàn bộ trang; không cắt góc.”</small></div></div>
  <div class="acts"><button class="btn btn-primary" data-v="track">Quay lại theo dõi hồ sơ</button><button class="btn" onclick="window.print()">Tải bản ghi nhận mẫu</button></div></section>
  <section class="card"><h2 style="font-size:19px">Tài liệu trong hồ sơ được giữ lại</h2><p class="muted" style="margin-bottom:6px">Chỉ thay bản thông tin cư trú. Các tài liệu khác không cần gửi lại.</p>${docRows()}<div class="alert alert-info" style="margin:14px 0 0"><span>${icon('info', 16)}</span><div><b>Bản cũ được giữ trong lịch sử</b>thong_tin_cu_tru_mau.pdf · 540 KB · Đã thay thế. Bản cũ không còn là tài liệu đang chờ kiểm tra.</div></div></section>
  <section class="card side-list"><h2 style="font-size:19px">Điều gì diễn ra tiếp theo?</h2><div class="row"><div><h3>1. Kiểm tra tài liệu bổ sung</h3><p>Trong kịch bản, bản rõ hơn được đối chiếu với thông tin đã gửi.</p></div></div><div class="row"><div><h3>2. Theo dõi thông báo</h3><p>Bạn sẽ thấy cập nhật ở Theo dõi hồ sơ và Thông báo; chưa có kết quả ở trạng thái này.</p></div></div><div class="row"><div><h3>3. Xác nhận việc thực tế với nơi tiếp nhận</h3><p>Nếu đang làm thủ tục thật, dùng mã chính thức và kênh của cơ quan; không dùng mã CG để tra cứu tại cơ quan.</p></div></div></section></div>
  <aside><section class="card kv"><h2>Thông tin hồ sơ</h2><span class="tag">Chờ kiểm tra</span><small>Mã hồ sơ</small><b>CG-2026-001248</b><small>Hai bên</small><b>Nguyễn An &amp; Trần Bình</b><small>Cơ quan trong kịch bản</small><b>UBND phường Minh Hòa (minh họa)</b><small>Ngày gửi ban đầu</small><b>01/10/2026 · 09:15</b><small>Yêu cầu bổ sung</small><b>02/10/2026 · 14:30 · Bản cư trú bị mờ</b></section>
  <div class="alert alert-info"><span>${icon('info', 16)}</span><div><b>Mốc thời gian chỉ là minh họa</b>04/10 là trạng thái tiếp theo sau yêu cầu bổ sung. Không có cam kết thời hạn xử lý hoặc lệ phí thực tế.</div></div>
  <section class="card"><h2>Bạn cần làm gì lúc này?</h2><p class="muted" style="margin:10px 0 14px">Không cần gửi lại cùng tài liệu. Theo dõi trạng thái mới hoặc hỏi hỗ trợ nếu bản mẫu chưa đúng.</p><a class="btn btn-block" href="citizen-notification-list.html">Xem Thông báo</a><a class="btn btn-block" style="margin-top:10px" href="#" data-view>Hỏi về hồ sơ mẫu</a></section></aside></div>`};
    const result = () => {
        const arch = localStorage.getItem('cg-archived') === '1', f = 'ket_qua_ket_hon_CG-2026-001248_mau';
        return `<div class="alert alert-ok" style="padding:14px 16px"><span>${icon('ok', 18)}</span><div><b>Đã hoàn thành trong kịch bản minh họa</b>Hồ sơ mẫu của Nguyễn An &amp; Trần Bình đã đến bước nhận kết quả, sau khi tài liệu bổ sung được kiểm tra. Không có giấy tờ pháp lý thật được cấp.</div></div>
  <div class="layout" style="grid-template-columns:1fr 270px"><div><section class="card"><h2 style="font-size:19px;margin-bottom:14px">Kết quả mẫu để tải và xem</h2><div class="saved-head"><div style="display:flex;gap:12px;align-items:center"><span style="color:var(--blue)">${icon('file', 26)}</span><div><b style="font-size:13px">${f}.pdf</b><p class="muted" style="margin-top:6px">PDF · 320 KB · 1 trang · Tạo 06/10/2026, 15:00</p></div></div><span class="st st-ok">Kết quả minh họa</span></div>
  <div class="preview" id="pv"><small>CIVICGUIDE · TÀI LIỆU HƯ CẤU</small><h3>BẢN KẾT QUẢ ĐĂNG KÝ KẾT HÔN MẪU</h3><div style="font-size:12px">Nguyễn An &amp; Trần Bình · CG-2026-001248</div><div class="big">MINH HỌA</div><div class="no">KHÔNG CÓ GIÁ TRỊ PHÁP LÝ</div><p style="text-align:left">Chỉ minh họa trải nghiệm nhận kết quả. Không phải giấy chứng nhận kết hôn, không có chữ ký hoặc con dấu của cơ quan nhà nước.</p></div>
  <div class="acts" style="margin:0 0 12px"><button class="btn btn-primary" id="dl">Tải kết quả mẫu</button><button class="btn" id="fs">Xem toàn màn hình</button></div><p class="muted">Giữ nguyên nhãn “MINH HỌA” khi chia sẻ. Không dùng tệp này để chứng minh quan hệ hôn nhân hoặc làm thủ tục khác.</p></section>
  <section class="card side-list"><h2 style="font-size:19px">Kiểm tra với cơ quan tiếp nhận thực tế</h2><div class="row"><div><h3>Xác nhận tình trạng hồ sơ thật</h3><p>Tra cứu bằng mã chính thức hoặc liên hệ cơ quan thực tế. Mã CG-2026-001248 chỉ dùng trong bản minh họa.</p></div></div><div class="row"><div><h3>Hỏi cách nhận và yêu cầu có mặt</h3><p>Hai bên xác nhận việc xuất trình giấy tờ, ký và nhận kết quả theo hướng dẫn của nơi tiếp nhận.</p></div></div><div class="row"><div><h3>Đối chiếu thông tin trên kết quả thật</h3><p>Kiểm tra họ tên, ngày sinh và nội dung ghi nhận; báo cơ quan có thẩm quyền nếu phát hiện sai lệch.</p></div></div>
  <div class="alert alert-warn" style="margin:14px 0 0"><span>${icon('warn', 16)}</span><div><b>Không thay thế kết quả chính thức</b>UBND phường Minh Hòa là tên minh họa. Thời hạn, lệ phí và hình thức nhận thực tế phải được xác nhận riêng.</div></div></section>
  <section class="card"><h2 style="font-size:19px">Lịch sử hoàn tất hồ sơ</h2>${tl([...base, ['ok', '02/10/2026 · 14:30', 'Yêu cầu bổ sung', 'Bản thông tin cư trú bị mờ.'], ['ok', '04/10/2026 · 09:40', 'Đã gửi bổ sung', 'Bản rõ hơn đã thay tài liệu cũ.'], ['ok', '05/10/2026 · 10:15', 'Đã kiểm tra bổ sung · Tiếp tục xử lý', 'Tài liệu mẫu đã được đối chiếu.'], ['ok', '06/10/2026 · 15:00', 'Đã hoàn thành · Có kết quả mẫu', 'Trạng thái cuối của kịch bản minh họa.']])}</section></div>
  <aside><section class="card kv"><h2>Thông tin hồ sơ</h2><span class="st st-ok">Đã hoàn thành · Minh họa</span><small>Mã hồ sơ</small><b>CG-2026-001248</b><small>Hai bên</small><b>Nguyễn An &amp; Trần Bình</b><small>Cơ quan trong kịch bản</small><b>UBND phường Minh Hòa (minh họa)</b><small>Hoàn tất mẫu</small><b>06/10/2026 · 15:00</b><a class="link" style="display:block;margin-top:12px" href="#" data-v="track">Xem tài liệu đã gửi →</a></section>
  <section class="card"><h2>Lưu lại hành trình</h2><p class="muted" style="margin:10px 0 14px">Đưa hồ sơ mẫu vào mục lưu trữ để gọn danh sách. Bạn vẫn có thể xem lịch sử và kết quả mẫu.</p><button class="btn btn-block" id="arch">${arch ? 'Đã lưu trữ hồ sơ mẫu ✓' : 'Lưu trữ hồ sơ mẫu'}</button><a class="btn btn-block" style="margin-top:10px" href="citizen-application-track.html">Về Hồ sơ của tôi</a></section>
  <section class="card"><h2>Trải nghiệm có rõ ràng không?</h2><p class="muted" style="margin-top:10px">Đánh giá luồng chuẩn bị và theo dõi, không đánh giá việc xử lý của cơ quan nhà nước.</p><div class="rate" role="group" aria-label="Điểm đánh giá">${[1, 2, 3, 4, 5].map(n => `<button data-r="${n}" class="${rate === n ? 'on' : ''}">${n}</button>`).join('')}</div><p class="muted" style="margin-bottom:12px;font-size:10.5px">1: Chưa rõ · 5: Rất rõ</p><button class="btn btn-primary btn-block" id="rsend">Gửi đánh giá</button></section>
  <section class="card"><h2>Cần trợ giúp về kết quả?</h2><p class="muted" style="margin:10px 0 14px">Có lỗi khi xem tệp mẫu hoặc cần hiểu bước tiếp theo? Không gửi giấy tờ thật qua hỗ trợ.</p><a class="btn btn-block" href="#" data-view>Liên hệ hỗ trợ</a><a class="link" style="display:block;margin-top:12px" href="#" data-view>Hướng dẫn nhận kết quả →</a></section></aside></div>`};
    const T = { track: ['Theo dõi hồ sơ', () => `CG-2026-001248 · Đăng ký kết hôn · Cập nhật ${cs === 'need' ? '03/10/2026, 08:30' : '04/10/2026, 09:40'}`, 'Theo dõi hồ sơ'], success: ['Bổ sung hồ sơ thành công', () => 'CG-2026-001248 · Đăng ký kết hôn · Trạng thái sau khi gửi bổ sung trong kịch bản.', 'CG-2026-001248 › Bổ sung thành công'], result: ['Nhận kết quả hồ sơ', () => 'CG-2026-001248 · Đăng ký kết hôn · Cập nhật 06/10/2026, 15:00 (minh họa)', 'CG-2026-001248 › Nhận kết quả'] };
    const fi = document.createElement('input'); fi.type = 'file'; fi.accept = '.pdf,.jpg,.jpeg,.png'; fi.hidden = true; document.body.appendChild(fi);
    fi.onchange = () => {
        const f = fi.files[0]; fi.value = ''; if (!f) return; if (!/\.(pdf|jpe?g|png)$/i.test(f.name)) return showToast('Chỉ nhận tệp PDF, JPG hoặc PNG.'); if (f.size > 10485760) return showToast('Tệp vượt quá 10 MB.');
        pick = { n: f.name, s: f.size < 1048576 ? Math.max(1, Math.round(f.size / 1024)) + ' KB' : (f.size / 1048576).toFixed(1).replace('.', ',') + ' MB' }; render()
    };/* chỉ ghi tên + dung lượng */
    function render() {
        $('#ttl').textContent = T[view][0]; $('#sub').textContent = T[view][1]();
        $('#crumb').innerHTML = `<a href="../../index.html">Trang chủ</a> › <a href="citizen-application-track.html">Hồ sơ của tôi</a> › ${view === 'track' ? 'Theo dõi hồ sơ' : T[view][2]}`;
        $('#hact').innerHTML = view === 'track' ? '<button class="btn" onclick="window.print()">Tải bản xác nhận</button>' : '';
        $('#view').innerHTML = { track, success, result }[view](); hydrateIcons();
        $('#demo').innerHTML = '<b>Công cụ minh họa kịch bản:</b>' + (cs === 'review' ? '<button class="btn" id="d-done">Mô phỏng: cơ quan kiểm tra xong</button>' : '') + (cs === 'done' ? '<a class="btn" href="?view=result">Đang ở trạng thái hoàn thành</a>' : '') + '<button class="btn" id="d-reset">Đặt lại kịch bản</button>';
        const q = s => document.querySelectorAll(s), on = (s, f) => { const e = $(s); if (e) e.onclick = f };
        q('[data-view]').forEach(a => a.onclick = e => { e.preventDefault(); showToast('Bản minh họa: chức năng này không có tệp hoặc kênh thật.') });
        q('[data-v]').forEach(a => a.onclick = e => { e.preventDefault(); view = a.dataset.v; render(); window.scrollTo(0, 0) });
        on('#pick', () => fi.click());
        on('#sendsupp', () => { localStorage.setItem('cg-supp-sent', JSON.stringify({ n: pick.n, s: pick.s, t: (() => { const n = new Date(), p = x => String(x).padStart(2, '0'); return `${p(n.getDate())}/${p(n.getMonth() + 1)}/${n.getFullYear()} · ${p(n.getHours())}:${p(n.getMinutes())}` })() })); localStorage.setItem('cg-case', 'review'); cs = 'review'; pick = null; view = 'success'; render(); window.scrollTo(0, 0) });
        on('#d-done', () => { localStorage.setItem('cg-case', 'done'); cs = 'done'; view = 'result'; render(); window.scrollTo(0, 0) });
        on('#d-reset', () => { ['cg-case', 'cg-supp-sent', 'cg-archived'].forEach(k => localStorage.removeItem(k)); cs = 'need'; pick = null; view = 'track'; render(); window.scrollTo(0, 0) });
        on('#dl', () => { const b = new Blob(['CIVICGUIDE · TÀI LIỆU HƯ CẤU\nBẢN KẾT QUẢ ĐĂNG KÝ KẾT HÔN MẪU\nNguyễn An & Trần Bình · CG-2026-001248\nMINH HỌA - KHÔNG CÓ GIÁ TRỊ PHÁP LÝ\n'], { type: 'text/plain;charset=utf-8' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'ket_qua_ket_hon_CG-2026-001248_mau.txt'; a.click(); URL.revokeObjectURL(a.href); showToast('Đã tải kết quả mẫu') });
        on('#fs', () => { const e = $('#pv'); (e.requestFullscreen ? e.requestFullscreen() : Promise.reject()).catch(() => showToast('Trình duyệt không hỗ trợ toàn màn hình.')) });
        on('#arch', () => { const v = localStorage.getItem('cg-archived') === '1'; localStorage.setItem('cg-archived', v ? '0' : '1'); showToast(v ? 'Đã bỏ lưu trữ' : 'Đã lưu trữ hồ sơ mẫu'); render() });
        q('[data-r]').forEach(b => b.onclick = () => { rate = +b.dataset.r; q('[data-r]').forEach(x => x.classList.toggle('on', x === b)) });
        on('#rsend', () => { if (!rate) return showToast('Chọn điểm từ 1 đến 5 trước khi gửi.'); localStorage.setItem('cg-rating', rate); showToast('Cảm ơn bạn đã đánh giá (' + rate + '/5)') });
    }
    render();
});

/* ===== Thông báo ===== */
if (page === 'notif') document.addEventListener('DOMContentLoaded', async () => {
    if (!SES || SES.role !== 'citizen') return;
    const all = await API.load(BASE, 'assets/data/notifications.json'); let tab = 'all', cat = '';
    const read = () => JSON.parse(localStorage.getItem('cg-notif-read') || '[]'), un = n => n.unread && !read().includes(n.id);
    function draw() {
        const r = read(), cnt = f => all.filter(f).length;
        const tabs = [['all', 'Tất cả', all.length], ['un', 'Chưa đọc', cnt(un)], ['Hồ sơ', 'Hồ sơ', cnt(n => n.cat === 'Hồ sơ')], ['Checklist', 'Checklist', cnt(n => n.cat === 'Checklist')], ['Thủ tục đã lưu', 'Thủ tục đã lưu', cnt(n => n.cat === 'Thủ tục đã lưu')]];
        $('#pills').innerHTML = tabs.map(t => `<button class="btn ${tab === t[0] ? 'on' : ''}" data-t="${t[0]}">${t[1]} (${t[2]})</button>`).join('');
        const list = all.filter(n => (tab === 'all' || (tab === 'un' ? un(n) : n.cat === tab)) && (!cat || n.cat === cat));
        $('#list').innerHTML = list.map(n => `<article class="card notif ${un(n) ? 'unread' : ''}">${icon(n.icon, 26)}<div><h3>${n.title}</h3><p>${n.body}</p><div class="foot"><span>${n.cat} · ${n.time}</span><a class="link" data-id="${n.id}" href="${n.href}">${n.cta}</a></div></div>${un(n) ? '<span class="dot" aria-label="Chưa đọc"></span>' : ''}</article>`).join('') || '<div class="card"><h2>Không có thông báo</h2><p class="muted">Bạn đã xem hết thông báo trong mục này.</p></div>';
        const u = cnt(un); $('#ucount').textContent = u + ' thông báo chưa đọc';
        document.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; draw() });
        document.querySelectorAll('[data-id]').forEach(a => a.onclick = () => { const x = read(); x.push(a.dataset.id); localStorage.setItem('cg-notif-read', JSON.stringify(x)) })
    }
    $('#readall').onclick = () => { localStorage.setItem('cg-notif-read', JSON.stringify(all.map(n => n.id))); showToast('Đã đánh dấu tất cả là đã đọc'); draw() };
    $('#apply').onclick = () => { cat = $('#f-cat').value; draw() }; draw();
});

/* ===== Tài khoản & bảo mật ===== */
if (page === 'account') document.addEventListener('DOMContentLoaded', async () => {
    if (!SES || SES.role !== 'citizen') return;
    const DEFP = { name: SES.full || 'Nguyễn An', display: SES.name || 'An Nguyễn', email: 'an.nguyen@example.invalid', phone: '', addr: '12 đường Hoa, phường Minh Hòa (hư cấu)' };
    const getP = () => Object.assign({}, DEFP, JSON.parse(localStorage.getItem('cg-profile') || '{}'));
    const f = $('#pf'), fill = () => { const p = getP();['name', 'display', 'email', 'phone', 'addr'].forEach(k => f[k].value = p[k]); $('#s-display').textContent = p.display }; fill();
    f.onsubmit = e => {
        e.preventDefault(); let ok = true; const chk = (i, m) => { V.setErr(i, m); if (m) ok = false };
        chk(f.name, V.required(f.name.value) ? '' : 'Nhập họ và tên.'); chk(f.email, V.email(f.email.value) ? '' : 'Email chưa hợp lệ.'); chk(f.phone, !f.phone.value || V.phone(f.phone.value) ? '' : 'Số điện thoại chưa hợp lệ.'); chk(f.addr, V.required(f.addr.value) ? '' : 'Nhập địa chỉ.'); if (!ok) return;
        const p = { name: f.name.value.trim(), display: f.display.value.trim() || f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim(), addr: f.addr.value.trim() };
        localStorage.setItem('cg-profile', JSON.stringify(p)); const store = localStorage.getItem('cg-session') ? localStorage : sessionStorage; store.setItem('cg-session', JSON.stringify(Object.assign({}, SES, { name: p.display, full: p.name })));
        $('#s-display').textContent = p.display; showToast('Đã lưu thông tin cá nhân')
    };
    $('#pcancel').onclick = () => { fill(); document.querySelectorAll('#pf .invalid').forEach(i => V.setErr(i, '')); showToast('Đã hủy thay đổi') };
    $('#addphone').onclick = () => f.phone.focus();
    const users = (await API.load(BASE, 'assets/data/users.json')).users.concat(JSON.parse(localStorage.getItem('cg-users') || '[]'));
    const pw = $('#pwf'); pw.onsubmit = e => {
        e.preventDefault(); const me = users.find(u => u.id === SES.id), ov = JSON.parse(localStorage.getItem('cg-pw') || '{}'), cur = me ? (ov[me.id] || me.password) : ''; let ok = true; const chk = (i, m) => { V.setErr(i, m); if (m) ok = false };
        chk(pw.cur, pw.cur.value && pw.cur.value === cur ? '' : 'Mật khẩu hiện tại chưa đúng.'); chk(pw.nw, V.pwOk(pw.nw.value) ? '' : 'Mật khẩu mới chưa đáp ứng yêu cầu.'); chk(pw.nw2, V.match(pw.nw.value, pw.nw2.value) ? '' : 'Hai mật khẩu chưa khớp.'); if (!ok) return;
        ov[me.id] = pw.nw.value; localStorage.setItem('cg-pw', JSON.stringify(ov)); pw.reset(); $('#pwdate').textContent = new Date().toLocaleDateString('vi-VN') + ' · Đã đổi (minh họa)'; showToast('Đã đổi mật khẩu')
    };
    $('#logout-others').onclick = () => showToast('Đã đăng xuất các phiên khác (minh họa)');
    const tfa = $('#tfa'), tb = $('#tfa-badge'); tfa.checked = localStorage.getItem('cg-2fa') === '1';
    const tfaUi = () => { tb.textContent = tfa.checked ? 'Đã bật' : 'Chưa bật'; tb.className = 'tag' + (tfa.checked ? '' : ' tag-warn'); if (tfa.checked) tb.style.cssText = 'background:#d3f0e0;color:#1e7a4a'; else tb.style.cssText = '' }; tfaUi();
    tfa.onchange = () => { localStorage.setItem('cg-2fa', tfa.checked ? '1' : '0'); tfaUi(); showToast(tfa.checked ? 'Đã bật xác minh hai bước (minh họa)' : 'Đã tắt xác minh hai bước') };
    $('#tfa-setup').onclick = () => showToast('Bản minh họa: không có bước xác minh thật.');
    const PK = 'cg-prefs', pr = Object.assign({ rec: true, chk: true, sav: true, mail: false, usage: false }, JSON.parse(localStorage.getItem(PK) || '{}'));
    document.querySelectorAll('[data-p]').forEach(c => { c.checked = !!pr[c.dataset.p]; c.onchange = () => { pr[c.dataset.p] = c.checked; if (c.dataset.p === 'usage') { localStorage.setItem(PK, JSON.stringify(pr)); showToast('Đã lưu tùy chọn chia sẻ dữ liệu') } } });
    $('#savepref').onclick = () => { localStorage.setItem(PK, JSON.stringify(pr)); showToast('Đã lưu tùy chọn thông báo') };
    document.querySelectorAll('[data-demo]').forEach(b => b.onclick = e => { e.preventDefault(); showToast('Giao diện mẫu: ' + b.dataset.demo + ' chưa có xử lý thật.') });
    const links = [...document.querySelectorAll('.toc a')]; addEventListener('scroll', () => { let cur = links[0]; links.forEach(a => { const s = $(a.getAttribute('href')); if (s && s.getBoundingClientRect().top < 140) cur = a }); links.forEach(a => a.classList.toggle('on', a === cur)) });
});