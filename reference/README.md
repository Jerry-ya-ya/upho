# UPHO Reference

Angular 主頁提供首頁、晶體結構、聲子模態與展開公式導覽。原始互動 HTML 透過同源 iframe 載入，共用 src/modules/theme/theme.css；保留 canvas 動畫、匯出及 LaTeX 複製功能。

## 本機開發

使用 Node.js 24.15 以上，執行：

```sh
cd reference
npm ci
npm start
```

## GitHub Pages

在 repository Settings → Pages 將 Source 設定為 GitHub Actions，推送 master 後由 pages.yml 建置並部署。預期網址為 https://jerry-ya-ya.github.io/upho/ 。

`npm run build` 使用 `/upho/` base href，輸出在 dist/browser。導覽採 hash URL，重新整理子頁不需伺服器 rewrite。若更改 repo 名稱，請同步修改 package.json 的 base-href。

原始碼結構：

```text
src/
  modules/
    navigation/   # 導覽列：component.ts、HTML、CSS
    content/      # 內容容器：component.ts、HTML、CSS
    i18n/         # Angular 語言服務與互動頁面翻譯程式
    theme/        # 互動頁面共用樣式
  pages/
    shell/        # 組合導覽列、內容區與頁尾
    home/         # 首頁：component.ts、HTML、CSS
    crystals/     # 晶體結構：HTML、CSS、JS
    modes/        # 聲子模態：HTML、CSS、JS
    formulas/     # 展開公式：HTML、CSS、JS
    pages.ts      # 頁面清單
  i18n/           # 中英文 JSON 翻譯
  main.ts         # Angular 啟動入口
  index.html      # 網站 HTML 入口
  styles.css      # 全域基礎樣式
```

每個頁面或顯示元件的 HTML、樣式與互動程式集中在各自資料夾；共用翻譯服務與樣式集中於 modules。部署保留 pages 子目錄，PPT 擷取腳本也已更新來源路徑。程式碼來源連結指向 GitHub。

## 依賴漏洞狀態（2026-11-18）

完整 npm audit 的 11 項 high 警告皆源自 picomatch <=4.0.7 的單一 ReDoS 漏洞（GHSA-fc5q-39xc-vjpf），其餘項目是受影響的建置工具依賴鏈。npm registry 最新版仍為 4.0.7，官方公告目前無修補版本，因此沒有以降級 Angular 或忽略稽核來消除警告。

公告：https://github.com/advisories/GHSA-fc5q-39xc-vjpf

開發伺服器僅綁定 127.0.0.1。建置使用儲存庫內固定 glob，勿將不可信輸入當作 glob 或執行不可信建置設定。GitHub Pages 僅發布 dist/browser 靜態產物，不發布 Node 建置工具。這些措施限制暴露範圍，並未修補 picomatch 本身；待官方提供修補版後更新鎖定檔並重跑 npm audit 與 npm run build。

建置的 JS/CSS 檔名包含內容雜湊，讓新版部署使用新的資源網址。入口 HTML 以 UTF-8 儲存，瀏覽器標題由語言服務同步切換。

## 公式互動

`src/pages/formulas/formula-explorer.js` 為既有 13 條 MathML 公式加入參數引線。點選符號或以 Tab / Enter 選取，會在公式上方或下方顯示說明；公式橫向捲動及視窗縮放後引線會重新定位。說明與控制項翻譯位於 i18n JSON 的 `parameter.*`、`animation.*`。

五組動畫展示 Bloch 相位、波向量折疊、等幅分量的相位投影、Lorentzian 展寬與權重、star 算術平均。示意值與材料算例分開標示。動畫預設暫停，離開可視區或隱藏分頁時停止更新。公式與 LaTeX 原文仍保留，可供閱讀與複製。
