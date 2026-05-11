const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AUTH_HEADER = "x-stack-access-token";

export interface ApiOptions {
  token?: string;
  headers?: HeadersInit;
  keepalive?: boolean;
}

function buildUrl(endpoint: string): string {
  if (!API_URL) {
    throw new Error(
      "API_URL no está configurada. Verifica que NEXT_PUBLIC_API_URL esté definida en las variables de entorno.",
    );
  }
  return `${API_URL}${endpoint}`;
}

function authHeaders(token?: string, headers?: HeadersInit): HeadersInit {
  return {
    ...(token ? { [AUTH_HEADER]: token } : {}),
    ...headers,
  };
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return body?.detail ?? JSON.stringify(body);
  } catch {
    const text = await response.text().catch(() => "");
    return text || `Error ${response.status}`;
  }
}

async function request<T>(
  endpoint: string,
  fetchOptions: RequestInit = {},
  { token, headers, keepalive }: ApiOptions = {},
): Promise<T> {
  const response = await fetch(buildUrl(endpoint), {
    ...fetchOptions,
    keepalive,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token, headers),
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} - ${await readErrorMessage(response)}`);
  }

  if (response.status === 204) return undefined as T;

  return response.json();
}

export function get<T>(endpoint: string, options?: ApiOptions): Promise<T> {
  return request<T>(endpoint, { method: "GET" }, options);
}

export function post<T>(
  endpoint: string,
  body: unknown,
  options?: ApiOptions,
): Promise<T> {
  return request<T>(
    endpoint,
    { method: "POST", body: JSON.stringify(body) },
    options,
  );
}

export function patch<T>(
  endpoint: string,
  body: unknown,
  options?: ApiOptions,
): Promise<T> {
  return request<T>(
    endpoint,
    { method: "PATCH", body: JSON.stringify(body) },
    options,
  );
}

export function del<T>(endpoint: string, options?: ApiOptions): Promise<T> {
  return request<T>(endpoint, { method: "DELETE" }, options);
}

export async function downloadReport(
  endpoint: string,
  token: string,
  filename: string,
): Promise<void> {
  const response = await fetch(buildUrl(endpoint), {
    method: "GET",
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`${response.status} - ${await readErrorMessage(response)}`);
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}
