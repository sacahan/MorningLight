import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useWeights } from './useWeights';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('useWeights', () => {
  const userId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch weights on load', async () => {
    const mockData = [{ id: '1', weight: 70, date: '2026-01-01', created_at: '2026-01-01T00:00:00Z' }];
    const mockFrom = supabase.from as Mock;
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const { result } = renderHook(() => useWeights(userId));
    
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.weights).toEqual(mockData);
  });

  it('should add weight via upsert', async () => {
    const mockFrom = supabase.from as Mock;
    mockFrom.mockReturnValue({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      // For refresh after upsert
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockResolvedValue({ data: [], error: null }),
    });

    const { result } = renderHook(() => useWeights(userId));
    await result.current.addWeight(72, '2026-01-24');

    expect(supabase.from).toHaveBeenCalledWith('weights');
  });
});
