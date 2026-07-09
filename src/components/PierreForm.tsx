import { useState, useRef } from 'react';

interface PhotoPreview {
  file: File;
  url: string;
}

interface Props {
  initialData?: {
    id?: string;
    nom?: string;
    origine?: string;
    description?: string;
    photos?: string[];
  };
}

export default function PierreForm({ initialData }: Props) {
  const [nom, setNom] = useState(initialData?.nom ?? '');
  const [origine, setOrigine] = useState(initialData?.origine ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [photos, setPhotos] = useState<PhotoPreview[]>([]);
  const [existingPhotos] = useState<string[]>(initialData?.photos ?? []);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const previews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...previews]);
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nom.trim() || submitting) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append('nom', nom.trim());
    if (origine.trim()) formData.append('origine', origine.trim());
    if (description.trim()) formData.append('description', description.trim());
    if (initialData?.id) formData.append('id', initialData.id);
    photos.forEach((p) => formData.append('photos', p.file));
    existingPhotos.forEach((name) => formData.append('existingPhotos', name));

    try {
      const res = await fetch('/api/pierres', { method: 'POST', body: formData });
      if (res.ok) {
        window.location.href = '/';
      } else {
        const err = await res.text();
        alert(`Erreur : ${err}`);
      }
    } catch {
      alert('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} class="mx-auto max-w-lg space-y-6">
      <div>
        <label for="nom" class="mb-2 block text-sm text-text-secondary">
          Nom *
        </label>
        <input
          id="nom"
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          class="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary outline-none transition-colors focus:border-accent"
        />
      </div>

      <div>
        <label for="origine" class="mb-2 block text-sm text-text-secondary">
          Origine
        </label>
        <input
          id="origine"
          type="text"
          value={origine}
          onChange={(e) => setOrigine(e.target.value)}
          class="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary outline-none transition-colors focus:border-accent"
        />
      </div>

      <div>
        <label for="description" class="mb-2 block text-sm text-text-secondary">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          class="w-full rounded-lg border border-border bg-background px-4 py-2 text-text-primary outline-none transition-colors focus:border-accent resize-y"
        />
      </div>

      <div>
        <label class="mb-2 block text-sm text-text-secondary">Photos</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          class="w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-surface file:px-4 file:py-2 file:text-sm file:text-text-primary file:cursor-pointer hover:file:bg-surface-hover"
        />

        {existingPhotos.length > 0 && (
          <div class="mt-3">
            <p class="mb-2 text-xs text-text-secondary">Photos existantes :</p>
            <div class="flex flex-wrap gap-2">
              {existingPhotos.map((photo, i) => (
                <div key={i} class="relative">
                  <img
                    src={`/images/pierres/${initialData?.id}/${photo}`}
                    alt=""
                    class="size-20 rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <div class="mt-3">
            <p class="mb-2 text-xs text-text-secondary">Nouvelles photos :</p>
            <div class="flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={i} class="relative">
                  <img src={p.url} alt="" class="size-20 rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    class="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        class="w-full rounded-lg bg-accent px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? 'Enregistrement…' : initialData?.id ? 'Enregistrer' : 'Créer'}
      </button>
    </form>
  );
}
