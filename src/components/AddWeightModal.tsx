import React, { useState } from 'react';
import { Mascot } from './Mascot';
import { Calendar, Weight, X, Activity } from 'lucide-react';

interface AddWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (weight: number, date: string, bodyFat?: number) => Promise<void>;
}

export const AddWeightModal: React.FC<AddWeightModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const today = new Date().toLocaleDateString('en-CA'); // 使用本地時區的 YYYY-MM-DD 格式
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [date, setDate] = useState(today);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !date) return;
    setLoading(true);
    await onSubmit(Number(weight), date, bodyFat ? Number(bodyFat) : undefined);
    setLoading(false);
    onClose();
  };

   return (
     <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-3 md:p-4 bg-slate-900/40 backdrop-blur-sm">
       <div className="card w-full max-w-sm relative animate-in zoom-in duration-200 rounded-t-3xl md:rounded-3xl">
         <button 
           onClick={onClose}
           className="absolute right-3 md:right-4 top-3 md:top-4 p-2 rounded-full hover:bg-rose-50 text-slate-400 transition-colors"
         >
           <X className="w-5 h-5 md:w-6 md:h-6" />
         </button>

         <div className="text-center space-y-3 md:space-y-4 mb-4 md:mb-6 pt-2">
           <Mascot expression="happy" className="w-20 h-20 md:w-24 md:h-24 mx-auto" />
           <h2 className="text-xl md:text-2xl font-bold text-rose-500">紀錄今天的分量</h2>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
           <div className="grid grid-cols-2 gap-3 md:gap-4">
             <div className="space-y-2">
               <label className="text-xs md:text-sm font-bold text-slate-600 ml-1">體重 (kg)</label>
               <div className="relative">
                 <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-300 w-4 h-4" />
                 <input
                   type="number"
                   step="0.1"
                   placeholder="0.0"
                   autoFocus
                   required
                   className="w-full pl-9 pr-3 py-2 md:py-3 rounded-xl border-2 border-rose-100 focus:border-rose-400 focus:outline-none text-base md:text-lg font-bold"
                   value={weight}
                   onChange={(e) => setWeight(e.target.value)}
                 />
               </div>
             </div>

             <div className="space-y-2">
               <label className="text-xs md:text-sm font-bold text-slate-600 ml-1">體脂 (%)</label>
               <div className="relative">
                 <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-300 w-4 h-4" />
                 <input
                   type="number"
                   step="0.1"
                   placeholder="可選"
                   className="w-full pl-9 pr-3 py-2 md:py-3 rounded-xl border-2 border-rose-100 focus:border-rose-400 focus:outline-none text-base md:text-lg font-bold"
                   value={bodyFat}
                   onChange={(e) => setBodyFat(e.target.value)}
                 />
               </div>
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-xs md:text-sm font-bold text-slate-600 ml-1">日期</label>
             <div className="relative">
               <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 w-4 h-4 md:w-5 md:h-5" />
               <input
                 type="date"
                 max={today}
                 required
                 className="w-full pl-12 pr-4 py-3 md:py-4 rounded-2xl border-2 border-rose-100 focus:border-rose-400 focus:outline-none font-bold text-sm md:text-base appearance-none bg-white"
                 style={{ minWidth: 0 }}
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
               />
             </div>
           </div>

           <button
             type="submit"
             disabled={loading}
             className="btn-primary w-full py-3 md:py-4 mt-2 text-sm md:text-base"
           >
             {loading ? '儲存中...' : '確認紀錄'}
           </button>
         </form>
       </div>
     </div>
   );
};
