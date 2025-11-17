"use client";

import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { api } from "@/lib/api";
import { UserProfile, UserStatus } from "@/types/user.types";

export type UserLogged = {
  id: string;
  nome: string;
  usuario: string;
  perfil: UserProfile;
  situacao: UserStatus;
};

export type LoginResponse = {
  user: UserLogged;
  token: string;
  refresh_token: string;
};

export type LoginPayload = {
  usuario: string;
  senha: string;
};

export function useLogin() {
  const [user, setUser] = useState<UserLogged | null>(null);

  useEffect(() => {
    const cookieUser = getCookie("auth_user");

    if (cookieUser && typeof cookieUser === "string") {
      try {
        const parsed = JSON.parse(cookieUser) as UserLogged;
        setUser(parsed);
      } catch {
        setUser(null);
      }
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await api.post<LoginResponse>("/session", payload);
      return response.data;
    },
    onSuccess: (data) => {
      setCookie("auth_token", data.token, {
        maxAge: 24 * 60 * 60, // 1 dia
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      setCookie("auth_refresh_token", data.refresh_token, {
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      setCookie("auth_user", JSON.stringify(data.user), {
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      setUser(data.user);
    },
  });

  const getUser = (): UserLogged | null => {
    const cookieUser = getCookie("auth_user");

    if (!cookieUser || typeof cookieUser !== "string") {
      return null;
    }

    try {
      return JSON.parse(cookieUser) as UserLogged;
    } catch {
      return null;
    }
  };

  const logout = async () => {
    const refreshToken = getCookie("auth_refresh_token");

    try {
      if (refreshToken && typeof refreshToken === "string") {
        await api.post("/session/logout", {
          refresh_token: refreshToken,
        });
      }
    } catch (error) {
      console.error("Erro ao deslogar no servidor:", error);
    }

    deleteCookie("auth_token", { path: "/" });
    deleteCookie("auth_refresh_token", { path: "/" });
    deleteCookie("auth_user", { path: "/" });

    setUser(null);

    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return {
    login: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    user,
    getUser,
    logout,
  };
}
