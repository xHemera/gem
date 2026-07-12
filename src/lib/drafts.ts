import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync, rmSync, statSync } from 'fs';
import { join } from 'path';

export interface Draft {
  localId: string;
  type: 'create' | 'edit';
  nom: string;
  origine?: string;
  description?: string;
  existingPhotoNames: string[];
  newPhotoNames: string[];
  existingStoneId?: string;
}

export interface DraftStore {
  list(): Promise<Draft[]>;
  get(localId: string): Promise<Draft | null>;
  save(draft: Draft): Promise<void>;
  delete(localId: string): Promise<void>;
  clear(): Promise<void>;
  savePhoto(localId: string, filename: string, data: ArrayBuffer): Promise<void>;
  getPhoto(localId: string, filename: string): Promise<ArrayBuffer | null>;
}

function createLocalStore(): DraftStore {
  const dir = join(process.cwd(), '.drafts');

  function ensure() {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  }

  return {
    async list() {
      ensure();
      return readdirSync(dir)
        .filter((f) => f.endsWith('.json'))
        .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf-8')) as Draft);
    },

    async get(localId: string) {
      ensure();
      const p = join(dir, `${localId}.json`);
      return existsSync(p) ? (JSON.parse(readFileSync(p, 'utf-8')) as Draft) : null;
    },

    async save(draft: Draft) {
      ensure();
      writeFileSync(join(dir, `${draft.localId}.json`), JSON.stringify(draft, null, 2), 'utf-8');
    },

    async delete(localId: string) {
      ensure();
      const p = join(dir, `${localId}.json`);
      if (existsSync(p)) unlinkSync(p);
      const photoDir = join(dir, localId);
      if (existsSync(photoDir)) rmSync(photoDir, { recursive: true, force: true });
    },

    async clear() {
      ensure();
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        statSync(p).isDirectory() ? rmSync(p, { recursive: true, force: true }) : unlinkSync(p);
      }
    },

    async savePhoto(localId: string, filename: string, data: ArrayBuffer) {
      ensure();
      const d = join(dir, localId);
      if (!existsSync(d)) mkdirSync(d, { recursive: true });
      writeFileSync(join(d, filename), Buffer.from(data));
    },

    async getPhoto(localId: string, filename: string) {
      ensure();
      const p = join(dir, localId, filename);
      return existsSync(p) ? readFileSync(p).buffer as ArrayBuffer : null;
    },
  };
}

async function createNetlifyStore(): Promise<DraftStore> {
  const { getStore } = await import('@netlify/blobs');
  const store = getStore('pierre-drafts');

  return {
    async list() {
      const { blobs } = await store.list({ prefix: 'draft:' });
      const drafts: Draft[] = [];
      for (const blob of blobs) {
        const raw: string | null = await store.get(blob.key);
        if (raw) drafts.push(JSON.parse(raw));
      }
      return drafts;
    },

    async get(localId: string) {
      const raw: string | null = await store.get(`draft:${localId}`);
      return raw ? (JSON.parse(raw) as Draft) : null;
    },

    async save(draft: Draft) {
      await store.set(`draft:${draft.localId}`, JSON.stringify(draft));
    },

    async delete(localId: string) {
      const { blobs } = await store.list({ prefix: `draft:${localId}` });
      for (const blob of blobs) {
        await store.delete(blob.key);
      }
    },

    async clear() {
      const { blobs } = await store.list({ prefix: 'draft:' });
      for (const blob of blobs) {
        await store.delete(blob.key);
      }
    },

    async savePhoto(localId: string, filename: string, data: ArrayBuffer) {
      await store.set(`draft:${localId}:photo:${filename}`, data);
    },

    async getPhoto(localId: string, filename: string) {
      const data = await store.get(`draft:${localId}:photo:${filename}`, { type: 'arrayBuffer' });
      return data as ArrayBuffer | null;
    },
  };
}

let _instance: DraftStore | null = null;

export async function getDraftStore(): Promise<DraftStore> {
  if (!_instance) {
    _instance = process.env.NETLIFY
      ? await createNetlifyStore()
      : createLocalStore();
  }
  return _instance;
}

export function createLocalId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
