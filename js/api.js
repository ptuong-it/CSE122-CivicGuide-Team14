const apiBase = window.location.port === "5500"
  ? `${window.location.protocol}//${window.location.hostname}:3000`
  : "";

async function request(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options
  });
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error("API không trả về JSON. Hãy chạy backend bằng lệnh npm start rồi tải lại trang.");
  }
  const payload = response.status === 204 ? {} : await response.json();
  if (!response.ok) {
    const error = new Error(payload.error || `Yêu cầu thất bại (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export const api = {
  get: (path) => request(path),
  post: (path, body = {}) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body = {}) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body = {}) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" })
};