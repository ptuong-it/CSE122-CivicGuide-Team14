/* Tìm kiếm + lọc + sắp xếp + phân trang (trang public-procedure-search) */
const PAGE_SIZE = 5;
const qs = new URLSearchParams(location.search);
const state = { q: qs.get('q') || 'đăng ký kết hôn', field: qs.get('field') || '', form: qs.get('form') || '', types: new Set(['Thủ tục', 'Hướng dẫn']), sort: 'rel', page: 1 };
const $ = s => document.querySelector(s);
const searchBox = () => `<form class="card" id="sf"><label class="lbl" for="q">Từ khóa tìm kiếm</label><div style="display:flex;gap:14px"><input id="q" name="q" class="input" value="${state.q}"><button class="btn btn-primary" style="height:38px">Tìm kiếm</button></div>%CHIPS%</form>`;
function run(data) {
    const words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    return data.results.filter(x => words.every(w => x.kw.includes(w)) && (!state.field || x.field === state.field) && (!state.form || x.form.includes(state.form)));
}
function chips() {
    const c = [state.field && `<button class="chip" data-clear="field">${state.field} ×</button>`, state.form && `<button class="chip" data-clear="form">${state.form} ×</button>`].filter(Boolean);
    return c.length ? `<div class="chips">${c.join('')}<span>Bộ lọc đang áp dụng · <span id="cnt">0</span> kết quả</span><a class="link" style="margin-left:auto" href="?q=${encodeURIComponent(state.q)}">Xóa tất cả bộ lọc</a></div>` : '';
}
function card(x) { return `<article class="card result"><div class="top"><span>${x.type === 'Thủ tục' ? 'Thủ tục · ' + x.id : 'Hướng dẫn theo sự kiện'}</span>${x.best ? '<span class="tag">Phù hợp nhất</span>' : ''}</div><h3>${x.title}</h3><p>${x.desc}</p><div class="foot"><span>${x.meta}</span><a class="btn" href="public-procedure-detail.html?id=${x.id}">Xem chi tiết</a></div></article>` }
function renderResults(data, all) {
    const list = all.filter(x => state.types.has(x.type));
    const n = (t) => all.filter(x => x.type === t).length;
    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE)); state.page = Math.min(state.page, pages);
    const s = (state.page - 1) * PAGE_SIZE, slice = list.slice(s, s + PAGE_SIZE);
    $('#app').innerHTML = `${searchBox().replace('%CHIPS%', '')}
 <div class="layout left" style="grid-template-columns:1fr 240px"><div>
  <div class="toolbar"><span>${list.length} kết quả cho “${state.q}”</span><select class="input" id="sort"><option value="rel">Sắp xếp: Liên quan nhất</option><option value="az">Sắp xếp: A → Z</option></select></div>
  <div class="chips" style="margin:0 0 14px"><button class="chip">Kết hôn & gia đình ×</button><a class="link" href="?q=${encodeURIComponent(state.q)}">Xóa tất cả</a></div>
  ${slice.map(card).join('')}
  <div class="pager"><span>Hiển thị ${s + 1}–${s + slice.length} trong ${list.length} kết quả</span><div><button data-p="${state.page - 1}">‹</button>${Array.from({ length: pages }, (_, i) => `<button data-p="${i + 1}" class="${i + 1 === state.page ? 'on' : ''}">${i + 1}</button>`).join('')}<button data-p="${state.page + 1}">›</button></div></div></div>
 <aside><div class="card"><h2>Thu hẹp kết quả</h2><label class="lbl">Loại nội dung</label>
  ${['Thủ tục', 'Hướng dẫn'].map(t => `<label class="check"><input type="checkbox" data-type="${t}" ${state.types.has(t) ? 'checked' : ''}>${t} (${n(t)})</label>`).join('')}
  <label class="lbl" style="margin-top:16px">Sự kiện cuộc sống</label><label class="check"><input type="checkbox" checked>Kết hôn &amp; gia đình</label><label class="check"><input type="checkbox">Giấy tờ cá nhân</label>
  <label class="lbl" style="margin-top:16px">Địa phương</label><select class="input"><option>Tất cả địa phương</option></select>
  <label class="lbl" style="margin:16px 0 6px">Cấp tiếp nhận</label><select class="input"><option>Tất cả cấp</option></select>
  <button class="btn btn-primary btn-block" style="margin-top:16px">Áp dụng bộ lọc</button></div>
  <div class="note-box"><b>Chọn đúng trường hợp</b>Hồ sơ có yếu tố nước ngoài có thể có yêu cầu và thẩm quyền khác. Xác nhận với nơi tiếp nhận trước khi chuẩn bị.</div>
  <a class="btn btn-block" href="public-service-catalog.html">Xem danh mục dịch vụ công</a></aside></div>`;
    if (state.sort === 'az') $('#sort').value = 'az';
}
function renderEmpty() {
    $('#app').innerHTML = `${searchBox().replace('%CHIPS%', chips())}
 <div class="layout left"><aside><div class="card"><h2>Bộ lọc tìm kiếm</h2>
  <label class="lbl">Lĩnh vực</label><select class="input" id="f-field"><option value="">Tất cả lĩnh vực</option><option ${state.field === 'Hộ tịch' ? 'selected' : ''}>Hộ tịch</option></select>
  <label class="lbl" style="margin:16px 0 6px">Hình thức</label><select class="input" id="f-form"><option value="">Tất cả hình thức</option><option ${state.form === 'Trực tuyến' ? 'selected' : ''}>Trực tuyến</option><option>Trực tiếp</option></select>
  <label class="lbl" style="margin:16px 0 6px">Phạm vi hướng dẫn</label><select class="input"><option>Tất cả trường hợp</option></select>
  <button class="btn btn-primary btn-block" id="apply" style="margin-top:16px">Áp dụng bộ lọc</button><a class="btn btn-block" style="margin-top:10px" href="?q=${encodeURIComponent(state.q)}">Đặt lại bộ lọc</a></div>
  <div class="note-box"><b>Không thấy không có nghĩa là không có thủ tục</b>Danh mục minh họa chưa bao phủ mọi trường hợp. Hãy kiểm tra tại nguồn chính thức hoặc hỏi cơ quan có thẩm quyền.</div></aside>
 <div><div class="card empty"><span class="ico" data-icon="nosearch" data-size="34"></span><h2>Không tìm thấy hướng dẫn phù hợp</h2>
  <p style="margin-bottom:10px">Không có kết quả cho “${state.q}” với bộ lọc ${[state.field, state.form].filter(Boolean).join(' và ') || 'hiện tại'}.</p>
  <p class="muted">Thử bỏ “online 24h”, dùng tên thủ tục ngắn hơn hoặc xóa bộ lọc. CivicGuide không cam kết xử lý trong 24 giờ.</p>
  <div class="acts"><a class="btn btn-primary" href="?q=${encodeURIComponent(state.q)}">Xóa bộ lọc và tìm lại</a><a class="btn" href="public-service-catalog.html">Xem danh mục dịch vụ công</a></div></div>
 <div class="card"><h2>Thử một từ khóa khác</h2><p class="muted" style="margin-bottom:12px">Các gợi ý này bắt đầu lượt tìm kiếm mới, không phải kết quả của truy vấn hiện tại.</p>
  <div class="acts" style="margin:0 0 14px">${['trích lục kết hôn', 'đăng ký lại kết hôn', 'đăng ký kết hôn'].map(k => `<a class="btn" href="?q=${encodeURIComponent(k)}">${k}</a>`).join('')}</div>
  <div class="row faq"><div><h3>Bạn cần bản sao thông tin đã đăng ký?</h3><p>Thử từ khóa “trích lục kết hôn” và kiểm tra phạm vi hướng dẫn.</p></div></div>
  <div class="row faq"><div><h3>Bạn muốn sửa thông tin hoặc đăng ký lại?</h3><p>Dùng tên nhu cầu cụ thể; hỏi cơ quan tiếp nhận để xác định thủ tục phù hợp.</p></div></div></div>
 <div class="card"><h2>Hướng dẫn khác để tham khảo</h2><p class="muted">Không khớp với truy vấn hiện tại · Chỉ gợi ý khám phá riêng.</p>
  <div class="row"><div><h3>Đăng ký kết hôn</h3><p>Hướng dẫn trường hợp trong nước · Chuẩn bị hồ sơ của hai bên</p></div><a class="link" href="public-procedure-detail.html?id=P001">Xem →</a></div>
  <div class="row"><div><h3>Hướng dẫn sự kiện: Kết hôn</h3><p>Các việc cần kiểm tra trước và sau khi đăng ký</p></div><a class="link" href="public-procedure-detail.html?id=G01">Xem →</a></div></div>
 <div class="card"><h2>Vẫn chưa tìm được điều bạn cần?</h2><p>Mô tả nhu cầu trong một câu ngắn để gửi câu hỏi hỗ trợ. Không kèm số định danh hoặc giấy tờ cá nhân thật.</p><div class="acts"><a class="btn btn-primary" href="#">Liên hệ hỗ trợ</a><a class="btn" href="#">Trung tâm trợ giúp</a></div></div></div></div>`;
    const c = $('#cnt'); if (c) c.textContent = '0';
    if (window.hydrateIcons) window.hydrateIcons();
    $('#apply').onclick = () => { const p = new URLSearchParams({ q: state.q }); const f = $('#f-field').value, m = $('#f-form').value; if (f) p.set('field', f); if (m) p.set('form', m); location.search = p };
}
document.addEventListener('DOMContentLoaded', async () => {
    const data = await API.load(BASE); let all = run(data);
    const draw = () => {
        if (!all.length) return renderEmpty(); if (state.sort === 'az') all.sort((a, b) => a.title.localeCompare(b.title, 'vi')); renderResults(data, all);
        document.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { state.page = +b.dataset.p || 1; draw() });
        document.querySelectorAll('[data-type]').forEach(b => b.onchange = () => { b.checked ? state.types.add(b.dataset.type) : state.types.delete(b.dataset.type); draw() });
        const sortEl = $('#sort');
        if (sortEl) sortEl.onchange = e => { state.sort = e.target.value; draw() };
    };
    draw();
});