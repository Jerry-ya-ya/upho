window.i18nReady=(async()=>{
const lang=new URLSearchParams(location.search).get('lang')||localStorage.getItem('upho-language')||'zh-Hant';
const data=await fetch(new URL('../../i18n/'+(lang==='en'?'en':'zh-Hant')+'.json',document.baseURI)).then(r=>r.json());
document.documentElement.lang=lang;
const t=s=>data[s.trim()]||s;
const apply=()=>{document.querySelectorAll("[data-i18n]").forEach(e=>{const v=data[e.dataset.i18n];if(v && e.textContent!==v)e.textContent=v;});const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=walk.nextNode()){if(n.parentElement.closest('script,style,math,pre,code'))continue;const v=t(n.data);if(v!==n.data.trim())n.data=n.data.replace(n.data.trim(),v);}document.querySelectorAll('[title],[aria-label]').forEach(e=>{for(const a of ['title','aria-label'])if(e.hasAttribute(a))e.setAttribute(a,t(e.getAttribute(a)));});};
const fill=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(s,...args){return fill.call(this,t(String(s)),...args);};
window.translate=t;
const observer=new MutationObserver(()=>{observer.disconnect();apply();observer.observe(document.body,{childList:true,subtree:true,characterData:true});});
const start=()=>{apply();observer.observe(document.body,{childList:true,subtree:true,characterData:true});};if(document.readyState==='loading')window.addEventListener('DOMContentLoaded',start);else start();
})();