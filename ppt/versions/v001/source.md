# 從聲子展開到物理約束學習
<!-- layout: cover -->

演講者：XXX

指導老師：XXX

能不能在燒出第一片陶瓷前
先決定哪幾個配方值得做？

::: notes
以這個問題作為演講開場。本次內容先介紹晶體結構與聲子，再展示 repo 內兩個合金例子的圖譜。Cu–Au 是方法示範，不是陶瓷配方的預測結果。物理約束學習的模型與實驗驗證留待後續加入。
:::

---

# 常見晶體結構
<!-- layout: image -->

![BCC、FCC 與 HCP 晶體結構](../../crystal_structures.png)

灰線表示晶胞邊界，青綠線表示圖中原子的最近鄰連接。

::: notes
來源：../reference/src/pages/crystals/crystals.html。圖中 BCC 的體心連接八個角點。畫面只顯示有限晶胞，完整配位數需包含相鄰晶胞的原子。
:::

---

# 晶體結構比較
<!-- layout: table -->

| 結構 | 原子排列 | 最近鄰配位數 |
| --- | --- | --- |
| BCC 體心立方 | 立方體角點與體心 | 8 |
| FCC 面心立方 | 立方體角點與面心 | 12 |
| HCP 六方最密堆積 | 密排層以 ABAB 方式堆疊 | 12 |

配位數描述一個原子在完整晶體中的最近鄰數量。

::: notes
來源：../reference/src/pages/crystals/crystals.html。HCP 圖採理想 c/a = √(8/3)。這些是基礎結構示意，不能直接代表所有陶瓷的晶體結構。
:::

---

# 聲學與光學模態
<!-- layout: pair -->

![Acoustic mode：長波長下同相運動](../../assets/acoustic-chain.png)

![Optical mode：長波長下反相運動](../../assets/optical-chain.png)

一維雙原子鏈，彈簧常數相同。A 的質量為 m，B 為 2m。

::: notes
來源：../reference/src/pages/modes/modes.html。擷取 qa/π = 0.22 的靜態畫面。靠近 Γ 時，聲學模態的兩個原子近似同向，光學模態近似反向。這些方向描述針對長波長極限，不適用於整個布里淵區。箭頭表示相對平衡位置的位移。
:::

---

# 聲子色散：頻率與波向量
<!-- layout: image -->

![一維雙原子鏈的聲學支與光學支](../../assets/dispersion-chart.png)

Γ 點的聲學支頻率為零；光學支維持有限頻率。

頻率單位為 √(K/m)，K 是彈簧常數。曲線為本頁雙原子鏈模型。

::: notes
來源：../reference/src/pages/modes/modes.html。在此模型，聲學支在 Γ 附近近似線性，光學支在 Γ 附近較平坦。此圖是頻率對波向量，與下一頁的位移對空間相位不同。
:::

---

# Longitudinal Acoustic and Optical Phonon Modes
<!-- layout: pair -->

![Acoustic Mode · In-Phase Motion](../../assets/acoustic-k.png)

![Optical Mode · Out-of-Phase Motion](../../assets/optical-k.png)

固定時間的長波長示意，縱軸為歸一化位移 u，橫軸為空間相位 θ。

Acoustic：uA = uB = sin θ

Optical：uA = sin θ，uB = −½ sin θ（假設 mB = 2mA）

::: notes
來源：../reference/src/pages/modes/modes.html。兩圖沿 k 方向觀察縱向位移。A、B 是兩個原子位置或種類的標記，不代表正負電荷。兩條反相曲線形成雙葉形狀，是位移快照，不是聲子色散支的形狀。
:::

---

# 例一 L1₂ Cu₃Au：原始參考圖
<!-- layout: spectrum -->

![sf.orig：原始參考圖](../../../examples/00.L12_Cu3Au/png/sf.orig.png)

Cu 75 at.%、Au 25 at.%；保留 repo 內原始參考圖的標示。

