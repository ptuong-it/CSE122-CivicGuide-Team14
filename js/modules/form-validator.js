/* Hàm validate dùng chung */
const V = {
    required: v => v.trim() !== '',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    phone: v => /^(0|\+84)\d{9}$/.test(v.replace(/\s/g, '')),
    emailOrPhone: v => V.email(v) || V.phone(v),
    pwRules: p => [['Ít nhất 12 ký tự', p.length >= 12], ['Có chữ hoa, chữ thường và chữ số', /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p)], ['Có ký tự đặc biệt', /[^A-Za-z0-9]/.test(p)]],
    pwOk: p => V.pwRules(p).every(r => r[1]),
    match: (a, b) => a !== '' && a === b,
    setErr(input, msg) { input.classList.toggle('invalid', !!msg); const e = input.closest('.field')?.querySelector('.err'); if (e) e.textContent = msg || '' }
};