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
  AppVersion = environment.AppVersion;
  rute = "";
  isActive: boolean = false;
  ruteAux: any;
  name= "settings"

  constructor(private translate: TranslateService, public rutaActiva: Router) {
    this.rute = this.rutaActiva.routerState.snapshot.url;
    this.ruteAux = this.rute.split("/");
  }

  ngOnInit(): void { // Inicializa
    this.readStorage();
    this.translate.use(this.activeLang);
  }

  toggleState() {
    this.isActive = !this.isActive;
    if(this.isActive){
      this.rute= "/devices";
      this.name= "settings"
    }
    if(!this.isActive){
      this.rute= "/users";
      this.name= "management"
    }
  }

  isActiveOption(option: boolean): boolean {
    return option;
  }

  changeLanguage() { // Cambia lenguaje
    this.saveStorage();
    this.translate.use(this.activeLang);
  }

  saveStorage() { // Guarda datos en el local storage
    localStorage.setItem("activeLang", this.activeLang);
  }

  readStorage() { // Recupera datos del local storage
    this.activeLang = localStorage.getItem("activeLang") ?? "es";
  }
}
