import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { environment } from "../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["../app.component.css"],
})

export class NavbarComponent {
  
  @ViewChild('confirmDeleteModal2') confirmDeleteModal2!: ElementRef;
  @ViewChild('confirmDeleteModal3') confirmDeleteModal3!: ElementRef;
  @ViewChild('openModalButton') openModalButton: ElementRef | undefined;
  @ViewChild('clouseModalButton') clouseModalButton: ElementRef | undefined;

  lengName = environment.languageName;
  lengLang = environment.languageLang;
  activeLang = environment.languageLang[0];
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
  alertUserOk= false;
  alertPassNot= false;
  alertUserNot= false;

  postUser: string = environment.baseUrl+environment.users;
  but= false;
  changed= false;
  scriptEnable= false;

  status = 2; 
  date= ''; 
  backendURL: string = "http://localhost:5172/api/script";

  formapassword = {
    id: this.id,
    password: "",
  };

  formuserdata = {
    id: this.id,
    user: "",
  };

  constructor(private authService: AuthService,private renderer: Renderer2, private http: HttpClient, private translate: TranslateService, public router: Router) {
    this.rute = this.router.routerState.snapshot.url;
    this.ruteAux = this.rute.split("/");
  }

  passwordFieldType = 'password';
  passwordFieldType1 = 'password';

  ngOnInit(): void { // Inicializa
    if (localStorage.getItem('status')) {
      let aux= localStorage.getItem('status');
      if(aux!=null)
        this.status=  parseInt(aux, 10);
    }
    else{
      this.status= 2;
    }

    if (localStorage.getItem('date')) {
      let storedDate = localStorage.getItem('date');
      if (storedDate !== null) {
        this.date = storedDate;
      }   
    }
    else{
      this.date= '';
    }

    this.readStorage();
    this.translate.use(this.activeLang);
    if(this.authService.isAuthenticated()){
      setInterval(() => {
        this.statusScript();
      }, 5000);
    }
  }

  togglePasswordType() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  togglePasswordType1() {
    this.passwordFieldType1 = this.passwordFieldType1 === 'password' ? 'text' : 'password';
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

  clouseModal() {
    if(this.clouseModalButton!=null){
      this.renderer.selectRootElement(this.clouseModalButton.nativeElement).click();
    }
  }

  clouseModalUser() {
    if(this.clouseModalButton!=null){
      this.renderer.selectRootElement(this.clouseModalButton.nativeElement).click();
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

  changeUser(form: any) { // Editar perfil
    let token = localStorage.getItem('token') ?? ''; 
  
    //if (form.valid) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': `${token}`
      })
    };
    this.formuserdata.id= this.id;

    this.http.put(this.postUser, JSON.stringify(this.formuserdata), httpOptions)
      .subscribe(
        (data: any) => {
          this.alertUserOk = true;
          //this.clouseModalUser();
          //console.log(data.user)
          this.setCookie('refresh_token', data.refresh_token);
          localStorage.setItem("username", data.user);
          

          setTimeout(() => {
            this.alertUserOk = false;
          }, 2000);
        },
        (error) => {
          console.error("Error:", error);
          this.alertUserNot = true;
          setTimeout(() => {
            this.alertUserNot = false;
          }, 2000);
        }
      );
    this.change1 = false;
    //}
  }
  
    // Guardar cookie
    setCookie(name: string, value: string, days: number = 1): void {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + days);
      const cookieString = `${name}=${value};expires=${expirationDate.toUTCString()};path=/`;
      document.cookie = cookieString;
    }

  changePassword(form: any) { // Cambiar contraseña
    let token = localStorage.getItem('token') ?? ''; 
  
    if (form.valid) {
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': `${token}`
        })
      };
      this.formapassword.id= this.id;
      
      this.http.put(this.postUser, JSON.stringify(this.formapassword), httpOptions)
        .subscribe(
          (data: any) => {
            this.alertPassOk = true;
            this.change_password = false;
  
            localStorage.setItem('change_password', "0");
            //this.clouseModal();
            
            setTimeout(() => {
              this.alertPassOk = false;
            }, 2000);
          },
          (error) => {
            this.change_password = false;
            localStorage.setItem('change_password', "0");
  
            console.error("Error:", error);
            this.alertPassNot = true;
            
            if (error && error.errors) {
              // Handle errors here
              // For example, you can access error.errors and display appropriate error messages
            }
            
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
    this.formuserdata.user= this.username;
  }

  logOut(){
    localStorage.removeItem("id");
    this.deleteCookie('refresh_token');
    localStorage.removeItem("username");
    localStorage.removeItem("activeLang");
    localStorage.removeItem("date");
    localStorage.removeItem("status");
    localStorage.setItem('token', '');
    this.router.navigate(['/login']);
  }

  deleteCookie(name: string): void {  // Eliminar cookie por nombre
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  removeSpaces(event: any) {
    event.target.value = event.target.value.replace(/\s/g, ''); 
  }

  statusScript(): void { // STATUS //
    let token = localStorage.getItem('token') ?? ''; 
    let headers = new HttpHeaders().set('Authorization', `${token}`);

    if(this.authService.isAuthenticated()){
      this.http.get<any>(this.backendURL + "/script-status", {headers}).subscribe(
        (data) => {
          this.date= data.date;
          this.status= data.status;
          localStorage.setItem('status', this.status.toString());
          localStorage.setItem('date', this.date.toString());
        },
        (error) => {
          console.error("Error al obtener el estado:", error);
        }
      );
    }
  }
}
