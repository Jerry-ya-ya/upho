# 簡報手稿與輸出

最新版 v006 共 34 頁：第 5 頁為聲子色散，第 6 頁為雙模式 GIF，第 7 頁為含 A／B 子晶格說明的位移對照，第 8 頁為 UPHO 流程圖；第 32 頁加入跨領域學習與 AI 使用反思。

## 先寫講稿，再整理簡報

1. 編輯 `speech.md` 的「講述內容」，可自由調整章節，不需要維持目前的 24 頁。
2. 講稿確認後，再請助理提取成 `learning.md`，保留投影片重點、表格、LaTeX、圖片與完整講者備註。已建立本次的 `learning.md`。
3. 使用 `learning.md` 產生下一版 PPT，再執行歸檔程式，輸出同版 PDF。

`speech.md` 是依 v002 的文字、講者備註與既有 Markdown 整理的口語草稿，銜接句為補寫，不是錄音逐字稿。物理約束學習的模型與實驗成果仍待補充。

## 檔案位置

- `speech.md`：目前主要編輯入口。
- `phonon_to_physics_learning.md`：舊版投影片原稿，保留作為公式、表格與圖片來源，不再作為講稿主檔。
- `versions/v001/`：14 頁初版 PPTX 與 PDF。
- `versions/v002/`：24 頁含公式版 PPTX 與 PDF。
- 每個版本的 `extracted.md`：直接擷取該 PPT 的文字與備註，保留舊路徑作為原文紀錄。
- 每個版本的 `source.md`：對應的舊版投影片 Markdown 快照，圖片路徑已調整。
- 每個版本的 `manifest.json`：原始檔名、頁數、PPTX SHA-256 與 PDF 轉換方式。
- `assets/`：共用圖片；`.build/`：暫存與檢查預覽。
- `build_ppt.mjs`、`render_formulas.mjs`、`capture_reference.mjs`：既有投影片產生工具。
- `archive_ppt.mjs`、`export_pdf.py`：歸檔現有 PPT 並產生對應 PDF。

版本資料夾中的 PPTX 保留原檔位元組，沒有重新編輯。PDF 使用 Artifact Tool 以 1.5 倍解析度逐頁渲染，再以 ReportLab 封裝，文字不可選取或搜尋。PPTX 與 PDF 都沿用產出物的 Git 忽略規則，講稿、原稿、擷取文字與版本紀錄可納入 Git。

八張圖譜使用 `../examples/*/png/` 的現有輸出，晶體圖使用 `crystal_structures.png`。已產生的 PPTX 會嵌入圖片，單獨傳送也能顯示。若要在別台電腦重建，須一併保留原稿引用的圖片。

## 投影片原稿格式（之後的 learning.md）

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

等 `learning.md` 完成後，有該套件的 Node 環境可執行：

```powershell
node ppt/render_formulas.mjs ppt/learning.md
node ppt/build_ppt.mjs ppt/learning.md ppt/.build/next.pptx
node ppt/archive_ppt.mjs ppt/.build/next.pptx
```

如果套件放在非標準位置，先將 `ARTIFACT_NODE_MODULES` 設成包含 `@oai/artifact-tool` 的 node_modules 目錄。Codex 完整驗證另使用 `PRESENTATIONS_SKILL_DIR` 與 `ARTIFACT_PYTHON`。每次使用新的輸出檔名，避免覆蓋已手動修改的版本。

公式排版另需 KaTeX。可用 `KATEX_MODULE` 指定 `katex/dist/katex.mjs` 的完整路徑，或使用已安裝 KaTeX 的 Node 環境。公式圖依手稿中公式頁的順序命名，增刪或調整公式頁順序後也必須重新執行 `render_formulas.mjs`。

HTML 更新後可執行 `node ppt/capture_reference.mjs`，需本機 Edge；可透過 `EDGE_PATH` 指定位置。程式只會開啟獨立無頭瀏覽器讀取本機 HTML。晶體圖如有修改，可用 `reference/src/pages/crystals/crystals.html` 的 Export PNG 更新 `crystal_structures.png`。

## 內容範圍

目前依照指定材料整理內容，尚未加入物理約束學習的模型或成果。Cu–Au 圖譜是方法展示，不代表陶瓷配方篩選結果。HTML 的互動動畫在此版 PPTX 中為靜態圖；圖譜保留為原圖，可替換或縮放，曲線不是 PowerPoint 原生圖表。

## 版本歸檔

`archive_ppt.mjs` 預設選取下一個版本號，目前下一版為 `v007`。也可指定：

```powershell
node ppt/archive_ppt.mjs path/to/new.pptx v003
```

需要 `ARTIFACT_NODE_MODULES` 指向隨附 Node 套件，`ARTIFACT_PYTHON` 指向包含 ReportLab 與 pypdf 的 Python。工具先渲染所有頁面、驗證 PDF 頁數，再複製 PPTX 並核對 SHA-256，最後移除輸入 PPTX；既有版本資料夾一律不覆寫。若輸入在轉換途中變動，保留輸入並報錯。

之後每次出新版本，也應將當時的 `speech.md` 與 `learning.md` 複製進版本資料夾作為文字快照；不要直接修改已歸檔版本。

## v003 版面更新

`phonon_to_physics_learning_v3.md` 是這次版面調整的投影片原稿。`image_table` 版面在同頁放晶格圖與原生表格，`annotated` 版面放全參數說明圖，原參數段落只保留於講者備註。原本同頁的多條公式拆頁以保留可讀性。

`capture_formula_annotations.mjs` 透過本機伺服器擷取 reference 公式頁，開啟全部參數，使用適合投影片的字級；輸出至 `assets/annotated/`。PNG 內的參數說明不能直接在 PPT 編輯，修改 reference 後重新擷取。

```powershell
node ppt/capture_formula_annotations.mjs
node ppt/build_ppt.mjs ppt/phonon_to_physics_learning_v3.md ppt/.build/next.pptx
node ppt/archive_ppt.mjs ppt/.build/next.pptx
```

## v004 講稿轉換

`learning.md` 由目前 `speech.md` 提取而成，投影片放精簡重點，講者備註保留講述內容及技術來源。`versions/v004/` 保存本次 PPTX、PDF、講稿與投影片原稿快照。後續請先修改 `speech.md`，再更新 `learning.md` 並產生新版本。

## v005 動畫與公式流程

兩個模式以 qa/π = 0.15、mB = 2mA 的既有雙原子鏈模型產生 GIF，各 60 幀、3 秒循環。為方便比較位移相位，各自將一個振動週期歸一化為 3 秒，播放快慢不代表物理頻率比。GIF 已完整嵌入 PPTX，PDF 顯示靜態首幀。尚未在本機 PowerPoint 實際播放驗證。

重建動畫：設定 `ARTIFACT_NODE_MODULES` 與含 Pillow 的 `ARTIFACT_PYTHON` 後，執行 `node ppt/capture_mode_gifs.mjs`。腳本會呼叫 `encode_mode_gifs.py` 完成編碼。

`assets/upho-formula-flow.html` 是流程圖的可修改來源，PNG 用於簡報。圖上公式頁碼對應 v005，若增刪投影片需同步更新。新增 `dispersion`、`pair_split` 與 `diagram` 版面；前兩者使用 `===` 分隔不同文字區域。
