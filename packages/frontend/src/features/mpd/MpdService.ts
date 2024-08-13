export type MpdVersion = string;

export interface MpdService {
  pingMpd: (host: string, port: number) => Promise<MpdVersion>;
}
