# 每日體重紀錄 App - 完整設計規格書 (Design Specification)

## 專案概述 (Project Overview)

本專案為一款專注於個人健康管理的 網頁應用程式 (Web App)，核心目標是提供使用者一個輕鬆、無壓力的環境來紀錄每日體重。設計上採用 「溫馨/可愛風」，透過粉嫩色系與圓潤的 UI 元素，降低面對體重數字的焦慮感，並透過直觀的圖表與自動化計算，協助使用者掌握健康趨勢。

## 功能規格 (Functional Specifications)

### 核心功能 (Core Features)

- 每日體重紀錄：提供彈出式視窗 (Modal) 輸入日期與體重 (kg)。預設日期為當日，支援補登過去日期的資料。
- 體重趨勢圖表：
  - 類型：直線折線圖 (Straight Line Chart)，精確反映數據波動。
  - 顯示範圍：顯示所有歷史數據。
  - 辦助線：若有設定目標體重，圖表上會顯示一條綠色虛線作為基準。
- 儀表板數據 (Dashboard)：
  - 目前體重：顯示最新一筆輸入的體重。
  - BMI 自動計算：根據使用者設定的身高與最新體重，自動計算 BMI 數值。
  - 健康狀態提示：根據 BMI 數值顯示對應狀態（過輕、健康、過重、肥胖）及顏色標籤。
  - 目標進度：顯示目前體重與目標體重的差距。
- 歷史紀錄管理：
  - 列表顯示最近 5 筆紀錄。
  - 支援刪除功能 (點擊垃圾桶圖示)。

### 初始設定 (Onboarding)

- 首次使用引導：當系統偵測到無設定檔時，強制引導使用者輸入：
  - 身高 (cm) - 用於計算 BMI。
  - 目標體重 (kg) - 用於圖表目標線與進度計算。

### 介面與視覺設計 (UI/UX Design)

#### 設計風格

- 風格關鍵字：cartoon style infographic, playful and exaggerated, fun characters (卡通風格，誇張可愛，趣味角色)。
- 視覺語言：大量的圓角 (Rounded corners)、卡片式設計、柔和的陰影。

#### 色彩計畫 (Color Palette)

- 主色標 (Primary)：Rose-500 (#f43f5e) 至 Rose-400 - 用於按鈕、重點文字、圖表線條。
- 背景色 (Background)：Rose-50 (#fff1f2) - 營造溫暖氛圍。
- 文字色 (Text)：Slate-700 (#334155) - 確保閱讀清晰度，避免純黑帶來的生硬感。
- 狀態色 (Status Colors)：
  - 健康：Emerald-500 (綠色)
  - 過輕：Blue-500 (藍色)
  - 過重：Orange-500 (橘色)
  - 肥胖：Rose-500 (紅色)

#### 圖示系統 (Icons)

- 使用 Lucide React 套件，風格簡約現代。
- 主要圖示：Plus (新增), Activity (趨勢), Target (目標), Trash2 (刪除)。

### 技術架構 (Technical Architecture)

#### 前端 (Frontend)

- 框架：React
- 樣式庫：Tailwind CSS (透過 className 實作響應式設計)
- 圖表實作：客製化 SVG Component (不依賴肥大的圖表庫，保持輕量)。

#### 後端與資料庫 (Backend & Database)

- 平台：Supabase
- 身份驗證 (Auth)：Supabase Auth (支援 Email/Login 及社會化登入)。
- 資料庫 (Database)：Supabase Database (PostgreSQL)。

#### 資料結構 (Data Schema)

所有的資料皆儲存於 Supabase 資料庫中，並透過 RLS (Row Level Security) 確保資料隱私。

- Table: weights (體重紀錄)

| 欄位名稱   | 類型        | 說明                      |
| ---------- | ----------- | ------------------------- |
| id         | UUID        | 文件 ID (主鍵)            |
| user_id    | UUID        | 使用者 ID (關聯 Auth)     |
| weight     | Numeric     | 體重 (kg)                 |
| date       | Date        | 紀錄日期                  |
| created_at | Timestamptz | 建立時間 (用於排序或稽核) |

- Table: settings (使用者設定)

| 欄位名稱      | 類型    | 說明          |
| ------------- | ------- | ------------- |
| user_id       | UUID    | 使用者 ID     |
| height        | Numeric | 身高 (cm)     |
| target_weight | Numeric | 目標體重 (kg) |

### 未來擴充規劃 (Future Roadmap)

(以下功能為暫不開發，但保留擴充彈性)

- 體脂率紀錄：在 weights 集合中新增 bodyFat 欄位。
- 資料匯出：將歷史紀錄匯出為 CSV 格式。
- 多重圖表視圖：切換「週 / 月 / 年」視圖。
- 帳號綁定：將匿名帳號升級為 Google 登入，確保更換裝置後資料不遺失。
