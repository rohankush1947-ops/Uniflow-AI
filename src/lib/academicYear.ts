/**
 * Academic Year parsing and formatting utilities for UniFlow AI.
 * Supabase applications and students tables store year as an integer (1, 2, 3, 4).
 */

/**
 * Converts any academic year representation (e.g. "1st Year", "1st Year (B.Tech)", "Year 2", "3", 3)
 * into a valid integer (1, 2, 3, 4, etc.).
 * Returns null if the value is empty or cannot be parsed into a positive integer.
 */
export function parseAcademicYearToInteger(val: string | number | null | undefined): number | null {
  if (val === null || val === undefined) return null;

  if (typeof val === 'number') {
    return Number.isInteger(val) && val > 0 ? val : null;
  }

  const str = String(val).trim();
  if (!str) return null;

  // Direct integer check (e.g. "1", "2", "3", "4")
  const directNum = parseInt(str, 10);
  if (!isNaN(directNum) && directNum > 0 && String(directNum) === str) {
    return directNum;
  }

  // Ordinal and standard patterns: "1st Year", "2nd Year", "3rd Year", "4th Year", "Year 1", etc.
  const match =
    str.match(/\b([1-9])(?:st|nd|rd|th)?\s*year/i) ||
    str.match(/\byear\s*([1-9])\b/i) ||
    str.match(/\b([1-9])\b/);

  if (match) {
    const parsed = parseInt(match[1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // Handle Ph.D. / Research Scholar if selected (defaults to 5)
  if (/research|ph\.?d/i.test(str)) {
    return 5;
  }

  return null;
}

/**
 * Formats a numeric or textual year into standard UI display label.
 */
export function formatAcademicYearDisplay(year: number | string | null | undefined): string {
  if (year === null || year === undefined) return 'N/A';
  const parsed = parseAcademicYearToInteger(year);
  switch (parsed) {
    case 1:
      return '1st Year (B.Tech)';
    case 2:
      return '2nd Year (B.Tech)';
    case 3:
      return '3rd Year (B.Tech)';
    case 4:
      return '4th Year (B.Tech)';
    case 5:
      return 'Research Scholar (Ph.D.)';
    default:
      return typeof year === 'string' && year.trim() !== '' ? year : `Year ${year}`;
  }
}
