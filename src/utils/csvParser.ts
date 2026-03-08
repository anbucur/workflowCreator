/**
 * Simple CSV/TSV parser that converts tabular data to a markdown table
 * for AI consumption. No external dependencies needed.
 */

interface CsvParseResult {
  headers: string[];
  rows: string[][];
  rowCount: number;
  columnCount: number;
  markdown: string;
}

/**
 * Detect the delimiter used in CSV/TSV content.
 * Checks first line for tabs vs commas.
 */
function detectDelimiter(content: string): string {
  const firstLine = content.split('\n')[0] || '';
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  return tabCount > commaCount ? '\t' : ',';
}

/**
 * Parse a single CSV line, handling quoted fields with commas inside.
 */
function parseLine(line: string, delimiter: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Parse CSV/TSV content into structured data and a markdown table.
 * Limits to first 100 rows to keep token budget reasonable.
 */
export function parseCsv(content: string): CsvParseResult {
  const delimiter = detectDelimiter(content);
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [], rowCount: 0, columnCount: 0, markdown: '_Empty file_' };
  }

  const headers = parseLine(lines[0], delimiter);
  const maxRows = Math.min(lines.length - 1, 100);
  const rows: string[][] = [];

  for (let i = 1; i <= maxRows; i++) {
    rows.push(parseLine(lines[i], delimiter));
  }

  // Build markdown table
  const mdLines: string[] = [];
  mdLines.push(`| ${headers.join(' | ')} |`);
  mdLines.push(`| ${headers.map(() => '---').join(' | ')} |`);
  for (const row of rows) {
    // Pad row to match header count
    while (row.length < headers.length) row.push('');
    mdLines.push(`| ${row.slice(0, headers.length).join(' | ')} |`);
  }

  const truncatedNote = lines.length - 1 > maxRows
    ? `\n\n_Showing first ${maxRows} of ${lines.length - 1} rows._`
    : '';

  return {
    headers,
    rows,
    rowCount: lines.length - 1,
    columnCount: headers.length,
    markdown: mdLines.join('\n') + truncatedNote,
  };
}

/**
 * Format file size in human-readable form.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
