import { useState, useEffect } from 'react'
import { Bell, BellOff, Clock, X, Loader2, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { UserSettings } from '../hooks/useSettings'
import { usePushNotification } from '../hooks/usePushNotification'

interface ReminderSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: UserSettings
  userId: string
  onUpdate: (newSettings: UserSettings) => Promise<unknown>
}

export function ReminderSettingsModal({
  isOpen,
  onClose,
  settings,
  userId,
  onUpdate
}: ReminderSettingsModalProps) {
  const [enabled, setEnabled] = useState(settings.reminder_enabled ?? true)
  const [time, setTime] = useState(settings.reminder_time ?? 10)
  const [isSaving, setIsSaving] = useState(false)
  
  const { 
    permission, 
    isSubscribed, 
    subscribe, 
    unsubscribe, 
    sendTestNotification,
    loading: pushLoading 
  } = usePushNotification(userId)

  useEffect(() => {
    const newEnabled = settings.reminder_enabled ?? true
    const newTime = settings.reminder_time ?? 10

    if (enabled !== newEnabled) setEnabled(newEnabled)
    if (time !== newTime) setTime(newTime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  const handleSave = async () => {
    setIsSaving(true)
    await onUpdate({
      ...settings,
      reminder_enabled: enabled,
      reminder_time: time
    })
    setIsSaving(false)
    onClose()
  }

  const handleTogglePush = async () => {
    if (isSubscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
  }

  const timeOptions = [6, 7, 8, 9, 10, 11, 12]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 md:left-1/2 md:right-auto md:w-full md:max-w-md md:-translate-x-1/2 bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-700">提醒設定</h2>
                    <p className="text-xs font-bold text-slate-400">每天定時提醒你記錄體重</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Notification Permission & Subscription */}
                <div className="p-4 bg-rose-50 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSubscribed ? (
                        <Bell className="w-4 h-4 text-rose-500" />
                      ) : (
                        <BellOff className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-sm font-bold text-slate-700">
                        {isSubscribed ? '已啟用瀏覽器通知' : '尚未啟用通知'}
                      </span>
                    </div>
                    <button
                      onClick={handleTogglePush}
                      disabled={pushLoading}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isSubscribed
                          ? 'bg-white text-slate-500 border border-slate-200'
                          : 'bg-rose-500 text-white shadow-md shadow-rose-200'
                      }`}
                    >
                      {pushLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isSubscribed ? (
                        '取消訂閱'
                      ) : (
                        '立即啟用'
                      )}
                    </button>
                  </div>
                  {permission === 'denied' && (
                    <p className="text-[10px] text-rose-500 font-bold">
                      ⚠️ 通知權限已被封鎖，請在瀏覽器設定中開啟。
                    </p>
                  )}
                  {isSubscribed && (
                    <button
                      onClick={sendTestNotification}
                      disabled={pushLoading}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-white/50 border border-rose-100 rounded-xl text-[10px] font-bold text-rose-400 hover:bg-white transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      發送測試通知
                    </button>
                  )}
                </div>

                {/* Reminder Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">啟用每日提醒</span>
                  </div>
                  <button
                    onClick={() => setEnabled(!enabled)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      enabled ? 'bg-rose-500' : 'bg-slate-300'
                    }`}
                  >
                    <motion.div
                      animate={{ x: enabled ? 26 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>

                {/* Time Selection */}
                <div className={`space-y-3 transition-opacity ${enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <label className="text-xs font-bold text-slate-400 ml-1">提醒時間 (上午)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeOptions.map((h) => (
                      <button
                        key={h}
                        onClick={() => setTime(h)}
                        className={`py-2 rounded-xl text-xs font-extrabold border-2 transition-all ${
                          time === h
                            ? 'bg-rose-50 border-rose-500 text-rose-500'
                            : 'bg-white border-transparent text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {h}:00
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 bg-slate-700 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                儲存設定
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
