# Git 工作流程規範 (Git Workflow Guidelines)

本專案採用 **Git Flow (簡化版)** 搭配 **Conventional Commits** 規範。

---

## 1. 分支策略 (Branching Strategy)

### 1.1 主要分支
- **`main`**: 穩定版本分支。僅接受來自 `develop` 或 `hotfix/*` 的合併，且必須通過測試與審核。
- **`develop`**: 整合分支。所有新功能分支的基準，代表最新的穩定開發進度。

### 1.2 輔助分支
- **`feature/*`**: 功能開發。
  - 命名：`feature/<issue-id>-<description>` (例如: `feature/101-user-login`)
  - 基準分支：`develop`
  - 合併回：`develop`
- **`bugfix/*`**: 一般 Bug 修復。
  - 命名：`bugfix/<issue-id>-<description>`
  - 基準分支：`develop`
  - 合併回：`develop`
- **`hotfix/*`**: 緊急生產環境修復。
  - 基準分支：`main`
  - 合併回：`main` 與 `develop`

---

## 2. 提交訊息規範 (Commit Message Convention)

我們遵循 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <description>

[optional body]
```

### 2.1 常用類型 (Type)
- `feat`: 新增功能 (Feature)
- `fix`: 修復 Bug (Bug Fix)
- `docs`: 文件更動 (Documentation)
- `style`: 程式碼格式 (不影響功能的更動，如空格、分號等)
- `refactor`: 重構 (既不是修復 Bug 也不是新增功能的程式碼更動)
- `perf`: 效能改進 (Performance)
- `test`: 測試相關 (新增或更正現有測試)
- `chore`: 建置程序或輔助工具的變更 (如依賴庫更新)

### 2.2 範例
- `feat(auth): 實作 Google 第三方登入`
- `fix(api): 修正登入逾時處理邏輯`
- `docs(readme): 更新本地開發環境設定說明`

---

## 3. 開發流程 (Development Process)

1. **同步代碼**：開始工作前先同步 `develop` 分支。
   ```bash
   git checkout develop
   git pull origin develop
   ```
2. **建立功能分支**：
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **開發與提交**：保持小規模、高頻率的提交。
4. **同步與解決衝突**：定期從 `develop` 分支進行 `rebase`。
   ```bash
   git fetch origin
   git rebase origin/develop
   ```
5. **發起 PR (Pull Request)**：推送到遠端並在 GitHub/GitLab 發起 PR。
6. **代碼審核 (Review)**：通過審核並修復建議後，由維護者合併。

---

## 4. 提交前檢查 (Pre-commit Checks)

在提交前，請確保：
- [ ] 執行 `npm run lint` 通過代碼規範。
- [ ] 執行 `npm run build` 確認可正常建置。
- [ ] 所有測試已通過 (如有)。
