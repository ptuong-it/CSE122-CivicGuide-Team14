import { api } from "../api.js";
import { escapeHtml } from "./dom-utils.js";

export function applicationForm(procedure) {
  return `<form id="application-form" class="form-grid"><input type="hidden" name="procedureId" value="${escapeHtml(procedure.id)}"><div class="field field-full"><label>Thủ tục</label><strong>${escapeHtml(procedure.title)}</strong></div><div class="field field-full"><label for="applicantName">Họ và tên</label><input id="applicantName" name="applicantName" required maxlength="100" autocomplete="name"></div><div class="field field-full"><label for="phone">Số điện thoại</label><input id="phone" name="phone" required maxlength="30" autocomplete="tel"></div><div class="field field-full"><label for="note">Ghi chú (không bắt buộc)</label><textarea id="note" name="note" maxlength="1000"></textarea></div><div class="field field-full"><div class="notice">Đây là hồ sơ minh họa để theo dõi trong CivicGuide; vui lòng nộp hồ sơ chính thức qua cơ quan có thẩm quyền.</div></div><div class="field field-full"><button class="button" type="submit">Tạo hồ sơ theo dõi</button></div></form>`;
}

export async function submitApplication(form) {
  const data = Object.fromEntries(new FormData(form));
  return api.post("/api/applications", data);
}