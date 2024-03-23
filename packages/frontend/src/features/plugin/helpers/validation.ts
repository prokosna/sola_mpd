export function validateIpAndPort(input: string): boolean {
  const pattern = /^([^:]+):(\d+)$/;
  const match = input.match(pattern);
  if (match) {
    const port = parseInt(match[2], 10);
    return port >= 0 && port <= 65535;
  }
  return false;
}
