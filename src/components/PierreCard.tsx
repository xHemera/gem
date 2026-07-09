import type { Pierre } from '../lib/pierres';

interface Props {
  pierre: Pierre;
  onSelect: (pierre: Pierre) => void;
}

export default function PierreCard({ pierre, onSelect }: Props) {
  const firstPhoto = pierre.photos?.[0];
  const imgPath = firstPhoto ? `/images/pierres/${pierre.id}/${firstPhoto}` : null;

  return (
    <button
      onClick={() => onSelect(pierre)}
      class="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:bg-surface-hover text-left cursor-pointer"
    >
      {imgPath ? (
        <div class="aspect-[4/3] overflow-hidden">
          <img
            src={imgPath}
            alt={pierre.nom}
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div class="flex aspect-[4/3] items-center justify-center bg-surface-hover">
          <span class="text-4xl text-text-secondary">💎</span>
        </div>
      )}
      <div class="flex flex-col gap-1 p-4">
        <h2 class="text-base font-semibold">{pierre.nom}</h2>
        {pierre.origine && (
          <p class="text-xs text-text-secondary">{pierre.origine}</p>
        )}
      </div>
    </button>
  );
}
