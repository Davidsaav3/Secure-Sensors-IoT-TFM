import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from "../../environments/environment";
import { HttpOptionsService } from '../../services/httpOptions.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["../../app.component.css"],
})

export class LoginComponent implements OnDestroy {

  registerForm2: FormGroup = this.formBuilder.group({
    fa: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });
  registerForm: FormGroup = this.formBuilder.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  postLogin: string = environment.baseUrl + environment.url.users + '/login';

  cont: any = 0;
  mostrar: any = false;
  mostrar2: any = false;
  mostrar3: any = false;
  mostrar4: any = false;
  mostrar5: any = false;
  fa: string | undefined;
  change1 = false;

  temp1: any = null;
  temp2: any = null;
  temp3: any = null;

  alertCreNot = false;
  alertServNot = false;
  alertDifNot = false;
  passwordPattern = environment.password_pattern;;

  id = 1;
  username = 'davidsaav';
  token = '';

  constructor(private httpOptionsService: HttpOptionsService, private storageService: StorageService, private formBuilder: FormBuilder, private router: Router, private http: HttpClient) { }

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

  ngOnDestroy() {
    if(this.temp1!=null) 
      clearTimeout(this.temp1);
    if(this.temp2!=null) 
      clearTimeout(this.temp2);
    if(this.temp3!=null) 
      clearTimeout(this.temp3);
  }

  login(form: any) {
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

      // Realizar la solicitud HTTP
      this.http.post(this.postLogin, JSON.stringify(this.formlogin), this.httpOptionsService.getHttpOptions())
        .subscribe(
          (data: any) => {
            this.username = data.user;
            this.id = data.id;
            this.saveStorage();
            this.storageService.setToken(data.token)
            this.setCookie('refresh_token', data.refresh_token);
            this.storageService.setChange(data.change_password.toString());
            this.router.navigate(['/devices']);
          },
          (error: any) => {
            if (error.status === 401) {
              console.error("Credenciales incorrectas");
              this.alertCreNot = true;
              this.temp1 = setTimeout(() => {
                this.alertCreNot = false;
              }, 2000);
            }
            else if (error.status === 500) {
              console.error("Error en el servidor");
              this.alertServNot = true;
              this.temp2 = setTimeout(() => {
                this.alertServNot = false;
              }, 2000);
            }
            else {
              console.error("Error desconocido:", error);
              this.alertDifNot = true;
              this.temp3 = setTimeout(() => {
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
    const passwordPattern = environment.password_pattern;;
    if (password.trim().length < minLength || password.trim().length > maxLength) {
      return false;
    }
    if (!passwordPattern.test(password)) {
      return false;
    }
    return true;
  }

  saveStorage() { // Guarda datos en el local storage
    this.storageService.setId(this.id.toString());
    this.storageService.setUsername(this.username);
  }

  readStorage() { // Recupera datos del local storage
    const idString: string | null = this.storageService.getId();
    const id: number = idString !== null ? parseInt(idString) : 1;
    this.id = id;
    this.username = this.storageService.getUsername() ?? "davidsaav";
    this.token = this.storageService.getToken() ?? '';
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
