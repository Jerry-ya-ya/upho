import {Component, inject, signal} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
import zh from './i18n/zh-Hant.json';
import en from './i18n/en.json';
import {DomSanitizer} from '@angular/platform-browser';
@Component({selector:'app-root', standalone:true, template:`
<header><button class="language" (click)="toggleLanguage()" aria-label="切換語言 / Switch language">🌐 {{lang()==='en'?'繁體中文':'English'}}</button><a class="brand" href="#home">UPHO <span>REFERENCE</span></a><a href="https://github.com/Jerry-ya-ya/upho">GitHub ↗</a></header>
<nav aria-label="主導覽">@for(page of pages; track page.id){<a [href]="'#'+page.id" [class.active]="current()===page.id" [attr.aria-current]="current()===page.id?'page':null">{{t(page.title)}}</a>}</nav>
@if(current()==='home'){<main><p class="eyebrow">CRYSTALS / VIBRATIONS / UNFOLDING</p><h1>{{t('從晶體結構，')}}<br>{{t('理解聲子展開。')}}</h1><p class="lead">{{t('以互動模型、振動示意與投影公式，探索原子排列如何形塑聲子頻譜。')}}</p><div class="topics">@for(page of pages.slice(1); track page.id){<a [href]="'#'+page.id"><small>{{page.number}}</small><h2>{{t(page.title)}}</h2><p>{{t(page.description)}}</p><span>{{t('開始探索 ↗')}}</span></a>}</div></main>}
@else{<iframe [src]="url()" [title]="title()"></iframe>}
<footer>{{t('UPHO · 晶體結構與聲子展開學習筆記')}}</footer>`})
class App {
 lang=signal(localStorage.getItem('upho-language')==='en'?'en':'zh-Hant');
 t(s:string){return ((this.lang()==='en'?en:zh) as Record<string,string>)[s]||s;}
 toggleLanguage(){this.lang.set(this.lang()==='en'?'zh-Hant':'en');localStorage.setItem('upho-language',this.lang());document.documentElement.lang=this.lang();}
 sanitizer=inject(DomSanitizer);
 pages=[{id:'home',title:'首頁',number:'',description:'',file:''},{id:'crystals',title:'晶體結構',number:'01',description:'旋轉 BCC、FCC 與 HCP 模型，觀察最近鄰連接。',file:'crystal_structures.html'},{id:'modes',title:'聲子模態',number:'02',description:'比較聲學與光學模態的相位、位移與色散。',file:'phonon_modes.html'},{id:'formulas',title:'展開公式',number:'03',description:'從動力矩陣到平移投影，理解頻譜與元素分解。',file:'phonon_unfolding_formulas.html'}];
 current=signal('home');
 constructor(){const update=()=>{const id=location.hash.slice(1);this.current.set(this.pages.some(p=>p.id===id)?id:'home');};update();window.addEventListener('hashchange',update);}
 title(){return this.pages.find(p=>p.id===this.current())!.title;}
 url(){return this.sanitizer.bypassSecurityTrustResourceUrl('content/'+this.pages.find(p=>p.id===this.current())!.file+'?lang='+this.lang());}
}
bootstrapApplication(App).catch(console.error);
