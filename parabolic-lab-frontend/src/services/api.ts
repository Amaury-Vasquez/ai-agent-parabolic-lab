const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AUTH_HEADER = "x-stack-access-token";

export interface ApiOptions {
  token?: string;
  headers?: HeadersInit;
  keepalive?: boolean;
}

/**
 * Error de API con información estructurada. `fieldErrors` mapea cada campo
 * (último segmento del `loc` de FastAPI) a un mensaje legible, útil para
 * marcar errores por campo en los formularios.
 */
export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(
    status: number,
    message: string,
    fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

interface ValidationDetail {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

// Traduce los tipos de error de Pydantic a mensajes claros en español.
function traducirMensaje(detail: ValidationDetail): string {
  const tipo = detail.type ?? "";
  const msg = detail.msg ?? "Valor inválido";
  if (tipo.includes("missing")) return "Este campo es obligatorio";
  if (tipo.includes("email")) return "El correo no tiene un formato válido";
  if (tipo.includes("too_short") || tipo.includes("min_length"))
    return "El valor es demasiado corto";
  if (tipo.includes("too_long") || tipo.includes("max_length"))
    return "El valor es demasiado largo";
  if (tipo.includes("uuid")) return "Identificador inválido";
  if (tipo.includes("int") || tipo.includes("float") || tipo.includes("number"))
    return "Debe ser un número válido";
  // Pydantic ya manda msg en inglés; lo usamos como respaldo.
  return msg;
}

// Parsea el cuerpo de error de FastAPI a (mensaje legible, errores por campo).
function parseErrorBody(
  status: number,
  body: unknown,
): { message: string; fieldErrors: Record<string, string> } {
  const fieldErrors: Record<string, string> = {};
  const detail = (body as { detail?: unknown })?.detail;

  // El backend puede enviar un mapa campo -> mensaje ya traducido.
  const backendFieldErrors = (body as { field_errors?: Record<string, string> })
    ?.field_errors;
  if (backendFieldErrors && typeof backendFieldErrors === "object") {
    Object.assign(fieldErrors, backendFieldErrors);
  }

  // 422: detail es un array de errores de validación de Pydantic.
  if (Array.isArray(detail)) {
    const partes: string[] = [];
    for (const item of detail as ValidationDetail[]) {
      const loc = item.loc ?? [];
      // El primer segmento suele ser "body"; el campo real es el último.
      const campo = String(loc[loc.length - 1] ?? "");
      const mensaje = traducirMensaje(item);
      if (campo && campo !== "body") {
        fieldErrors[campo] = mensaje;
        partes.push(`${campo}: ${mensaje}`);
      } else {
        partes.push(mensaje);
      }
    }
    return {
      message: partes.join(". ") || "Los datos enviados no son válidos",
      fieldErrors,
    };
  }

  // detail string (errores de negocio, p.ej. 409/400/404).
  if (typeof detail === "string") {
    return { message: detail, fieldErrors };
  }

  // Sin formato conocido.
  return {
    message: typeof body === "string" ? body : `Error ${status}`,
    fieldErrors,
  };
}

async function buildApiError(response: Response): Promise<ApiError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    const text = await response.text().catch(() => "");
    return new ApiError(response.status, text || `Error ${response.status}`);
  }
  const { message, fieldErrors } = parseErrorBody(response.status, body);
  return new ApiError(response.status, message, fieldErrors);
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
    throw await buildApiError(response);
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
    throw await buildApiError(response);
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
