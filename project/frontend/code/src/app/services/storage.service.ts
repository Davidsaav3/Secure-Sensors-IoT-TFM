import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private token: string = '';
  private status: string = '';
  private date: string = '';
  private id: string = '';
  private username: string = '';
  private change_password: string = '';

  constructor() {}

  // TOKEN //
  setToken(token: string): void {
    this.token = token;
  }
  getToken(): string {
    return this.token;
  }

  // STATUS //
  setStatus(status: string): void {
    this.status = status;
  }
  getStatus(): string {
    return this.status;
  }

  // DATE //
  setDate(date: string): void {
    this.date = date;
  }
  getDate(): string {
    return this.date;
  }

  // ID //
  setId(id: string): void {
    this.id = id;
  }
  getId(): string {
    return this.id;
  }

  // USERNAME //
  setUsername(username: string): void {
    this.username = username;
  }
  getUsername(): string {
    return this.username;
  }

  // CHANGE PASSWORD //
  setChange(change_password: string): void {
    this.change_password = change_password;
  }
  getChange(): string {
    return this.change_password;
  }

}