import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from "./environments/environment"
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from "@angular/router";
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = environment.title;
  postRefresh: string = environment.baseUrl + environment.url.users + '/refresh';
  AppVersion = environment.AppVersion;
  activeLang = environment.languageLang;
  constructor(private storageService: StorageService, private authService: AuthService, private translate: TranslateService, private http: HttpClient, public router: Router) {
    this.translate.setDefaultLang(this.activeLang[0]);
  }

  contador = 0;

  /*ngOnInit(): void {
    let consecutivoFallos = 0; // Contador de fallos consecutivos

    const intervalId = setInterval(async () => {
      if (consecutivoFallos < environment.acces_token_times) {
        try {
          if (this.contador < environment.acces_token_frontend) {
            const newToken = await this.renewToken(this.getCookie('refresh_token') ?? '');
            if (!newToken) {
              console.warn('La renovación del token ha fallado');
              consecutivoFallos++;
            }
            else {
              this.contador++;
              consecutivoFallos = 0; // Reiniciar contador en caso de éxito
            }
          }
          else {
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error('Error al renovar el token:', error);
          consecutivoFallos++; // Incrementar contador en caso de fallo
        }
      }
      else {
        clearInterval(intervalId);
        this.logOut();
      }
    }, environment.acces_token_timeout);
  }

  async renewToken(refreshToken: string): Promise<string | null> {
    try {
      let token = this.storageService.getToken() ?? '';

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': `${token}`,
        }),
        withCredentials: true // Permitir el envío de cookies
      };

      const body = { refreshToken };
      const response = await this.http.post<any>(this.postRefresh, body, httpOptions).toPromise();
      if (!response || !response.token) {
        console.error('Error al renovar el token');
        return null;
      }

      const newToken = response.token;
      this.storageService.setToken(newToken); // Almacenar el nuevo token en el almacenamiento local
      return newToken;
    }
    catch (error) {
      // Realizar la lógica de cierre de sesión en caso de error
      throw error; // Relanzar el error para ser capturado por el llamador
    }
  }*/

  ngOnInit(): void {
    // Inicializa
    //console.log('NGINIT APP')
    //if(this.authService.isAuthenticated()){
    //console.log('ARRANCANDO INT')
    const intervalId = setInterval(async () => {
      if (this.contador < environment.acces_token_times) {
        const newToken = await this.renewToken(this.getCookie('refresh_token') ?? '');
        if (!newToken) {
          console.warn('La renovación del token ha fallado');
          this.contador++;
        }
        else {
          this.contador = 0;
        }
      }
      else {
        //clearInterval(intervalId);
      }
    }, environment.acces_token_timeout);
    //}
  }

  //ngOnDestroy

  async renewToken(refreshToken: string): Promise<string | null> {
    try {
      let token = this.storageService.getToken() ?? '';

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': `${token}`,
        }),
        withCredentials: true // Permitir el envío de cookies
      };

      const body = { refreshToken };
      const response = await this.http.post<any>(this.postRefresh, body, httpOptions).toPromise();
      if (!response || !response.token) {
        console.error('Error al renovar el token');
        return null;
      }
      this.contador = 0;
      const newToken = response.token;
      this.storageService.setToken(newToken); // Almacenar el nuevo token en el almacenamiento local
      return newToken;
    }
    catch (error) {
      this.logOut(); // Realizar la lógica de cierre de sesión en caso de error
      console.error('Error al renovar el token:', error);
      return null;
    }
  }

  logOut() {
    this.storageService.setId('');
    this.storageService.setUsername('');
    this.storageService.setChange('');
    this.storageService.setStatus('');
    this.storageService.setDate('');
    this.storageService.setToken('');
    this.storageService.setPage('1');
    this.storageService.setSearch('');
    this.storageService.setOpen('true');
    this.storageService.setMap(environment.defaultMapsStyle);
    this.storageService.setPerPage('15');
    this.contador = 0;
    this.deleteCookie('refresh_token');
    this.router.navigate(['/login']);
  }

  setCookie(name: string, value: string, days: number = 7): void {  // Guardar cookie
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    const cookieString = `${name}=${value};expires=${expirationDate.toUTCString()};path=/`;
    document.cookie = cookieString;
  }

  getCookie(name: string): string | null {  // Obtener cookie por nombre
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split('=');
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  }

  deleteCookie(name: string): void {  // Eliminar cookie por nombre
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  changeLenguaje(lang: any) {
    this.activeLang = lang;
    this.translate.use(lang);
  }
}
