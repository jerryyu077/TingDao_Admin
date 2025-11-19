/**
 * Utility helper functions
 */

/**
 * Generate a unique ID with prefix
 * @param {string} prefix - ID prefix (e.g., 'user', 'sermon', 'rst')
 * @returns {string} - Unique ID
 */
export function generateId(prefix = 'id') {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${prefix}-${timestamp}-${randomStr}`;
}

