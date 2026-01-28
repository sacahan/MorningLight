import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface UserSettings {
  height: number;
  target_weight: number;
  reminder_enabled?: boolean;
  reminder_time?: number;
}

export function useSettings(userId: string | undefined) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchSettings() {
      if (!userId) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        if (mounted) setLoading(true);
        const { data, error } = await supabase
          .from('settings')
          .select('height, target_weight, reminder_enabled, reminder_time')
          .eq('user_id', userId)
          .single();

        if (mounted && !error && data) {
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchSettings();

    return () => {
      mounted = false;
    };
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
