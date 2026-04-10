/**
 * Extract a string parameter from Express params object
 * Handles both string and string[] types from Express routing
 * @throws {Error} if the parameter is not found
 */
export const getParam = (
  params: Record<string, string | string[] | undefined>,
  name: string,
): string => {
  const value = params[name];
  if (value === undefined || value === null) {
    throw new Error(`Parameter "${name}" not found`);
  }
  return Array.isArray(value) ? value[0] : value;
};
