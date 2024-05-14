import { TranslateService } from '@ngx-translate/core';
import { environment } from "./environments/environment"
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  title = environment.title;
  AppVersion = environment.AppVersion;
  activeLang = environment.languageLang;

  constructor(private translate: TranslateService, public router: Router) {
    this.translate.setDefaultLang(this.activeLang[0]);
  }

  ngOnInit(): void {
    if (environment.verbose) console.log('NGINIT APP')
  }

  ngOnDestroy() {

  }

}
