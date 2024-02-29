import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, public jwtHelper: JwtHelperService) {}

  isAuthenticated(): boolean {
    let isAuthenticated = false;
    const token: string | null = localStorage.getItem('token');
    
    if (token !== null) {
      isAuthenticated = !this.jwtHelper.isTokenExpired(token);
    }
    
    return isAuthenticated;
  }
}
