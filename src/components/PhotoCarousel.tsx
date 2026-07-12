import { useEffect, useCallback, useState, useRef } from 'react';
import type { Pierre } from '../lib/pierres';

interface Props {
  pierre: Pierre;
  onClose: () => void;
  photoBaseUrl?: string;
}

export default function PhotoCarousel({ pierre, onClose, photoBaseUrl }: Props) {
  const photos = pierre.photos ?? [];
  const [index, setIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const baseUrl = photoBaseUrl ?? `/images/pierres/${pierre.id}`;

  const prev = useCallback(() => setIndex((i) => (i > 0 ? i - 1 : photos.length - 1)), [photos.length]);
  const next = useCallback(() => setIndex((i) => (i < photos.length - 1 ? i + 1 : 0)), [photos.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    },
    [prev, next],
  );

  useEffect(() => {
    dialogRef.current?.showModal();
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <dialog ref={dialogRef} class="modal" onClose={onClose}>
      <div class="modal-box max-w-3xl p-6">
        {photos.length > 0 ? (
          <div class="flex flex-col items-center gap-4">
            <div class="carousel w-full rounded-box">
              {photos.map((photo, i) => (
                <div key={i} class={`carousel-item w-full ${i === index ? '' : 'hidden'}`}>
                  <img
                    src={`${baseUrl}/${photo}?nf_resize=fit&w=1200`}
                    alt={`${pierre.nom} - ${i + 1}`}
                    loading={i === index ? 'eager' : 'lazy'}
                    decoding="async"
                    class="w-full max-h-[60vh] object-contain"
                  />
                </div>
              ))}
            </div>
            {photos.length > 1 && (
              <div class="flex items-center gap-4">
                <button onClick={prev} class="btn btn-circle btn-ghost btn-sm">←</button>
                <span class="text-sm text-base-content/60">{index + 1} / {photos.length}</span>
                <button onClick={next} class="btn btn-circle btn-ghost btn-sm">→</button>
              </div>
            )}
          </div>
        ) : (
          <p class="text-center text-base-content/60">Aucune photo</p>
        )}

        <div class="mt-6 text-center">
          <h2 class="text-xl font-bold">{pierre.nom}</h2>
          {pierre.origine && (
            <p class="mt-1 text-sm text-base-content/60">{pierre.origine}</p>
          )}
          {pierre.description && (
            <p class="mt-3 max-w-md mx-auto text-sm leading-relaxed text-base-content/70">
              {pierre.description}
            </p>
          )}
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>fermer</button>
      </form>
    </dialog>
  );
}
