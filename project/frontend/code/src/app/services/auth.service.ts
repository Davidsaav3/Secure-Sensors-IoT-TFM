import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated: boolean = false;

  constructor() { 
    localStorage.setItem('auth', this.isAuthenticated.toString());
  }

  setAuthenticated(value: boolean) {
    localStorage.setItem('auth', this.isAuthenticated.toString());
    this.isAuthenticated = value;
    //console.log(this.isAuthenticated)
  }

  getAuthenticated(): boolean {
    this.isAuthenticated = Boolean(localStorage.getItem('auth'));
    //console.log(this.isAuthenticated)
    return this.isAuthenticated;
  }
}