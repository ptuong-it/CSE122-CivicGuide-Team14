import { api } from "./api.js";
import { auth } from "./auth.js";
import { preferences } from "./storage.js";
import { assistantAnswer } from "./modules/ai-search.js";
import { renderFaqs } from "./modules/ai-faq.js";
import { renderChecklists } from "./modules/ai-checklist.js";
import { submitApplication } from "./modules/application-wizard.js";
import { emptyState, escapeHtml, statusBadge } from "./modules/dom-utils.js";

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

function updateNavigation() {
  const authenticated = Boolean(currentUser);
  root.querySelectorAll("[data-user-link]").forEach((element) => { element.hidden = !authenticated; });
  root.querySelectorAll("[data-guest-link]").forEach((element) => { element.hidden = authenticated; });
  root.querySelectorAll("[data-role-link]").forEach((element) => {
    element.hidden = !currentUser || !element.dataset.roleLink.split(" ").includes(currentUser.role);
  });
  const profileLink = root.querySelector("[data-profile-link]");
  if (profileLink) {
    profileLink.hidden = !authenticated;
    if (authenticated) profileLink.textContent = currentUser.displayName.split(" ")[0];
  }
  root.querySelectorAll(".nav-links a").forEach((anchor) => {
    if (anchor.getAttribute("href") === location.pathname) anchor.setAttribute("aria-current", "page");
    else anchor.removeAttribute("aria-current");
  });
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
  return procedures.map((procedure) => `<article class="service-card"><div class="service-card-heading"><span class="service-icon" aria-hidden="true">${iconFor(procedure.category)}</span><span class="eyebrow">${escapeHtml(procedure.category)}</span></div><h3>${escapeHtml(procedure.title)}</h3><p class="service-card-description">${escapeHtml(procedure.description)}</p><div class="service-card-summary"><span>${procedure.steps?.length || 0} bước hướng dẫn</span><span>${escapeHtml(procedure.duration)}</span></div><div class="service-meta"><button class="text-link" data-action="procedure" data-id="${escapeHtml(procedure.id)}" aria-label="Xem chi tiết ${escapeHtml(procedure.title)}">Xem chi tiết <span aria-hidden="true">→</span></button></div></article>`).join("");
}

function iconFor(category) {
  return ({ "Hộ tịch": "♧", "Cư trú": "⌂", "Kinh doanh": "▤", "Đất đai": "⌖" })[category] || "✳";
}

async function renderHome(main) {
  const [procedureData, faqData] = await Promise.all([api.get("/api/procedures"), api.get("/api/faqs")]);
  currentProcedures = procedureData.procedures;
  currentFaqs = faqData.faqs;
  main.querySelector("#home-search").value = new URLSearchParams(location.search).get("q") || "";
  main.querySelector("#home-procedures").innerHTML = procedureCards(currentProcedures.slice(0, 6));
  await renderFaqs(main.querySelector("#home-faq"));
  main.querySelector("#home-data-status").hidden = true;
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
  main.querySelector("#search-query").value = query;
  const categorySelect = main.querySelector("[name='category']");
  categorySelect.insertAdjacentHTML("beforeend", categoryData.categories.map((category) => `<option value="${escapeHtml(category)}" ${category === selectedCategory ? "selected" : ""}>${escapeHtml(category)}</option>`).join(""));
  const chips = main.querySelector(".search-chips");
  chips.innerHTML = [`<button class="chip ${selectedCategory ? "" : "active"}" data-action="filter" data-category="">Tất cả</button>`, ...categoryData.categories.map((category) => `<button class="chip ${category === selectedCategory ? "active" : ""}" data-action="filter" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`)].join("");
  main.querySelector("#search-results").innerHTML = procedureCards(visibleProcedures);
  main.querySelectorAll("[data-guest-feedback]").forEach((field) => {
    field.hidden = Boolean(currentUser);
    field.querySelector("input").disabled = Boolean(currentUser);
  });
}

function applicationTable(applications) {
  if (!applications.length) return emptyState("Bạn chưa có hồ sơ theo dõi", "Tìm một thủ tục để bắt đầu tạo hồ sơ.");
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Mã hồ sơ</th><th>Thủ tục</th><th>Người nộp</th><th>Ngày tạo</th><th>Trạng thái</th></tr></thead><tbody>${applications.map((item) => `<tr><td><strong>${escapeHtml(item.id)}</strong></td><td>${escapeHtml(item.procedureTitle)}</td><td>${escapeHtml(item.applicantName)}</td><td>${new Date(item.createdAt).toLocaleDateString("vi-VN")}</td><td>${statusBadge(item.status)}</td></tr>`).join("")}</tbody></table></div>`;
}

async function renderApplications(main) {
  const { applications } = await api.get("/api/applications");
  const { procedures } = await api.get("/api/procedures");
  main.querySelector("#applications-table").innerHTML = applicationTable(applications);
  const createSection = main.querySelector(".application-create");
  createSection.hidden = currentUser.role !== "citizen";
  const procedureSelect = main.querySelector("#application-procedure");
  procedureSelect.innerHTML = procedures.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`).join("");
  main.querySelector("#application-name").value = currentUser.displayName;
}

