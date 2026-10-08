import { api } from "../api.js";
import { escapeHtml } from "./dom-utils.js";

export async function renderFaqs(container) {
  const { faqs } = await api.get("/api/faqs");
  container.innerHTML = faqs.map((faq) => `<details class="faq-item"><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join("")
    || `<p class="muted">Chưa có câu hỏi thường gặp.</p>`;
}