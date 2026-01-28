import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'
import { Onboarding } from './components/Onboarding'
import { Mascot } from './components/Mascot'
import { AddWeightModal } from './components/AddWeightModal'
import { ReminderSettingsModal } from './components/ReminderSettingsModal'
import { HistoryList } from './components/HistoryList'
import { WeightChart } from './components/WeightChart'
import { useSettings } from './hooks/useSettings'
import { useWeights } from './hooks/useWeights'
import { Plus, LogOut, ChartLine, Download, Settings } from 'lucide-react'
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
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
       <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-rose-100 px-4 py-3 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <Mascot expression={getExpression()} className="w-10 h-10" />
            <div>
              <h1 className="text-lg font-extrabold text-rose-500 leading-none">Morning Light</h1>
              <p className="text-[10px] font-bold text-slate-400">早安，今天也要加油！</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-300 hover:text-rose-400 transition-colors"
              title="提醒設定"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
              title="登出"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

       <main className="max-w-3xl mx-auto p-3 md:p-4 space-y-6">
         {/* Dashboard Cards */}
         <div className="grid grid-cols-2 gap-3">
           <div className="card p-3 md:p-5 relative overflow-hidden">
             <div className="flex flex-col gap-1 mb-2">
               <p className="text-slate-400 text-xs font-bold">目前體重</p>
              {settings.target_weight && (
                 <span className="self-start text-[10px] font-bold text-rose-400 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-100">
                   目標 {settings.target_weight}
                </span>
              )}
            </div>
             <div className="flex items-baseline gap-1">
               <span className="text-3xl md:text-4xl font-black text-slate-700">{currentWeight || '--'}</span>
               <span className="text-xs font-bold text-slate-400">kg</span>
            </div>
            {settings.target_weight && currentWeight > 0 && (
               <p className="text-[10px] font-bold text-rose-400 mt-2 flex items-center gap-1">
                <ChartLine className="w-3 h-3" />
                 差 {Math.abs(currentWeight - settings.target_weight).toFixed(1)}
              </p>
            )}
          </div>

           <div className="card p-3 md:p-5">
             <div className="flex flex-col gap-1 mb-2">
               <p className="text-slate-400 text-xs font-bold">BMI 指數</p>
               <span className="self-start text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
                理想 {BMI_IDEAL_RANGE}
              </span>
            </div>
             <div className="flex items-baseline gap-1">
               <span className="text-3xl md:text-4xl font-black text-slate-700">{bmi}</span>
            </div>
            {bmiStatus && (
               <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold ${bmiStatus.bg} ${bmiStatus.color}`}>
                {bmiStatus.label}
              </span>
            )}
          </div>
        </div>

         {/* Chart Section */}
         <div className="card p-3 md:p-4 space-y-4">
           <div className="flex items-center justify-between gap-2">
             <div>
               <h3 className="font-bold text-slate-700">體重趨勢</h3>
             </div>
             <div className="flex items-center gap-2">
               <button
                 onClick={handleExport}
                 disabled={!hasWeights}
                 className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                   hasWeights
                     ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
                     : 'text-slate-300 bg-slate-50 cursor-not-allowed'
                 }`}
                 aria-label="匯出全部"
               >
                 <Download className="w-4 h-4" />
               </button>
               <div className="flex bg-rose-50 rounded-lg p-1">
                 {(['7d', '30d', 'all'] as const).map((v) => (
                   <button
                     key={v}
                     onClick={() => setChartView(v)}
                     className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${chartView === v ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'
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

      {user && settings && (
        <ReminderSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          userId={user.id}
          onUpdate={updateSettings}
        />
      )}
    </div>
  )
}

export default App
