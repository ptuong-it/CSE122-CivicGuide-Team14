import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(ROOT, "assets", "data");
const PORT = Number(process.env.PORT || 3000);
const sessions = new Map();
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

const seeds = {
  procedures: [
    { id: "marriage-registration", title: "Đăng ký kết hôn", category: "Hộ tịch", description: "Thủ tục đăng ký kết hôn tại Ủy ban nhân dân cấp xã nơi cư trú của một trong hai bên.", agency: "Ủy ban nhân dân cấp xã", duration: "05 ngày làm việc", fee: "Miễn phí", updatedAt: "2026-09-15", status: "published", steps: ["Chuẩn bị tờ khai đăng ký kết hôn và giấy tờ tùy thân.", "Nộp hồ sơ trực tiếp tại bộ phận một cửa.", "Cùng ký vào Sổ hộ tịch và nhận Giấy chứng nhận kết hôn."] },
    { id: "birth-registration", title: "Đăng ký khai sinh", category: "Hộ tịch", description: "Đăng ký khai sinh cho trẻ em tại cơ quan hộ tịch có thẩm quyền.", agency: "Ủy ban nhân dân cấp xã", duration: "Trong ngày tiếp nhận hồ sơ", fee: "Miễn phí", updatedAt: "2026-09-12", status: "published", steps: ["Điền tờ khai đăng ký khai sinh.", "Nộp giấy chứng sinh và giấy tờ tùy thân của người đi đăng ký.", "Kiểm tra thông tin và nhận Giấy khai sinh."] },
    { id: "residence-confirmation", title: "Xác nhận thông tin cư trú", category: "Cư trú", description: "Yêu cầu cấp văn bản xác nhận thông tin về nơi cư trú hiện tại.", agency: "Công an cấp xã", duration: "01 ngày làm việc", fee: "Miễn phí", updatedAt: "2026-08-28", status: "published", steps: ["Gửi yêu cầu xác nhận thông tin cư trú trực tuyến hoặc trực tiếp.", "Cung cấp thông tin định danh cá nhân.", "Nhận kết quả điện tử hoặc bản giấy."] },
    { id: "business-household", title: "Đăng ký hộ kinh doanh", category: "Kinh doanh", description: "Đăng ký thành lập hộ kinh doanh tại cơ quan đăng ký kinh doanh cấp huyện.", agency: "Cơ quan đăng ký kinh doanh cấp huyện", duration: "03 ngày làm việc", fee: "Tùy địa phương", updatedAt: "2026-08-20", status: "published", steps: ["Chuẩn bị giấy đề nghị đăng ký hộ kinh doanh.", "Nộp hồ sơ tại cơ quan đăng ký kinh doanh.", "Nhận giấy chứng nhận hoặc thông báo bổ sung hồ sơ."] },
    { id: "land-certificate", title: "Cấp giấy chứng nhận quyền sử dụng đất", category: "Đất đai", description: "Hướng dẫn hồ sơ đề nghị cấp giấy chứng nhận quyền sử dụng đất lần đầu.", agency: "Văn phòng đăng ký đất đai", duration: "Theo quy định địa phương", fee: "Theo quy định hiện hành", updatedAt: "2026-08-05", status: "published", steps: ["Chuẩn bị giấy tờ về quyền sử dụng đất.", "Nộp hồ sơ tại bộ phận tiếp nhận hồ sơ.", "Theo dõi tiến độ và nhận kết quả."] },
    { id: "marriage-registration-updated", title: "Cập nhật thủ tục đăng ký kết hôn", category: "Hộ tịch", description: "Bản cập nhật đang chờ biên tập và phê duyệt.", agency: "Ủy ban nhân dân cấp xã", duration: "05 ngày làm việc", fee: "Miễn phí", updatedAt: "2026-10-01", status: "pending", steps: ["Kiểm tra hồ sơ theo quy định mới."] }
  ],
  checklists: [
    { id: "marriage", procedureId: "marriage-registration", title: "Đăng ký kết hôn", items: ["Tờ khai đăng ký kết hôn theo mẫu", "CCCD/hộ chiếu còn hiệu lực của hai bên", "Giấy xác nhận tình trạng hôn nhân (nếu cần)"] },
    { id: "birth", procedureId: "birth-registration", title: "Đăng ký khai sinh", items: ["Tờ khai đăng ký khai sinh", "Giấy chứng sinh", "Giấy tờ tùy thân của người đi đăng ký"] },
    { id: "residence", procedureId: "residence-confirmation", title: "Xác nhận thông tin cư trú", items: ["Tờ khai thay đổi thông tin cư trú (nếu nộp trực tiếp)", "CCCD hoặc mã định danh cá nhân"] }
  ],
  documents: [
    { id: "source-1", title: "Cổng Dịch vụ công Quốc gia", url: "https://dichvucong.gov.vn", agency: "Văn phòng Chính phủ", checkedAt: "2026-09-20", status: "active" },
    { id: "source-2", title: "Cơ sở dữ liệu quốc gia về văn bản pháp luật", url: "https://vbpl.vn", agency: "Bộ Tư pháp", checkedAt: "2026-09-18", status: "active" }
  ],
  faqs: [
    { id: "faq-1", question: "Tôi có thể nộp hồ sơ trực tuyến ở đâu?", answer: "Bạn có thể tìm thủ tục trên Cổng Dịch vụ công Quốc gia tại dichvucong.gov.vn. Một số thủ tục hỗ trợ nộp và theo dõi hồ sơ trực tuyến.", category: "Nộp hồ sơ", status: "published" },
    { id: "faq-2", question: "Làm sao để theo dõi hồ sơ đã nộp?", answer: "Đăng nhập CivicGuide, mở mục Hồ sơ của tôi và chọn hồ sơ cần theo dõi. Mã hồ sơ cũng có thể được tra cứu trên cổng dịch vụ công nơi bạn đã nộp.", category: "Theo dõi hồ sơ", status: "published" },
    { id: "faq-3", question: "Thông tin trên CivicGuide có thay thế tư vấn pháp lý không?", answer: "Không. CivicGuide giúp bạn tìm hiểu quy trình; hãy liên hệ cơ quan tiếp nhận để xác nhận yêu cầu cụ thể theo địa phương.", category: "Thông tin chung", status: "published" }
  ],
  feedback: [
    { id: "feedback-1", name: "Nguyễn Minh Anh", email: "minhanh@example.com", message: "Mong bổ sung hướng dẫn rõ hơn về giấy xác nhận tình trạng hôn nhân.", procedureId: "marriage-registration", createdAt: "2026-09-24", status: "new" },
    { id: "feedback-2", name: "Trần Quốc Bảo", email: "quocbao@example.com", message: "Liên kết tra cứu hồ sơ của thủ tục cư trú có thể được cập nhật không?", procedureId: "residence-confirmation", createdAt: "2026-09-19", status: "reviewing" }
  ],
  categories: ["Hộ tịch", "Cư trú", "Kinh doanh", "Đất đai"],
  steps: [],
  users: []
};

