import { useSyncCantos } from '../hooks/useSyncCantos';

export default function SyncManager() {
    const { status, lastSync } = useSyncCantos();

    if (import.meta.env.PROD && status === 'idle') return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white text-xs px-3 py-2 rounded-full backdrop-blur flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'syncing' ? 'bg-yellow-400 animate-pulse' : status === 'error' ? 'bg-red-500' : 'bg-green-500'}`} />
            <span>{status === 'idle' ? 'Synced' : status}</span>
            {lastSync && <span className="text-gray-400 text-[10px] ml-1">({new Date(lastSync).toLocaleTimeString()})</span>}
        </div>
    );
}
