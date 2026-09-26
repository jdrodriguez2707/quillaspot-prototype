/**
 * Normaliza cadenas de texto en español eliminando acentos/tildes y convirtiendo a minúsculas
 * Ejemplo: "Gastronomía" -> "gastronomia", "Ciénaga" -> "cienaga"
 */
export const normalizeText = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};
