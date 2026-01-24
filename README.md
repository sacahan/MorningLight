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
- **部署**: GitHub Pages

## 🚀 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 環境變數設定
在根目錄建立 `.env` 並填入您的 Supabase 資訊：
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. 本地開發
```bash
npm run dev
```

### 4. 執行測試
```bash
npm test
```

### 5. 部署至 GitHub Pages
```bash
npm run deploy
```

## 🐾 貓咪「小光」的表情邏輯

- **開心 (Happy)**: 預設狀態或剛登入時。
- **興奮 (Excited)**: 當體重較前一筆下降時。
- **難過 (Sad)**: 當體重較前一筆上升超過 0.5kg 時。
- **想睡 (Sleepy)**: 資料讀取中。

---
由 Antigravity 團隊精心打造。
