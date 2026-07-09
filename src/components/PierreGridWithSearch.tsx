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
      <div class="mb-6">
        <div class="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une pierre…"
            class="w-full rounded-lg border border-border bg-background px-4 py-2 pl-10 text-text-primary outline-none transition-colors focus:border-accent"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">🔍</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p class="py-12 text-center text-text-secondary">
          {search ? 'Aucune pierre trouvée' : 'Aucune pierre pour le moment'}
        </p>
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