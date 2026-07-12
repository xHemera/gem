import type { APIRoute } from 'astro';
import { getDraftStore } from '../../lib/drafts';

export const GET: APIRoute = async () => {
  const store = await getDraftStore();
  const drafts = await store.list();
  const body = drafts.map((d) => ({
    localId: d.localId,
    type: d.type,
    nom: d.nom,
    origine: d.origine,
    description: d.description,
    existingPhotoNames: d.existingPhotoNames,
    newPhotoNames: d.newPhotoNames,
    existingStoneId: d.existingStoneId,
  }));
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
  });
};
