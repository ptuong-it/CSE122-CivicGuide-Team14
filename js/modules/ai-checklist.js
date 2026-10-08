import { api } from "../api.js";
import { escapeHtml } from "./dom-utils.js";

export async function renderChecklists(container, notify) {
  const { checklists, progress } = await api.get("/api/checklists");
  container.innerHTML = checklists.map((list) => {
    const completed = progress[list.id] || [];
    const percent = list.items.length ? Math.round(completed.length / list.items.length * 100) : 0;
    return `<section class="panel checklist" data-checklist="${escapeHtml(list.id)}"><div class="section-heading"><div><h2>${escapeHtml(list.title)}</h2><p data-checklist-progress>${completed.length}/${list.items.length} giấy tờ đã chuẩn bị</p></div><span class="badge" data-checklist-percent>${percent}%</span></div><div class="progress-track"><div class="progress-value" data-checklist-bar style="width:${percent}%"></div></div>${list.items.map((item) => `<div class="check-row"><input type="checkbox" data-check-item="${escapeHtml(item)}" ${completed.includes(item) ? "checked" : ""}><label>${escapeHtml(item)}</label></div>`).join("")}<a class="text-link" href="/pages/citizen/citizen-civic-search.html">Xem hướng dẫn thủ tục →</a></section>`;
  }).join("");

  if (container.dataset.listenerBound !== "true") {
    container.dataset.listenerBound = "true";
    container.addEventListener("change", async (event) => {
      const input = event.target.closest("[data-check-item]");
      if (!input) return;
      const checklistElement = input.closest("[data-checklist]");
      const checkboxes = [...checklistElement.querySelectorAll("[data-check-item]")];
      const completed = [...checklistElement.querySelectorAll("[data-check-item]:checked")].map((checkbox) => checkbox.dataset.checkItem);
      const updateProgress = () => {
        const count = checklistElement.querySelectorAll("[data-check-item]:checked").length;
        const percent = checkboxes.length ? Math.round(count / checkboxes.length * 100) : 0;
        checklistElement.querySelector("[data-checklist-progress]").textContent = `${count}/${checkboxes.length} giấy tờ đã chuẩn bị`;
        checklistElement.querySelector("[data-checklist-percent]").textContent = `${percent}%`;
        checklistElement.querySelector("[data-checklist-bar]").style.width = `${percent}%`;
      };
      const wasChecked = !input.checked;
      updateProgress();
      checkboxes.forEach((checkbox) => { checkbox.disabled = true; });
      try {
        await api.put(`/api/checklists/${encodeURIComponent(checklistElement.dataset.checklist)}`, { completed });
        notify("Đã lưu tiến độ chuẩn bị hồ sơ.");
      } catch (error) {
        input.checked = wasChecked;
        updateProgress();
        notify(error.message, true);
      } finally {
        checkboxes.forEach((checkbox) => { checkbox.disabled = false; });
      }
    });
  }
}