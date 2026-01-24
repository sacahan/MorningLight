import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface WeightRecord {
  id: string;
  weight: number;
  date: string;
  created_at: string;
}

const PAGE_SIZE = 20;

export function useWeights(userId: string | undefined) {
  const [weights, setWeights] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const weightsRef = useRef<WeightRecord[]>([]);

  // Keep ref in sync for pagination calculations without triggering re-renders or dependency loops
  useEffect(() => {
    weightsRef.current = weights;
  }, [weights]);

  const fetchWeights = useCallback(async (isRefresh = false) => {
    if (!userId) return;
    
    setLoading(true);
    
    const start = isRefresh ? 0 : weightsRef.current.length;
    const end = start + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from('weights')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .range(start, end);

    if (!error && data) {
      if (isRefresh) {
        setWeights(data);
      } else {
        setWeights(prev => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    let isMounted = true;
    
    // Use a microtask to avoid the synchronous setState in effect warning
    Promise.resolve().then(() => {
      if (isMounted) {
        fetchWeights(true);
      }
    });

    return () => { isMounted = false; };
  }, [fetchWeights]);

  const addWeight = async (weight: number, date: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from('weights')
      .upsert({ user_id: userId, weight, date });
    
    if (!error) {
      fetchWeights(true);
    }
    return error;
  };

  const deleteWeight = async (id: string) => {
    const { error } = await supabase
      .from('weights')
      .delete()
      .eq('id', id);
    
    if (!error) {
      setWeights(prev => prev.filter(w => w.id !== id));
    }
    return error;
  };

  return { weights, loading, hasMore, addWeight, deleteWeight, fetchMore: () => fetchWeights() };
}
