document.addEventListener('DOMContentLoaded', async () => {
    if (document.body.dataset.page !== 'procedure-detail') return;

    // 1. Lấy ID từ URL
    const params = new URLSearchParams(window.location.search);
    const procedureId = params.get('id') || 'P001'; // Mặc định P001

    // 2. Load dữ liệu từ JSON
    let procedure = null;
    let allProcedures = [];
    try {
        const data = await API.load('../../', 'assets/data/procedures.json');
        allProcedures = data.results || [];
        procedure = allProcedures.find(p => p.id === procedureId);
    } catch (error) {
        console.error('Lỗi tải procedures.json:', error);
        document.getElementById('detail-title').textContent = 'Không thể tải dữ liệu';
        return;
    }

    if (!procedure) {
        document.getElementById('detail-title').textContent = 'Không tìm thấy thủ tục';
        document.getElementById('detail-desc').textContent = `Mã thủ tục "${procedureId}" không tồn tại trong hệ thống.`;
        return;
    }

    // 3. Cập nhật tiêu đề trang & breadcrumb
    document.title = `${procedure.title} – CivicGuide`;
    document.getElementById('breadcrumb-title').textContent = procedure.title;
    document.getElementById('detail-title').textContent = procedure.title;
    document.getElementById('detail-sub').textContent = `${procedure.id} · ${procedure.field} · ${procedure.event}`;

    // 4. Render Tags
    const tagsHTML = `
        <span class="tag">${procedure.field}</span>
        <span class="tag">${procedure.event}</span>
        ${procedure.best ? '<span class="tag tag-warn">Phù hợp nhất</span>' : ''}
    `;
    document.getElementById('detail-tags').innerHTML = tagsHTML;

    // 5. Render mô tả
    document.getElementById('detail-desc').textContent = procedure.desc;

    // 6. Render điều kiện (dữ liệu mẫu dựa trên loại)
    const conditions = [
        { title: 'Hai bên tự nguyện và đáp ứng điều kiện', desc: 'Kiểm tra điều kiện về độ tuổi, năng lực hành vi và các trường hợp bị cấm theo quy định hiện hành.' },
        { title: 'Thông tin hộ tịch phù hợp', desc: 'Đối chiếu thông tin hộ tịch của các bên; xác minh giấy tờ cần cung cấp nếu dữ liệu chưa đủ.' },
        { title: 'Chọn đúng phạm vi hướng dẫn', desc: 'Nếu có yếu tố nước ngoài hoặc đăng ký lại, yêu cầu hồ sơ và thẩm quyền có thể khác.' }
    ];
    document.getElementById('detail-conditions').innerHTML = conditions.map(c => `
        <div class="cond">
            <b>${c.title}</b>
            <span>${c.desc}</span>
        </div>
    `).join('');

    // 7. Render giấy tờ
    const documents = [
        { name: 'Tờ khai theo mẫu', desc: 'Điền thông tin theo mẫu được nơi tiếp nhận hướng dẫn.' },
        { name: 'Căn cước / hộ chiếu', desc: 'Chuẩn bị giấy tờ còn hiệu lực; bản chụp rõ nét để đối chiếu.' },
        { name: 'Thông tin tình trạng hôn nhân', desc: 'Xác minh có cần giấy xác nhận trong trường hợp của bạn không.' },
        { name: 'Thông tin cư trú', desc: 'Cung cấp thông tin hoặc giấy tờ khi cơ quan tiếp nhận yêu cầu.' }
    ];
    document.getElementById('detail-documents').innerHTML = documents.map(d => `
        <tr>
            <td style="color:inherit">${d.name}</td>
            <td>${d.desc}</td>
        </tr>
    `).join('');

    // 8. Render các bước
    const steps = [
        { title: '1. Chuẩn bị và kiểm tra hồ sơ', desc: 'Chọn đúng cơ quan; rà soát thông tin và giấy tờ theo yêu cầu.' },
        { title: '2. Nộp hồ sơ theo hình thức được hỗ trợ', desc: 'Nộp tại nơi tiếp nhận hoặc kênh trực tuyến chính thức, nếu được cung cấp.' },
        { title: '3. Tiếp nhận, đối chiếu và xử lý', desc: 'Cơ quan kiểm tra, hướng dẫn bổ sung khi cần; theo dõi theo mã hồ sơ chính thức.' },
        { title: '4. Nhận kết quả', desc: 'Thực hiện việc có mặt, ký và nhận giấy chứng nhận theo hướng dẫn của nơi tiếp nhận.' }
    ];
    document.getElementById('detail-steps').innerHTML = steps.map(s => `
        <li>
            <b>${s.title}</b>
            <span>${s.desc}</span>
        </li>
    `).join('');

    // 9. Render thông tin tiếp nhận (sidebar)
    document.getElementById('detail-agency').textContent = procedure.meta.split(' · ')[0] || 'UBND cấp xã / phường';
    document.getElementById('detail-duration').textContent = 'Xác nhận thời hạn theo hồ sơ và yêu cầu xác minh.';
    document.getElementById('detail-fee').textContent = 'Kiểm tra mức áp dụng và trường hợp miễn tại địa phương.';
    document.getElementById('detail-form').textContent = (procedure.form || ['Trực tiếp']).join('; ');

    // 10. Render related (3 thủ tục khác cùng lĩnh vực)
    const related = allProcedures.filter(p => p.id !== procedure.id && p.field === procedure.field).slice(0, 3);
    if (related.length === 0) {
        // Nếu không có, lấy 3 thủ tục bất kỳ khác
        related.push(...allProcedures.filter(p => p.id !== procedure.id).slice(0, 3));
    }
    document.getElementById('detail-related').innerHTML = related.map(r => `
        <div class="row">
            <h3>${r.title}</h3>
            <a class="link" href="public-procedure-detail.html?id=${r.id}">Xem →</a>
        </div>
    `).join('');

    // 11. Nút "Lưu thủ tục"
    document.getElementById('btn-save').addEventListener('click', () => {
        const saved = JSON.parse(localStorage.getItem('civicguide-saved-procedures') || '[]');
        if (saved.includes(procedure.id)) {
            if (window.showToast) window.showToast('Thủ tục này đã được lưu trước đó!', 'info');
        } else {
            saved.push(procedure.id);
            localStorage.setItem('civicguide-saved-procedures', JSON.stringify(saved));
            if (window.showToast) window.showToast(`Đã lưu thủ tục "${procedure.title}"`, 'success');
        }
    });

    // 12. Cập nhật lại icons (nếu có dùng data-icon)
    if (window.hydrateIcons) window.hydrateIcons();
});