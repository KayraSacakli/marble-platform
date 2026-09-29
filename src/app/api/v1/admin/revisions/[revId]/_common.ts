import { z } from 'zod';
import { BadRequestError, ValidationError } from '@/lib/api/errors';

const revParam = z.string().uuid('Invalid revision id.');

export function parseRevisionId(id: string): string {
  const parsed = revParam.safeParse(id);
  if (!parsed.success) throw new BadRequestError('Invalid revision id.');
  return parsed.data;
}

export async function readJsonBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const text = await req.text();
    if (!text.trim()) return {};
    const body = JSON.parse(text);
    return ((body ?? {}) as Record<string, unknown>);
  } catch {
    throw new ValidationError('Invalid JSON body', []);
  }
}
