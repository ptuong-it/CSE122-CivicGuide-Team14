import { api } from "../api.js";

export async function submitApplication(form) {
  const data = Object.fromEntries(new FormData(form));
  return api.post("/api/applications", data);
}