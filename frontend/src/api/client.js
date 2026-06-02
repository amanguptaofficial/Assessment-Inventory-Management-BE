import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const client = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export function extractErrorMessage(error) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => `${d.loc?.slice(1).join(".") || "field"}: ${d.msg}`)
      .join("; ");
  }
  if (typeof detail === "string") return detail;
  if (error?.message) return error.message;
  return "Something went wrong. Please try again.";
}

export default client;
