await window.i18nReady;
    (() => {
      "use strict";

      const wavevector = document.querySelector("#wavevector");
      const waveValue = document.querySelector("#wave-value");
      const playback = document.querySelector("#playback");
      const modes = [
        {name: "acoustic", color: "#006d65"},
        {name: "optical", color: "#a34329"}
      ].map(mode => ({
        ...mode,
        context: document.querySelector("#" + mode.name + "-chain").getContext("2d"),
        branchContext: document.querySelector("#" + mode.name + "-branch").getContext("2d"),
        frequencyLabel: document.querySelector("#" + mode.name + "-frequency"),
        note: document.querySelector("#" + mode.name + "-note")
      }));
      const chart = document.querySelector("#dispersion-chart").getContext("2d");

      // For masses m and 2m the mass-weighted matrix has diagonal entries
      // 2 and 1, and off-diagonal entries -sqrt(2) cos(qa/2), in units of K/m.
      function normalModes(reducedQ) {
        const coupling = Math.SQRT2 * Math.cos(Math.PI * reducedQ / 2);
        const splitting = Math.hypot(0.5, coupling);
        const angle = Math.atan2(2 * coupling, 1) / 2;
        const sine = Math.sin(angle);
        const cosine = Math.cos(angle);
        return [
          [Math.sqrt(Math.max(0, 1.5 - splitting)), [sine, cosine / Math.SQRT2]],
          [Math.sqrt(1.5 + splitting), [cosine, -sine / Math.SQRT2]]
        ].map(([frequency, amplitudes]) => {
          const scale = Math.max(...amplitudes.map(Math.abs));
          return {frequency, amplitudes: amplitudes.map(value => value / scale)};
        });
      }

      const atomCount = 12;
      const step = 55;
      const firstX = (720 - (atomCount - 1) * step) / 2;

      function line(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      function drawArrow(ctx, from, to, y) {
        if (Math.abs(to - from) < 2) return;
        const head = Math.sign(to - from) * Math.min(6, Math.abs(to - from) / 2);
        line(ctx, from, y, to, y);
        ctx.beginPath();
        ctx.moveTo(to - head, y - 4);
        ctx.lineTo(to, y);
        ctx.lineTo(to - head, y + 4);
        ctx.stroke();
      }

      function drawChain(mode, data, reducedQ, time) {
        const ctx = mode.context;
        ctx.save();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.translate(160, 0);
        ctx.rotate(Math.PI / 2);
        const y = 61;
        const centerCell = 3;
        const cellStart = firstX + (centerCell * 2 - 0.5) * step;
        ctx.clearRect(0, 0, 720, 160);
        ctx.fillStyle = "#f0f5f3";
        ctx.fillRect(cellStart, 22, step * 2, 107);

        // The half-cell offset is included in the Bloch phase of atom B.
        const atoms = Array.from({length: atomCount}, (_, index) => {
          const heavy = index % 2;
          const equilibrium = firstX + index * step;
          const phase = Math.PI * reducedQ * (index / 2 - centerCell);
          const displacement = 13 * data.amplitudes[heavy] *
            Math.cos(phase - data.frequency * time);
          return {heavy, equilibrium, x: equilibrium + displacement};
        });

        ctx.strokeStyle = "#9aa9ab";
        ctx.lineWidth = 2;
        for (let i = 1; i < atoms.length; i++) {
          const start = atoms[i - 1].x;
          const end = atoms[i].x;
          const length = end - start;
          ctx.beginPath();
          ctx.moveTo(start, y);
          for (let segment = 1; segment < 8; segment++) {
            ctx.lineTo(start + length * segment / 8, y + (segment % 2 ? -4 : 4));
          }
          ctx.lineTo(end, y);
          ctx.stroke();
        }

        for (const {heavy, equilibrium, x} of atoms) {
          ctx.fillStyle = heavy ? "#9fb5d3" : "#233d70";
          ctx.strokeStyle = "#526a8f";
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.arc(x, y, heavy ? 13 : 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.strokeStyle = "#a0b0b4";
          line(ctx, equilibrium, 83, equilibrium, 96);
          ctx.strokeStyle = mode.color;
          ctx.lineWidth = 2;
          drawArrow(ctx, equilibrium, equilibrium + (x - equilibrium) * 2, 102);
        }
        ctx.strokeStyle = "#a0b0b4";
        ctx.lineWidth = 1;
        line(ctx, cellStart, 128, cellStart + 2 * step, 128);
        ctx.fillStyle = "#50636b";
        ctx.font = "15px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("unit cell", cellStart + step, 150);
        ctx.restore();
      }

      const dispersion = Array.from({length: 101}, (_, index) => normalModes(index / 100));

      function drawBranch(ctx, branch, reducedQ, frequency) {
        const color = modes[branch].color;
        const left = 57, right = 670, top = 12, bottom = ctx.canvas.height - 36;
        const x = q => left + (q + 1) / 2 * (right - left);
        const y = frequency => bottom - frequency / 1.9 * (bottom - top);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#73858a";
        line(ctx, left, bottom, right, bottom);
        line(ctx, left, bottom, left, top);
        ctx.setLineDash([5, 4]);
        line(ctx, x(0), top, x(0), bottom);
        ctx.setLineDash([]);

        ctx.strokeStyle = color;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        for (let index = -100; index <= 100; index++) {
          const px = x(index / 100);
          const py = y(dispersion[Math.abs(index)][branch].frequency);
          if (index === -100) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x(reducedQ), y(frequency), 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#50636b";
        ctx.font = "20px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("−π/a", left, bottom + 26);
        ctx.fillText("Γ", x(0), bottom + 26);
        ctx.fillText("π/a", right, bottom + 26);
        ctx.fillText("q", 705, bottom + 5);
        ctx.fillText("ω", 25, top + 12);
        ctx.fillText("0", 25, bottom + 5);
      }

      // Use precisely the chain's equilibrium positions, Bloch phase and time.
      // The horizontal axis is a displacement value, not transverse motion.
      function drawDisplacement(canvas, data, reducedQ, time) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const center = 190, scale = 95;
        const position = index => firstX + index * step;
        const displacement = (index, site) => data.amplitudes[site] *
          Math.cos(Math.PI * reducedQ * (index / 2 - 3) - data.frequency * time);
        ctx.font = '18px Segoe UI, sans-serif';
        ctx.textAlign = 'center';ctx.fillStyle = '#50636b';
        ctx.fillText('u / max|u|', center, 23);
        ctx.strokeStyle = '#80919a';ctx.lineWidth = 1;
        line(ctx, center-scale, 40, center+scale, 40);
        line(ctx, center, 40, center, 685);
        for (const tick of [-1,0,1]) ctx.fillText(String(tick),center+tick*scale,58);
        ctx.fillText('r ∥ q ↓', 45, 360);
        const colors = ['#233d70','#a34329'];
        for (let site=0;site<2;site++) {
          ctx.strokeStyle=colors[site];ctx.lineWidth=3;
          ctx.setLineDash(site ? [8,5] : []);ctx.beginPath();
          for(let j=0;j<=220;j++) {
            const index=11*j/220, x=center+scale*displacement(index,site), y=position(index);
            if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
          }
          ctx.stroke();ctx.setLineDash([]);
          for(let index=site;index<atomCount;index+=2) {
            const x=center+scale*displacement(index,site), y=position(index);
            ctx.fillStyle=colors[site];ctx.beginPath();
            if(site===0)ctx.arc(x,y,6,0,2*Math.PI);
            else {ctx.moveTo(x,y-7);ctx.lineTo(x+7,y);ctx.lineTo(x,y+7);ctx.lineTo(x-7,y);ctx.closePath();}
            ctx.fill();
          }
        }
        ctx.fillStyle=colors[0];ctx.fillText('● A',125,710);
        ctx.fillStyle=colors[1];ctx.fillText('◆ B',255,710);
      }

      function drawDispersion(reducedQ, selected) {
        const ctx = chart;
        const left = 44, right = 690, top = 12, bottom = 163;
        const x = q => left + q * (right - left);
        const y = frequency => bottom - frequency / 1.9 * (bottom - top);
        ctx.clearRect(0, 0, 720, 210);
        ctx.lineWidth = 1;
        ctx.font = "15px Segoe UI, sans-serif";
        ctx.textAlign = "right";
        ctx.fillStyle = "#50636b";
        for (const tick of [0, 0.5, 1, 1.5]) {
          ctx.strokeStyle = "#e1e8e5";
          line(ctx, left, y(tick), right, y(tick));
          ctx.fillText(String(tick), left - 9, y(tick) + 5);
        }
        ctx.strokeStyle = "#73858a";
        line(ctx, left, bottom, right, bottom);
        line(ctx, left, bottom, left, top);
        ctx.setLineDash([5, 4]);
        line(ctx, x(reducedQ), top, x(reducedQ), bottom);
        ctx.setLineDash([]);

        modes.forEach((mode, branch) => {
          ctx.strokeStyle = mode.color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          dispersion.forEach((sample, index) => {
            const px = x(index / 100);
            const py = y(sample[branch].frequency);
            if (index === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();
          ctx.fillStyle = mode.color;
          ctx.beginPath();
          ctx.arc(x(reducedQ), y(selected[branch].frequency), 5, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = "#50636b";
        ctx.textAlign = "left";
        ctx.fillText("ω", 4, 22);
        ctx.fillText("Γ · 0", left, 183);
        ctx.textAlign = "right";
        ctx.fillText("π/a", right, 183);
        ctx.textAlign = "center";
        ctx.fillText("Wave vector q", (left + right) / 2, 200);
      }

      let reducedQ;
      let selected;
      let elapsed = 0;
      let frame = null;
      let previousFrame = null;
      let playing = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function renderChains() {
        modes.forEach((mode, index) => {
          drawChain(mode, selected[index], reducedQ, elapsed);
          drawDisplacement(document.querySelector('#'+mode.name+'-k'), selected[index], reducedQ, elapsed);
        });
      }

      function selectWavevector(value) {
        reducedQ = value;
        wavevector.value = String(value);
        waveValue.value = value.toFixed(2);
        selected = normalModes(value);
        elapsed = 0;
        modes.forEach((mode, index) => {
          const frequency = selected[index].frequency;
          mode.frequencyLabel.textContent = "ω = " + frequency.toFixed(3);
          drawBranch(mode.branchContext, index, value, frequency);
        });
        if (value === 0) {
          modes[0].note.textContent = "At Γ, the chain has a rigid displacement and zero frequency.";
          modes[1].note.textContent = "At Γ, A and B oscillate in opposite directions.";
        } else if (value === 1) {
          modes[0].note.textContent = "At the zone edge, only the heavier B atoms oscillate.";
          modes[1].note.textContent = "At the zone edge, only the lighter A atoms oscillate.";
        } else {
          modes[0].note.textContent = "Near Γ, the two atoms in each cell move together.";
          modes[1].note.textContent = "Near Γ, the two atoms in each cell move in opposite directions.";
        }
        renderChains();
        drawDispersion(value, selected);
      }

      function animate(now) {
        if (previousFrame !== null) elapsed += Math.min(now - previousFrame, 50) * 0.0025;
        previousFrame = now;
        renderChains();
        frame = requestAnimationFrame(animate);
      }

      function updatePlayback() {
        playback.textContent = playing ? "Pause" : "Play";
        if (playing) {
          frame = requestAnimationFrame(animate);
        } else {
          if (frame !== null) cancelAnimationFrame(frame);
          frame = null;
          previousFrame = null;
        }
      }

      wavevector.addEventListener("input", () => selectWavevector(Number(wavevector.value)));
      document.querySelector("#gamma").addEventListener("click", () => selectWavevector(0));
      document.querySelector("#zone-edge").addEventListener("click", () => selectWavevector(1));
      playback.addEventListener("click", () => {
        playing = !playing;
        updatePlayback();
      });

      selectWavevector(Number(wavevector.value));
      updatePlayback();
    })();