async function renderProcedures(main, management = false) {
  const { procedures } = await api.get("/api/procedures");
  currentProcedures = procedures;
  if (!management) return renderSearch(main);
  main.querySelector("#category-options").innerHTML = [...new Set(procedures.map((item) => item.category))].map((category) => `<option value="${escapeHtml(category)}">`).join("");
  main.querySelector("#procedure-table").innerHTML = procedureTable(procedures);
}

function procedureTable(procedures, options = {}) {
  if (!procedures.length) return emptyState("Chưa có thủ tục", "Nội dung mới sẽ xuất hiện tại đây.");
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Thủ tục</th><th>Lĩnh vực</th><th>Cập nhật</th><th>Trạng thái</th>${options.approvals ? "<th>Thao tác</th>" : ""}</tr></thead><tbody>${procedures.map((item) => `<tr><td>${escapeHtml(item.title)}</td><td>${escapeHtml(item.category)}</td><td>${escapeHtml(item.updatedAt)}</td><td>${statusBadge(item.status)}</td>${options.approvals ? `<td><button class="button button-small" data-action="approve" data-id="${escapeHtml(item.id)}">Phê duyệt</button></td>` : ""}</tr>`).join("")}</tbody></table></div>`;
}

async function renderFaqManagement(main) {
  const { faqs } = await api.get("/api/faqs");
  currentFaqs = faqs;
  main.querySelector("#faq-list").innerHTML = faqs.map((faq) => `<article class="list-item"><div><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p><span class="badge">${escapeHtml(faq.category)}</span></div><button class="button button-danger button-small" data-action="delete-faq" data-id="${escapeHtml(faq.id)}">Xóa</button></article>`).join("") || emptyState("Chưa có câu hỏi");
}

async function renderFeedback(main) {
  const { feedback } = await api.get("/api/feedback");
  main.querySelector("#feedback-rows").innerHTML = feedback.map((item) => `<tr><td>${escapeHtml(item.createdAt)}</td><td>${escapeHtml(item.name)}<br><span class="muted">${escapeHtml(item.email)}</span></td><td>${escapeHtml(item.message)}</td><td>${statusBadge(item.status)}</td><td><select data-feedback-status="${escapeHtml(item.id)}" aria-label="Cập nhật trạng thái"><option value="new" ${item.status === "new" ? "selected" : ""}>Mới</option><option value="reviewing" ${item.status === "reviewing" ? "selected" : ""}>Đang xử lý</option><option value="resolved" ${item.status === "resolved" ? "selected" : ""}>Đã xử lý</option></select></td></tr>`).join("") || `<tr><td colspan="5">${emptyState("Chưa có góp ý")}</td></tr>`;
}

async function renderDashboard(main) {
  const { stats } = await api.get("/api/dashboard");
  main.querySelector("#dashboard-stats").innerHTML = stats.map((stat) => `<article class="stat-card"><span>${escapeHtml(stat.label)}</span><strong>${escapeHtml(stat.value)}</strong></article>`).join("");
}

async function renderCategories(main) {
  const [categoryData, procedureData] = await Promise.all([api.get("/api/categories"), api.get("/api/procedures")]);
  main.querySelector(".category-list").innerHTML = categoryData.categories.map((category) => `<span class="chip">${escapeHtml(category)}</span>`).join("");
  main.querySelector("#procedure-table").innerHTML = procedureTable(procedureData.procedures);
}

async function renderUsers(main) {
  const { users } = await api.get("/api/users");
  main.querySelector("#user-rows").innerHTML = users.map((user) => `<tr><td>${escapeHtml(user.displayName)}</td><td>${escapeHtml(user.email)}</td><td><select data-user-role="${escapeHtml(user.id)}" aria-label="Vai trò của ${escapeHtml(user.displayName)}">${Object.entries(roleNames).map(([role, name]) => `<option value="${role}" ${user.role === role ? "selected" : ""}>${name}</option>`).join("")}</select></td><td><button class="button button-small ${user.active ? "button-secondary" : ""}" data-action="toggle-user" data-id="${escapeHtml(user.id)}" data-active="${user.active}">${user.active ? "Đang hoạt động" : "Đã khóa"}</button></td></tr>`).join("") || `<tr><td colspan="4">${emptyState("Chưa có người dùng")}</td></tr>`;
}

async function renderApprovalQueue(main) {
  const { procedures } = await api.get("/api/procedures");
  const pending = procedures.filter((procedure) => procedure.status === "pending");
  main.querySelector("#procedure-table").innerHTML = procedureTable(pending, { approvals: true });
}

async function renderFreshness(main) {
  const { procedures } = await api.get("/api/procedures");
  const sorted = [...procedures].sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  main.querySelector("#procedure-table").innerHTML = procedureTable(sorted);
}

async function renderSources(main) {
  const { documents } = await api.get("/api/documents");
  main.querySelector("#source-list").innerHTML = documents.map((item) => `<article class="list-item"><div><h3><a class="text-link" href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a></h3><p>${escapeHtml(item.agency)} · Rà soát ${escapeHtml(item.checkedAt)}</p></div>${statusBadge(item.status)}</article>`).join("") || emptyState("Chưa có nguồn tham khảo");
}

async function renderProfile(main) {
  main.querySelector("#profile-name").value = currentUser.displayName;
  main.querySelector("#profile-email").value = currentUser.email;
  main.querySelector("#profile-role").value = roleNames[currentUser.role] || currentUser.role;
}

async function renderSettings(main) {
  const saved = preferences.read();
  main.querySelector("[name='compact']").checked = saved.compact;
  main.querySelector("[name='reminders']").checked = saved.reminders !== false;
}

function renderAccessDenied(main, message = "Hãy đăng nhập bằng tài khoản phù hợp hoặc quay lại trang tra cứu.") {
  main.querySelector("[data-page-content]").hidden = true;
  const denied = main.querySelector("#access-denied");
  denied.hidden = false;
  denied.querySelector("#access-denied-message").textContent = message;
}

async function renderPage(main) {
  if (roles[page] && (!currentUser || !roles[page].includes(currentUser.role))) {
    renderAccessDenied(main, "Bạn chưa có quyền xem trang này. Hãy đăng nhập bằng tài khoản phù hợp hoặc quay lại trang tra cứu.");
    return;
  }
  if (["citizen-my-applications", "citizen-my-checklists", "profile", "settings"].includes(page) && !currentUser) {
    renderAccessDenied(main, "Đăng nhập để xem và quản lý thông tin tài khoản của bạn.");
    return;
  }
  switch (page) {
    case "index": return renderHome(main);
    case "citizen-civic-search": return renderSearch(main);
    case "login":
    case "register": return;
    case "forgot-password": return;
    case "citizen-my-applications": return renderApplications(main);
    case "citizen-my-checklists":
      if (!currentUser) return renderAccessDenied(main, "Đăng nhập để lưu tiến độ chuẩn bị giấy tờ.");
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
    case "notifications": return;
    case "403": case "404": return;
    default: return;
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
  const detail = dialog.querySelector("#procedure-detail");
  detail.hidden = false;
  dialog.querySelector("#procedure-application").hidden = true;
  detail.querySelector("[data-procedure-category]").textContent = procedure.category;
  detail.querySelector("[data-procedure-title]").textContent = procedure.title;
  detail.querySelector("[data-procedure-description]").textContent = procedure.description;
  detail.querySelector("[data-procedure-updated]").textContent = procedure.updatedAt;
  detail.querySelector("[data-procedure-agency]").textContent = procedure.agency;
  detail.querySelector("[data-procedure-duration]").textContent = procedure.duration;
  detail.querySelector("[data-procedure-fee]").textContent = procedure.fee;
  const steps = procedure.steps?.length ? procedure.steps : ["Liên hệ cơ quan tiếp nhận để được hướng dẫn các bước cụ thể."];
  detail.querySelector("[data-step-count]").textContent = String(steps.length);
  detail.querySelector("#procedure-steps").innerHTML = steps.map((step, index) => `<li><span class="procedure-step-number" aria-hidden="true">${index + 1}</span><p>${escapeHtml(step)}</p></li>`).join("");
  detail.querySelector("[data-action='apply']").dataset.id = procedure.id;
  dialog.showModal();
}

const main = root.querySelector("#main-content");

try {
  const session = await auth.session();
  currentUser = session.user;
  updateNavigation();
  await renderPage(main);
} catch (error) {
  notify(`Không thể tải nội dung: ${error.message}. Hãy chạy máy chủ Node.js rồi tải lại trang.`, true);
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
      const dialog = document.querySelector("#procedure-dialog");
      const detail = dialog.querySelector("#procedure-detail");
      const application = dialog.querySelector("#procedure-application");
      detail.hidden = true;
      application.hidden = false;
      application.querySelector("[name='procedureId']").value = procedure.id;
      application.querySelector("[data-application-title]").textContent = procedure.title;
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
      updateNavigation();
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