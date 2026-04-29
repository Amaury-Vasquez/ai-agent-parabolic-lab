const READ_ONLY_FIELDS = new Set(["fechacreacion", "fechamodificacion"]);

export function sanitizeData<T extends Record<string, unknown>>(
  data: T,
): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const [key, value] of Object.entries(data)) {
    if (READ_ONLY_FIELDS.has(key)) continue;
    if (value === undefined || value === null) continue;
    if (typeof value === "function") continue;
    (sanitized[key as keyof T] as unknown) = value;
  }

  return sanitized;
}
