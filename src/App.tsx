import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'
import { Onboarding } from './components/Onboarding'
import { Mascot } from './components/Mascot'
import { AddWeightModal } from './components/AddWeightModal'
import { HistoryList } from './components/HistoryList'
import { WeightChart } from './components/WeightChart'
import { useSettings } from './hooks/useSettings'
import { useWeights } from './hooks/useWeights'
import { Plus, LogOut, ChartLine, Download } from 'lucide-react'
import type { User, Session } from '@supabase/supabase-js'
import { downloadCsv, weightsToCsv } from './utils/export'
import { calculateBMI, getBMIStatus, BMI_IDEAL_RANGE } from './utils/health'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    // Check for initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsInitializing(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsInitializing(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const { settings, loading: settingsLoading, updateSettings } = useSettings(user?.id)
  const { weights, loading: weightsLoading, hasMore, addWeight, deleteWeight, fetchMore } = useWeights(user?.id)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [chartView, setChartView] = useState<'7d' | '30d' | 'all'>('7d')

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const hasWeights = weights.length > 0

  const handleExport = () => {
    if (!hasWeights) return
    const csv = weightsToCsv([...weights].sort((a, b) => a.date.localeCompare(b.date)))
    downloadCsv(csv, 'morning-light-weights.csv')
  }

  // Show "Verifying" or "Initializing" state
  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 space-y-4">
        <Mascot expression="sleepy" className="w-32 h-32 animate-pulse" />
        <p className="text-rose-400 font-bold animate-bounce">確認身分中...</p>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <Mascot expression="sleepy" className="w-32 h-32 animate-pulse" />
      </div>
    )
  }

  if (!settings) {
    return <Onboarding onComplete={async (height, targetWeight) => {
      await updateSettings({ height, target_weight: targetWeight })
    }} />
  }

  // Calculate Dashboard Data
  const currentWeight = weights[0]?.weight ?? 0
  const bmiValue = calculateBMI(currentWeight, settings.height)
  const bmi = bmiValue > 0 ? bmiValue.toFixed(1) : '--'
  const bmiStatus = bmiValue > 0 ? getBMIStatus(bmiValue) : null

  // Mascot expression logic
  const getExpression = () => {
    if (weights.length < 2) return 'happy'
    const diff = weights[0].weight - weights[1].weight
    if (diff < 0) return 'excited'
    if (diff > 0.5) return 'sad'
    return 'happy'
  }

   return (
     <div className="min-h-screen bg-rose-50 pb-24">
       {/* Header */}
       <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-rose-100 px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
         <div className="flex items-center gap-2 md:gap-3 flex-col md:flex-row md:items-center">
           <Mascot expression={getExpression()} className="w-10 h-10 md:w-12 md:h-12" />
           <div className="text-center md:text-left">
             <h1 className="text-lg md:text-xl font-extrabold text-rose-500 leading-none">Morning Light</h1>
             <p className="text-xs font-bold text-slate-400">早安，今天也要加油！</p>
           </div>
         </div>
         <button
           onClick={handleLogout}
           className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
         >
           <LogOut className="w-5 h-5" />
         </button>
       </header>

       <main className="max-w-3xl mx-auto p-3 md:p-4 space-y-6">
         {/* Dashboard Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="card p-5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <p className="text-slate-400 text-sm font-bold">目前體重</p>
              {settings.target_weight && (
                <span className="text-[10px] font-bold text-rose-400 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                  目標 {settings.target_weight} kg
                </span>
              )}
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-slate-700">{currentWeight || '--'}</span>
              <span className="text-sm font-bold text-slate-400 mb-2">kg</span>
            </div>
            {settings.target_weight && currentWeight > 0 && (
              <p className="text-xs font-bold text-rose-400 mt-2 flex items-center gap-1">
                <ChartLine className="w-3 h-3" />
                距離目標 {Math.abs(currentWeight - settings.target_weight).toFixed(1)} kg
              </p>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-slate-400 text-sm font-bold">BMI 指數</p>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                理想 {BMI_IDEAL_RANGE}
              </span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-slate-700">{bmi}</span>
            </div>
            {bmiStatus && (
              <span className={`inline-block mt-2 px-2 py-1 rounded-lg text-xs font-bold ${bmiStatus.bg} ${bmiStatus.color}`}>
                {bmiStatus.label}
              </span>
            )}
          </div>
        </div>

         {/* Chart Section */}
         <div className="card p-4 space-y-4">
           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-2 px-2">
             <div>
               <h3 className="font-bold text-slate-700">體重趨勢</h3>
               <p className="text-xs font-bold text-slate-400">資料可匯出成 CSV</p>
             </div>
             <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 w-full md:w-auto">
               <button
                 onClick={handleExport}
                 disabled={!hasWeights}
                 className={`flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap ${
                   hasWeights
                     ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
                     : 'text-slate-300 bg-slate-50 cursor-not-allowed'
                 }`}
               >
                 <Download className="w-4 h-4" />
                 匯出全部
               </button>
               <div className="flex bg-rose-50 rounded-xl p-1">
                 {(['7d', '30d', 'all'] as const).map((v) => (
                   <button
                     key={v}
                     onClick={() => setChartView(v)}
                     className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${chartView === v ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                       }`}
                   >
                     {v === 'all' ? '全部' : v === '30d' ? '30天' : '7天'}
                   </button>
                 ))}
               </div>
             </div>
           </div>
          <WeightChart
            data={weights}
            targetWeight={settings.target_weight}
            view={chartView}
          />
        </div>

        {/* History Section */}
        <HistoryList
          records={weights}
          loading={weightsLoading}
          hasMore={hasMore}
          onLoadMore={fetchMore}
          onDelete={async (id) => { await deleteWeight(id) }}
        />
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-lg shadow-rose-200 flex items-center justify-center transition-transform active:scale-95 z-50"
      >
        <Plus className="w-8 h-8" />
      </button>

      <AddWeightModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (w, d, bf) => { await addWeight(w, d, bf) }}
      />
    </div>
  )
}

export default App
