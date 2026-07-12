import type { APIRoute } from 'astro';
import { getDraftStore } from '../../../../../lib/drafts';

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};

export const GET: APIRoute = async ({ params }) => {
  const { localId, filename } = params;
  if (!localId || !filename) return new Response('Not found', { status: 404 });

  const store = await getDraftStore();
  const data = await store.getPhoto(localId, filename);
  if (!data) return new Response('Not found', { status: 404 });

  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const contentType = MIME[ext] ?? 'application/octet-stream';

  return new Response(data, {
    headers: { 'Content-Type': contentType, 'Cache-Control': 'no-store' },
  });
};
