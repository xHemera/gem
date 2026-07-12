import { useState, useRef } from 'react';

interface PhotoPreview {
  file: File;
  url: string;
}

const MAX_DIM = 1920;
const JPEG_QUALITY = 0.8;

function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const name = file.name.replace(/\.[^.]+$/, '.jpg');
            resolve(new File([blob], name, { type: 'image/jpeg' }));
          } else {
            reject(new Error('Échec de la compression'));
          }
        },
        'image/jpeg',
        JPEG_QUALITY,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Impossible de charger l\'image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

interface Props {
  initialData?: {
    localId?: string;
    id?: string;
    nom?: string;
    origine?: string;
    description?: string;
    photos?: string[];
    newPhotoNames?: string[];
  };
  onSaved?: () => void;
}

export default function PierreForm({ initialData, onSaved }: Props) {
  const [nom, setNom] = useState(initialData?.nom ?? '');
  const [origine, setOrigine] = useState(initialData?.origine ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [committedPhotos, setCommittedPhotos] = useState<string[]>(initialData?.photos ?? []);
  const [draftPhotos, setDraftPhotos] = useState<string[]>(initialData?.newPhotoNames ?? []);
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<PhotoPreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const previews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setNewPhotoPreviews((prev) => [...prev, ...previews]);
  }

  function removeNewPhoto(index: number) {
    setNewPhotoPreviews((prev) => {
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

    committedPhotos.forEach((name) => formData.append('committedPhotos', name));
    draftPhotos.forEach((name) => formData.append('draftPhotos', name));
    for (const p of newPhotoPreviews) {
      const compressed = await compressImage(p.file);
      formData.append('photos', compressed);
    }

    if (initialData?.localId) formData.append('localId', initialData.localId);
    if (initialData?.id) formData.append('id', initialData.id);

    try {
      const res = await fetch('/api/pierres', { method: 'POST', body: formData });
      if (res.ok) {
        onSaved?.();
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
          capture="environment"
          multiple
          onChange={handleFileChange}
          class="file-input w-full"
        />

        <div class="flex flex-wrap gap-2 mt-3">
          {committedPhotos.map((name) => (
            <div key={name} class="relative group">
              <img
                src={`/images/pierres/${initialData?.id}/${name}`}
                alt=""
                class="size-20 rounded-box object-cover"
              />
              <button
                type="button"
                onClick={() => setCommittedPhotos((prev) => prev.filter((p) => p !== name))}
                class="btn btn-circle btn-xs btn-error absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          {draftPhotos.map((name, i) => (
            <div key={name} class="relative group">
              <img
                src={`/api/drafts/${initialData?.localId}/photos/${name}`}
                alt=""
                class="size-20 rounded-box object-cover"
              />
              <button
                type="button"
                onClick={() => setDraftPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                class="btn btn-circle btn-xs btn-error absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          {newPhotoPreviews.map((p, i) => (
            <div key={i} class="relative group">
              <img src={p.url} alt="" class="size-20 rounded-box object-cover" />
              <button
                type="button"
                onClick={() => removeNewPhoto(i)}
                class="btn btn-circle btn-xs btn-error absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </fieldset>

      <button type="submit" disabled={submitting} class="btn btn-primary btn-block">
        {submitting ? (
          <span class="loading loading-spinner"></span>
        ) : initialData?.id || initialData?.localId ? (
          'Enregistrer le brouillon'
        ) : (
          'Créer le brouillon'
        )}
      </button>
    </form>
  );
}
