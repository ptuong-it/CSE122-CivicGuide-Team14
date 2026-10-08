import { api } from "./api.js";

export const auth = {
  session: () => api.get("/api/session"),
  login: (credentials) => api.post("/api/auth/login", credentials),
  register: (details) => api.post("/api/auth/register", details),
  logout: () => api.post("/api/auth/logout")
};