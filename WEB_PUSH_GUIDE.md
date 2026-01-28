# ☀️ Morning Light: 每日體重提醒功能落地說明 (Web Push Guide)

本文件說明如何配置與啟動 「Morning Light」 的每日體重提醒功能。此功能結合了 **PWA Web Push**、**Supabase Edge Functions** 與 **GitHub Actions**。

---

## 🔑 關鍵金鑰 (VAPID Keys)

推播驗證需要一對成對的金鑰。請妥善保存，切勿洩漏私鑰：

| 項目                   | 數值                                                                                      |
| :--------------------- | :---------------------------------------------------------------------------------------- |
| **Public Key (公鑰)**  | `BGZ-7hfgUKGVDbf4HaxfEeikpLeQ0ydlvGMFftMYAQY1WgfQK1tHrlABTYk6QjIwZ_RoCZxwkaJgnmwEke4y7TE` |
| **Private Key (私鑰)** | `trX0allUFWV9Skksg_9DAtVvAZhOCc31JW29QVMtEnA`                                             |

---

## 🚀 落地設定步驟

### 1. 設定 Supabase 環境變數 (Secrets)

Edge Function 在簽署推播訊息時需要使用私鑰。請在終端機執行以下指令：

```bash
# 設定推播金鑰與聯絡資訊
supabase secrets set VAPID_PUBLIC_KEY=BGZ-7hfgUKGVDbf4HaxfEeikpLeQ0ydlvGMFftMYAQY1WgfQK1tHrlABTYk6QjIwZ_RoCZxwkaJgnmwEke4y7TE
supabase secrets set VAPID_PRIVATE_KEY=trX0allUFWV9Skksg_9DAtVvAZhOCc31JW29QVMtEnA
supabase secrets set VAPID_SUBJECT=mailto:your-email@example.com
```

### 2. 部署 Edge Function

將後端提醒邏輯部署至 Supabase：

```bash
supabase functions deploy send-weight-reminder
```

### 3. 設定 GitHub Repository Secrets

請至 GitHub Repo > **Settings > Secrets and variables > Actions**，新增以下五項：

| Secret 名稱                 | 取得來源                                                    | 用途                                |
| :-------------------------- | :---------------------------------------------------------- | :---------------------------------- |
| `SUPABASE_URL`              | Settings > API > Project URL                                | 後端 API 地址                       |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings > API > Project API Keys (`service_role` / Secret) | 高權限金鑰 (發送通知用，**勿外洩**) |
| `VITE_SUPABASE_URL`         | 同上                                                        | 前端連線用                          |
| `VITE_SUPABASE_ANON_KEY`    | Settings > API > Project API Keys (`anon` / Public)         | 前端連線用                          |
| `VITE_VAPID_PUBLIC_KEY`     | 上方的公鑰                                                  | 前端訂閱推播用                      |

### 4. 重新部署前端

在 GitHub 設定完上述 Secrets 後，請推送程式碼或手動執行 Actions 中的 `Deploy to GitHub Pages` 工作流。

---

## 🧪 測試流程

1.  **啟用通知**：開啟 App，點擊標題列右側的 **「齒輪 (Settings)」**，點擊 **「立即啟用通知」**。
2.  **發送測試通知**：點擊設定視窗中的 **「發送測試通知」**，確認是否收到推播。
3.  **手動模擬排程**：到 GitHub Repo 的 **Actions** 頁面，手動執行 `Daily Weight Reminder` 工作流。

---

## 🛠️ 技術架構簡述

- **GitHub Actions**: 充當排程器 (Cron)，每小時呼叫 Edge Function。
- **Supabase Edge Function**: 檢查資料庫，找出符合時段且尚未記錄體重的用戶，並執行發信。
- **Service Worker (`src/sw.ts`)**: 負責在背景監聽推播事件並顯示通知 UI。
- **Database**: `push_subscriptions` 表儲存用戶裝置的訂閱憑證。

---

## ⚠️ 注意事項

- **iOS 支援**：必須先「加入主畫面」才能接收 Web Push。
- **安全提示**：`SUPABASE_SERVICE_ROLE_KEY` 具有最高權限，請確保僅設定在 GitHub Secrets 中，切勿寫死在程式碼或環境變數檔案（.env）中。
