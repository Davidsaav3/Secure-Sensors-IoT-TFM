import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient/*, public jwtHelper: JwtHelperService*/) {}

  isAuthenticated(): boolean {
    let dev= false;
    const token = localStorage.getItem('token');
    if(token!=null){
      dev= true//!this.jwtHelper.isTokenExpired(token);
    }
    return dev;
  }
}
