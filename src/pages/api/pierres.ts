import type { APIRoute } from 'astro';
import { verifySession } from '../../lib/auth';
import { commitFiles, readFileContent } from '../../lib/github';
import { dump } from 'js-yaml';

export const POST: APIRoute = async ({ request }) => {
  const isAuth = verifySession(request.headers.get('cookie'));
  if (!isAuth) {
    return new Response('Non autorisé', { status: 401 });
  }

  const formData = await request.formData();
  const nom = formData.get('nom') as string | null;
  const origine = formData.get('origine') as string | null;
  const description = formData.get('description') as string | null;
  const existingId = formData.get('id') as string | null;
  const existingPhotos = formData.getAll('existingPhotos') as string[];
  const photoFiles = formData.getAll('photos') as File[];

  if (!nom?.trim()) {
    return new Response('Le nom est requis', { status: 400 });
  }

  const id = existingId ?? slugify(nom);

  const photoEntries: { filename: string; content: string }[] = [];
  const newPhotoNames: string[] = [];

  for (const file of photoFiles) {
    if (file.size === 0) continue;
    const ext = file.name.split('.').pop() ?? 'jpg';
    const filename = `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
    const buffer = await file.arrayBuffer();
    const content = readFileContent(buffer);
    photoEntries.push({ filename, content });
    newPhotoNames.push(filename);
  }

  const allPhotos = [
    ...existingPhotos.filter(Boolean),
    ...newPhotoNames,
  ];

  const data: Record<string, unknown> = {
    nom: nom.trim(),
    origine: origine?.trim() || undefined,
    description: description?.trim() || undefined,
    photos: allPhotos.length > 0 ? allPhotos : undefined,
  };

  const ymlContent = dump(data, { indent: 2, lineWidth: -1, noRefs: true });
  const files = [
    {
      path: `src/data/pierres/${id}.yml`,
      content: Buffer.from(ymlContent).toString('base64'),
    },
    ...photoEntries.map((p) => ({
      path: `public/images/pierres/${id}/${p.filename}`,
      content: p.content,
    })),
  ];

  const isNew = !existingId;
  try {
    await commitFiles(files, isNew ? `Ajout de ${nom}` : `Modification de ${nom}`);
  } catch (err) {
    console.error(err);
    return new Response('Erreur lors du commit GitHub', { status: 500 });
  }

  return new Response(null, { status: 200 });
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
