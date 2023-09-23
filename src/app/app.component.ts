import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from "./environments/environment"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  activeLang = environment.languageLang;
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang(this.activeLang[0]);
  }

  changeLenguaje(lang: any) {
    this.activeLang = lang;
    this.translate.use(lang);
  }
  
  title = 'Sensors';
}
