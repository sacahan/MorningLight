import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mascot } from './Mascot';
import { LogIn, Mail } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('請查收郵件以獲取登入連結！');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-rose-50">
      <div className="card w-full max-w-md text-center space-y-8 py-12">
        <div className="space-y-4">
          <Mascot expression="happy" className="w-32 h-32 mx-auto" />
          <h1 className="text-3xl font-extrabold text-rose-500">Morning Light</h1>
          <p className="text-slate-500">歡迎回來！讓小光陪你一起紀錄健康</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-600 ml-1">電子信箱</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-rose-300" />
              <input
                type="email"
                placeholder="example@mail.com"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-rose-100 focus:border-rose-400 focus:outline-none transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? '傳送中...' : (
              <>
                <LogIn className="w-5 h-5" />
                獲取登入連結
              </>
            )}
          </button>
        </form>

        {message && (
          <p className="text-sm font-medium text-rose-600 bg-rose-50 p-3 rounded-xl">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};
