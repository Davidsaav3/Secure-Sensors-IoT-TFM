import { Component , OnInit} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from "./environments/environment"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  active_lang = environment.lenguaje_lang;
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang(this.active_lang[0]);
  }

  changeLenguaje(lang: any) {
    this.active_lang = lang;
    this.translate.use(lang);
  }
  
  title = 'Sensors';
}
