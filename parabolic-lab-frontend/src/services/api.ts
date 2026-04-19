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
  const url = `${API_URL}${endpoint}`;
  
  if (!API_URL) {
    throw new Error(
      "API_URL no está configurada. Verifica que NEXT_PUBLIC_API_URL esté definida en las variables de entorno."
    );
  }

  let response: Response;
  
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { [AUTH_HEADER]: token } : {}),
        ...headers,
      },
    });
  } catch (fetchError) {
    const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
    console.error(`Error de conexión a ${url}:`, errorMsg);
    throw new Error(`Fallo en la conexión al servidor: ${errorMsg}`);
  }

  if (!response.ok) {
    let errorDetail = `Error ${response.status}`;
    let responseBody = null;
    
    try {
      responseBody = await response.json();
      // FastAPI retorna los errores en 'detail'
      errorDetail = responseBody?.detail || JSON.stringify(responseBody);
    } catch {
      try {
        // Si no es JSON, intenta obtener el texto
        const text = await response.text();
        errorDetail = text || errorDetail;
      } catch {
        // Si falla todo, usa el mensaje genérico
      }
    }

    console.error(`Error en ${response.status} para ${url}:`, {
      status: response.status,
      statusText: response.statusText,
      detail: errorDetail,
      body: responseBody,
    });

    throw new Error(`${response.status} - ${errorDetail}`);
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

/**
 * Descarga un archivo (PDF, CSV, etc.) y lo guarda localmente.
 * Maneja correctamente el header de autenticación x-stack-access-token.
 * 
 * @param endpoint - El endpoint de la API a llamar
 * @param token - El token de autenticación
 * @param filename - El nombre del archivo a descargar
 */
export async function downloadReport(
  endpoint: string,
  token: string,
  filename: string
): Promise<void> {
  const url = `${API_URL}${endpoint}`;

  if (!API_URL) {
    throw new Error(
      "API_URL no está configurada. Verifica que NEXT_PUBLIC_API_URL esté definida en las variables de entorno."
    );
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        [AUTH_HEADER]: token,
      },
    });

    if (!response.ok) {
      let errorDetail = `Error ${response.status}`;
      try {
        const errorBody = await response.json();
        errorDetail = errorBody?.detail || JSON.stringify(errorBody);
      } catch {
        try {
          const text = await response.text();
          errorDetail = text || errorDetail;
        } catch {
          // Si falla todo, usa el mensaje genérico
        }
      }
      throw new Error(`${response.status} - ${errorDetail}`);
    }

    // Obtener el blob del response
    const blob = await response.blob();

    // Crear un objeto URL para descargar el archivo
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (fetchError) {
    const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
    console.error(`Error descargando reporte desde ${url}:`, errorMsg);
    throw new Error(`Fallo al descargar el reporte: ${errorMsg}`);
  }
}
