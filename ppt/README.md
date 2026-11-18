# 簡報手稿與輸出

最新版為 24 頁。第 1 頁包含題目、姓名與開場問題，第 2–6 頁介紹晶體結構與聲子，第 7–14 頁介紹展開公式，第 15–16 頁整理算例與指令，第 17–24 頁放兩個例子的八張聲子圖。

## 建議架構

- `phonon_to_physics_learning.md`：主要編輯入口，保存每頁內容、表格、圖片路徑與講者備註。
- `phonon_to_physics_learning_v2.pptx`：含公式的最新版 PowerPoint。文字與表格可直接編輯；原版 14 頁 PPTX 保留。
- `assets/`：從 reference HTML 擷取的靜態示意圖。
- `build_ppt.mjs`：讀取 Markdown 並產生 PPTX。
- `capture_reference.mjs`：HTML 改動後，重新擷取聲子示意圖。
- `render_formulas.mjs`：讀取手稿的 LaTeX，以 KaTeX 與 Edge 排版公式圖片。
- `.build/`：暫存簡報與檢查預覽，已忽略於 Git。

八張圖譜使用 `../examples/*/png/` 的現有輸出，晶體圖使用 `crystal_structures.png`。已產生的 PPTX 會嵌入圖片，單獨傳送也能顯示。若要在別台電腦重建，須一併保留原稿引用的圖片。

## 如何修改手稿

用 `---` 分頁。每頁以 `# 標題` 開始，接著指定一種版面：

```markdown
# 這一頁的標題
<!-- layout: image -->

![圖片說明](assets/圖片.png)

投影片上的說明文字。

::: notes
這裡是講者備註，不顯示在投影片上。
:::
```

支援的版面：`cover`（開場）、`image`（單圖）、`pair`（並排雙圖）、`table`（表格）、`spectrum`（大型圖譜）、`formula`（LaTeX 公式與說明）、`text`（步驟與指令）。使用一般 Markdown 的 `|` 表格語法，輸出為 PowerPoint 原生表格。

這是刻意保持簡單的試作格式，尚未支援任意 Markdown 排版或巢狀清單。長篇文字或增加表格列數時，需要一併調整版面。現有 table 版面適合三欄短表格。第一頁前兩段是講者與老師，其餘段落是開場問題。

公式頁使用 `<!-- layout: formula -->`，每條公式以獨立兩行 `$$` 包住 LaTeX。原文同時寫入 PPT 講者備註。PPT 上的公式為圖片，修改請回到手稿並先重新排版公式，再輸出 PPTX。

建議以 Markdown 作為主稿，修改後再產生新版本 PPTX。PowerPoint 內的手動修改不會回寫原稿。

## 重新產生

轉換腳本使用 Node.js 與 Codex 隨附的 `@oai/artifact-tool`。在本機 Codex 中，可請助理載入 workspace dependencies，再執行轉換。它不是不需依賴的獨立 Markdown 工具。

有該套件的 Node 環境可執行：

```powershell
node ppt/render_formulas.mjs ppt/phonon_to_physics_learning.md
node ppt/build_ppt.mjs ppt/phonon_to_physics_learning.md ppt/phonon_to_physics_learning_v3.pptx
```

如果套件放在非標準位置，先將 `ARTIFACT_NODE_MODULES` 設成包含 `@oai/artifact-tool` 的 node_modules 目錄。Codex 完整驗證另使用 `PRESENTATIONS_SKILL_DIR` 與 `ARTIFACT_PYTHON`。每次使用新的輸出檔名，避免覆蓋已手動修改的版本。

公式排版另需 KaTeX。可用 `KATEX_MODULE` 指定 `katex/dist/katex.mjs` 的完整路徑，或使用已安裝 KaTeX 的 Node 環境。公式圖依手稿中公式頁的順序命名，增刪或調整公式頁順序後也必須重新執行 `render_formulas.mjs`。

HTML 更新後可執行 `node ppt/capture_reference.mjs`，需本機 Edge；可透過 `EDGE_PATH` 指定位置。程式只會開啟獨立無頭瀏覽器讀取本機 HTML。晶體圖如有修改，可用 `reference/src/crystal_structures.html` 的 Export PNG 更新 `crystal_structures.png`。

## 內容範圍

目前依照指定材料整理內容，尚未加入物理約束學習的模型或成果。Cu–Au 圖譜是方法展示，不代表陶瓷配方篩選結果。HTML 的互動動畫在此版 PPTX 中為靜態圖；圖譜保留為原圖，可替換或縮放，曲線不是 PowerPoint 原生圖表。
