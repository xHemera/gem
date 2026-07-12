import type { APIRoute } from 'astro';
import { getDraftStore, createLocalId } from '../../../lib/drafts';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { id, nom, photos } = await request.json();

    if (!id || !nom) {
      return new Response('id et nom requis', { status: 400 });
    }

    const store = await getDraftStore();
    const localId = createLocalId();

    const draft = {
      localId,
      type: 'delete' as const,
      nom,
      origine: undefined as string | undefined,
      description: undefined as string | undefined,
      existingPhotoNames: (photos as string[]) ?? [],
      newPhotoNames: [] as string[],
      existingStoneId: id,
    };

    await store.save(draft);

    return new Response(JSON.stringify({ localId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Erreur suppression pierre:', err);
    return new Response(
      err instanceof Error ? err.message : 'Erreur interne',
      { status: 500 },
    );
  }
};
