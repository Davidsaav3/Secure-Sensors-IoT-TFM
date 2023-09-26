import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})

export class DataSharingService {
  private sharedLat = new BehaviorSubject<any>("");
  sharedLat$ = this.sharedLat.asObservable();
  private sharedLon = new BehaviorSubject<any>("");
  sharedLon$ = this.sharedLon.asObservable();
  private sharedAct = new BehaviorSubject<any>(false);
  sharedAct$ = this.sharedAct.asObservable();

  updatesharedLat(sharedLat: any) {
    this.sharedLat.next(sharedLat);
  }
  updatesharedLon(sharedLon: any) {
    this.sharedLon.next(sharedLon);
  }
  updatesharedAct(sharedAct: any) {
    this.sharedAct.next(sharedAct);
  }
}
