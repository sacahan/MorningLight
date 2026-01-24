import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mascot } from './Mascot';
import { LogIn, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'http://localhost:5174',
        },
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('註冊成功！請查收郵件以驗證您的帳號。');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
      }
    }
    setLoading(false);
  };

   return (
     <div className="min-h-screen flex flex-col items-center justify-center p-3 md:p-4 bg-rose-50">
       <div className="card w-full max-w-md text-center space-y-6 md:space-y-8 py-8 md:py-10 px-6 md:px-8">
         <div className="space-y-3 md:space-y-4">
           <Mascot expression={loading ? 'sleepy' : 'happy'} className="w-20 h-20 md:w-24 md:h-24 mx-auto" />
           <h1 className="text-2xl md:text-3xl font-extrabold text-rose-500">Morning Light</h1>
           <p className="text-sm md:text-base text-slate-500">
             {isSignUp ? '建立帳號，開始您的健康旅程' : '歡迎回來！讓小光陪你一起紀錄健康'}
           </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4 text-left">
           <div className="space-y-2">
             <label className="text-xs md:text-sm font-bold text-slate-600 ml-1">電子信箱</label>
             <div className="relative">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-rose-300" />
               <input
                 type="email"
                 placeholder="example@mail.com"
                 className="w-full pl-12 pr-4 py-3 text-sm md:text-base rounded-xl border-2 border-rose-100 focus:border-rose-400 focus:outline-none transition-colors font-medium"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>
           </div>

           <div className="space-y-2">
             <label className="text-xs md:text-sm font-bold text-slate-600 ml-1">密碼</label>
             <div className="relative">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-rose-300" />
               <input
                 type="password"
                 placeholder="••••••••"
                 className="w-full pl-12 pr-4 py-3 text-sm md:text-base rounded-xl border-2 border-rose-100 focus:border-rose-400 focus:outline-none transition-colors font-medium"
                 value={password}
                 onChange={(e) => setPassword(e.target.value)}
                 required
                 minLength={6}
               />
             </div>
           </div>

           <button
             type="submit"
             disabled={loading}
             className="btn-primary w-full py-3 md:py-4 flex items-center justify-center gap-2 text-base md:text-lg shadow-md hover:shadow-lg active:translate-y-0.5 transition-all"
           >
             {loading ? '請稍候...' : (
               <>
                 {isSignUp ? <UserPlus className="w-4 h-4 md:w-5 md:h-5" /> : <LogIn className="w-4 h-4 md:w-5 md:h-5" />}
                 {isSignUp ? '立即註冊' : '登入帳號'}
               </>
             )}
           </button>
         </form>

         <div className="relative">
           <div className="absolute inset-0 flex items-center">
             <span className="w-full border-t border-rose-100"></span>
           </div>
           <div className="relative flex justify-center text-xs uppercase">
             <span className="bg-white px-2 text-slate-400 font-bold">或者</span>
           </div>
         </div>

         <button
           onClick={() => {
             setIsSignUp(!isSignUp);
             setMessage('');
           }}
           className="w-full text-xs md:text-sm font-bold text-rose-400 hover:text-rose-500 flex items-center justify-center gap-1 transition-colors"
         >
           {isSignUp ? '已經有帳號了？點此登入' : '還沒有帳號？點此註冊'}
           <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
         </button>

         {message && (
           <div className={`p-3 md:p-4 rounded-xl text-xs md:text-sm font-bold animate-in fade-in slide-in-from-top-2 ${
             message.includes('成功') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
           }`}>
             {message}
           </div>
         )}
       </div>
     </div>
   );
};