::: notes
來源：../examples/00.L12_Cu3Au/sf.orig.svg。此圖與後續重新繪製的圖可能具有不同的座標標示或色階。跨圖比較需注意其原始設定。
:::

---

# 例一 L1₂ Cu₃Au：線性強度圖
<!-- layout: spectrum -->

![sf：線性強度](../../../examples/00.L12_Cu3Au/png/sf.png)

Cu 75 at.%、Au 25 at.%；顏色表示聲子譜強度。

::: notes
來源：../examples/00.L12_Cu3Au/sf.svg；繪圖腳本：../scripts/upho_plot。
:::

---

# 例一 L1₂ Cu₃Au：Gamma 強度增強
<!-- layout: spectrum -->

![sf_gamma：Gamma correction](../../../examples/00.L12_Cu3Au/png/sf_gamma.png)

γ = 0.35，增強較暗分支的可見度，原始譜資料不變。

::: notes
來源：../examples/00.L12_Cu3Au/sf_gamma.svg；../scripts/upho_plot。Gamma correction 是顏色映射的非線性轉換，不會增加聲子譜的原始強度。
:::

---

# 例一 L1₂ Cu₃Au：局部峰值
<!-- layout: spectrum -->

![sf_ridges：局部峰值提取](../../../examples/00.L12_Cu3Au/png/sf_ridges.png)

從 sf_SR.dat 提取沿頻率方向的局部峰值，標示候選分支位置。

::: notes
來源：../examples/00.L12_Cu3Au/sf_ridges.svg；../scripts/upho_plot。合併總譜與對稱性通道的局部峰值。結果依賴峰值門檻，不能保證找出所有分支，也不等同於跨波向量追蹤模態。
:::

---

# 例二 A1 Cu₀.₇₅Au₀.₂₅：原始參考圖
<!-- layout: spectrum -->

![sf.orig：原始參考圖](../../../examples/01.A1_Cu0.75Au0.25/png/sf.orig.png)

Cu 75 at.%、Au 25 at.%；無序合金例子。

::: notes
來源：../examples/01.A1_Cu0.75Au0.25/sf.orig.svg。保留原圖標示，與後續輸出比較需留意座標與色階差異。
:::

---

# 例二 A1 Cu₀.₇₅Au₀.₂₅：線性強度圖
<!-- layout: spectrum -->

![sf：線性強度](../../../examples/01.A1_Cu0.75Au0.25/png/sf.png)

展開後的聲子譜呈現於參考晶體的波向量路徑。

::: notes
來源：../examples/01.A1_Cu0.75Au0.25/sf.svg；../examples/01.A1_Cu0.75Au0.25/README.md。此頁呈現 repo 的合金算例，不將它解讀成陶瓷配方篩選成果。
:::

---

# 例二 A1 Cu₀.₇₅Au₀.₂₅：Gamma 強度增強
<!-- layout: spectrum -->

![sf_gamma：Gamma correction](../../../examples/01.A1_Cu0.75Au0.25/png/sf_gamma.png)

γ = 0.35，讓低強度分支更容易辨識。

::: notes
來源：../examples/01.A1_Cu0.75Au0.25/sf_gamma.svg；../scripts/upho_plot。顏色映射經過轉換，定量強度仍以原始資料及色條為準。
:::

---

# 例二 A1 Cu₀.₇₅Au₀.₂₅：局部峰值
<!-- layout: spectrum -->

![sf_ridges：局部峰值提取](../../../examples/01.A1_Cu0.75Au0.25/png/sf_ridges.png)

局部峰值提供候選分支位置；分支的完整性仍需檢查。

::: notes
來源：../examples/01.A1_Cu0.75Au0.25/sf_ridges.svg；../scripts/upho_plot。展寬、重疊與弱峰可能影響提取結果。後續若作為學習目標，需另外定義特徵、物理約束與驗證方法。
:::
