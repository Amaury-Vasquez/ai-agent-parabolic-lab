/**
 * Normalizes a string by removing accents and converting to lowercase
 * @param str - The string to normalize
 * @returns Normalized string without accents in lowercase
 */
export const normalizeString = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

/**
 * Checks if a text includes a search term, ignoring accents and case
 * @param text - The text to search in
 * @param searchTerm - The term to search for
 * @returns True if the search term is found (ignoring accents and case)
 */
export const searchIgnoreAccents = (
  text: string,
  searchTerm: string
): boolean => {
  return normalizeString(text).includes(normalizeString(searchTerm));
};
