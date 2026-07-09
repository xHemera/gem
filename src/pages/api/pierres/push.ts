import type { APIRoute } from 'astro';
import { dump } from 'js-yaml';
import { getDraftStore, slugify } from '../../../lib/drafts';
import { commitFiles, readFileContent } from '../../../lib/github';

export const POST: APIRoute = async () => {
  const store = getDraftStore();
  const drafts = await store.list();

  if (drafts.length === 0) {
    return new Response('Aucun brouillon', { status: 400 });
  }

  const files: { path: string; content: string }[] = [];
  const usedIds = new Set<string>();

  for (const draft of drafts) {
    const stoneId = draft.existingStoneId ?? slugify(draft.nom);
    let finalId = stoneId;
    let counter = 1;
    while (usedIds.has(finalId)) {
      finalId = `${stoneId}-${counter}`;
      counter++;
    }
    usedIds.add(finalId);

    const allPhotos = [...draft.existingPhotoNames, ...draft.newPhotoNames];

    const data: Record<string, unknown> = {
      nom: draft.nom,
      origine: draft.origine || undefined,
      description: draft.description || undefined,
      photos: allPhotos.length > 0 ? allPhotos : undefined,
    };

    const ymlContent = dump(data, { indent: 2, lineWidth: -1, noRefs: true });
    files.push({
      path: `src/data/pierres/${finalId}.yml`,
      content: Buffer.from(ymlContent).toString('base64'),
    });

    for (const photoName of draft.newPhotoNames) {
      const photoData = await store.getPhoto(draft.localId, photoName);
      if (photoData) {
        files.push({
          path: `public/images/pierres/${finalId}/${photoName}`,
          content: readFileContent(photoData),
        });
      }
    }
  }

  const names = drafts.map((d) => d.nom).join(', ');
  await commitFiles(files, `Mise à jour : ${names}`);

  await store.clear();

  return new Response(null, { status: 200 });
};
