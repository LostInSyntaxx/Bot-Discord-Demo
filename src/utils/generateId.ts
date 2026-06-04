export function generateId(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateSnowflake(): string {
  const timestamp = Date.now() - 1420070400000; // Discord epoch
  const workerId = Math.floor(Math.random() * 32);
  const processId = Math.floor(Math.random() * 32);
  const increment = Math.floor(Math.random() * 4096);

  return (
    (BigInt(timestamp) << 22n) |
    (BigInt(workerId) << 17n) |
    (BigInt(processId) << 12n) |
    BigInt(increment)
  ).toString();
}

export function generateCustomId(prefix: string, ...parts: string[]): string {
  return [prefix, ...parts].join(':');
}
