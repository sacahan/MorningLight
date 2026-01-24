# Morning Light - 每日體重紀錄 App

這是一款專為個人健康管理設計的網頁應用程式 (Web App)，以「溫馨/可愛風」為核心，陪伴您輕鬆紀錄每日體重。

## ✨ 特色功能

- **皮克斯風格吉祥物「小光 (Light)」**：根據您的體重趨勢變化表情，陪伴您的健康旅程。
- **直觀儀表板**：自動計算 BMI (亞洲標準) 並顯示健康狀態標籤。
- **體重趨勢圖**：客製化 SVG 折線圖，支援 7天 / 30天 / 全部 數據視圖。
- **無限滾動紀錄**：輕鬆瀏覽所有歷史數據，支援快速刪除與二次確認。
- **PWA 支援**：可安裝至手機桌面，提供接近原生 App 的體驗。
- **Supabase 整合**：安全的資料儲存與 Email 無密碼登入。

## 🛠 技術棧

- **前端框架**: React + Vite + TypeScript
- **樣式系統**: Tailwind CSS (v4)
- **動畫**: Framer Motion
- **後端**: Supabase (Auth, Database, RLS)
- **測試**: Vitest + React Testing Library (TDD 開發模式)
- **部署**: GitHub Actions + GitHub Pages（自動構建與部署）

## 🚀 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 環境變數與資料庫設定
1. 在根目錄建立 `.env` 並填入您的 Supabase 資訊：
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
2. 前往 Supabase 控制台的 **SQL Editor**。
3. 複製並執行 `supabase_setup.sql` 檔案中的內容，以建立資料表與 RLS 政策。

### 3. 本地開發
```bash
npm run dev
```

### 4. 執行測試
```bash
npm test
```

### 5. 部署至 GitHub Pages

#### 自動部署（推薦）
提交並推送到 `main` 分支時，GitHub Actions 會自動構建並部署到 GitHub Pages：
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

部署會自動進行以下步驟：
1. 執行 `npm test` 驗證所有測試
2. 執行 `npm run build` 構建項目
3. 將 `dist/` 目錄部署到 GitHub Pages

✅ **部署完成後**，您的應用會在以下 URL 上線：
```
https://sacahan.github.io/MorningLight/
```

#### 手動部署
如果需要在本地手動構建並部署：
```bash
npm run deploy
```

#### 查看部署狀態
前往 GitHub repository 的 **Actions** 標籤頁面查看部署流程和日誌。

#### GitHub Pages 設定
確保您的 repository settings 已配置：
1. 前往 **Settings > Pages**
2. 選擇 **Source** 為 "GitHub Actions"
3. 您的應用將在上述 URL 上線


## 📊 新增功能

### 數據匯出
- **CSV 匯出**：將所有體重歷史紀錄匯出為 CSV 格式
- **安全防護**：內建 Excel/Sheets 公式注入防護
- **按日期排序**：匯出的資料自動按時間順序排列

### 帳戶認證
- **Email + 密碼註冊**：安全的註冊流程，需驗證電子郵件
- **郵件驗證**：自訂溫馨的驗證信件範本
- **密碼登入**：驗證完成後可直接使用帳密登入


- **開心 (Happy)**: 預設狀態或剛登入時。
- **興奮 (Excited)**: 當體重較前一筆下降時。
- **難過 (Sad)**: 當體重較前一筆上升超過 0.5kg 時。
- **想睡 (Sleepy)**: 資料讀取中。

---
由 Antigravity 團隊精心打造。
