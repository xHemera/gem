import { useState } from 'react';
import type { Pierre } from '../lib/pierres';
import PierreCard from './PierreCard';
import PhotoCarousel from './PhotoCarousel';

interface Props {
  pierres: Pierre[];
}

export default function PierreGridWithSearch({ pierres }: Props) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Pierre | null>(null);

  const filtered = pierres.filter((p) =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <label class="input input-neutral flex items-center gap-2 mb-6">
        <span class="text-base-content/40">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une pierre…"
          class="grow"
        />
      </label>

      {filtered.length === 0 ? (
        <div class="flex flex-col items-center gap-4 py-20 text-base-content/40">
          <span class="text-5xl">💎</span>
          <p class="text-lg">{search ? 'Aucune pierre trouvée' : 'Aucune pierre pour le moment'}</p>
        </div>
      ) : (
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <PierreCard key={p.id} pierre={p} onSelect={setSelected} />
          ))}
        </div>
      )}

      {selected && (
        <PhotoCarousel pierre={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
