import {Component,inject,input} from '@angular/core';
import {I18nService} from '../i18n/i18n.service';
import {pages} from '../../pages/pages';
@Component({selector:'app-navigation',standalone:true,templateUrl:'./navigation.component.html',styleUrl:'./navigation.component.css'})
export class NavigationComponent {readonly i18n=inject(I18nService);readonly current=input('home');readonly pages=pages;}
