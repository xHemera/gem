import type { APIRoute } from 'astro';
import { dump } from 'js-yaml';
import { getDraftStore, slugify } from '../../../lib/drafts';
import { commitFiles, readFileContent, getFileContent } from '../../../lib/github';

export const POST: APIRoute = async () => {
  try {
    const store = await getDraftStore();
    const drafts = await store.list();

    if (drafts.length === 0) {
      return new Response('Aucun brouillon', { status: 400 });
    }

    const files: { path: string; content?: string }[] = [];
    const usedIds = new Set<string>();
    const names: string[] = [];

    for (const draft of drafts) {
      if (draft.type === 'delete') {
        const stoneId = draft.existingStoneId;
        if (!stoneId) continue;
        usedIds.add(stoneId);
        names.push(`Suppression: ${draft.nom}`);

        files.push({ path: `src/data/pierres/${stoneId}.yml` });

        for (const photo of draft.existingPhotoNames) {
          files.push({ path: `public/images/pierres/${stoneId}/${photo}` });
        }
        continue;
      }

      const stoneId = draft.existingStoneId ?? slugify(draft.nom);
      let finalId = stoneId;
      let counter = 1;
      while (usedIds.has(finalId)) {
        finalId = `${stoneId}-${counter}`;
        counter++;
      }
      usedIds.add(finalId);
      names.push(draft.nom);

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

    // Auto-versioning
    const versionRaw = await getFileContent('src/data/version.json');
    const currentVersion = versionRaw ? JSON.parse(versionRaw).version : 0;
    const nextVersion = currentVersion + 1;
    files.push({
      path: 'src/data/version.json',
      content: Buffer.from(JSON.stringify({ version: nextVersion })).toString('base64'),
    });

    const message = `Mise à jour : ${names.join(', ')} (v${nextVersion})`;
    await commitFiles(files, message);

    await store.clear();

    return new Response(null, { status: 200 });
  } catch (err) {
    console.error('Erreur push:', err);
    return new Response(
      err instanceof Error ? err.message : 'Erreur interne lors du push',
      { status: 500 },
    );
  }
};
