import { Component, ElementRef, OnInit, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: "app-monitoring",
  templateUrl: "./monitoring.component.html",
  styleUrls: ["../../app.component.css"],
})

export class MonitoringComponent implements OnInit {

  constructor(private http: HttpClient,public rutaActiva: Router, private elementRef: ElementRef) {

  }
  
  ngOnInit(): void { // Inicializa

  }
}
