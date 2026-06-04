export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidSnowflake(id: string): boolean {
  return /^\d{17,19}$/.test(id);
}

export function isValidHexColor(color: string): boolean {
  return /^#?([0-9A-F]{3}){1,2}$/i.test(color);
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/`/g, '\\`')
    .trim();
}

export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function escapeMarkdown(text: string): string {
  return text.replace(/([*_`~|\\])/g, '\\$1');
}

export function codeBlock(code: string, language: string = ''): string {
  return `\`\`\`${language}\n${code}\n\`\`\``;
}

export function inlineCode(text: string): string {
  return `\`${text}\``;
}
