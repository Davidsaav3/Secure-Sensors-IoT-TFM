import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  redirectUrl: string | null = null; 

  constructor(private tokenService: TokenService,private http: HttpClient, public jwtHelper: JwtHelperService) {}

  isAuthenticated(): boolean {
    let isAuthenticated = false;
    const token: string | null = this.tokenService.getToken();
    if (token !== null) {
      isAuthenticated = !this.jwtHelper.isTokenExpired(token);
    }
    return isAuthenticated;
  }
  
}
