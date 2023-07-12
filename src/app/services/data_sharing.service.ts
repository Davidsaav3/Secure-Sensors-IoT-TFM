import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {
  private sharedLat = new BehaviorSubject<any>('');
  sharedLat$ = this.sharedLat.asObservable();

  private sharedLon = new BehaviorSubject<any>('');
  sharedLon$ = this.sharedLon.asObservable();

  private sharedList = new BehaviorSubject<any>('');
  sharedList$ = this.sharedList.asObservable();

  private sharedAmp = new BehaviorSubject<any>(false);
  sharedAmp$ = this.sharedAmp.asObservable();

  private sharedAct = new BehaviorSubject<any>(false);
  sharedAct$ = this.sharedAct.asObservable();

  updatesharedLat(sharedLat: any) {
    this.sharedLat.next(sharedLat);
  }
  updatesharedLon(sharedLon: any) {
    this.sharedLon.next(sharedLon);
  }

  updatesharedList(sharedList: any) {
    this.sharedList.next(sharedList);
  }
  updatesharedAmp(sharedAmp: any) {
    this.sharedAmp.next(sharedAmp);
  }
  updatesharedAct(sharedAct: any) {
    this.sharedAct.next(sharedAct);
  }

}
