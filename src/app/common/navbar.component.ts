import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { environment } from "../../../environments/environment"
import { DataSharingService } from '../services/data_sharing.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['../app.component.css']
})
export class NavbarComponent {
  leng_name= environment.lenguaje_name;
  leng_lang= environment.lenguaje_lang;
  activeLang = environment.lenguaje_lang[0];
  dup_ok=false;
  dup_not=false;
  rute='';
  rute2: any;

  constructor(private translate: TranslateService,public rutaActiva: Router ,private dataSharingService: DataSharingService) {
    this.translate.setDefaultLang(this.activeLang);
    this.rute= this.rutaActiva.routerState.snapshot.url;
    this.rute2 = this.rute.split('/');
  }

  changeLenguaje() {
    setTimeout(() =>{ 
      this.translate.use(this.activeLang);
      this.dataSharingService.updatesharedLeng(this.activeLang);
    }, 1);

  }
  
}
