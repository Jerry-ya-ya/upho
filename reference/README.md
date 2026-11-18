# UPHO Reference

Angular 主頁提供首頁、晶體結構、聲子模態與展開公式導覽。原始互動 HTML 透過同源 iframe 載入，共用 src/theme.css；保留 canvas 動畫、匯出及 LaTeX 複製功能。

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

內容編輯 src/ 下的三個 HTML，統一樣式在 src/theme.css，網站首頁與導覽在 src/main.ts、src/styles.css。程式碼來源連結指向 GitHub，避免部署後相對路徑失效。

## 依賴漏洞狀態（2026-11-18）

完整 npm audit 的 11 項 high 警告皆源自 picomatch <=4.0.7 的單一 ReDoS 漏洞（GHSA-fc5q-39xc-vjpf），其餘項目是受影響的建置工具依賴鏈。npm registry 最新版仍為 4.0.7，官方公告目前無修補版本，因此沒有以降級 Angular 或忽略稽核來消除警告。

公告：https://github.com/advisories/GHSA-fc5q-39xc-vjpf

開發伺服器僅綁定 127.0.0.1。建置使用儲存庫內固定 glob，勿將不可信輸入當作 glob 或執行不可信建置設定。GitHub Pages 僅發布 dist/browser 靜態產物，不發布 Node 建置工具。這些措施限制暴露範圍，並未修補 picomatch 本身；待官方提供修補版後更新鎖定檔並重跑 npm audit 與 npm run build。
