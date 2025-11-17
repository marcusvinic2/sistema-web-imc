import axios from "axios";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://192.168.0.112:3002",
  withCredentials: false
});

api.interceptors.request.use(
  async (config) => {
    const token = getCookie("auth_token") as string | undefined;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    console.log("Erro na resposta da API:", error.response);

    const status = error.response?.status;
    const originalRequest = error.config;

    // caso ocorrer erro no refresh
    if (originalRequest?.url?.includes("/session/refresh")) {
      deleteCookie("auth_token", { path: "/" });
      deleteCookie("auth_refresh_token", { path: "/" });
      deleteCookie("auth_user", { path: "/" });

      if (typeof window !== "undefined") {
        window.location.href = "/";
      }

      return Promise.reject(error);
    }

    if (status !== 401) {
      return Promise.reject(error);
    }

    const refreshToken = getCookie("auth_refresh_token");

    if (!refreshToken) {
      deleteCookie("auth_token", { path: "/" });
      deleteCookie("auth_refresh_token", { path: "/" });
      deleteCookie("auth_user", { path: "/" });

      if (typeof window !== "undefined") {
        window.location.href = "/";
      }

      return Promise.reject(error);
    }

    try {
      // atualizar token
      const responseRefresh = await api.post("/session/refresh", {
        refresh_token: refreshToken,
      });

      const newAccessToken = responseRefresh.data.token;
      const newRefreshToken = responseRefresh.data.refresh_token;

      setCookie("auth_token", newAccessToken, {
        maxAge: 24 * 60 * 60,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      setCookie("auth_refresh_token", newRefreshToken, {
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });

      originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

      return api(originalRequest);

    } catch (refreshError) {
      deleteCookie("auth_token", { path: "/" });
      deleteCookie("auth_refresh_token", { path: "/" });
      deleteCookie("auth_user", { path: "/" });

      if (typeof window !== "undefined") {
        window.location.href = "/";
      }

      return Promise.reject(refreshError);
    }
  }
);

