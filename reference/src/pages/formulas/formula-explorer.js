// MathML remains the authoritative formula and LaTeX source.
const t = key => window.translate(key);
const NS = 'http://www.w3.org/2000/svg';
const equations = [...document.querySelectorAll('.equation')];
for (const equation of equations) {
  const hint = document.createElement('p'); hint.className = 'parameter-hint'; hint.textContent = t('animation.hint'); equation.before(hint);
  let showAll = false;
  const updates = [];
  const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'all-parameters';
  const refresh = () => { toggle.textContent = t(showAll ? 'animation.hideAll' : 'animation.showAll'); toggle.setAttribute('aria-pressed', String(showAll)); updates.forEach(update => update()); };
  toggle.addEventListener('click', () => { showAll = !showAll; refresh(); }); equation.prepend(toggle);
  for (const math of equation.querySelectorAll('math')) {
    const wrap = document.createElement('div'); wrap.className = 'annotated-formula';
    const scroll = document.createElement('div'); scroll.className = 'math-scroll';
    const above = document.createElement('div'); above.className = 'parameter-callout above';
    const below = document.createElement('div'); below.className = 'parameter-callout below';
    above.setAttribute('aria-live','polite'); below.setAttribute('aria-live','polite');
    const svg = document.createElementNS(NS,'svg'); svg.classList.add('parameter-lines'); svg.setAttribute('aria-hidden','true');
    math.parentNode.insertBefore(wrap,math); scroll.append(math); wrap.append(above,scroll,below,svg);
    let active;
    let connections = [];
    const draw = () => {
      svg.replaceChildren();
      for (const [symbol, box] of connections) {
        const r=wrap.getBoundingClientRect(), a=symbol.getBoundingClientRect(), b=box.getBoundingClientRect();
        const isAbove=box.parentNode===above;
        if(a.right<scroll.getBoundingClientRect().left || a.left>scroll.getBoundingClientRect().right) continue;
        const x=a.left+a.width/2-r.left, y=(isAbove?a.top:a.bottom)-r.top;
        const bx=b.left+b.width/2-r.left, by=(isAbove?b.bottom:b.top)-r.top;
        const line=document.createElementNS(NS,'path');line.setAttribute('d',`M ${x} ${y} L ${x} ${(y+by)/2} L ${bx} ${by}`);svg.append(line);
        const dot=document.createElementNS(NS,'circle');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r','3');svg.append(dot);
      }
    };
    const symbols=[...math.querySelectorAll('mi')].filter(el=>t('parameter.'+el.textContent)!=='parameter.'+el.textContent);
    const parameterKey = el => 'parameter.'+(el.textContent==='G' && math.textContent.includes('μ')?'Ḡ':el.textContent);
    const update = () => {
      above.replaceChildren(); below.replaceChildren(); connections = [];
      // Map retains the last occurrence but the first insertion order. Sort by
      // the actual anchor position so repeated symbols cannot reverse leaders.
      const unique = [...new Map(symbols.map(el => [parameterKey(el), el])).values()]
        .sort((a,b) => {
          const ra=a.getBoundingClientRect(), rb=b.getBoundingClientRect();
          return (ra.left+ra.width/2)-(rb.left+rb.width/2);
        });
      wrap.classList.toggle('all-parameters-visible', showAll);
      const displayed = showAll ? unique : active ? [active] : [];
      symbols.forEach(el => el.classList.toggle('selected-parameter', showAll || el === active));
      displayed.forEach((el,i) => {
        const label = document.createElement('span'); label.className = 'parameter-label'; label.textContent = t(parameterKey(el));
        (showAll ? (i%2 ? below : above) : (el.dataset.side==='above' ? above : below)).append(label);
        connections.push([el,label]);
      });
      requestAnimationFrame(draw);
    };
    updates.push(update);
    const choose = el => { active=el; update(); };
    symbols.forEach((el,i)=>{el.setAttribute('tabindex','0');el.setAttribute('role','button');el.setAttribute('aria-label',t(parameterKey(el)));el.dataset.side=i%2?'below':'above';el.classList.add('parameter-symbol');el.addEventListener('click',()=>choose(el));el.addEventListener('focus',()=>choose(el));el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(el);}});});
    if(symbols.length) choose(symbols[0]);
    new ResizeObserver(draw).observe(wrap);scroll.addEventListener('scroll',draw);document.fonts.ready.then(update);
  }
  refresh();
}
function demo(index, kind) {
  const section=document.createElement('div');section.className='formula-demo';
  const heading=document.createElement('h4');heading.textContent=t('animation.'+kind);section.append(heading);
  const note=document.createElement('p');note.textContent=t('animation.'+kind+'Note');section.append(note);
  const canvas=document.createElement('canvas');canvas.width=900;canvas.height=280;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',heading.textContent);section.append(canvas);
  const controls=document.createElement('div');controls.className='demo-controls';section.append(controls);
  const ctx=canvas.getContext('2d'); const fields={};
  function slider(key,min,max,step,value){const label=document.createElement('label');label.textContent=t('animation.'+key);const input=document.createElement('input');input.type='range';Object.assign(input,{min,max,step,value});const out=document.createElement('output');out.value=String(value);label.append(input,out);controls.append(label);fields[key]=input;input.addEventListener('input',()=>{out.value=input.value;if(input===driver && input.matches(':active'))position=+input.value;render();});return input;}
  let driver;
  if(kind==='phase'||kind==='project') driver=slider('phaseSlider',0,6.283,.01,0);
  if(kind==='fold')driver=slider('kSlider',-4,4,.01,.6);
  if(kind==='spectrum'){driver=slider('etaSlider',.05,.8,.01,.15);slider('weightSlider',0,1,.01,.6);}
  if(kind==='star')driver=slider('countSlider',1,4,1,1);
  const play=document.createElement('button');play.type='button';controls.append(play);
  let playing=false,raf=0,last=0,visible=false,position=+driver.value;
  const setPlay=()=>{play.textContent=t('animation.'+(playing?'pause':'play'));play.setAttribute('aria-pressed',String(playing));};
  const line=(points,color='#14685c',width=3)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();};
  const label=(s,x,y)=>{ctx.fillStyle='#19382f';ctx.font='18px "Segoe UI",sans-serif';ctx.fillText(s,x,y);};
  function render(){ctx.clearRect(0,0,900,280);ctx.fillStyle='#fff';ctx.fillRect(0,0,900,280);const v=+driver.value;
    if(kind==='phase'||kind==='project'){
      ctx.strokeStyle='#c9d8d0';ctx.lineWidth=1;ctx.beginPath();ctx.arc(170,140,95,0,Math.PI*2);ctx.stroke();line([[65,140],[275,140]],'#c9d8d0',1);line([[170,30],[170,250]],'#c9d8d0',1);
      if(kind==='phase'){line([[170,140],[170+95*Math.cos(v),140-95*Math.sin(v)]]);label(`φ = ${v.toFixed(2)} rad`,330,85);label(`Re exp(iφ) = ${Math.cos(v).toFixed(3)}`,330,130);label(`Im exp(iφ) = ${Math.sin(v).toFixed(3)}`,330,175);}
      else{let re=0,im=0;for(let j=0;j<4;j++){line([[170,140],[170+95*Math.cos(j*v),140-95*Math.sin(j*v)]],['#14685c','#b65b39','#5577a1','#856399'][j],2);re+=Math.cos(j*v)/4;im+=Math.sin(j*v)/4;}line([[170,140],[170+95*re,140-95*im]],'#162c38',5);label(`φ = ${v.toFixed(2)} rad`,330,90);label(`|Σ exp(ijφ) / 4|² = ${(re*re+im*im).toFixed(3)}`,330,135);label('j = 0, 1, 2, 3',330,180);}
    } else if(kind==='fold'){
      const K=((v+1)%2+2)%2-1,G=v-K,x=q=>450+q*85;line([[75,140],[825,140]],'#bacdc3',2);for(let q=-4;q<=4;q++){line([[x(q),133],[x(q),147]],'#849e90',1);label(String(q),x(q)-6,174);}ctx.fillStyle='#e7f1eb';ctx.fillRect(x(-1),90,170,35);line([[x(K),110],[x(v),65]],'#b65b39');ctx.fillStyle='#14685c';ctx.beginPath();ctx.arc(x(K),140,7,0,7);ctx.fill();ctx.fillStyle='#b65b39';ctx.beginPath();ctx.arc(x(v),140,5,0,7);ctx.fill();label(`k = ${v.toFixed(2)}   K = ${K.toFixed(2)}   k − K = ${G.toFixed(0)}`,220,230);
    } else {
      const eta=kind==='spectrum'?v:.18, count=kind==='star'?v:3, colors=['#14685c','#b65b39','#5577a1','#856399'];
      line([[65,30],[65,225],[850,225]],'#849e90',1);
      const lor=(x,c)=>eta/(Math.PI*((x-c)**2+eta**2));
      const curves=Array.from({length:kind==='star'?4:3},(_,j)=>Array.from({length:501},(_,i)=>{const x=8*i/500;return kind==='star'?(.5+.08*j)*lor(x,3.5+.28*j):([1,+fields.weightSlider.value,.4][j])*lor(x,[2,4,6][j]);}));
      const sum=curves[0].map((_,i)=>kind==='star'?curves.slice(0,count).reduce((s,c)=>s+c[i],0)/count:curves.reduce((s,c)=>s+c[i],0));const max=Math.max(...sum,...curves.flat())*1.12;
      curves.forEach((c,j)=>line(c.map((y,i)=>[65+785*i/500,225-190*y/max]),kind==='star'&&j>=count?'#dbe3de':colors[j],1.5));line(sum.map((y,i)=>[65+785*i/500,225-190*y/max]),'#142e25',3);
      for(let x=0;x<=8;x+=2)label(String(x),60+785*x/8,250);label(t('animation.frequency'),360,276);label(kind==='star'?`M = ${count}`:`η = ${eta.toFixed(2)} THz`,665,35);
    }
  }
  function tick(now){if(!playing||!visible||document.hidden)return;const dt=Math.min((now-last)/1000||0,.05);last=now;if(!driver.matches(':active')){const step=+driver.step;let val=position+dt*(kind==='fold'?.6:kind==='spectrum'?.08:kind==='star'?0: .6);if(kind==='star')val=1+Math.floor(now/1200)%4;if(val>+driver.max)val=+driver.min;position=val;driver.value=String(Math.round(val/step)*step);driver.dispatchEvent(new Event('input'));}raf=requestAnimationFrame(tick);}
  function resume(){cancelAnimationFrame(raf);last=performance.now();position=+driver.value;if(playing&&visible&&!document.hidden)raf=requestAnimationFrame(tick);}
  play.addEventListener('click',()=>{playing=!playing;const r=section.getBoundingClientRect();visible=r.bottom>0&&r.top<innerHeight;setPlay();resume();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;resume();}).observe(section);document.addEventListener('visibilitychange',resume);
  equations[index].closest('article').append(section);setPlay();render();
}
demo(0,'phase');demo(1,'fold');demo(2,'project');demo(3,'spectrum');demo(7,'star');
