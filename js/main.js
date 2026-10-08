import { api } from "./api.js";
import { auth } from "./auth.js";
import { preferences } from "./storage.js";
import { assistantAnswer } from "./modules/ai-search.js";
import { renderFaqs } from "./modules/ai-faq.js";
import { renderChecklists } from "./modules/ai-checklist.js";
import { applicationForm, submitApplication } from "./modules/application-wizard.js";
import { procedureDetails } from "./modules/procedure-drawer.js";
import { emptyState, escapeHtml, pageHeading, statusBadge } from "./modules/dom-utils.js";

const root = document.querySelector("#app");
const page = document.body.dataset.page;
const path = {
  home: "/pages/shared/index.html",
  login: "/pages/shared/login.html",
  register: "/pages/shared/register.html",
  search: "/pages/citizen/citizen-civic-search.html",
  applications: "/pages/citizen/citizen-my-applications.html",
  checklists: "/pages/citizen/citizen-my-checklists.html",
  profile: "/pages/shared/profile.html"
};
const roles = {
  "admin-govtech-dashboard": ["admin"],
  "admin-user-management": ["admin"],
  "admin-category-management": ["admin"],
  "editor-approval-queue": ["editor", "admin"],
  "editor-freshness-monitor": ["editor", "admin"],
  "editor-source-management": ["editor", "admin"],
  "officer-procedure-management": ["officer", "admin"],
  "officer-faq-management": ["officer", "admin"],
  "officer-citizen-feedback": ["officer", "admin"]
};
const roleNames = { citizen: "Công dân", officer: "Cán bộ", editor: "Biên tập viên", admin: "Quản trị viên" };
let currentUser = null;
let currentProcedure = null;
let currentProcedures = [];
let currentFaqs = [];

function link(href, label, current = false) {
  return `<a href="${href}"${current ? ' aria-current="page"' : ""}>${label}</a>`;
}

function navigation() {
  const links = [
    link(path.home, "Trang chủ", page === "index"),
    link(path.search, "Tra cứu thủ tục", page.includes("search")),
    ...(currentUser ? [
      link(path.applications, "Hồ sơ của tôi", page.includes("applications")),
      link(path.checklists, "Giấy tờ cần chuẩn bị", page.includes("checklists")),
      ...(currentUser.role === "officer" || currentUser.role === "admin" ? [link("/pages/officer/officer-procedure-management.html", "Quản lý nội dung")] : []),
      ...(currentUser.role === "editor" || currentUser.role === "admin" ? [link("/pages/editor/editor-approval-queue.html", "Phê duyệt")] : []),
      ...(currentUser.role === "admin" ? [link("/pages/admin/admin-govtech-dashboard.html", "Quản trị")] : [])
    ] : [])
  ];
  return `<header class="site-header"><div class="header-inner"><a class="brand" href="${path.home}" aria-label="CivicGuide - Trang chủ"><span class="brand-mark">C</span><span class="brand-name">Civic<span>Guide</span></span></a><button class="mobile-menu" data-action="menu" aria-label="Mở menu" aria-expanded="false">☰</button><nav class="nav-links" aria-label="Điều hướng">${links.join("")}</nav><div class="header-actions">${currentUser ? `<a class="button button-secondary button-small" href="${path.profile}">${escapeHtml(currentUser.displayName.split(" ")[0])}</a><button class="button button-small" data-action="logout">Đăng xuất</button>` : `${link(path.login, "Đăng nhập")}<a class="button button-small" href="${path.register}">Tạo tài khoản</a>`}</div></div></header>`;
}

function footer() {
  return `<footer class="site-footer"><div class="footer-inner"><div><a class="brand" href="${path.home}"><span class="brand-mark">C</span><span class="brand-name">Civic<span>Guide</span></span></a><p class="footer-copy">Thông tin hướng dẫn được tổng hợp để giúp bạn chuẩn bị tốt hơn. Luôn xác nhận yêu cầu mới nhất với cơ quan có thẩm quyền.</p></div><nav class="footer-links" aria-label="Liên kết cuối trang">${link(path.search, "Tra cứu thủ tục")}${link(path.checklists, "Danh sách giấy tờ")}${link("/pages/shared/notifications.html", "Thông báo")}</nav></div></footer>`;
}

