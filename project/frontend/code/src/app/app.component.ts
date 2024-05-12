import { TranslateService } from '@ngx-translate/core';
import { environment } from "./environments/environment"
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from "@angular/router";
import { AuthService } from './services/auth.service';
import { StorageService } from './services/storage.service';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  title = environment.title;
  postRefresh: string = environment.baseUrl + environment.url.users + '/refresh';
  AppVersion = environment.AppVersion;
  activeLang = environment.languageLang;
  constructor(private storageService: StorageService, private authService: AuthService, private translate: TranslateService, private http: HttpClient, public router: Router) {
    this.translate.setDefaultLang(this.activeLang[0]);
  }
  consecutivoFallos= 0;
  contador = 0;
  temp1: any= null;

  ngOnInit(): void {
    // Inicializa
    if(environment.verbose) console.log('NGINIT APP')
    //if(this.authService.isAuthenticated()){
    if(environment.verbose) console.log('ARRANCANDO INT')

    //if(this.authService.isAuthenticated()){
      //this.lanzarTimer();
    //}
  }

  ngOnDestroy() {
    if(this.temp1!=null) 
      clearTimeout(this.temp1);
  }

  lanzarTimer() {
    if(environment.verbose) console.log("LANZAR TIMER")
    this.consecutivoFallos = 0; // Contador de fallos consecutivos
    const bucle = (t: number) => {
      if (this.consecutivoFallos <= environment.acces_token_times) { //  acces_token_
        this.temp1= setTimeout(() => {
          if(environment.verbose) console.log(this.consecutivoFallos)
          this.renewToken(this.getCookie('refresh_token') ?? '').then(() => {
             // Reiniciar contador en caso de éxito
          }).catch(() => {
            this.consecutivoFallos++; // Incrementar contador en caso de fallo
          }).finally(() => {
            bucle(environment.acces_token_timeout); // Llamar recursivamente al bucle
          });
        }, t); // acces_token_
      }
      else{
        this.logOut();
      }
    };
    bucle(0);
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

      let newToken= null;
      const body = { refreshToken };
      if(this.authService.isAuthenticated()){
        this.http.post<any>(this.postRefresh, body, httpOptions).subscribe(
          (response: any) => {
            if (!response || !response.token) {
              console.error('Error al renovar el token');
              //return null;
            }
            newToken = response.token;
            this.storageService.setToken(newToken); // Almacenar el nuevo token en el almacenamiento local
            if(response.token!=undefined && response.token!=null && response.token!='' && response.token!="{}"){
              this.consecutivoFallos = 0;
            }
            else{
              this.consecutivoFallos++;
            }
          },
          (error) => {
            console.error('Error al renovar el token');
            this.consecutivoFallos++;
          }
        );
      
      }
      else{
        this.consecutivoFallos++;
      }
      return newToken;
    }
    catch (error) {
      //this.logOut(); // Realizar la lógica de cierre de sesión en caso de error
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
