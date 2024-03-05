import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { environment } from "../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as bootstrap from "bootstrap";
import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["../app.component.css"],
})

export class NavbarComponent {
  
  @ViewChild('confirmDeleteModal2') confirmDeleteModal2!: ElementRef;
  @ViewChild('confirmDeleteModal3') confirmDeleteModal3!: ElementRef;
  @ViewChild('openModalButton') openModalButton: ElementRef | undefined;

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
  passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;
  alerts= false;
  change_password= false;

  username= "davidsaav";
  id= 1;
  token= '';

  alertPassOk= false;
  alertEmailOk= false;
  alertPassNot= false;
  alertEmailNot= false;

  postEmail: string = environment.baseUrl+environment.users+'/email';
  postPass: string = environment.baseUrl+environment.users+'/password';
  but= false;
  changed= false;

  formapassword = {
    id: this.id,
    password: "",
    newpassword1: "",
    newpassword2: "",
    email: this.username
  };

  formuserdata = {
    id: this.id,
    email: "",
  };

  constructor(private renderer: Renderer2, private http: HttpClient, private translate: TranslateService, public router: Router) {
    this.rute = this.router.routerState.snapshot.url;
    this.ruteAux = this.rute.split("/");
  }

  ngOnInit(): void { // Inicializa
    this.readStorage();
    this.translate.use(this.activeLang);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.change_password) {
        this.openModal();
      }
    });
  }

  openModal() {
    if(this.openModalButton!=null){
    this.renderer.selectRootElement(this.openModalButton.nativeElement).click();
    }
  }

  setBackdropAttribute(): void {
    const modal = document.getElementById('confirmDeleteModal2');
    if (modal) {
      if (this.change_password) {
        modal.setAttribute('data-bs-backdrop', 'static');
        
        //modal.classList.add('show');
        //const modalInstance = new bootstrap.Modal(modal);
        //modalInstance.show();
      } 
      else {
        modal.removeAttribute('data-bs-backdrop');

        //modal.classList.remove('show');
        //const modalInstance = new bootstrap.Modal(modal);
        //modalInstance.hide();
      }
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
    this.formuserdata.id= this.id;

    //if (form.valid) {
      const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}`})};
      //console.log(this.formuserdata)
      this.http.put(this.postEmail, JSON.stringify(this.formuserdata), httpOptions)
        .subscribe(
          (data: any) => {
            this.alertEmailOk = true;
            //console.log(data)
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
    this.formapassword.id= this.id;
    this.formapassword.email= this.username;

    if (form.valid) {
      const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}`})};
      this.http.put(this.postPass, JSON.stringify(this.formapassword), httpOptions)
        .subscribe(
          (data: any) => {
            this.alertPassOk = true;
            this.change_password= false;
            localStorage.setItem('change_password', "0");
            //const modal: any = this.confirmDeleteModal2.nativeElement;
            //modal.modal('hide'); 

            setTimeout(() => {
              this.alertPassOk = false;
            }, 2000);
          },
          (error) => {
            this.change_password= false;
            localStorage.setItem('change_password', "0");
            //this.setBackdropAttribute();

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
    const storedValue = localStorage.getItem('change_password');
    this.change_password = storedValue !== null ? JSON.parse(storedValue) : false;
    if(this.change_password){
      this.setBackdropAttribute();
    }
  }

  logOut(){
    localStorage.removeItem("id");
    localStorage.removeItem("username");
    localStorage.removeItem("activeLang");
    localStorage.setItem('token', '');
    this.router.navigate(['/login']);
  }

}
