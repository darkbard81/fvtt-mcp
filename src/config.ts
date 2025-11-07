import 'dotenv/config';

const toInt = (v: string | undefined, d: number) =>
  v ? Number.parseInt(v, 10) : d;

export const cfg = {
  HOST: process.env.WS_HOST ?? '0.0.0.0',
  PORT: toInt(process.env.WS_PORT, 3010),
  WS_PATH: process.env.WS_PATH ?? '/relay',
  MCP_PATH: process.env.MCP_PATH ?? '/sse',
  API_KEY: process.env.MCP_SERVER_API_KEY,
  PING_INTERVAL_MS: toInt(process.env.PING_INTERVAL_MS, 20_000)
} as const;
