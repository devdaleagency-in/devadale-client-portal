import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import type { ConnectionStatus } from '../../hooks/useSocket';

interface ConnectionStatusProps {
  status: ConnectionStatus;
}

export default function ConnectionStatusIndicator({ status }: ConnectionStatusProps) {
  if (status === 'connected') return null;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-semibold border-b ${
      status === 'connecting' || status === 'reconnecting'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-red-50 text-red-700 border-red-200'
    }`}>
      {status === 'connecting' || status === 'reconnecting' ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          Reconnecting...
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          Disconnected
        </>
      )}
    </div>
  );
}
