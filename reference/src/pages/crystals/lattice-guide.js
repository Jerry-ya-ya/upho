await window.i18nReady;
const t=window.translate;
const spacing=document.querySelector('#lattice-spacing'), repeats=document.querySelector('#lattice-repeat');
const canvas=document.querySelector('#reciprocal-demo'), ctx=canvas.getContext('2d');
function render(){
  const a=+spacing.value,N=+repeats.value,L=N*a,b=2*Math.PI/a,B=b/N;
  document.querySelector('#spacing-value').value=a.toFixed(1);
  document.querySelector('#repeat-value').value=String(N);
  document.querySelector('#reciprocal-values').textContent=`L = Na = ${L.toFixed(1)} Å; 2π/a = ${b.toFixed(3)} Å⁻¹; 2π/L = ${B.toFixed(3)} Å⁻¹`;
  canvas.dataset.supercellLength=String(L);canvas.dataset.reciprocalSpacing=String(B);
  ctx.clearRect(0,0,1000,360);ctx.fillStyle='#fff';ctx.fillRect(0,0,1000,360);
  const text=(str,x,y,color='#243f38')=>{ctx.fillStyle=color;ctx.font='19px "Microsoft JhengHei",sans-serif';ctx.fillText(str,x,y);};
  const line=(x1,y1,x2,y2,color='#81988c')=>{ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();};
  text(t('guide.real'),20,28);text(`a = ${a.toFixed(1)} Å    N = ${N}    L = ${L.toFixed(1)} Å`,220,28);
  const start=90,scale=32,end=start+L*scale;
  ctx.fillStyle='#dceaf7';ctx.fillRect(start,48,end-start,62);
  line(55,80,925,80);
  for(let j=0;j<=N;j++){const x=start+j*a*scale;line(x,48,x,110,'#8aabc5');ctx.fillStyle='#315e88';ctx.beginPath();ctx.arc(x,80,6,0,2*Math.PI);ctx.fill();}
  text('0',start-5,137);text('a',start+a*scale-5,137);if(N>1)text('Na',end-14,137);
  text(t('guide.reciprocal'),20,181);
  const center=500,rscale=100;
  ctx.fillStyle='#edf3ee';ctx.fillRect(center-b/2*rscale,210,b*rscale,50);
  ctx.fillStyle='#b9d5ce';ctx.fillRect(center-B/2*rscale,210,B*rscale,50);
  line(80,235,920,235);line(center,202,center,268);
  for(const sign of [-1,1]){line(center+sign*b/2*rscale,210,center+sign*b/2*rscale,260);line(center+sign*B/2*rscale,210,center+sign*B/2*rscale,260,'#14685c');}
  text('−π/a',center-b/2*rscale-25,292);text('Γ',center-7,292);text('π/a',center+b/2*rscale-15,292);text('k (Å⁻¹)',875,211);
  text(t('guide.primitive')+`: [−π/a, π/a]`,30,332);
  text(t('guide.super')+`: [−π/L, π/L]`,500,332,'#14685c');
}
spacing.addEventListener('input',render);repeats.addEventListener('input',render);render();document.fonts.ready.then(render);
