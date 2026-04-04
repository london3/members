import { createClient, type Client, type InValue } from "@libsql/client";

let _client: Client | null = null;

export function getClient(): Client {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL || "file:./prisma/dev.db",
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return _client;
}

// Helper: SELECT single row
export async function dbGet<T>(sql: string, args: InValue[] = []): Promise<T | undefined> {
  const client = getClient();
  const result = await client.execute({ sql, args });
  if (result.rows.length === 0) return undefined;
  return result.rows[0] as unknown as T;
}

// Helper: SELECT multiple rows
export async function dbAll<T>(sql: string, args: InValue[] = []): Promise<T[]> {
  const client = getClient();
  const result = await client.execute({ sql, args });
  return result.rows as unknown as T[];
}

// Helper: INSERT/UPDATE/DELETE
export async function dbRun(sql: string, args: InValue[] = []) {
  const client = getClient();
  return client.execute({ sql, args });
}

// Helper to generate cuid-like IDs
export function generateId(): string {
  return (
    Date.now().toString(36) +
    Math.random().toString(36).substring(2, 10)
  );
}
