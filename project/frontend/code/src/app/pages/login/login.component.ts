import { Component, ElementRef, OnInit, HostListener } from "@angular/core";
import { environment } from "../../environments/environment";
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../../app.component.css"],
})

export class LoginComponent {
  
  registerForm2: FormGroup = this.formBuilder.group({
    fa: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });
  registerForm: FormGroup = this.formBuilder.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  postLogin: string = environment.baseUrl+environment.users+'/login';

  cont: any= 0;
  mostrar: any= false;
  mostrar2: any= false;
  mostrar3: any= false;
  mostrar4: any= false;
  mostrar5: any= false;
  fa: string | undefined;
  change1= false;

  alertCreNot= false;
  alertServNot= false;
  alertDifNot= false;
  passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;

  id= 1;
  username= 'davidsaav';
  token= '';

  constructor(private authService:AuthService, private formBuilder: FormBuilder, private router: Router, private http: HttpClient) { }

  formlogin = {
    user: "",
    password: "",
  };

  passwordFieldType = 'password';

  get registerFormControl() {
    return this.registerForm.controls;
  }

  togglePasswordType() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  login(form: any) {
      let token = localStorage.getItem('token') ?? '';
      if (form.valid) {
        const { user, password } = this.formlogin;

        // Validar el nombre de usuario
        if (!this.isValidUsername(user)) {
            console.error("Nombre de usuario no válido");
            return;
        }

        // Validar la contraseña
        if (!this.isValidPassword(password)) {
            console.error("Contraseña no válida");
            return;
        }
  
        // Codificar datos antes de enviarlos al servidor para prevenir XSS
        const encodedFormLogin = {
            user: encodeURIComponent(this.formlogin.user),
            password: encodeURIComponent(this.formlogin.password)
        };

        // Crear opciones HTTP con el token de autorización
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json; charset=UTF-8',
                'Authorization': `${token}`
            })
        };

        // Realizar la solicitud HTTP
        this.http.post(this.postLogin, JSON.stringify(this.formlogin), httpOptions)
        .subscribe(
          (data: any) => {
            this.username= data.user;
            this.id= data.id;
            this.saveStorage();
            localStorage.setItem('token', data.token);
            this.setCookie('refresh_token', data.refresh_token);
            localStorage.setItem('change_password', data.change_password);
            this.router.navigate(['/devices']);
          },
          (error: any) => {
            if (error.status === 401) {
              console.error("Credenciales incorrectas");
              this.alertCreNot = true;
              setTimeout(() => {
                this.alertCreNot = false;
              }, 2000);
            } 
            else if (error.status === 500) {
              console.error("Error en el servidor");
              this.alertServNot = true;
              setTimeout(() => {
                this.alertServNot = false;
              }, 2000);
            } 
            else {
              console.error("Error desconocido:", error);
              this.alertDifNot = true;
              setTimeout(() => {
                this.alertDifNot = false;
              }, 2000);
            }
          }
        );
      this.change1 = false;
    }

  }
    
  // Fnombre de usuario
  isValidUsername(username: string): boolean {
    return username.trim().length >= 3 && username.trim().length <= 20;
  }

  // contraseña
  isValidPassword(password: string): boolean {
    const minLength = 8;
    const maxLength = 20;
    const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;
    if (password.trim().length < minLength || password.trim().length > maxLength) {
        return false;
    }
    if (!passwordPattern.test(password)) {
        return false;
    }
    return true;
  }

  saveStorage() { // Guarda datos en el local storage
    localStorage.setItem("id", this.id.toString());
    localStorage.setItem("username", this.username);
  }

  readStorage() { // Recupera datos del local storage
    const idString: string | null = localStorage.getItem("id");
    const id: number = idString !== null ? parseInt(idString) : 1; 
    this.id = id;    
    this.username = localStorage.getItem("username") ?? "davidsaav";
    this.token = localStorage.getItem('token') ?? '';
  }

  // Guardar cookie
  setCookie(name: string, value: string, days: number = 1): void {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    const cookieString = `${name}=${value};expires=${expirationDate.toUTCString()};path=/`;
    document.cookie = cookieString;
  }

  removeSpaces(event: any) {
    event.target.value = event.target.value.replace(/\s/g, ''); // Esto elimina todos los espacios en blanco
  }
}
