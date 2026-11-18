import {Component,computed,inject,signal} from '@angular/core';
import {NavigationComponent} from '../../modules/navigation/navigation.component';
import {ContentComponent} from '../../modules/content/content.component';
import {I18nService} from '../../modules/i18n/i18n.service';
import {pages} from '../pages';
@Component({selector:'app-root',standalone:true,imports:[NavigationComponent,ContentComponent],templateUrl:'./shell.component.html',styleUrl:'./shell.component.css'})
export class App {
 readonly i18n=inject(I18nService);readonly current=signal('home');
 readonly page=computed(()=>pages.find(p=>p.id===this.current())||pages[0]);
 constructor(){const update=()=>this.current.set(location.hash.slice(1)||'home');update();window.addEventListener('hashchange',update);}
}

