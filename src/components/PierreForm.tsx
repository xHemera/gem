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
    <form onSubmit={handleSubmit} class="mx-auto max-w-lg space-y-5">
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Nom *</legend>
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          class="input w-full"
          placeholder="Ex: Rubis"
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Origine</legend>
        <input
          type="text"
          value={origine}
          onChange={(e) => setOrigine(e.target.value)}
          class="input w-full"
          placeholder="Ex: Birmanie"
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Description</legend>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          class="textarea w-full"
          placeholder="Description de la pierre…"
        />
      </fieldset>

      <fieldset class="fieldset">
        <legend class="fieldset-legend">Photos</legend>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          class="file-input w-full"
        />

        {existingPhotos.length > 0 && (
          <div class="mt-3">
            <p class="mb-2 text-xs text-base-content/50">Photos existantes :</p>
            <div class="flex flex-wrap gap-2">
              {existingPhotos.map((photo, i) => (
                <img
                  key={i}
                  src={`/images/pierres/${initialData?.id}/${photo}`}
                  alt=""
                  class="size-20 rounded-box object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <div class="mt-3">
            <p class="mb-2 text-xs text-base-content/50">Nouvelles photos :</p>
            <div class="flex flex-wrap gap-2">
              {photos.map((p, i) => (
                <div key={i} class="relative">
                  <img src={p.url} alt="" class="size-20 rounded-box object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    class="btn btn-circle btn-xs btn-error absolute -top-1 -right-1 text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </fieldset>

      <button
        type="submit"
        disabled={submitting}
        class="btn btn-primary btn-block"
      >
        {submitting ? (
          <span class="loading loading-spinner"></span>
        ) : initialData?.id ? (
          'Enregistrer'
        ) : (
          'Créer'
        )}
      </button>
    </form>
  );
}
