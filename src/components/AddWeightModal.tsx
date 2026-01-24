import React, { useState } from 'react';
import { Mascot } from './Mascot';
import { Calendar, Weight, X } from 'lucide-react';

interface AddWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (weight: number, date: string) => Promise<void>;
}

export const AddWeightModal: React.FC<AddWeightModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const today = new Date().toISOString().split('T')[0];
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !date) return;
    setLoading(true);
    await onSubmit(Number(weight), date);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="card w-full max-w-sm relative animate-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-rose-50 text-slate-400 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-4 mb-6">
          <Mascot expression="happy" className="w-24 h-24 mx-auto" />
          <h2 className="text-2xl font-bold text-rose-500">紀錄今天的分量</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 ml-1">體重 (kg)</label>
            <div className="relative">
              <Weight className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 w-5 h-5" />
              <input
                type="number"
                step="0.1"
                placeholder="0.0"
                autoFocus
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-rose-100 focus:border-rose-400 focus:outline-none text-xl font-bold"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 ml-1">日期</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 w-5 h-5" />
              <input
                type="date"
                max={today}
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-rose-100 focus:border-rose-400 focus:outline-none font-bold"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 mt-2"
          >
            {loading ? '儲存中...' : '確認紀錄'}
          </button>
        </form>
      </div>
    </div>
  );
};
