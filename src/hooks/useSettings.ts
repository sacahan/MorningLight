import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface UserSettings {
  height: number;
  target_weight: number;
}

export function useSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    async function fetchSettings() {
      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('height, target_weight')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setSettings(data);
      }
      setLoading(false);
    }

    fetchSettings();
  }, [userId]);

  const updateSettings = async (newSettings: UserSettings) => {
    if (!userId) return;
    const { error } = await supabase
      .from('settings')
      .upsert({ user_id: userId, ...newSettings });
    
    if (!error) {
      setSettings(newSettings);
    }
    return error;
  };

  return { settings, loading, updateSettings };
}
