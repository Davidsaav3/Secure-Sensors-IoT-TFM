import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  redirectUrl: string | null = null;

  constructor(private storageService: StorageService, private http: HttpClient, public jwtHelper: JwtHelperService) { }

  isAuthenticated(): boolean {
    let isAuthenticated = false;
    const token: string | null = this.storageService.getToken();
    if (token !== null) {
      isAuthenticated = !this.jwtHelper.isTokenExpired(token);
    }
    return isAuthenticated;
  }

}
