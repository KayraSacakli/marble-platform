import { prisma } from '@/lib/prisma';

/** Shared audit writer for admin mutations. Never pass secrets. */
export async function writeAudit(
  actorId: string,
  action: string,
  contentItemId: string | null,
  details: Record<string, unknown>,
): Promise<void> {
  await prisma.auditEvent.create({
    data: {
      actorId,
      action,
      contentItemId,
      details: JSON.stringify(details),
    },
  });
}
