await window.i18nReady;
    for (const equation of document.querySelectorAll(".equation")) {
      const formulas = Array.from(equation.querySelectorAll("annotation"), node => node.textContent);
      if (!formulas.length) continue;
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = "顯示 LaTeX";
      const source = document.createElement("pre");
      source.tabIndex = 0;
      source.textContent = formulas.map(formula => "\\[\n" + formula + "\n\\]").join("\n\n");
      const copy = document.createElement("button");
      copy.type = "button";
      copy.textContent = "複製 LaTeX";
      const status = document.createElement("span");
      status.setAttribute("role", "status");
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(source.textContent);
          status.textContent = "已複製";
        } catch {
          const range = document.createRange();
          range.selectNodeContents(source);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          status.textContent = "已選取公式，按 Ctrl+C 或 ⌘C 複製。";
        }
      });
      details.append(summary, source, copy, status);
      equation.after(details);
    }

await import('./formula-explorer.js');
