import React, { useState } from 'react';
import { Mascot } from './Mascot';
import { Target, Ruler, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (height: number, targetWeight: number) => Promise<void>;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [height, setHeight] = useState<string>('');
  const [targetWeight, setTargetWeight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 1 && height) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!height || !targetWeight) return;
    setLoading(true);
    await onComplete(Number(height), Number(targetWeight));
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-rose-50 overflow-hidden">
      <div className="card w-full max-w-md relative z-10 space-y-8 py-10">
        <div className="text-center space-y-4">
          <Mascot expression={step === 1 ? 'happy' : 'excited'} className="w-40 h-40 mx-auto" />
          <div className="bg-rose-50 p-4 rounded-2xl relative inline-block mx-auto max-w-[80%]">
            <p className="text-rose-600 font-bold">
              {step === 1 
                ? "你好！我是小光。在開始前，先告訴我你的身高吧？" 
                : "太棒了！那你的目標體重是多少呢？"}
            </p>
            {/* Speech bubble arrow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[10px] border-b-rose-50" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="relative">
                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 w-6 h-6" />
                <input
                  type="number"
                  placeholder="身高 (cm)"
                  autoFocus
                  className="w-full pl-14 pr-4 py-5 rounded-2xl border-2 border-rose-100 focus:border-rose-400 focus:outline-none text-xl font-bold"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">cm</span>
              </div>
              <button
                type="button"
                onClick={handleNext}
                disabled={!height}
                className="btn-primary w-full flex items-center justify-center gap-2 py-5"
              >
                下一步 <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 w-6 h-6" />
                <input
                  type="number"
                  placeholder="目標體重 (kg)"
                  autoFocus
                  className="w-full pl-14 pr-4 py-5 rounded-2xl border-2 border-rose-100 focus:border-rose-400 focus:outline-none text-xl font-bold"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">kg</span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1 py-5"
                >
                  回上一步
                </button>
                <button
                  type="submit"
                  disabled={!targetWeight || loading}
                  className="btn-primary flex-[2] py-5"
                >
                  {loading ? '儲存中...' : '開始旅程！'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
