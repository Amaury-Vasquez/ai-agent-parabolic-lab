/**
 * Valida si un string es un UUID válido en formato estándar
 * Soporta UUID v4 con y sin guiones
 */
export function isValidUUID(value: unknown): boolean {
  if (typeof value !== "string") {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Valida múltiples UUIDs
 */
export function areValidUUIDs(...values: unknown[]): boolean {
  return values.every(isValidUUID);
}
