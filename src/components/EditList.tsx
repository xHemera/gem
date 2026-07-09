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
        <button
          onClick={() => setEditing(null)}
          class="mb-6 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          ← Retour à la liste
        </button>
        <h1 class="mb-8 text-2xl font-bold">Modifier : {editing.nom}</h1>
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
        <button
          onClick={() => setCreating(false)}
          class="mb-6 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          ← Retour à la liste
        </button>
        <h1 class="mb-8 text-2xl font-bold">Nouvelle pierre</h1>
        <PierreForm />
      </div>
    );
  }

  return (
    <div>
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une pierre…"
            class="w-full rounded-lg border border-border bg-background px-4 py-2 pl-10 text-text-primary outline-none transition-colors focus:border-accent"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">🔍</span>
        </div>
        <button
          onClick={() => setCreating(true)}
          class="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          + Nouvelle pierre
        </button>
      </div>

      {filtered.length === 0 ? (
        <p class="py-12 text-center text-text-secondary">
          {search ? 'Aucune pierre trouvée' : 'Aucune pierre pour le moment'}
        </p>
      ) : (
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => setEditing(p)}
              class="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:bg-surface-hover text-left cursor-pointer"
            >
              {p.photos?.[0] ? (
                <div class="aspect-[4/3] overflow-hidden">
                  <img
                    src={`/images/pierres/${p.id}/${p.photos[0]}`}
                    alt={p.nom}
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div class="flex aspect-[4/3] items-center justify-center bg-surface-hover">
                  <span class="text-4xl text-text-secondary">💎</span>
                </div>
              )}
              <div class="flex flex-col gap-1 p-4">
                <h2 class="text-base font-semibold">{p.nom}</h2>
                {p.origine && (
                  <p class="text-xs text-text-secondary">{p.origine}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}