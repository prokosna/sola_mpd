/**
 * Validates if the input string is in the format of IP:PORT.
 * The IP can be any string without a colon, and the port must be a number between 0 and 65535.
 * @param input - The string to validate, expected to be in the format "IP:PORT"
 * @returns True if the input is valid, false otherwise
 */
export function validateIpAndPort(input: string): boolean {
  const pattern = /^([^:]+):(\d+)$/;
  const match = input.match(pattern);
  if (match) {
    const port = parseInt(match[2], 10);
    return port >= 0 && port <= 65535;
  }
  return false;
}
