import axios from "axios";

// Usar la URL del backend desde el env, o /api por defecto
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  withCredentials: true,
});

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

// Interceptor de Request: inyecta el token Bearer si existe en cookie o storage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        getCookie("token") ||
        localStorage.getItem("token") ||
        localStorage.getItem("access_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response: logging detallado de errores de API
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("❌ API Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
      });
      console.error(
        "📄 Response data details:",
        JSON.stringify(error.response.data, null, 2)
      );
    } else if (error.request) {
      console.error("❌ Network Error:", error.message);
    } else {
      console.error("❌ Request Setup Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;