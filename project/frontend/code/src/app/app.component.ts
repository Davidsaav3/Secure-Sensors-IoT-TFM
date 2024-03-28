import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from "./environments/environment"
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  postRefresh: string = environment.baseUrl+environment.users+'/refresh';
  AppVersion = environment.AppVersion;
  activeLang = environment.languageLang;
  constructor(private translate: TranslateService, private http: HttpClient, public router: Router) {
    this.translate.setDefaultLang(this.activeLang[0]);
  }

  ngOnInit(): void { // Inicializa
    setInterval(async () => {
      const newToken = await this.renewToken(this.getCookie('refresh_token') ?? '');
      if (!newToken) {
          console.warn('La renovación del token ha fallado');
      }
    }, 5000); //250000
  }

  async renewToken(refreshToken: string): Promise<string | null> {
    try {
      let token = localStorage.getItem('token') ?? '';
      const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json; charset=UTF-8','Authorization': `${token}`,}),};
      const body = { refreshToken };
      //console.log(oldToken) //console.log(refreshToken)
      const response = await this.http.post<any>(this.postRefresh, body, httpOptions).toPromise();
      if (!response) {
        console.error('Error al renovar el token');
        return null;
      }
      const newToken = response.token;
      console.log(newToken)
      localStorage.setItem('token', newToken);
      return newToken;
    } 
    catch (error) {
      this.logOut();
      console.error('Error al renovar el token:', error);
      return null;
    }
  }

  logOut(){
    localStorage.removeItem("id");
    this.deleteCookie('refresh_token');
    localStorage.removeItem("username");
    localStorage.removeItem("activeLang");
    localStorage.setItem('token', '');
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
  
  title = 'Sensors IoT';
}
