import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const authStore = localStorage.getItem("omni-dashboard-auth");
  if (authStore) {
    try {
      const { state } = JSON.parse(authStore);
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // localStorage.removeItem("omni-dashboard-auth");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
