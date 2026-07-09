import { useState } from 'react';
import type { Pierre } from '../lib/pierres';
import PierreForm from './PierreForm';

interface Props {
  pierres: Pierre[];
}

export default function EditList({ pierres }: Props) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Pierre | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = pierres.filter((p) =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );

  if (editing) {
    return (
      <div>
        <button onClick={() => setEditing(null)} class="btn btn-ghost mb-6">
          ← Retour à la liste
        </button>
        <h1 class="text-2xl font-bold mb-8">Modifier : {editing.nom}</h1>
        <PierreForm
          initialData={{
            id: editing.id,
            nom: editing.nom,
            origine: editing.origine,
            description: editing.description,
            photos: editing.photos,
          }}
        />
      </div>
    );
  }

  if (creating) {
    return (
      <div>
        <button onClick={() => setCreating(false)} class="btn btn-ghost mb-6">
          ← Retour à la liste
        </button>
        <h1 class="text-2xl font-bold mb-8">Nouvelle pierre</h1>
        <PierreForm />
      </div>
    );
  }

  return (
    <div>
      <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <label class="input input-neutral flex items-center gap-2 flex-1">
          <span class="text-base-content/40">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une pierre…"
            class="grow"
          />
        </label>
        <button onClick={() => setCreating(true)} class="btn btn-primary">
          + Nouvelle pierre
        </button>
      </div>

      {filtered.length === 0 ? (
        <div class="flex flex-col items-center gap-4 py-20 text-base-content/40">
          <span class="text-5xl">💎</span>
          <p class="text-lg">{search ? 'Aucune pierre trouvée' : 'Aucune pierre pour le moment'}</p>
        </div>
      ) : (
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setEditing(p)}
              class="card card-border bg-base-100 cursor-pointer text-left hover:shadow-xl transition-shadow"
            >
              {p.photos?.[0] ? (
                <figure class="aspect-[4/3] overflow-hidden">
                  <img
                    src={`/images/pierres/${p.id}/${p.photos[0]}`}
                    alt={p.nom}
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </figure>
              ) : (
                <figure class="flex aspect-[4/3] items-center justify-center bg-base-300">
                  <span class="text-4xl text-base-content/30">💎</span>
                </figure>
              )}
              <div class="card-body gap-1 p-4">
                <h2 class="card-title text-base">{p.nom}</h2>
                {p.origine && (
                  <p class="text-xs text-base-content/60">{p.origine}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
