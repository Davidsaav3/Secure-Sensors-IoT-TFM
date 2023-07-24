import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['../app.component.css']
})
export class NavbarComponent {
  activeLang = 'es';

  dup_ok=false;
  dup_not=false;
  rute='';
  rute2: any;

  constructor(private translate: TranslateService,public rutaActiva: Router ) {
    this.translate.setDefaultLang(this.activeLang);
    this.rute= this.rutaActiva.routerState.snapshot.url;
    this.rute2 = this.rute.split('/');
  }

  changeLenguaje() {
    setTimeout(() =>{ 
      this.translate.use(this.activeLang);
    }, 1);
  }
  
}
