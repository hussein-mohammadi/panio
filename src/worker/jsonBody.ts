import type { HonoRequest } from 'hono';

/** Parses a JSON request body, returning `{}` (cast to T, an all-optional shape by convention) on invalid/missing JSON. */
export async function readJsonBody<T>(req: HonoRequest): Promise<T> {
  try {
    return await req.json<T>();
  } catch {
    return {} as T;
  }
}
