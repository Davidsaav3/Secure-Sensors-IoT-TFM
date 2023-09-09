import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { environment } from "../environments/environment"

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['../app.component.css']
})
export class NavbarComponent {
  leng_name= environment.lenguaje_name;
  leng_lang= environment.lenguaje_lang;
  active_lang = environment.lenguaje_lang[0];
  dup_ok=false;
  dup_not=false;
  rute='';
  rute2: any;

  constructor(private translate: TranslateService,public rutaActiva: Router) {
    this.rute= this.rutaActiva.routerState.snapshot.url;
    this.rute2 = this.rute.split('/');
  }

  ngOnInit(): void {
    this.readStorage();
    this.translate.use(this.active_lang);
  }

  changeLenguaje() {
    this.saveStorage();
    this.translate.use(this.active_lang);
  }

  saveStorage() { // Guarda datos
    localStorage.setItem('active_lang', this.active_lang);
  }
  readStorage() { // Recupera datos
    this.active_lang = localStorage.getItem('active_lang') ?? 'es';
  }
  
}
