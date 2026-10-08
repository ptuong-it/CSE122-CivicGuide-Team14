import { escapeHtml } from "./dom-utils.js";

export function assistantAnswer(question, procedures, faqs) {
  const query = question.trim().toLocaleLowerCase("vi");
  if (!query) return "Hãy nhập câu hỏi hoặc tên thủ tục bạn đang cần tìm.";
  const procedure = procedures.find((item) => `${item.title} ${item.description} ${item.category}`.toLocaleLowerCase("vi").includes(query));
  if (procedure) return `Bạn có thể bắt đầu với thủ tục <strong>${escapeHtml(procedure.title)}</strong>. Thời hạn tham khảo: ${escapeHtml(procedure.duration)}; cơ quan tiếp nhận: ${escapeHtml(procedure.agency)}. Hãy kiểm tra yêu cầu tại địa phương trước khi nộp.`;
  const words = query.split(/\s+/).filter((word) => word.length > 2);
  const faq = faqs.find((item) => words.some((word) => `${item.question} ${item.answer}`.toLocaleLowerCase("vi").includes(word)));
  if (faq) return `<strong>${escapeHtml(faq.question)}</strong><br>${escapeHtml(faq.answer)}`;
  return "Mình chưa tìm thấy câu trả lời phù hợp trong hướng dẫn hiện có. Hãy thử từ khóa khác hoặc gửi góp ý để đội ngũ CivicGuide hỗ trợ bổ sung thông tin.";
}