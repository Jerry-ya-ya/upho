import {Component,computed,inject,input} from '@angular/core';
import {HomeComponent} from '../../pages/home/home.component';
import {DomSanitizer} from '@angular/platform-browser';
import {I18nService} from '../i18n/i18n.service';
import {pages,ReferencePage} from '../../pages/pages';
@Component({selector:'app-content',standalone:true,imports:[HomeComponent],styleUrl:'./content.component.css',templateUrl:'./content.component.html'})
export class ContentComponent {
 readonly i18n=inject(I18nService);readonly pages=pages;readonly page=input.required<ReferencePage>();
 private readonly sanitizer=inject(DomSanitizer);
 readonly url=computed(()=>this.sanitizer.bypassSecurityTrustResourceUrl('content/'+this.page().file+'?lang='+this.i18n.lang()));
}
