// Client for the JDesk backend API. In production NEXT_PUBLIC_API_URL is unset,
// so calls hit the same origin at /api (nginx proxies to the NestJS server).

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "/api";

export type ApiError = { status: number; message: string };

async function toError(res: Response): Promise<ApiError> {
  let message = res.statusText;
  try {
    const body = await res.json();
    if (Array.isArray(body?.message)) message = body.message.join(", ");
    else if (typeof body?.message === "string") message = body.message;
  } catch {
    /* keep statusText */
  }
  return { status: res.status, message };
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw await toError(res);
  return res.json() as Promise<T>;
}

export async function apiSend<T>(
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw await toError(res);
  // DELETE / empty responses
  const text = await res.text();
  return (text ? JSON.parse(text) : {}) as T;
}

// --- typed shapes shared with the backend --------------------------------
export type FeedbackInput = {
  email: string;
  fullName: string;
  content: string;
  website?: string; // honeypot
};
