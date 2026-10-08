export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

export function pageHeading(eyebrow, title, description = "") {
  return `<div class="page-heading"><div><span class="eyebrow">${escapeHtml(eyebrow)}</span><h1>${escapeHtml(title)}</h1>${description ? `<p>${escapeHtml(description)}</p>` : ""}</div></div>`;
}

export function emptyState(title, description = "") {
  return `<div class="empty-state"><strong>${escapeHtml(title)}</strong>${description ? `<span>${escapeHtml(description)}</span>` : ""}</div>`;
}

export function statusBadge(status) {
  const labels = { published: "Đang công khai", pending: "Chờ duyệt", new: "Mới", reviewing: "Đang xử lý", resolved: "Đã xử lý", active: "Đang hoạt động" };
  const tone = ["published", "resolved", "active"].includes(status) ? "badge-success" : status === "pending" || status === "reviewing" ? "badge-warning" : "";
  return `<span class="badge ${tone}">${escapeHtml(labels[status] || status || "—")}</span>`;
}