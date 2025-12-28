import { useSyncCantos } from '../hooks/useSyncCantos';

export default function SyncManager() {
    useSyncCantos();
    return null; // Este componente no renderiza nada visualmente
}
