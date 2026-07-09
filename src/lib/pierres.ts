import { load } from 'js-yaml';
import fs from 'node:fs';
import path from 'node:path';

export interface Pierre {
  id: string;
  nom: string;
  origine?: string;
  description?: string;
  photos?: string[];
}

const DATA_DIR = path.resolve('src/data/pierres');

export function getAllPierres(): Pierre[] {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.yml'));
  return files
    .map(f => {
      const id = f.replace(/\.yml$/, '');
      const raw = fs.readFileSync(path.join(DATA_DIR, f), 'utf-8');
      const data = load(raw) as Record<string, unknown>;
      return { id, ...data } as Pierre;
    })
    .filter(p => p.nom)
    .sort((a, b) => a.nom.localeCompare(b.nom));
}

export function getPierre(id: string): Pierre | undefined {
  const filePath = path.join(DATA_DIR, `${id}.yml`);
  if (!fs.existsSync(filePath)) return undefined;
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = load(raw) as Record<string, unknown>;
  return { id, ...data } as Pierre;
}
