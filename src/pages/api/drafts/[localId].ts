import type { APIRoute } from 'astro';
import { getDraftStore } from '../../../lib/drafts';

export const GET: APIRoute = async ({ params }) => {
  const { localId } = params;
  if (!localId) return new Response('Missing id', { status: 400 });

  const store = await getDraftStore();
  const draft = await store.get(localId);
  if (!draft) return new Response('Not found', { status: 404 });

  return new Response(JSON.stringify(draft), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ params }) => {
  const { localId } = params;
  if (!localId) return new Response('Missing id', { status: 400 });

  const store = await getDraftStore();
  await store.delete(localId);

  return new Response(null, { status: 204 });
};
