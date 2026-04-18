const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AUTH_HEADER = "x-stack-access-token";

export interface ApiOptions {
  token?: string;
  headers?: HeadersInit;
}

async function request<T>(
  endpoint: string,
  fetchOptions: RequestInit = {},
  { token, headers }: ApiOptions = {},
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { [AUTH_HEADER]: token } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? `Error ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  return response.json();
}

export function get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
  return request<T>(endpoint, { method: "GET" }, options);
}

export function post<T>(endpoint: string, body: unknown, options?: ApiOptions): Promise<T> {
  return request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }, options);
}

export function patch<T>(endpoint: string, body: unknown, options?: ApiOptions): Promise<T> {
  return request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }, options);
}

export function del<T>(endpoint: string, options?: ApiOptions): Promise<T> {
  return request<T>(endpoint, { method: "DELETE" }, options);
}
