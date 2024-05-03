import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private token: string | null = null;
  private status: string | null = null;
  private date: string | null = null;
  private id: string | null = null;
  private username: string | null = null;
  private pass: string | null = null;
  private map: string | null = null;
  private open: string | null = null;
  private page: string | null = null;
  private search: string | null = null;
  private lang: string | null = 'es';

  constructor() {
    // Al inicializar el servicio, intenta cargar los valores del localStorage si existen
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    this.token = localStorage.getItem('token') || null;
    this.status = localStorage.getItem('status') || null;
    this.date = localStorage.getItem('date') || null;
    this.id = localStorage.getItem('id') || null;
    this.username = localStorage.getItem('username') || null;
    this.pass = localStorage.getItem('pass') || null;
    this.map = localStorage.getItem('map') || null;
    this.open = localStorage.getItem('open') || null;
    this.page = localStorage.getItem('page') || null;
    this.search = localStorage.getItem('search') || null;
    this.lang = localStorage.getItem('lang') || 'es';

    this.setItemToLocalStorage('lang', this.lang);
    this.setItemToLocalStorage('page', this.page);
    this.setItemToLocalStorage('open', this.open);
  }

  private setItemToLocalStorage(key: string, value: string | null): void {
    if (value !== null && value !== '') {
      localStorage.setItem(key, value);
    }
    else {
      localStorage.removeItem(key);
    }
  }
  
  // token //
  setToken(token: string): void {
    this.token = token;
    this.setItemToLocalStorage('token', token);
  }
  getToken(): string | null {
    return this.token;
  }

  // status //
  setStatus(status: string): void {
    this.status = status;
    this.setItemToLocalStorage('status', status);
  }
  getStatus(): string | null {
    return this.status;
  }

  // date //
  setDate(date: string): void {
    this.date = date;
    this.setItemToLocalStorage('date', date);
  }
  getDate(): string | null {
    return this.date;
  }

  // id //
  setId(id: string): void {
    this.id = id;
    this.setItemToLocalStorage('id', id);
  }
  getId(): string | null {
    return this.id;
  }

  // username //
  setUsername(username: string): void {
    this.username = username;
    this.setItemToLocalStorage('username', username);
  }
  getUsername(): string | null {
    return this.username;
  }

  // pass //
  setChange(pass: string): void {
    this.pass = pass;
    this.setItemToLocalStorage('pass', pass);
  }
  getChange(): string | null {
    return this.pass;
  }

  // search //
  setSearch(search: string): void {
    this.search = search;
    this.setItemToLocalStorage('search', search);
  }
  getSearch(): string | null {
    return this.search;
  }

  // page //
  setPage(page: string): void {
    this.page = page;
    this.setItemToLocalStorage('page', page);
  }
  getPage(): string | null {
    return this.page;
  }

  // open //
  setOpen(open: string): void {
    this.open = open;
    this.setItemToLocalStorage('open', open);
  }
  getOpen(): string | null {
    return this.open;
  }

  // map //
  setMap(map: string): void {
    this.map = map;
    this.setItemToLocalStorage('map', map);
  }
  getMap(): string | null {
    return this.map;
  }

  // lang //
  setLang(lang: string): void {
    this.lang = lang;
    this.setItemToLocalStorage('lang', lang);
  }
  getLang(): string | null {
    return this.lang;
  }

}
