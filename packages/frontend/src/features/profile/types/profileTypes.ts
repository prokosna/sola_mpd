/**
 * Input for MPD profile creation/update.
 *
 * Required fields:
 * - name: Profile identifier
 * - host: Server hostname/IP
 * - port: Server port
 */
export type ProfileInput = {
	name: string;
	host: string;
	port: number;
};
