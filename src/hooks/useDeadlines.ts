import { useState, useEffect } from 'react';
import { Deadline } from '../types';
import { useSocket } from './useSocket';
import { api } from '../utils/api';

export function useDeadlines() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, status: connectionStatus } = useSocket();

  const fetchDeadlines = async () => {
    try {
      setLoading(true);
      const data = await api.request<Deadline[]>('/deadlines');
      setDeadlines(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  useEffect(() => {
    const socketInstance = socket();
    if (!socketInstance || connectionStatus !== 'connected') return;

    const onDeadlineCreated = (deadline: Deadline) => {
      setDeadlines(prev => {
        // Only add if not already present
        if (prev.find(d => d.id === deadline.id)) return prev;
        return [...prev, deadline].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      });
    };

    const onDeadlineUpdated = (deadline: Deadline) => {
      setDeadlines(prev => {
        const idx = prev.findIndex(d => d.id === deadline.id);
        if (idx === -1) return prev;
        const newDeadlines = [...prev];
        newDeadlines[idx] = deadline;
        return newDeadlines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      });
    };

    const onDeadlineDeleted = (deadlineId: string) => {
      setDeadlines(prev => prev.filter(d => d.id !== deadlineId));
    };

    socketInstance.on('deadlineCreated', onDeadlineCreated);
    socketInstance.on('deadlineUpdated', onDeadlineUpdated);
    socketInstance.on('deadlineDeleted', onDeadlineDeleted);

    return () => {
      socketInstance.off('deadlineCreated', onDeadlineCreated);
      socketInstance.off('deadlineUpdated', onDeadlineUpdated);
      socketInstance.off('deadlineDeleted', onDeadlineDeleted);
    };
  }, [socket, connectionStatus]);

  return { deadlines, loading, error, refetch: fetchDeadlines };
}
