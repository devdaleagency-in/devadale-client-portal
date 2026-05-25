import { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket, disconnectSocket, getSocket } from '../services/chat/socket';
import { getAuthToken } from '../utils/api';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export function useSocket() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setStatus('disconnected');
      return;
    }

    const socket = connectSocket(token);
    socketRef.current = socket;

    setStatus('connecting');

    const onConnect = () => setStatus('connected');
    const onDisconnect = () => setStatus('disconnected');
    const onReconnect = () => setStatus('connected');
    const onReconnecting = () => setStatus('reconnecting');
    const onConnectError = () => setStatus('disconnected');

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect', onReconnect);
    socket.on('reconnecting', onReconnecting);
    socket.on('connect_error', onConnectError);

    if (socket.connected) setStatus('connected');

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnect', onReconnect);
      socket.off('reconnecting', onReconnecting);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  const getSocketInstance = (): Socket | null => socketRef.current || getSocket();

  return { status, socket: getSocketInstance };
}
