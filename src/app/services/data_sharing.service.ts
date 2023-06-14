import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class DataSharingService {
  private dataSubject = new Subject<string>();
  public data$ = this.dataSubject.asObservable();

  sendData(data: string) {
    this.dataSubject.next(data);
  }
}