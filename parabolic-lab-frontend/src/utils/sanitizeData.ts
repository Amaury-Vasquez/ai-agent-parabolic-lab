/**
 * Sanitiza un objeto eliminando valores undefined, null, y campos de fecha
 * para evitar problemas de serialización con el backend
 */
export function sanitizeData<T extends Record<string, unknown>>(data: T): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const [key, value] of Object.entries(data)) {
    // Excluir explícitamente campos de fecha que no deben ser enviados
    if (key === "fechacreacion" || key === "fechamodificacion") {
      continue;
    }

    // Excluir undefined y null en el nivel superior
    if (value === undefined || value === null) {
      continue;
    }

    // Si es un objeto (pero no es una función), incluirlo
    if (typeof value === "object" && !(value instanceof Date)) {
      (sanitized[key as keyof T] as unknown) = value;
    } else if (typeof value !== "function") {
      // Incluir primitivos (strings, numbers, booleans, etc.)
      (sanitized[key as keyof T] as unknown) = value;
    }
  }

  return sanitized;
}

/**
 * Serializa datos para JSON, manejando tipos especiales como Date
 * Registra cualquier campo de fecha encontrado para debugging
 */
export function serializeForAPI<T extends Record<string, unknown>>(
  data: T
): Record<string, unknown> {
  const serialized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      console.warn(
        `Campo de fecha detectado en datos a enviar: ${key}. Este campo será ignorado.`
      );
      continue;
    }

    if (value !== undefined && value !== null) {
      serialized[key] = value;
    }
  }

  return serialized;
}
