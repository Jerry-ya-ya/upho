import {Component,inject} from '@angular/core';
import {I18nService} from '../../modules/i18n/i18n.service';
import {pages} from '../pages';
@Component({selector:'app-home',standalone:true,templateUrl:'./home.component.html',styleUrl:'./home.component.css'})
export class HomeComponent {readonly i18n=inject(I18nService);readonly pages=pages;}
