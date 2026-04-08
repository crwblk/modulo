/**
 * Extract a string parameter from Express params object
 * Handles both string and string[] types from Express routing
 */
export const getParam = (
  params: Record<string, string | string[]>,
  name: string,
): string => {
  const value = params[name];
  return Array.isArray(value) ? value[0] : value;
};
