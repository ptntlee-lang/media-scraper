/**
 * Utility function to format dates
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

/**
 * Utility function to truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Utility function to validate URLs
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Utility function to parse URLs from text
 */
export function parseUrls(text: string): string[] {
  return text
    .split('\n')
    .map(url => url.trim())
    .filter(url => url.length > 0 && isValidUrl(url));
}

/**
 * Utility to get hostname from URL
 */
export function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
