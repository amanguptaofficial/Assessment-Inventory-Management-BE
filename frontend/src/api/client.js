import axios from "axios";

// Base URL is injected at build time via Vite env. Falls back to localhost for
// a bare `npm run dev` without an .env file.
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const client = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/**
 * Normalise backend / network errors into a single human-readable message so
 * UI components never have to dig through axios internals.
 */
export function extractErrorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    // FastAPI validation errors -> "field: message"
    return detail
      .map((d) => `${d.loc?.slice(1).join(".") || "field"}: ${d.msg}`)
      .join("; ");
  }
  if (typeof detail === "string") return detail;
  if (error?.message) return error.message;
  return "Something went wrong. Please try again.";
}

export default client;
