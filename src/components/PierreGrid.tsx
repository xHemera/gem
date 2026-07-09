import { useState } from 'react';
import type { Pierre } from '../lib/pierres';
import PierreCard from './PierreCard';
import PhotoCarousel from './PhotoCarousel';

interface Props {
  pierres: Pierre[];
}

export default function PierreGrid({ pierres }: Props) {
  const [selected, setSelected] = useState<Pierre | null>(null);

  return (
    <>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {pierres.map((p) => (
          <PierreCard key={p.id} pierre={p} onSelect={setSelected} />
        ))}
      </div>
      {selected && (
        <PhotoCarousel pierre={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
