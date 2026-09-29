import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

// ============================================================
// Media storage abstraction (provider-independent)
//
// The domain model (MediaAsset/ContentMedia) never touches the
// filesystem directly — it goes through this interface, so a future
// S3/Supabase/R2 provider only needs to implement MediaStorage.
// ============================================================

export interface StoredObject {
  /** Opaque storage key, e.g. "9f3c….png". Never a user path. */
  key: string;
  size: number;
}

export interface MediaStorage {
  save(data: Buffer, extension: string): Promise<StoredObject>;
  read(key: string): Promise<Buffer>;
  remove(key: string): Promise<void>;
}

const KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{3,4}$/;
const EXT_PATTERN = /^[a-z0-9]{3,4}$/;

export function assertSafeKey(key: string): void {
  if (!KEY_PATTERN.test(key)) {
    throw new Error('Invalid storage key.');
  }
}

export function storageRoot(): string {
  return process.env.MEDIA_STORAGE_DIR ?? path.join(process.cwd(), 'storage', 'uploads');
}

export class LocalMediaStorage implements MediaStorage {
  private readonly root: string;

  constructor(root: string = storageRoot()) {
    // Normalize once so the containment check below is reliable.
    this.root = path.resolve(root);
  }

  private resolve(key: string): string {
    assertSafeKey(key);
    const resolved = path.resolve(this.root, key);
    // Defense in depth: the resolved path must stay inside the root,
    // even though generated keys can never contain separators.
    if (!resolved.startsWith(this.root + path.sep)) {
      throw new Error('Storage path escapes the media root.');
    }
    return resolved;
  }

  async save(data: Buffer, extension: string): Promise<StoredObject> {
    if (!EXT_PATTERN.test(extension)) {
      throw new Error('Invalid file extension.');
    }
    await fs.mkdir(this.root, { recursive: true });
    const key = `${randomUUID()}.${extension}`;
    await fs.writeFile(this.resolve(key), data);
    return { key, size: data.length };
  }

  async read(key: string): Promise<Buffer> {
    return fs.readFile(this.resolve(key));
  }

  async remove(key: string): Promise<void> {
    try {
      await fs.unlink(this.resolve(key));
    } catch (error) {
      // Deleting a missing file is a no-op for idempotency.
      if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

let singleton: MediaStorage | null = null;

/** Process-wide storage singleton (overridable in tests). */
export function getMediaStorage(): MediaStorage {
  if (!singleton) {
    singleton = new LocalMediaStorage();
  }
  return singleton;
}

export function setMediaStorage(storage: MediaStorage | null): void {
  singleton = storage;
}

// Public URL prefix for managed uploads, e.g. "/api/media/<key>".
// MediaAsset.sourceReference stores the full public URL.
export const MEDIA_PUBLIC_PREFIX = '/api/media/';