function sendJson(response, status, data, extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders
  });
  response.end(JSON.stringify(data));
}

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function readData(name) {
  const contents = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf8");
  return JSON.parse(contents);
}

async function writeData(name, value) {
  const destination = path.join(DATA_DIR, `${name}.json`);
  const temporary = `${destination}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await fs.rename(temporary, destination);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

async function initializeData() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  for (const [name, value] of Object.entries(seeds)) {
    let isEmpty = false;
    try {
      const text = await fs.readFile(path.join(DATA_DIR, `${name}.json`), "utf8");
      if (!text.trim()) {
        isEmpty = true;
      } else {
        const storedData = JSON.parse(text);
        isEmpty = Array.isArray(storedData) && storedData.length === 0;
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      isEmpty = true;
    }
    if (isEmpty) {
      if (name === "users") {
        const demoUsers = [
          ["citizen@civicguide.vn", "Công dân mẫu", "citizen"],
          ["officer@civicguide.vn", "Cán bộ mẫu", "officer"],
          ["editor@civicguide.vn", "Biên tập viên mẫu", "editor"],
          ["admin@civicguide.vn", "Quản trị viên mẫu", "admin"]
        ];
        const password = hashPassword("Civic123!");
        await writeData(name, demoUsers.map(([email, displayName, role], index) => ({
          id: `demo-${role}`,
          email,
          displayName,
          role,
          active: true,
          salt: password.salt,
          passwordHash: password.hash,
          createdAt: "2026-01-01",
          ...(index ? {} : { checklistProgress: {} })
        })));
      } else {
        await writeData(name, value);
      }
    }
  }
}

function getSession(request) {
  const cookie = request.headers.cookie || "";
  const match = cookie.match(/(?:^|;\s*)civicguide_session=([a-f0-9-]+)/);
  return match ? sessions.get(match[1]) || null : null;
}

function requireUser(request, roles = []) {
  const user = getSession(request);
  if (!user) throw fail(401, "Vui lòng đăng nhập để tiếp tục.");
  if (roles.length && !roles.includes(user.role)) throw fail(403, "Bạn không có quyền thực hiện thao tác này.");
  return user;
}

async function readBody(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 1_000_000) throw fail(413, "Dữ liệu gửi lên vượt quá giới hạn.");
  }
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw fail(400, "Nội dung yêu cầu không phải JSON hợp lệ.");
  }
}

function requiredText(value, label, maxLength = 300) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > maxLength) {
    throw fail(400, `${label} không hợp lệ.`);
  }
  return value.trim();
}

function safeUser(user) {
  const { passwordHash, hash, salt, ...publicUser } = user;
  return publicUser;
}

async function handleApi(request, response, url) {
  const method = request.method;
  const pathname = url.pathname;

  if (pathname === "/api/session" && method === "GET") {
    const user = getSession(request);
    return sendJson(response, 200, { user: user ? safeUser(user) : null });
  }

  if (pathname === "/api/session" && method === "PATCH") {
    const user = requireUser(request);
    const body = await readBody(request);
    const users = await readData("users");
    const storedUser = users.find((item) => item.id === user.id);
    storedUser.displayName = requiredText(body.displayName, "Họ và tên", 100);
    await writeData("users", users);
    sessions.forEach((sessionUser, id) => {
      if (sessionUser.id === user.id) sessions.set(id, storedUser);
    });
    return sendJson(response, 200, { user: safeUser(storedUser) });
  }

  if (pathname === "/api/auth/login" && method === "POST") {
    const body = await readBody(request);
    const email = requiredText(body.email, "Email", 254).toLowerCase();
    const password = requiredText(body.password, "Mật khẩu", 200);
    const users = await readData("users");
    const user = users.find((item) => item.email.toLowerCase() === email && item.active);
    if (!user) throw fail(401, "Email hoặc mật khẩu không chính xác.");
    const storedHash = user.passwordHash || user.hash;
    if (!user.salt || !/^[a-f0-9]{128}$/i.test(storedHash || "")) {
      throw fail(401, "Email hoặc mật khẩu không chính xác.");
    }
    const submittedHash = hashPassword(password, user.salt).hash;
    if (!crypto.timingSafeEqual(Buffer.from(submittedHash, "hex"), Buffer.from(storedHash, "hex"))) {
      throw fail(401, "Email hoặc mật khẩu không chính xác.");
    }
    if (!user.passwordHash) {
      user.passwordHash = user.hash;
      delete user.hash;
      await writeData("users", users);
    }
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, user);
    return sendJson(response, 200, { user: safeUser(user) }, {
      "Set-Cookie": `civicguide_session=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`
    });
  }

  if (pathname === "/api/auth/logout" && method === "POST") {
    const sessionId = (request.headers.cookie || "").match(/(?:^|;\s*)civicguide_session=([a-f0-9-]+)/)?.[1];
    if (sessionId) sessions.delete(sessionId);
    return sendJson(response, 200, { success: true }, {
      "Set-Cookie": "civicguide_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
    });
  }

  if (pathname === "/api/auth/register" && method === "POST") {
    const body = await readBody(request);
    const displayName = requiredText(body.displayName, "Họ và tên", 100);
    const email = requiredText(body.email, "Email", 254).toLowerCase();
    const password = requiredText(body.password, "Mật khẩu", 200);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(400, "Email không đúng định dạng.");
    if (password.length < 8) throw fail(400, "Mật khẩu cần có ít nhất 8 ký tự.");
    const users = await readData("users");
    if (users.some((user) => user.email.toLowerCase() === email)) throw fail(409, "Email này đã được đăng ký.");
    const { salt, hash } = hashPassword(password);
    const user = {
      id: crypto.randomUUID(),
      displayName,
      email,
      role: "citizen",
      active: true,
      salt,
      passwordHash: hash,
      checklistProgress: {},
      createdAt: new Date().toISOString().slice(0, 10)
    };
    users.push(user);
    await writeData("users", users);
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, user);
    return sendJson(response, 201, { user: safeUser(user) }, {
      "Set-Cookie": `civicguide_session=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800`
    });
  }

  if (pathname === "/api/procedures" && method === "GET") {
    const procedures = await readData("procedures");
    const visible = procedures.filter((item) => item.status === "published" || ["admin", "editor", "officer"].includes(getSession(request)?.role));
    const query = (url.searchParams.get("q") || "").trim().toLocaleLowerCase("vi");
    const category = url.searchParams.get("category");
    const result = visible.filter((item) => (!query || `${item.title} ${item.description} ${item.category}`.toLocaleLowerCase("vi").includes(query))
      && (!category || item.category === category));
    return sendJson(response, 200, { procedures: result });
  }

  const procedureMatch = pathname.match(/^\/api\/procedures\/([a-z0-9-]+)$/);
  if (procedureMatch && method === "GET") {
    const procedure = (await readData("procedures")).find((item) => item.id === procedureMatch[1] && (item.status === "published" || ["admin", "editor", "officer"].includes(getSession(request)?.role)));
    if (!procedure) throw fail(404, "Không tìm thấy thủ tục.");
    return sendJson(response, 200, { procedure });
  }

  if (pathname === "/api/procedures" && method === "POST") {
    requireUser(request, ["admin", "editor", "officer"]);
    const body = await readBody(request);
    const procedures = await readData("procedures");
    const procedure = {
      id: crypto.randomUUID(),
      title: requiredText(body.title, "Tên thủ tục"),
      description: requiredText(body.description, "Mô tả", 1200),
      category: requiredText(body.category, "Danh mục", 80),
      agency: requiredText(body.agency || "Cơ quan có thẩm quyền", "Cơ quan", 150),
      duration: requiredText(body.duration || "Theo quy định", "Thời hạn", 80),
      fee: requiredText(body.fee || "Theo quy định", "Lệ phí", 80),
      updatedAt: new Date().toISOString().slice(0, 10),
      status: getSession(request).role === "officer" ? "pending" : "published",
      steps: Array.isArray(body.steps) ? body.steps.map((step) => requiredText(step, "Bước thực hiện", 300)) : []
    };
    procedures.push(procedure);
    await writeData("procedures", procedures);
    return sendJson(response, 201, { procedure });
  }

  if (pathname === "/api/categories" && method === "GET") {
    const categories = await readData("categories");
    return sendJson(response, 200, { categories });
  }

  if (pathname === "/api/categories" && method === "POST") {
    requireUser(request, ["admin"]);
    const body = await readBody(request);
    const category = requiredText(body.name, "Tên danh mục", 80);
    const categories = await readData("categories");
    if (categories.some((item) => item.toLocaleLowerCase("vi") === category.toLocaleLowerCase("vi"))) throw fail(409, "Danh mục đã tồn tại.");
    categories.push(category);
    await writeData("categories", categories);
    return sendJson(response, 201, { category });
  }

  const procedureUpdateMatch = pathname.match(/^\/api\/procedures\/([a-z0-9-]+)$/);
  if (procedureUpdateMatch && method === "PATCH") {
    const editor = requireUser(request, ["admin", "editor", "officer"]);
    const body = await readBody(request);
    const procedures = await readData("procedures");
    const procedure = procedures.find((item) => item.id === procedureUpdateMatch[1]);
    if (!procedure) throw fail(404, "Không tìm thấy thủ tục.");
    if (body.status) {
      if (editor.role === "officer" || !["published", "pending", "rejected"].includes(body.status)) throw fail(403, "Bạn không thể thay đổi trạng thái thủ tục này.");
      procedure.status = body.status;
    }
    for (const key of ["title", "description", "category", "agency", "duration", "fee"]) {
      if (body[key] !== undefined) procedure[key] = requiredText(body[key], key, key === "description" ? 1200 : 300);
    }
    if (Array.isArray(body.steps)) procedure.steps = body.steps.map((step) => requiredText(step, "Bước thực hiện", 300));
    procedure.updatedAt = new Date().toISOString().slice(0, 10);
    await writeData("procedures", procedures);
    return sendJson(response, 200, { procedure });
  }

  if (pathname === "/api/faqs" && method === "GET") return sendJson(response, 200, { faqs: (await readData("faqs")).filter((faq) => faq.status === "published" || ["admin", "officer"].includes(getSession(request)?.role)) });

  if (pathname === "/api/faqs" && method === "POST") {
    requireUser(request, ["admin", "officer"]);
    const body = await readBody(request);
    const faqs = await readData("faqs");
    const faq = { id: crypto.randomUUID(), question: requiredText(body.question, "Câu hỏi"), answer: requiredText(body.answer, "Câu trả lời", 1200), category: requiredText(body.category || "Thông tin chung", "Danh mục", 80), status: "published" };
    faqs.push(faq);
    await writeData("faqs", faqs);
    return sendJson(response, 201, { faq });
  }

  const faqMatch = pathname.match(/^\/api\/faqs\/([a-z0-9-]+)$/);
  if (faqMatch && method === "DELETE") {
    requireUser(request, ["admin", "officer"]);
    const faqs = await readData("faqs");
    const index = faqs.findIndex((faq) => faq.id === faqMatch[1]);
    if (index < 0) throw fail(404, "Không tìm thấy câu hỏi.");
    faqs.splice(index, 1);
    await writeData("faqs", faqs);
    return sendJson(response, 200, { success: true });
  }

  if (pathname === "/api/applications" && method === "GET") {
    const user = requireUser(request);
    const applications = await readData("steps");
    return sendJson(response, 200, { applications: applications.filter((item) => user.role !== "citizen" || item.userId === user.id) });
  }

  if (pathname === "/api/applications" && method === "POST") {
    const user = requireUser(request);
    const body = await readBody(request);
    const procedures = await readData("procedures");
    const procedure = procedures.find((item) => item.id === body.procedureId && item.status === "published");
    if (!procedure) throw fail(400, "Thủ tục đã chọn không hợp lệ.");
    const applications = await readData("steps");
    const application = {
      id: `CG-${new Date().getFullYear()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
      userId: user.id,
      procedureId: procedure.id,
      procedureTitle: procedure.title,
      applicantName: requiredText(body.applicantName, "Họ và tên", 100),
      phone: requiredText(body.phone, "Số điện thoại", 30),
      note: typeof body.note === "string" ? body.note.trim().slice(0, 1000) : "",
      status: "Đã tiếp nhận",
      createdAt: new Date().toISOString()
    };
    applications.unshift(application);
    await writeData("steps", applications);
    return sendJson(response, 201, { application });
  }

  if (pathname === "/api/checklists" && method === "GET") {
    const user = getSession(request);
    const [checklists, users] = await Promise.all([readData("checklists"), readData("users")]);
    const progress = user ? users.find((item) => item.id === user.id)?.checklistProgress || {} : {};
    return sendJson(response, 200, { checklists, progress });
  }

  const checklistMatch = pathname.match(/^\/api\/checklists\/([a-z0-9-]+)$/);
  if (checklistMatch && method === "PUT") {
    const user = requireUser(request);
    const body = await readBody(request);
    const checklists = await readData("checklists");
    const checklist = checklists.find((item) => item.id === checklistMatch[1]);
    if (!checklist || !Array.isArray(body.completed) || body.completed.some((item) => !checklist.items.includes(item))) throw fail(400, "Danh sách giấy tờ không hợp lệ.");
    const users = await readData("users");
    const storedUser = users.find((item) => item.id === user.id);
    storedUser.checklistProgress ||= {};
    storedUser.checklistProgress[checklist.id] = body.completed;
    await writeData("users", users);
    sessions.forEach((sessionUser, id) => {
      if (sessionUser.id === user.id) sessions.set(id, storedUser);
    });
    return sendJson(response, 200, { completed: body.completed });
  }

  if (pathname === "/api/feedback" && method === "GET") {
    requireUser(request, ["admin", "officer"]);
    return sendJson(response, 200, { feedback: await readData("feedback") });
  }

  if (pathname === "/api/feedback" && method === "POST") {
    const user = getSession(request);
    const body = await readBody(request);
    const feedback = await readData("feedback");
    const entry = {
      id: crypto.randomUUID(),
      name: user?.displayName || requiredText(body.name, "Họ và tên", 100),
      email: user?.email || requiredText(body.email, "Email", 254),
      message: requiredText(body.message, "Nội dung góp ý", 1500),
      procedureId: typeof body.procedureId === "string" ? body.procedureId : "",
      createdAt: new Date().toISOString().slice(0, 10),
      status: "new"
    };
    feedback.unshift(entry);
    await writeData("feedback", feedback);
    return sendJson(response, 201, { feedback: entry });
  }

  if (pathname === "/api/dashboard" && method === "GET") {
    requireUser(request, ["admin"]);
    const [procedures, users, applications, feedback] = await Promise.all(["procedures", "users", "steps", "feedback"].map(readData));
    return sendJson(response, 200, {
      stats: [
        { label: "Thủ tục đang công khai", value: procedures.filter((item) => item.status === "published").length },
        { label: "Người dùng", value: users.length },
        { label: "Hồ sơ đã gửi", value: applications.length },
        { label: "Góp ý cần xem", value: feedback.filter((item) => item.status !== "resolved").length }
      ]
    });
  }

  if (pathname === "/api/users" && method === "GET") {
    requireUser(request, ["admin"]);
    return sendJson(response, 200, { users: (await readData("users")).map(safeUser) });
  }

  const userMatch = pathname.match(/^\/api\/users\/([a-z0-9-]+)$/);
  if (userMatch && method === "PATCH") {
    requireUser(request, ["admin"]);
    const body = await readBody(request);
    const users = await readData("users");
    const target = users.find((item) => item.id === userMatch[1]);
    if (!target) throw fail(404, "Không tìm thấy người dùng.");
    if (body.role && !["citizen", "officer", "editor", "admin"].includes(body.role)) throw fail(400, "Vai trò không hợp lệ.");
    if (typeof body.active === "boolean") target.active = body.active;
    if (body.role) target.role = body.role;
    await writeData("users", users);
    sessions.forEach((sessionUser, id) => {
      if (sessionUser.id !== target.id) return;
      if (target.active) sessions.set(id, target);
      else sessions.delete(id);
    });
    return sendJson(response, 200, { user: safeUser(target) });
  }

  if (pathname === "/api/documents" && method === "GET") {
    requireUser(request, ["admin", "editor"]);
    return sendJson(response, 200, { documents: await readData("documents") });
  }

  if (pathname === "/api/documents" && method === "POST") {
    requireUser(request, ["admin", "editor"]);
    const body = await readBody(request);
    const documents = await readData("documents");
    const entry = {
      id: crypto.randomUUID(),
      title: requiredText(body.title, "Tên nguồn", 150),
      url: requiredText(body.url, "Đường dẫn", 500),
      agency: requiredText(body.agency, "Cơ quan", 150),
      checkedAt: new Date().toISOString().slice(0, 10),
      status: "active"
    };
    if (!/^https?:\/\//i.test(entry.url)) throw fail(400, "Đường dẫn cần bắt đầu bằng http:// hoặc https://.");
    documents.push(entry);
    await writeData("documents", documents);
    return sendJson(response, 201, { document: entry });
  }

  const feedbackMatch = pathname.match(/^\/api\/feedback\/([a-z0-9-]+)$/);
  if (feedbackMatch && method === "PATCH") {
    requireUser(request, ["admin", "officer"]);
    const body = await readBody(request);
    if (!["new", "reviewing", "resolved"].includes(body.status)) throw fail(400, "Trạng thái góp ý không hợp lệ.");
    const feedback = await readData("feedback");
    const entry = feedback.find((item) => item.id === feedbackMatch[1]);
    if (!entry) throw fail(404, "Không tìm thấy góp ý.");
    entry.status = body.status;
    await writeData("feedback", feedback);
    return sendJson(response, 200, { feedback: entry });
  }

  throw fail(404, "Không tìm thấy API.");
}

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  try {
    const origin = request.headers.origin;
    if (origin) {
      let parsedOrigin;
      try {
        parsedOrigin = new URL(origin);
      } catch {
        parsedOrigin = null;
      }
      const isLiveServer = parsedOrigin
        && parsedOrigin.protocol === "http:"
        && ["127.0.0.1", "localhost"].includes(parsedOrigin.hostname)
        && parsedOrigin.port === "5500";
      if (isLiveServer) {
        response.setHeader("Access-Control-Allow-Origin", origin);
        response.setHeader("Access-Control-Allow-Credentials", "true");
        response.setHeader("Vary", "Origin");
      }
      if (request.method === "OPTIONS" && url.pathname.startsWith("/api/")) {
        if (!isLiveServer) throw fail(403, "Nguồn yêu cầu không được cho phép.");
        response.writeHead(204, {
          "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "600"
        });
        response.end();
        return;
      }
    }
    if (url.pathname.startsWith("/api/")) return await handleApi(request, response, url);
    if (!["GET", "HEAD"].includes(request.method)) throw fail(405, "Phương thức không được hỗ trợ.");
    let requestedPath = decodeURIComponent(url.pathname === "/" ? "/pages/shared/index.html" : url.pathname);
    if (!/^\/(pages|css|js|assets\/(icons|images))\//.test(requestedPath)) throw fail(404, "Không tìm thấy trang.");
    const resolvedPath = path.resolve(ROOT, `.${requestedPath}`);
    if (resolvedPath !== ROOT && !resolvedPath.startsWith(`${ROOT}${path.sep}`)) throw fail(403, "Đường dẫn không hợp lệ.");
    const contents = await fs.readFile(resolvedPath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(resolvedPath)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; script-src 'self'",
      "Cache-Control": "no-cache"
    });
    response.end(request.method === "HEAD" ? undefined : contents);
  } catch (error) {
    const status = error.status || (error.code === "ENOENT" ? 404 : 500);
    if (status >= 500) console.error(error);
    if (url.pathname.startsWith("/api/")) {
      sendJson(response, status, { error: status === 500 ? "Đã xảy ra lỗi máy chủ." : error.message });
      return;
    }
    response.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(status === 404 ? "Không tìm thấy trang." : error.message);
  }
}

initializeData().then(() => {
  http.createServer(handleRequest).listen(PORT, () => {
    console.log(`CivicGuide đang chạy tại http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error("Không thể khởi tạo dữ liệu CivicGuide:", error);
  process.exitCode = 1;
});
