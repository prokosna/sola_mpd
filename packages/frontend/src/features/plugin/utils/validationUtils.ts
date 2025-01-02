/**
 * Validates a string representing an IP address and port combination.
 *
 * This function performs validation by:
 * 1. Checking the string format (IP:PORT)
 * 2. Validating port number range (0-65535)
 * 3. Ensuring IP part doesn't contain colons
 *
 * Format Rules:
 * - IP: Any string without colons (IPv4, IPv6, hostname)
 * - Port: Number between 0 and 65535
 * - Separator: Single colon (:)
 *
 * Common Use Cases:
 * - Plugin server address validation
 * - Network configuration validation
 * - User input validation
 *
 * Example Valid Inputs:
 * - "localhost:8080"
 * - "192.168.1.1:443"
 * - "my-server:1234"
 *
 * Example Invalid Inputs:
 * - "localhost" (no port)
 * - "127.0.0.1:" (empty port)
 * - "server:70000" (port out of range)
 *
 * @param input String to validate in format "IP:PORT"
 * @returns true if format and values are valid, false otherwise
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
