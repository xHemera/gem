import type { APIRoute } from 'astro';
import { getDraftStore, createLocalId, slugify } from '../../../lib/drafts';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const nom = formData.get('nom') as string | null;
    const origine = formData.get('origine') as string | null;
    const description = formData.get('description') as string | null;
    const existingStoneId = formData.get('id') as string | null;
    const committedPhotos = formData.getAll('committedPhotos') as string[];
    const draftPhotos = formData.getAll('draftPhotos') as string[];
    const photoFiles = formData.getAll('photos') as File[];
    const prevLocalId = formData.get('localId') as string | null;

    if (!nom?.trim()) {
      return new Response('Le nom est requis', { status: 400 });
    }

    const store = await getDraftStore();
    const localId = prevLocalId ?? createLocalId();

    const newPhotoNames: string[] = [];
    for (const file of photoFiles) {
      if (file.size === 0) continue;
      const ext = file.name.split('.').pop() ?? 'jpg';
      const filename = `${slugify(nom)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
      const buffer = await file.arrayBuffer();
      await store.savePhoto(localId, filename, buffer);
      newPhotoNames.push(filename);
    }

    const draft = {
      localId,
      type: (existingStoneId ? 'edit' : 'create') as 'edit' | 'create',
      nom: nom.trim(),
      origine: origine?.trim() || undefined,
      description: description?.trim() || undefined,
      existingPhotoNames: committedPhotos,
      newPhotoNames: [...draftPhotos, ...newPhotoNames],
      existingStoneId: existingStoneId || undefined,
    };

    await store.save(draft);

    return new Response(JSON.stringify({ localId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Erreur création brouillon:', err);
    return new Response(
      err instanceof Error ? err.message : 'Erreur interne',
      { status: 500 },
    );
  }
};
