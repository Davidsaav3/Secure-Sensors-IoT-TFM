import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { environment } from "../environments/environment";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["../app.component.css"],
})

export class NavbarComponent {
  
  lengName = environment.languageName;
  lengLang = environment.languageLang;
  activeLang = environment.languageLang[0];
  rute = "";
  ruteAux: any;

  constructor(private translate: TranslateService, public rutaActiva: Router) {
    this.rute = this.rutaActiva.routerState.snapshot.url;
    this.ruteAux = this.rute.split("/");
  }

  ngOnInit(): void {
    // Inicializador
    this.readStorage();
    this.translate.use(this.activeLang);
  }

  changeLanguage() {
    // Cambia lenguaje
    this.saveStorage();
    this.translate.use(this.activeLang);
  }

  saveStorage() {
    // Guarda datos
    localStorage.setItem("activeLang", this.activeLang);
  }

  readStorage() {
    // Recupera datos
    this.activeLang = localStorage.getItem("activeLang") ?? "es";
  }
}
