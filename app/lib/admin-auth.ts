"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiSend } from "./api";

const TOKEN_KEY = "jdesk-admin-token";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(email: string, password: string) {
  const res = await apiSend<{ accessToken: string; user: AdminUser }>(
    "POST",
    "/auth/login",
    { email, password },
  );
  setToken(res.accessToken);
  return res.user;
}

/**
 * Client hook: ensures an admin is logged in. Redirects to /admin/login
 * otherwise. Returns { user, token, ready }.
 */
export function useRequireAdmin() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    apiGet<AdminUser>("/auth/me", token)
      .then((u) => {
        setUser(u);
        setReady(true);
      })
      .catch(() => {
        clearToken();
        router.replace("/admin/login");
      });
  }, [router]);

  return { user, token: getToken(), ready };
}
