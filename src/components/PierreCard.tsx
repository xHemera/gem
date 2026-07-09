import type { Pierre } from '../lib/pierres';

interface Props {
  pierre: Pierre;
  onSelect: (pierre: Pierre) => void;
}

export default function PierreCard({ pierre, onSelect }: Props) {
  const firstPhoto = pierre.photos?.[0];
  const imgPath = firstPhoto ? `/images/pierres/${pierre.id}/${firstPhoto}` : null;

  return (
    <button onClick={() => onSelect(pierre)} class="card card-border bg-base-100 cursor-pointer text-left hover:shadow-xl transition-shadow">
      {imgPath ? (
        <figure class="aspect-[4/3] overflow-hidden">
          <img
            src={imgPath}
            alt={pierre.nom}
            class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </figure>
      ) : (
        <figure class="flex aspect-[4/3] items-center justify-center bg-base-300">
          <span class="text-4xl text-base-content/30">💎</span>
        </figure>
      )}
      <div class="card-body gap-1 p-4">
        <h2 class="card-title text-base">{pierre.nom}</h2>
        {pierre.origine && (
          <p class="text-xs text-base-content/60">{pierre.origine}</p>
        )}
      </div>
    </button>
  );
}
