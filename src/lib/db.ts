import Dexie from 'dexie';

export const db = new Dexie('SalterioDB');

db.version(1).stores({
    cantos: 'id, titulo, tono, autor, version, updated_at', // Primary key and indexed props
});
