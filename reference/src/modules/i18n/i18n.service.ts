import {Injectable, signal, effect} from '@angular/core';
import {Title} from '@angular/platform-browser';
import zh from '../../i18n/zh-Hant.json';
import en from '../../i18n/en.json';
@Injectable({providedIn:'root'})
export class I18nService {
 readonly lang=signal(localStorage.getItem('upho-language')==='en'?'en':'zh-Hant');
 constructor(title:Title){effect(()=>{document.documentElement.lang=this.lang();title.setTitle(this.lang()==='en'?'UPHO · Phonon learning notes':'UPHO · 聲子學習筆記');});}
 t(s:string){return ((this.lang()==='en'?en:zh) as Record<string,string>)[s]||s;}
 toggle(){this.lang.update(v=>v==='en'?'zh-Hant':'en');localStorage.setItem('upho-language',this.lang());}
}
