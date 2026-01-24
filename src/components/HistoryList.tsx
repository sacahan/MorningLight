import React from 'react';
import { Trash2, Calendar as CalendarIcon } from 'lucide-react';
import type { WeightRecord } from '../hooks/useWeights';

interface HistoryListProps {
  records: WeightRecord[];
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ 
  records, 
  onDelete, 
  loading, 
  hasMore, 
  onLoadMore 
}) => {
  const handleDelete = async (id: string) => {
    if (window.confirm('確定要刪除這筆紀錄嗎？小光會傷心的...')) {
      await onDelete(id);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-slate-700 px-2">歷史紀錄</h3>
      
      <div className="space-y-3">
        {records.map((record) => (
          <div key={record.id} className="card p-4 flex items-center justify-between group hover:border-rose-300 transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-rose-50 p-3 rounded-2xl">
                <CalendarIcon className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400">{record.date}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-black text-slate-700">{record.weight} <span className="text-sm font-bold">kg</span></p>
                  {record.body_fat && (
                    <p className="text-sm font-bold text-rose-400">/ {record.body_fat}%</p>
                  )}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => handleDelete(record.id)}
              className="p-3 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="w-full py-4 text-rose-400 font-bold hover:text-rose-600 transition-colors"
        >
          {loading ? '載入中...' : '載入更多紀錄'}
        </button>
      )}

      {!hasMore && records.length > 0 && (
        <p className="text-center text-slate-300 text-sm font-bold py-4">已經到底囉！繼續加油！</p>
      )}
    </div>
  );
};
