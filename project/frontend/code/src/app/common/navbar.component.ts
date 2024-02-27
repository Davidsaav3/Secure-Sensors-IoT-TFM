import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { environment } from "../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["../app.component.css"],
})

export class NavbarComponent {
  
  @ViewChild('confirmDeleteModal2') confirmDeleteModal2!: ElementRef;
  @ViewChild('confirmDeleteModal3') confirmDeleteModal3!: ElementRef;

  lengName = environment.languageName;
  lengLang = environment.languageLang;
  activeLang = environment.languageLang[0];
  AppVersion = environment.AppVersion;
  rute = "";
  isActive: boolean = false;
  ruteAux: any;
  name= "settings"
  change1= false;
  change2= false;

  username= "davidsaav";
  id= 1;
  token= '';

  alertPassOk= false;
  alertEmailOk= false;
  alertPassNot= false;
  alertEmailNot= false;

  postEmail: string = environment.baseUrl+environment.users+'/email';
  postPass: string = environment.baseUrl+environment.users+'/password';

  formapassword = {
    id: this.id,
    password: "",
    newpassword1: "",
    newpassword2: "",
  };

  formuserdata = {
    id: this.id,
    email: "",
  };

  constructor(private http: HttpClient, private translate: TranslateService, public router: Router) {
    this.rute = this.router.routerState.snapshot.url;
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

  onOptionSelected(event: any): void {
    const selectedOption = event.target.value;
    if (selectedOption === '1') {
      
    } 
    if (selectedOption === '2') {
      this.router.navigate(['/login']);
    }
  }

  changeEmail(form: any){ // Editar perfil
    let token = localStorage.getItem('token') ?? ''; 

    //if (form.valid) {
      const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}`})};
      this.http.put(this.postEmail, JSON.stringify(this.formuserdata), httpOptions)
        .subscribe(
          (data: any) => {
            this.alertEmailOk = true;
            console.log(data)
            localStorage.setItem("username", data.email);
            //const modal: any = this.confirmDeleteModal3.nativeElement;
            //modal.modal('hide'); 
            setTimeout(() => {
              this.alertEmailOk = false;
            }, 2000);
          },
          (error) => {
            console.error("Error:", error);
            this.alertEmailNot = true;
            setTimeout(() => {
              this.alertEmailNot = false;
            }, 2000);
          }
        );
      this.change1 = false;
    //}
  }

  changePassword(form: any){ // Cambiar contraseña
    let token = localStorage.getItem('token') ?? ''; 

    if (form.valid) {
      const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}`})};
      this.http.put(this.postPass, JSON.stringify(this.formapassword), httpOptions)
        .subscribe(
          (data: any) => {
            this.alertPassOk = true;
            //const modal: any = this.confirmDeleteModal2.nativeElement;
            //modal.modal('hide'); 
            setTimeout(() => {
              this.alertPassOk = false;
            }, 2000);
          },
          (error) => {
            console.error("Error:", error);
            this.alertPassNot = true;
            setTimeout(() => {
              this.alertPassNot = false;
            }, 2000);
          }
        );
      this.change1 = false;
    }
  }

  saveStorage() { // Guarda datos en el local storage
    localStorage.setItem("id", this.id.toString());
    localStorage.setItem("username", this.username);
    localStorage.setItem("activeLang", this.activeLang);
  }

  readStorage() { // Recupera datos del local storage
    const idString: string | null = localStorage.getItem("id");
    const id: number = idString !== null ? parseInt(idString) : 1; 
    this.id = id;    
    this.username = localStorage.getItem("username") ?? "davidsaav";
    this.activeLang = localStorage.getItem("activeLang") ?? "es";
    this.token = localStorage.getItem('token') ?? '';
  }

  logOut(){
    localStorage.removeItem("id");
    localStorage.removeItem("username");
    localStorage.removeItem("activeLang");
    localStorage.setItem('token', '');
    this.router.navigate(['/login']);
  }

}
