import { HttpHeaders } from '@angular/common/http';
import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpOptionsService {

  constructor(private storageService: StorageService) { }

  getHttpOptions() {
    const token = this.storageService.getToken() ?? '';
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': `${token}`
      })
    };
  }

}