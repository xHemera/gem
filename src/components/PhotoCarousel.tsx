import { useEffect, useCallback, useState } from 'react';
import type { Pierre } from '../lib/pierres';

interface Props {
  pierre: Pierre;
  onClose: () => void;
}

export default function PhotoCarousel({ pierre, onClose }: Props) {
  const photos = pierre.photos ?? [];
  const [index, setIndex] = useState(0);

  const prev = useCallback(() => setIndex((i) => (i > 0 ? i - 1 : photos.length - 1)), [photos.length]);
  const next = useCallback(() => setIndex((i) => (i < photos.length - 1 ? i + 1 : 0)), [photos.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    },
    [onClose, prev, next]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        class="relative flex max-h-[90vh] max-w-4xl flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {photos.length > 0 ? (
          <>
            <div class="relative flex items-center gap-4">
              {photos.length > 1 && (
                <button
                  onClick={prev}
                  class="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-white transition-colors hover:bg-surface-hover"
                  aria-label="Précédent"
                >
                  ←
                </button>
              )}
              <div class="overflow-hidden rounded-xl">
                <img
                  src={`/images/pierres/${pierre.id}/${photos[index]}`}
                  alt={`${pierre.nom} - ${index + 1}`}
                  class="max-h-[70vh] w-auto rounded-xl object-contain"
                />
              </div>
              {photos.length > 1 && (
                <button
                  onClick={next}
                  class="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-white transition-colors hover:bg-surface-hover"
                  aria-label="Suivant"
                >
                  →
                </button>
              )}
            </div>
            {photos.length > 1 && (
              <p class="text-sm text-text-secondary">
                {index + 1} / {photos.length}
              </p>
            )}
          </>
        ) : (
          <p class="text-text-secondary">Aucune photo</p>
        )}

        <div class="text-center">
          <h2 class="text-xl font-semibold">{pierre.nom}</h2>
          {pierre.origine && (
            <p class="mt-1 text-sm text-text-secondary">{pierre.origine}</p>
          )}
          {pierre.description && (
            <p class="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
              {pierre.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
