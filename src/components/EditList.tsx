import { useState, useEffect } from 'react';
import type { Pierre } from '../lib/pierres';
import PierreForm from './PierreForm';

interface DraftData {
  localId: string;
  type: 'create' | 'edit' | 'delete';
  nom: string;
  origine?: string;
  description?: string;
  existingPhotoNames: string[];
  newPhotoNames: string[];
  existingStoneId?: string;
}

interface Props {
  pierres: Pierre[];
}

type View = 'list' | 'create' | 'edit-stone' | 'edit-draft';

export default function EditList({ pierres }: Props) {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<View>('list');
  const [selectedStone, setSelectedStone] = useState<Pierre | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<DraftData | null>(null);
  const [drafts, setDrafts] = useState<DraftData[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pushing, setPushing] = useState(false);
  const [pushMsg, setPushMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/drafts')
      .then((r) => r.json())
      .then(setDrafts)
      .catch(() => {});
  }, [refreshKey]);

  async function handleDeleteDraft(localId: string) {
    if (!confirm('Supprimer ce brouillon ?')) return;
    await fetch(`/api/drafts/${localId}`, { method: 'DELETE' });
    setRefreshKey((k) => k + 1);
  }

  async function handleDeleteStone(pierre: Pierre) {
    if (!confirm(`Supprimer la pierre « ${pierre.nom} » définitivement au prochain push ?`)) return;
    try {
      const res = await fetch('/api/pierres/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pierre.id, nom: pierre.nom, photos: pierre.photos ?? [] }),
      });
      if (res.ok) {
        setPushMsg(`Brouillon de suppression créé pour « ${pierre.nom} »`);
        setTimeout(() => setPushMsg(null), 4000);
      } else {
        const err = await res.text();
        alert(`Erreur : ${err}`);
      }
    } catch {
      alert('Erreur réseau');
    }
    setRefreshKey((k) => k + 1);
  }

  async function handlePush() {
    if (!confirm(`Pusher ${drafts.length} brouillon(s) sur GitHub ?`)) return;
    setPushing(true);
    setPushMsg(null);
    try {
      const res = await fetch('/api/pierres/push', { method: 'POST' });
      if (res.ok) {
        setPushMsg('Push réussi !');
        setTimeout(() => setPushMsg(null), 4000);
        setRefreshKey((k) => k + 1);
      } else {
        const err = await res.text();
        setPushMsg(`Erreur : ${err}`);
      }
    } catch {
      setPushMsg('Erreur réseau');
    } finally {
      setPushing(false);
    }
  }

  function back() {
    setView('list');
    setSelectedStone(null);
    setSelectedDraft(null);
    setRefreshKey((k) => k + 1);
  }

  // --- Editing a draft ---
  if (view === 'edit-draft' && selectedDraft) {
    return (
      <div>
        <button onClick={back} class="btn btn-ghost mb-6">← Retour à la liste</button>
        <h1 class="text-2xl font-bold mb-8">Modifier le brouillon : {selectedDraft.nom}</h1>
        <PierreForm
          initialData={{
            localId: selectedDraft.localId,
            id: selectedDraft.existingStoneId,
            nom: selectedDraft.nom,
            origine: selectedDraft.origine,
            description: selectedDraft.description,
            photos: selectedDraft.existingPhotoNames,
            newPhotoNames: selectedDraft.newPhotoNames,
          }}
          onSaved={back}
        />
      </div>
    );
  }

  // --- Editing a committed stone ---
  if (view === 'edit-stone' && selectedStone) {
    return (
      <div>
        <button onClick={back} class="btn btn-ghost mb-6">← Retour à la liste</button>
        <h1 class="text-2xl font-bold mb-8">Modifier : {selectedStone.nom}</h1>
        <PierreForm
          initialData={{
            id: selectedStone.id,
            nom: selectedStone.nom,
            origine: selectedStone.origine,
            description: selectedStone.description,
            photos: selectedStone.photos,
          }}
          onSaved={back}
        />
      </div>
    );
  }

  // --- Creating a new stone ---
  if (view === 'create') {
    return (
      <div>
        <button onClick={back} class="btn btn-ghost mb-6">← Retour à la liste</button>
        <h1 class="text-2xl font-bold mb-8">Nouvelle pierre</h1>
        <PierreForm onSaved={back} />
      </div>
    );
  }

  // --- List view ---
  const filteredCommitted = pierres.filter((p) =>
    p.nom.toLowerCase().includes(search.toLowerCase())
  );
  const filteredDrafts = drafts.filter((d) =>
    d.nom.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <label class="input input-neutral flex items-center gap-2 flex-1">
          <span class="text-base-content/40">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher…"
            class="grow"
          />
        </label>
        <div class="flex gap-2">
          {drafts.length > 0 && (
            <button
              onClick={handlePush}
              disabled={pushing}
              class="btn btn-success"
            >
              {pushing ? (
                <span class="loading loading-spinner loading-sm"></span>
              ) : (
                `Tout pusher (${drafts.length})`
              )}
            </button>
          )}
          <button onClick={() => setView('create')} class="btn btn-primary">
            + Nouvelle
          </button>
        </div>
      </div>

      {pushMsg && (
        <div class={`alert mb-6 ${pushMsg.startsWith('Erreur') ? 'alert-error' : 'alert-success'}`}>
          <span>{pushMsg}</span>
        </div>
      )}

      {/* Drafts */}
      {filteredDrafts.length > 0 && (
        <section class="mb-10">
          <h2 class="text-lg font-semibold mb-4 text-base-content/70">
            Brouillons ({filteredDrafts.length})
          </h2>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredDrafts.map((d) => (
              <div
                key={d.localId}
                class={`card card-border bg-base-100 relative group ${d.type !== 'delete' ? 'cursor-pointer' : ''}`}
                onClick={() => d.type !== 'delete' && (setSelectedDraft(d), setView('edit-draft'))}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteDraft(d.localId); }}
                  class="btn btn-circle btn-xs btn-error absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                {d.newPhotoNames[0] ? (
                  <figure class="aspect-[4/3] overflow-hidden">
                    <img
                      src={`/api/drafts/${d.localId}/photos/${d.newPhotoNames[0]}`}
                      alt={d.nom}
                      loading="lazy"
                      decoding="async"
                      class="h-full w-full object-cover"
                    />
                  </figure>
                ) : (
                  <figure class="flex aspect-[4/3] items-center justify-center bg-base-300">
                    <span class="text-4xl text-base-content/30">💎</span>
                  </figure>
                )}
                <div class="card-body gap-1 p-4">
                  <div class="flex items-center gap-2">
                    <h2 class="card-title text-base">{d.nom}</h2>
                    <span class={`badge badge-xs ${d.type === 'delete' ? 'badge-error' : 'badge-warning'}`}>
                      {d.type === 'delete' ? 'Suppression' : 'Brouillon'}
                    </span>
                  </div>
                  {d.origine && <p class="text-xs text-base-content/60">{d.origine}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Committed stones */}
      <section>
        <h2 class="text-lg font-semibold mb-4 text-base-content/70">
          Pierres publiées ({filteredCommitted.length})
        </h2>
        {filteredCommitted.length === 0 ? (
          <div class="flex flex-col items-center gap-4 py-16 text-base-content/40">
            <span class="text-5xl">💎</span>
            <p class="text-lg">Aucune pierre trouvée</p>
          </div>
        ) : (
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filteredCommitted.map((p) => (
              <div
                key={p.id}
                class="card card-border bg-base-100 cursor-pointer text-left hover:shadow-xl transition-shadow relative group"
                onClick={() => { setSelectedStone(p); setView('edit-stone'); }}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteStone(p); }}
                  class="btn btn-circle btn-xs btn-error absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Supprimer cette pierre"
                >
                  ×
                </button>
                {p.photos?.[0] ? (
                  <figure class="aspect-[4/3] overflow-hidden">
                    <img
                      src={`/images/pierres/${p.id}/${p.photos[0]}`}
                      alt={p.nom}
                      loading="lazy"
                      decoding="async"
                      class="h-full w-full object-cover"
                    />
                  </figure>
                ) : (
                  <figure class="flex aspect-[4/3] items-center justify-center bg-base-300">
                    <span class="text-4xl text-base-content/30">💎</span>
                  </figure>
                )}
                <div class="card-body gap-1 p-4">
                  <h2 class="card-title text-base">{p.nom}</h2>
                  {p.origine && <p class="text-xs text-base-content/60">{p.origine}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
