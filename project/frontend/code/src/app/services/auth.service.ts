import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { 
  }

  getAuthenticated(): boolean {
    let dev= false;
    if(localStorage.getItem('auth')=="true"){
      dev= true;
    }
    if(localStorage.getItem('auth')=="false"){
      dev= false;
    }
    return dev;
  }
}