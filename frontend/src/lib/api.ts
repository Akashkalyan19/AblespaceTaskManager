import { getToken, clearToken } from "./auth";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

/**
 * Single fetch wrapper used by every query/mutation: prefixes the base URL,
 * attaches the JWT, normalizes NestJS error payloads and handles expired
 * sessions by sending the user back to the login page.
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Could not reach the server. Is the API running?");
  }

  if (response.status === 401 && typeof window !== "undefined") {
    clearToken();
    if (!window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data: unknown = await response.json();
      if (data && typeof data === "object" && "message" in data) {
        const raw = (data as { message: string | string[] }).message;
        message = Array.isArray(raw) ? raw[0] : raw;
      }
    } catch {
      // keep the generic message
    }
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
