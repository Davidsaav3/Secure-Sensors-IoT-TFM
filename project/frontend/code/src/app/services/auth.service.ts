import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { StorageService } from './storage.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Router } from "@angular/router";
import { HttpOptionsService } from './httpOptions.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  redirectUrl: string | null = null;

  constructor(public httpOptionsService: HttpOptionsService, public router: Router, private storageService: StorageService, private http: HttpClient, public jwtHelper: JwtHelperService) {
    this.lanzarTimer();
  }

  postRefresh: string = environment.domain + environment.baseUrl + environment.url.users + '/refresh';
  refreshError = 0;
  temp: any = null;

  isAuthenticated(): boolean {
    let isAuthenticated = false;
    const token: string | null = this.storageService.getToken();
    if (token !== null) {
      isAuthenticated = !this.jwtHelper.isTokenExpired(token);
    }
    return isAuthenticated;
  }

  stopTimer() {
    if (this.temp != null)
      clearTimeout(this.temp);
  }

  lanzarTimer() { // Timer para actualizar token de acceso
    this.refreshError = 0;
    const bucle = (t: number) => {
      if (this.refreshError < environment.acces_token_times) {
        this.temp = setTimeout(() => {
          if (environment.verbose) console.log("obtengo token")
          this.renewToken(this.getCookie('refresh_token') ?? '').then(() => {
          }).catch(() => {
            this.refreshError++;
          }).finally(() => {
            if (this.refreshError > 0) {
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
      if (this.isAuthenticated()) {
        this.http.post<any>(this.postRefresh, body, this.httpOptionsService.getHttpOptions()).subscribe(
          (response: any) => {
            if (!response || !response.token) {
              if (environment.verbose_error) console.error('Error al renovar el token');
            }
            newToken = response.token;
            this.storageService.setToken(newToken);

            environment.acces_token_timeout = parseInt(response.date);
            if (environment.verbose) console.log(environment.acces_token_timeout) // imprime milisegundos de vida del token

            if (response.token != undefined && response.token != null && response.token != '' && response.token != "{}") { // Control de los fallos
              this.refreshError = 0;
            }
            else {
              this.refreshError++;
            }
          },
          (error) => {
            if (environment.verbose_error) console.error('Error al renovar el token');
            this.refreshError++;
          }
        );

      }
      else {
        this.refreshError++;
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
    this.stopTimer();
    this.router.navigate(['/login']);
  }


  deleteCookie(name: string): void {  // Eliminar cookie por nombre
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

}
