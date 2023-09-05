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
  activeLang = environment.lenguaje_lang[0];
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
    this.translate.use(this.activeLang);
  }

  changeLenguaje() {
    setTimeout(() =>{ 
      this.saveStorage();
      this.translate.use(this.activeLang);
    }, 1);
  }

  saveStorage() { // Guarda datos
    localStorage.setItem('activeLang', this.activeLang);
  }
  readStorage() { // Recupera datos
    this.activeLang = localStorage.getItem('activeLang') ?? 'es';
  }
  
}