function notify(message, isError = false) {
  const region = document.querySelector(".toast-region");
  const toast = document.createElement("div");
  toast.className = `toast${isError ? " toast-error" : ""}`;
  toast.setAttribute("role", isError ? "alert" : "status");
  toast.textContent = message;
  region.append(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function procedureCards(procedures) {
  if (!procedures.length) return emptyState("Chưa tìm thấy thủ tục phù hợp", "Hãy thử từ khóa khác hoặc xóa bộ lọc.");
  return procedures.map((procedure) => `<article class="service-card"><span class="service-icon">${iconFor(procedure.category)}</span><span class="eyebrow">${escapeHtml(procedure.category)}</span><h3>${escapeHtml(procedure.title)}</h3><p>${escapeHtml(procedure.description)}</p><div class="service-meta"><span>${escapeHtml(procedure.duration)}</span><button class="text-link" data-action="procedure" data-id="${escapeHtml(procedure.id)}">Xem hướng dẫn →</button></div></article>`).join("");
}

function iconFor(category) {
  return ({ "Hộ tịch": "♧", "Cư trú": "⌂", "Kinh doanh": "▤", "Đất đai": "⌖" })[category] || "✳";
}

async function renderHome(main) {
  const [procedureData, faqData] = await Promise.all([api.get("/api/procedures"), api.get("/api/faqs")]);
  currentProcedures = procedureData.procedures;
  currentFaqs = faqData.faqs;
  main.innerHTML = `<section class="hero"><div class="hero-inner"><div class="hero-copy"><span class="eyebrow">CivicGuide · Dịch vụ công dễ hiểu</span><h1>Thủ tục công,<br><span>đơn giản hơn.</span></h1><p>Tìm hướng dẫn rõ ràng, chuẩn bị đúng giấy tờ và chủ động theo dõi hành trình hồ sơ của bạn.</p><form class="search-box" id="search-form"><label class="sr-only" for="home-search">Tìm thủ tục</label><input id="home-search" name="q" placeholder="Ví dụ: đăng ký kết hôn, xác nhận cư trú…" value="${escapeHtml(new URLSearchParams(location.search).get("q") || "")}"><button class="button" type="submit">⌕ &nbsp; Tìm thủ tục</button></form><p class="muted" style="margin:12px 0 0;font-size:.82rem">Phổ biến: Đăng ký kết hôn · Khai sinh · Cư trú</p></div></div></section><div class="page-shell"><section class="section" style="padding-top:45px"><div class="section-heading"><div><span class="eyebrow">Bắt đầu từ đây</span><h2>Thủ tục được quan tâm</h2><p>Thông tin nền tảng giúp bạn biết cần chuẩn bị gì.</p></div><a class="text-link" href="${path.search}">Xem tất cả →</a></div><div class="service-grid">${procedureCards(currentProcedures.slice(0, 6))}</div></section><section class="assistant-banner"><div><h2>Chưa biết bắt đầu từ đâu?</h2><p>Hỏi CivicGuide để tìm hướng dẫn phù hợp với nhu cầu của bạn.</p></div><a class="button" href="${path.search}">Khám phá thủ tục →</a></section><section class="section"><div class="section-heading"><div><span class="eyebrow">Trợ giúp nhanh</span><h2>Câu hỏi thường gặp</h2></div></div><div class="panel" id="home-faq"></div></section><section class="section"><div class="section-heading"><div><span class="eyebrow">Cùng CivicGuide</span><h2>Chuẩn bị hồ sơ tự tin hơn</h2><p>Lưu tiến độ giấy tờ và giữ thông tin quan trọng trong tầm tay.</p></div><a class="button button-secondary" href="${path.checklists}">Mở danh sách giấy tờ</a></div></section></div><dialog id="procedure-dialog" class="panel" style="width:min(820px,calc(100% - 28px));max-height:90vh;border:0;border-radius:18px;box-shadow:var(--shadow)"><div class="inline-actions" style="justify-content:flex-end"><button class="icon-button" data-action="close-dialog" aria-label="Đóng">×</button></div><div id="procedure-dialog-content"></div></dialog>`;
  await renderFaqs(main.querySelector("#home-faq"));
}

async function renderSearch(main) {
  const params = new URLSearchParams(location.search);
  const [procedureData, categoryData, faqData] = await Promise.all([
    api.get(`/api/procedures?q=${encodeURIComponent(params.get("q") || "")}`),
    api.get("/api/categories"),
    api.get("/api/faqs")
  ]);
  currentProcedures = procedureData.procedures;
  currentFaqs = faqData.faqs;
  const query = params.get("q") || "";
  const selectedCategory = params.get("category") || "";
  const visibleProcedures = selectedCategory ? currentProcedures.filter((item) => item.category === selectedCategory) : currentProcedures;
  main.innerHTML = `<div class="page-shell">${pageHeading("Tra cứu", "Tìm thủ tục phù hợp", "Thông tin dễ hiểu để bạn biết cơ quan, thời gian và giấy tờ cần chuẩn bị.")}<form class="toolbar" id="search-form"><label class="sr-only" for="search-query">Tìm thủ tục</label><input id="search-query" name="q" value="${escapeHtml(query)}" placeholder="Nhập tên thủ tục hoặc từ khóa"><select name="category" aria-label="Lọc theo lĩnh vực"><option value="">Tất cả lĩnh vực</option>${categoryData.categories.map((category) => `<option value="${escapeHtml(category)}" ${category === selectedCategory ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}</select><button class="button" type="submit">Tìm kiếm</button></form><div class="chip-list" style="margin-bottom:20px"><button class="chip ${selectedCategory ? "" : "active"}" data-action="filter" data-category="">Tất cả</button>${categoryData.categories.map((category) => `<button class="chip ${category === selectedCategory ? "active" : ""}" data-action="filter" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}</div><div class="service-grid" id="search-results">${procedureCards(visibleProcedures)}</div><section class="panel" style="margin-top:32px"><span class="eyebrow">CivicGuide hỗ trợ</span><h2 style="margin:7px 0">Hỏi nhanh về thủ tục</h2><p class="muted">Trợ lý tìm câu trả lời trong dữ liệu hướng dẫn hiện có; không thay thế tư vấn của cơ quan nhà nước.</p><form class="assistant-form" id="assistant-form"><label class="sr-only" for="assistant-question">Câu hỏi</label><input id="assistant-question" name="question" placeholder="Ví dụ: Đăng ký khai sinh cần giấy tờ gì?"><button class="button" type="submit">Hỏi</button></form><div id="assistant-answer" aria-live="polite"></div></section><section class="panel" style="margin-top:18px"><h2>Gửi góp ý</h2><p class="muted">Giúp CivicGuide cải thiện nội dung hướng dẫn.</p><form id="feedback-form" class="form-grid"><div class="field field-full"><label for="feedback-message">Nội dung góp ý</label><textarea id="feedback-message" name="message" required maxlength="1500"></textarea></div>${currentUser ? "" : `<div class="field"><label for="feedback-name">Họ và tên</label><input id="feedback-name" name="name" required maxlength="100"></div><div class="field"><label for="feedback-email">Email</label><input id="feedback-email" name="email" type="email" required maxlength="254"></div>`}<div class="field-full"><button class="button" type="submit">Gửi góp ý</button></div></form></section></div><dialog id="procedure-dialog" class="panel" style="width:min(820px,calc(100% - 28px));max-height:90vh;border:0;border-radius:18px;box-shadow:var(--shadow)"><div class="inline-actions" style="justify-content:flex-end"><button class="icon-button" data-action="close-dialog" aria-label="Đóng">×</button></div><div id="procedure-dialog-content"></div></dialog>`;
}

function authPage(type) {
  const registering = type === "register";
  const forgotten = type === "forgot-password";
  const title = registering ? "Tạo tài khoản CivicGuide" : forgotten ? "Khôi phục mật khẩu" : "Chào mừng bạn trở lại";
  const intro = registering ? "Lưu danh sách giấy tờ và theo dõi hồ sơ của bạn." : forgotten ? "Chức năng gửi email đặt lại mật khẩu chưa được cấu hình trong bản demo." : "Đăng nhập để quản lý hồ sơ và tiến độ chuẩn bị.";
  const form = forgotten
    ? `<form id="forgot-form"><div class="field"><label for="forgot-email">Email tài khoản</label><input id="forgot-email" name="email" type="email" required autocomplete="email"></div><button class="button" type="submit">Gửi yêu cầu hỗ trợ</button></form>`
    : `<form id="${registering ? "register-form" : "login-form"}">${registering ? `<div class="field"><label for="displayName">Họ và tên</label><input id="displayName" name="displayName" required maxlength="100" autocomplete="name"></div>` : ""}<div class="field"><label for="email">Email</label><input id="email" name="email" type="email" required autocomplete="email"></div><div class="field"><label for="password">Mật khẩu</label><input id="password" name="password" type="password" required minlength="${registering ? "8" : "1"}" autocomplete="${registering ? "new-password" : "current-password"}"></div><button class="button" type="submit">${registering ? "Tạo tài khoản" : "Đăng nhập"}</button></form>`;
  return `<div class="auth-layout"><aside class="auth-aside"><a class="brand" href="${path.home}"><span class="brand-mark">C</span><span class="brand-name">Civic<span>Guide</span></span></a><span class="eyebrow" style="margin-top:45px">Dịch vụ công, gần gũi hơn</span><h1>Chuẩn bị hôm nay, an tâm ngày mai.</h1><p class="muted">Hướng dẫn rõ ràng giúp bạn hiểu quy trình và tự tin hoàn thiện hồ sơ.</p></aside><section class="auth-main"><div class="auth-card"><span class="eyebrow">Tài khoản CivicGuide</span><h2>${title}</h2><p class="muted">${intro}</p>${form}<p class="auth-bottom">${forgotten ? `${link(path.login, "Quay lại đăng nhập")}` : registering ? `Đã có tài khoản? ${link(path.login, "Đăng nhập")}` : `Chưa có tài khoản? ${link(path.register, "Tạo tài khoản")}`}<br>${!registering && !forgotten ? `<a href="/pages/shared/forgot-password.html">Quên mật khẩu?</a>` : ""}</p></div></section></div>`;
}

function applicationTable(applications) {
  if (!applications.length) return emptyState("Bạn chưa có hồ sơ theo dõi", "Tìm một thủ tục để bắt đầu tạo hồ sơ.");
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Mã hồ sơ</th><th>Thủ tục</th><th>Người nộp</th><th>Ngày tạo</th><th>Trạng thái</th></tr></thead><tbody>${applications.map((item) => `<tr><td><strong>${escapeHtml(item.id)}</strong></td><td>${escapeHtml(item.procedureTitle)}</td><td>${escapeHtml(item.applicantName)}</td><td>${new Date(item.createdAt).toLocaleDateString("vi-VN")}</td><td>${statusBadge(item.status)}</td></tr>`).join("")}</tbody></table></div>`;
}

async function renderApplications(main) {
  if (!currentUser) return renderAccessDenied(main, "Đăng nhập để theo dõi hồ sơ của bạn.");
  const { applications } = await api.get("/api/applications");
  const { procedures } = await api.get("/api/procedures");
  main.innerHTML = `<div class="page-shell">${pageHeading("Không gian của bạn", "Hồ sơ của tôi", "Theo dõi các hồ sơ bạn đã tạo trên CivicGuide.")}<section class="panel"><div class="section-heading"><div><h2>Hồ sơ đang theo dõi</h2><p>Hồ sơ minh họa trong CivicGuide không thay thế hồ sơ chính thức.</p></div><a class="button" href="${path.search}">Tìm thủ tục</a></div>${applicationTable(applications)}</section>${currentUser.role === "citizen" ? `<section class="panel" style="margin-top:20px"><h2>Tạo hồ sơ theo dõi</h2><p class="muted">Gửi thông tin cơ bản để lưu hồ sơ và theo dõi tại đây.</p><form id="application-form" class="form-grid"><div class="field"><label for="application-procedure">Thủ tục</label><select name="procedureId" id="application-procedure" required>${procedures.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`).join("")}</select></div><div class="field"><label for="application-name">Họ và tên</label><input id="application-name" name="applicantName" required maxlength="100" value="${escapeHtml(currentUser.displayName)}"></div><div class="field"><label for="application-phone">Số điện thoại</label><input id="application-phone" name="phone" required maxlength="30"></div><div class="field"><label for="application-note">Ghi chú</label><input id="application-note" name="note" maxlength="1000"></div><div class="field-full"><button class="button" type="submit">Lưu hồ sơ theo dõi</button></div></form></section>` : ""}</div>`;
}

async function renderProcedures(main, management = false) {
  const { procedures } = await api.get("/api/procedures");
  currentProcedures = procedures;
  if (!management) return renderSearch(main);
  main.innerHTML = `<div class="page-shell">${pageHeading("Cổng cán bộ", "Quản lý thủ tục", "Bổ sung hướng dẫn để biên tập viên kiểm tra trước khi công khai.")}<div class="content-layout"><section class="panel"><h2>Thêm hướng dẫn thủ tục</h2><form class="form-grid" id="procedure-form"><div class="field field-full"><label for="procedure-title">Tên thủ tục</label><input id="procedure-title" name="title" required maxlength="300"></div><div class="field"><label for="procedure-category">Lĩnh vực</label><input id="procedure-category" name="category" list="category-options" required maxlength="80"><datalist id="category-options">${[...new Set(procedures.map((item) => item.category))].map((category) => `<option value="${escapeHtml(category)}">`).join("")}</datalist></div><div class="field"><label for="procedure-agency">Cơ quan tiếp nhận</label><input id="procedure-agency" name="agency" required maxlength="150"></div><div class="field"><label for="procedure-duration">Thời hạn</label><input id="procedure-duration" name="duration" value="Theo quy định"></div><div class="field"><label for="procedure-fee">Lệ phí</label><input id="procedure-fee" name="fee" value="Theo quy định"></div><div class="field field-full"><label for="procedure-description">Mô tả</label><textarea id="procedure-description" name="description" required maxlength="1200"></textarea></div><div class="field field-full"><label for="procedure-steps">Các bước (mỗi bước một dòng)</label><textarea id="procedure-steps" name="steps" placeholder="Chuẩn bị hồ sơ&#10;Nộp tại cơ quan tiếp nhận"></textarea></div><div class="field-full"><button class="button" type="submit">Gửi nội dung</button></div></form></section><section class="panel"><h2>Hướng dẫn hiện có</h2>${procedureTable(procedures)}</section></div></div>`;
}

function procedureTable(procedures, options = {}) {
  if (!procedures.length) return emptyState("Chưa có thủ tục", "Nội dung mới sẽ xuất hiện tại đây.");
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Thủ tục</th><th>Lĩnh vực</th><th>Cập nhật</th><th>Trạng thái</th>${options.approvals ? "<th>Thao tác</th>" : ""}</tr></thead><tbody>${procedures.map((item) => `<tr><td>${escapeHtml(item.title)}</td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.updatedAt)}</td><td>${statusBadge(item.status)}</td>${options.approvals ? `<td><button class="button button-small" data-action="approve" data-id="${escapeHtml(item.id)}">Phê duyệt</button></td>` : ""}</tr>`).join("")}</tbody></table></div>`;
}

async function renderFaqManagement(main) {
  const { faqs } = await api.get("/api/faqs");
  currentFaqs = faqs;
  main.innerHTML = `<div class="page-shell">${pageHeading("Cổng cán bộ", "Quản lý câu hỏi thường gặp", "Cập nhật câu trả lời để người dân nhanh chóng tìm thấy thông tin.")}<div class="content-layout"><section class="panel"><h2>Thêm câu hỏi và câu trả lời</h2><form id="faq-form" class="form-grid"><div class="field field-full"><label for="faq-question">Câu hỏi</label><input id="faq-question" name="question" required maxlength="300"></div><div class="field"><label for="faq-category">Chủ đề</label><input id="faq-category" name="category" value="Thông tin chung" maxlength="80"></div><div class="field field-full"><label for="faq-answer">Câu trả lời</label><textarea id="faq-answer" name="answer" required maxlength="1200"></textarea></div><div class="field-full"><button class="button" type="submit">Đăng câu trả lời</button></div></form></section><section class="panel"><h2>Câu hỏi hiện có</h2>${faqs.map((faq) => `<article class="list-item"><div><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p><span class="badge">${escapeHtml(faq.category)}</span></div><button class="button button-danger button-small" data-action="delete-faq" data-id="${escapeHtml(faq.id)}">Xóa</button></article>`).join("") || emptyState("Chưa có câu hỏi")}</section></div></div>`;
}

async function renderFeedback(main) {
  const { feedback } = await api.get("/api/feedback");
  main.innerHTML = `<div class="page-shell">${pageHeading("Cổng cán bộ", "Góp ý từ công dân", "Tiếp nhận và cập nhật trạng thái phản hồi về nội dung dịch vụ công.")}<section class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>Ngày</th><th>Người gửi</th><th>Góp ý</th><th>Trạng thái</th><th>Cập nhật</th></tr></thead><tbody>${feedback.map((item) => `<tr><td>${escapeHtml(item.createdAt)}</td><td>${escapeHtml(item.name)}<br><span class="muted">${escapeHtml(item.email)}</span></td><td style="white-space:normal;min-width:240px">${escapeHtml(item.message)}</td><td>${statusBadge(item.status)}</td><td><select data-feedback-status="${escapeHtml(item.id)}" aria-label="Cập nhật trạng thái"><option value="new" ${item.status === "new" ? "selected" : ""}>Mới</option><option value="reviewing" ${item.status === "reviewing" ? "selected" : ""}>Đang xử lý</option><option value="resolved" ${item.status === "resolved" ? "selected" : ""}>Đã xử lý</option></select></td></tr>`).join("")}</tbody></table></div></section></div>`;
}

async function renderDashboard(main) {
  const { stats } = await api.get("/api/dashboard");
  main.innerHTML = `<div class="page-shell">${pageHeading("Cổng quản trị", "Tổng quan GovTech", "Theo dõi dữ liệu và hoạt động của nền tảng CivicGuide.")}<div class="stats-grid">${stats.map((stat) => `<article class="stat-card"><span>${escapeHtml(stat.label)}</span><strong>${escapeHtml(stat.value)}</strong></article>`).join("")}</div><div class="service-grid"><a class="panel" href="/pages/admin/admin-category-management.html"><span class="eyebrow">Nội dung</span><h2>Danh mục dịch vụ</h2><p class="muted">Quản lý các lĩnh vực và hướng dẫn được công khai.</p></a><a class="panel" href="/pages/admin/admin-user-management.html"><span class="eyebrow">Tài khoản</span><h2>Người dùng</h2><p class="muted">Quản lý vai trò và quyền truy cập.</p></a><a class="panel" href="/pages/editor/editor-approval-queue.html"><span class="eyebrow">Biên tập</span><h2>Hàng đợi phê duyệt</h2><p class="muted">Kiểm tra các hướng dẫn cần được duyệt.</p></a></div></div>`;
}

async function renderCategories(main) {
  const [categoryData, procedureData] = await Promise.all([api.get("/api/categories"), api.get("/api/procedures")]);
  main.innerHTML = `<div class="page-shell">${pageHeading("Cổng quản trị", "Danh mục dịch vụ", "Giữ danh mục thủ tục gọn gàng và dễ tìm kiếm.")}<div class="content-layout"><section class="panel"><h2>Thêm lĩnh vực</h2><form id="category-form" class="form-grid"><div class="field field-full"><label for="category-name">Tên lĩnh vực</label><input id="category-name" name="name" required maxlength="80"></div><div class="field-full"><button class="button" type="submit">Thêm lĩnh vực</button></div></form><div class="chip-list" style="margin-top:20px">${categoryData.categories.map((category) => `<span class="chip">${escapeHtml(category)}</span>`).join("")}</div></section><section class="panel"><h2>Thủ tục trong danh mục</h2>${procedureTable(procedureData.procedures)}</section></div></div>`;
}

async function renderUsers(main) {
  const { users } = await api.get("/api/users");
  main.innerHTML = `<div class="page-shell">${pageHeading("Cổng quản trị", "Quản lý người dùng", "Cấp vai trò phù hợp và kiểm soát trạng thái tài khoản.")}<section class="panel"><div class="table-wrap"><table class="data-table"><thead><tr><th>Người dùng</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th></tr></thead><tbody>${users.map((user) => `<tr><td>${escapeHtml(user.displayName)}</td><td>${escapeHtml(user.email)}</td><td><select data-user-role="${escapeHtml(user.id)}" aria-label="Vai trò của ${escapeHtml(user.displayName)}">${Object.entries(roleNames).map(([role, name]) => `<option value="${role}" ${user.role === role ? "selected" : ""}>${name}</option>`).join("")}</select></td><td><button class="button button-small ${user.active ? "button-secondary" : ""}" data-action="toggle-user" data-id="${escapeHtml(user.id)}" data-active="${user.active}">${user.active ? "Đang hoạt động" : "Đã khóa"}</button></td></tr>`).join("")}</tbody></table></div></section></div>`;
}

async function renderApprovalQueue(main) {
  const { procedures } = await api.get("/api/procedures");
  const pending = procedures.filter((procedure) => procedure.status === "pending");
  main.innerHTML = `<div class="page-shell">${pageHeading("Không gian biên tập", "Hàng đợi phê duyệt", "Kiểm tra nội dung gửi đến trước khi đưa ra công khai.")}<section class="panel"><h2>Nội dung chờ duyệt</h2>${procedureTable(pending, { approvals: true })}</section></div>`;
}

async function renderFreshness(main) {
  const { procedures } = await api.get("/api/procedures");
  const sorted = [...procedures].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  main.innerHTML = `<div class="page-shell">${pageHeading("Không gian biên tập", "Theo dõi độ mới của thông tin", "Ưu tiên rà soát hướng dẫn đã lâu chưa được cập nhật.")}<section class="panel">${procedureTable(sorted)}</section></div>`;
}

async function renderSources(main) {
  const { documents } = await api.get("/api/documents");
  main.innerHTML = `<div class="page-shell">${pageHeading("Không gian biên tập", "Quản lý nguồn tham khảo", "Theo dõi những nguồn chính thức được dùng để rà soát nội dung.")}<div class="content-layout"><section class="panel"><h2>Thêm nguồn tham khảo</h2><form id="source-form" class="form-grid"><div class="field field-full"><label for="source-title">Tên nguồn</label><input id="source-title" name="title" required maxlength="150"></div><div class="field field-full"><label for="source-url">Địa chỉ website</label><input id="source-url" name="url" type="url" required></div><div class="field field-full"><label for="source-agency">Cơ quan</label><input id="source-agency" name="agency" required maxlength="150"></div><div class="field-full"><button class="button" type="submit">Lưu nguồn</button></div></form></section><section class="panel"><h2>Nguồn đang theo dõi</h2>${documents.map((item) => `<article class="list-item"><div><h3><a class="text-link" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.agency)} · Rà soát ${escapeHtml(item.checkedAt)}</p></div>${statusBadge(item.status)}</article>`).join("")}</section></div></div>`;
}

async function renderProfile(main) {
  if (!currentUser) return renderAccessDenied(main, "Đăng nhập để xem hồ sơ cá nhân.");
  main.innerHTML = `<div class="page-shell">${pageHeading("Tài khoản", "Hồ sơ cá nhân", "Thông tin dùng cho trải nghiệm CivicGuide của bạn.")}<section class="panel" style="max-width:650px"><form id="profile-form" class="form-grid"><div class="field field-full"><label for="profile-name">Họ và tên</label><input id="profile-name" name="displayName" value="${escapeHtml(currentUser.displayName)}" required maxlength="100"></div><div class="field field-full"><label>Email</label><input value="${escapeHtml(currentUser.email)}" disabled></div><div class="field field-full"><label>Vai trò</label><input value="${escapeHtml(roleNames[currentUser.role] || currentUser.role)}" disabled></div><div class="field-full"><button class="button" type="submit">Lưu thay đổi</button></div></form></section></div>`;
}

async function renderSettings(main) {
  if (!currentUser) return renderAccessDenied(main, "Đăng nhập để cập nhật cài đặt.");
  const saved = preferences.read();
  main.innerHTML = `<div class="page-shell">${pageHeading("Tài khoản", "Cài đặt", "Tùy chỉnh cách CivicGuide hiển thị trên thiết bị này.")}<section class="panel" style="max-width:680px"><form id="settings-form"><label class="check-row"><input type="checkbox" name="compact" ${saved.compact ? "checked" : ""}><span><strong>Giao diện gọn</strong><br><span class="muted">Ưu tiên nội dung và giảm khoảng cách giữa các thẻ.</span></span></label><label class="check-row"><input type="checkbox" name="reminders" ${saved.reminders !== false ? "checked" : ""}><span><strong>Hiện gợi ý chuẩn bị hồ sơ</strong><br><span class="muted">Cho phép CivicGuide hiển thị nhắc nhở hữu ích.</span></span></label><button class="button" type="submit">Lưu cài đặt</button></form></section></div>`;
}

function renderNotifications(main) {
  main.innerHTML = `<div class="page-shell">${pageHeading("Tài khoản", "Thông báo", "Các cập nhật liên quan đến việc sử dụng CivicGuide.")}<section class="panel">${emptyState("Bạn đã cập nhật", "Thông báo về hồ sơ sẽ xuất hiện tại đây khi có thay đổi.")}</section></div>`;
}

function renderAccessDenied(main, message) {
  main.innerHTML = `<div class="page-shell"><section class="panel">${pageHeading("Cần đăng nhập", "Không thể mở trang này", message)}<a class="button" href="${path.login}">Đăng nhập</a></section></div>`;
}

async function renderPage(main) {
  if (roles[page] && (!currentUser || !roles[page].includes(currentUser.role))) {
    main.innerHTML = `<div class="page-shell"><section class="panel">${pageHeading("403 · Truy cập bị giới hạn", "Bạn chưa có quyền xem trang này", "Hãy đăng nhập bằng tài khoản phù hợp hoặc quay lại trang tra cứu.")}<a class="button" href="${path.home}">Về trang chủ</a></section></div>`;
    return;
  }
  switch (page) {
    case "index": return renderHome(main);
    case "citizen-civic-search": return renderSearch(main);
    case "login":
    case "register":
    case "forgot-password": main.innerHTML = authPage(page); return;
    case "citizen-my-applications": return renderApplications(main);
    case "citizen-my-checklists":
      if (!currentUser) return renderAccessDenied(main, "Đăng nhập để lưu tiến độ chuẩn bị giấy tờ.");
      main.innerHTML = `<div class="page-shell">${pageHeading("Không gian của bạn", "Danh sách giấy tờ", "Đánh dấu giấy tờ bạn đã chuẩn bị. Tiến độ được lưu vào tài khoản.")}<div class="stack" id="checklist-container"></div></div>`;
      return renderChecklists(main.querySelector("#checklist-container"), notify);
    case "officer-procedure-management": return renderProcedures(main, true);
    case "officer-faq-management": return renderFaqManagement(main);
    case "officer-citizen-feedback": return renderFeedback(main);
    case "admin-govtech-dashboard": return renderDashboard(main);
    case "admin-category-management": return renderCategories(main);
    case "admin-user-management": return renderUsers(main);
    case "editor-approval-queue": return renderApprovalQueue(main);
    case "editor-freshness-monitor": return renderFreshness(main);
    case "editor-source-management": return renderSources(main);
    case "profile": return renderProfile(main);
    case "settings": return renderSettings(main);
    case "notifications": return renderNotifications(main);
    case "403": case "404": main.innerHTML = `<div class="page-shell"><section class="panel">${pageHeading(page === "403" ? "403 · Truy cập bị giới hạn" : "404 · Không tìm thấy", page === "403" ? "Bạn chưa có quyền xem trang này" : "Trang này không tồn tại", "Quay lại trang chủ hoặc tra cứu một thủ tục.")}<a class="button" href="${path.home}">Về trang chủ</a></section></div>`; return;
    default: main.innerHTML = `<div class="page-shell">${emptyState("Trang đang được hoàn thiện")}</div>`;
  }
}

function destinationFor(user) {
  if (user.role === "admin") return "/pages/admin/admin-govtech-dashboard.html";
  if (user.role === "editor") return "/pages/editor/editor-approval-queue.html";
  if (user.role === "officer") return "/pages/officer/officer-procedure-management.html";
  return path.home;
}

function formObject(form) {
  return Object.fromEntries(new FormData(form));
}

function showProcedure(procedure) {
  currentProcedure = procedure;
  const dialog = document.querySelector("#procedure-dialog");
  if (!dialog) {
    notify("Không thể mở chi tiết thủ tục tại trang này.", true);
    return;
  }
  const content = document.querySelector("#procedure-dialog-content");
  content.innerHTML = procedureDetails(procedure);
  dialog.showModal();
}

root.innerHTML = `${navigation()}<main id="main-content" tabindex="-1"><div class="page-shell"><div class="panel">Đang tải CivicGuide…</div></div></main>${footer()}<div class="toast-region" aria-live="polite"></div>`;
const main = root.querySelector("#main-content");

try {
  const session = await auth.session();
  currentUser = session.user;
  root.querySelector(".site-header").outerHTML = navigation();
  await renderPage(main);
} catch (error) {
  main.innerHTML = `<div class="page-shell"><div class="panel"><strong>Không thể tải CivicGuide</strong><p class="muted">${escapeHtml(error.message)}</p><p>Hãy chạy máy chủ Node.js rồi tải lại trang.</p></div></div>`;
}

root.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  try {
    if (action === "menu") {
      const nav = root.querySelector(".nav-links");
      const open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
    } else if (action === "logout") {
      await auth.logout();
      location.href = path.home;
    } else if (action === "procedure") {
      const procedure = currentProcedures.find((item) => item.id === id) || (await api.get(`/api/procedures/${encodeURIComponent(id)}`)).procedure;
      showProcedure(procedure);
    } else if (action === "close-dialog") {
      button.closest("dialog").close();
    } else if (action === "apply") {
      if (!currentUser) {
        location.href = path.login;
        return;
      }
      const procedure = currentProcedures.find((item) => item.id === id) || currentProcedure;
      const content = document.querySelector("#procedure-dialog-content");
      content.innerHTML = `<h2>Theo dõi hồ sơ</h2><p class="muted">Tạo hồ sơ minh họa để theo dõi trong tài khoản của bạn.</p>${applicationForm(procedure)}`;
    } else if (action === "filter") {
      const buttons = root.querySelectorAll("[data-action='filter']");
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      const filtered = button.dataset.category ? currentProcedures.filter((item) => item.category === button.dataset.category) : currentProcedures;
      root.querySelector("#search-results").innerHTML = procedureCards(filtered);
    } else if (action === "approve") {
      await api.patch(`/api/procedures/${encodeURIComponent(id)}`, { status: "published" });
      notify("Đã phê duyệt hướng dẫn.");
      await renderPage(main);
    } else if (action === "delete-faq") {
      if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
      await api.delete(`/api/faqs/${encodeURIComponent(id)}`);
      notify("Đã xóa câu hỏi.");
      await renderPage(main);
    } else if (action === "toggle-user") {
      const active = button.dataset.active !== "true";
      await api.patch(`/api/users/${encodeURIComponent(id)}`, { active });
      notify(active ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.");
      await renderPage(main);
    }
  } catch (error) {
    notify(error.message, true);
  }
});

root.addEventListener("submit", async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  try {
    if (form.id === "search-form") {
      const query = new FormData(form).get("q")?.toString().trim() || "";
      const category = new FormData(form).get("category")?.toString() || "";
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (category) params.set("category", category);
      location.href = `${path.search}${params.size ? `?${params}` : ""}`;
    } else if (form.id === "assistant-form") {
      const question = new FormData(form).get("question").toString();
      const answer = assistantAnswer(question, currentProcedures, currentFaqs);
      root.querySelector("#assistant-answer").innerHTML = `<div class="assistant-answer">${answer}</div>`;
    } else if (form.id === "login-form") {
      const { user } = await auth.login(formObject(form));
      currentUser = user;
      location.href = destinationFor(user);
    } else if (form.id === "register-form") {
      const { user } = await auth.register(formObject(form));
      currentUser = user;
      location.href = destinationFor(user);
    } else if (form.id === "forgot-form") {
      notify("Chức năng email đặt lại mật khẩu chưa được cấu hình. Vui lòng liên hệ quản trị viên.", true);
    } else if (form.id === "application-form") {
      await submitApplication(form);
      notify("Đã tạo hồ sơ theo dõi.");
      location.href = path.applications;
    } else if (form.id === "procedure-form") {
      const values = formObject(form);
      values.steps = values.steps.split(/\r?\n/).map((step) => step.trim()).filter(Boolean);
      await api.post("/api/procedures", values);
      notify("Đã gửi hướng dẫn để xử lý.");
      await renderPage(main);
    } else if (form.id === "faq-form") {
      await api.post("/api/faqs", formObject(form));
      notify("Đã đăng câu hỏi thường gặp.");
      await renderPage(main);
    } else if (form.id === "category-form") {
      await api.post("/api/categories", formObject(form));
      notify("Đã thêm lĩnh vực.");
      await renderPage(main);
    } else if (form.id === "source-form") {
      await api.post("/api/documents", formObject(form));
      notify("Đã lưu nguồn tham khảo.");
      await renderPage(main);
    } else if (form.id === "profile-form") {
      const { user } = await api.patch("/api/session", formObject(form));
      currentUser = user;
      root.querySelector(".site-header").outerHTML = navigation();
      notify("Đã cập nhật hồ sơ.");
    } else if (form.id === "settings-form") {
      preferences.write({ compact: form.elements.compact.checked, reminders: form.elements.reminders.checked });
      notify("Đã lưu cài đặt trên thiết bị này.");
    } else if (form.id === "feedback-form") {
      await api.post("/api/feedback", formObject(form));
      form.reset();
      notify("Cảm ơn bạn đã gửi góp ý.");
    }
  } catch (error) {
    notify(error.message, true);
  }
});

root.addEventListener("change", async (event) => {
  const roleSelect = event.target.closest("[data-user-role]");
  const feedbackSelect = event.target.closest("[data-feedback-status]");
  try {
    if (roleSelect) {
      await api.patch(`/api/users/${encodeURIComponent(roleSelect.dataset.userRole)}`, { role: roleSelect.value });
      notify("Đã cập nhật vai trò.");
    } else if (feedbackSelect) {
      await api.patch(`/api/feedback/${encodeURIComponent(feedbackSelect.dataset.feedbackStatus)}`, { status: feedbackSelect.value });
      notify("Đã cập nhật trạng thái góp ý.");
    }
  } catch (error) {
    notify(error.message, true);
    await renderPage(main);
  }
});