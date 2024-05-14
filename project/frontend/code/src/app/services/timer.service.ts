import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from './storage.service';
import { environment } from '../environments/environment';
import { AuthService } from '../services/auth.service';
import { Router } from "@angular/router";
import { HttpOptionsService } from '../services/httpOptions.service';

@Injectable({
  providedIn: 'root'
})

export class TimerService implements OnInit, OnDestroy {

  constructor(private http: HttpClient, private storageService: StorageService, private authService: AuthService, public router: Router) {
    console.log("creado")
    this.lanzarTimer();
  }

  backendURL = "http://localhost:5172/api/script";
  postRefresh: string = environment.baseUrl + environment.url.users + '/refresh';
  consecutivoFallos1 = 0;
  consecutivoFallos2 = 0;
  temp6: any = null;
  temp7: any = null;
  status = 2;
  date = '';

  ngOnInit() {
    //this.lanzarTimer();
  }

  ngOnDestroy() {
    if (this.temp6 != null)
      clearTimeout(this.temp6);
    if (this.temp7 != null)
      clearTimeout(this.temp7);
  }

  lanzarTimer() { // Timer para actualizar token de acceso
    this.consecutivoFallos2 = 0;
    const bucle = (t: number) => {
      if (this.consecutivoFallos2 < environment.acces_token_times) {
        this.temp7 = setTimeout(() => {
          console.log("holi")
          this.renewToken(this.getCookie('refresh_token') ?? '').then(() => {
          }).catch(() => {
            this.consecutivoFallos2++;
          }).finally(() => {
            if (this.consecutivoFallos2 > 0) {
              bucle(0);
            }
            else {
              bucle(environment.acces_token_timeout - environment.acces_token_dif);
            }
          });
        }, t);
      }
      else {
        this.logOut();
      }
    };
    bucle(0);
  }

  //

  async renewToken(refreshToken: string): Promise<string | null> { // Llaamada de renovación de token de acceso
    try {
      let token = this.storageService.getToken() ?? '';

      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': `${token}`,
        }),
        withCredentials: true // Permitir el envío de cookies
      };

      let newToken = null;
      const body = { refreshToken };
      if (this.authService.isAuthenticated()) {
        this.http.post<any>(this.postRefresh, body, httpOptions).subscribe(
          (response: any) => {
            if (!response || !response.token) {
              if (environment.verbose_error) console.error('Error al renovar el token');
            }
            newToken = response.token;
            this.storageService.setToken(newToken);

            environment.acces_token_timeout = parseInt(response.date);
            if (environment.verbose) console.log(environment.acces_token_timeout) // imprime milisegundos de vida del token

            if (response.token != undefined && response.token != null && response.token != '' && response.token != "{}") { // Control de los fallos
              this.consecutivoFallos2 = 0;
            }
            else {
              this.consecutivoFallos2++;
            }
          },
          (error) => {
            if (environment.verbose_error) console.error('Error al renovar el token');
            this.consecutivoFallos2++;
          }
        );

      }
      else {
        this.consecutivoFallos2++;
      }
      return newToken;
    }
    catch (error) {
      if (environment.verbose_error) console.error('Error al renovar el token:', error);
      return null;
    }
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
    this.deleteCookie('refresh_token');
    this.router.navigate(['/login']);
  }

  deleteCookie(name: string): void {  // Eliminar cookie por nombre
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  enable() {

  }
}
