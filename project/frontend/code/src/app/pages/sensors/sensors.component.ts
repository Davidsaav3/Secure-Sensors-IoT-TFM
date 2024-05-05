import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { HttpOptionsService } from '../../services/httpOptions.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: "app-sensors",
  templateUrl: "./sensors.component.html",
  styleUrls: ["../../app.component.css"],
})

export class SensorsComponent implements OnInit, OnDestroy {
  resultsPerPag = environment.resultsPerPag;

  constructor(private httpOptionsService: HttpOptionsService, private storageService: StorageService, private http: HttpClient, public rutaActiva: Router, private elementRef: ElementRef) {

  }

  getSensor: string = environment.baseUrl + environment.url.sensorsTypes;
  getId: string = environment.baseUrl + environment.url.sensorsTypes + "/id";

  totalPages = 5;
  currentPage = 1;
  quantPage = 15;
  page = 1;
  total = 0;
  totalPage = 0;

  alt1 = true;
  alt2 = true;
  alt3 = true;
  alt4 = true;
  alt5 = true;
  alt6 = true;
  alt7 = true;

  actId = 0;
  id = 0;
  state = -1;
  data: any;
  rute = "";
  charging = false;
  saved = false;
  change = false;
  width = 0;

  show = false;
  showAux = true;
  dupOk = false;
  dupNot = false;
  viewDup = -1;
  pencilDup = -1;

  searchAux = "search";
  order = "position";
  ordAux = "ASC";

  alertDelete: any = false;
  notDelete: any = false;
  alertNew: any = false;
  notNew: any = false;
  saveOk: any = false;
  saveNot: any = false;

  temp1: any = null;
  temp2: any = null;
  temp3: any = null;
  temp4: any = null;

  sensors = {
    id: 0,
    type: "",
    metric: "",
    description: "",
    errorvalue: null,
    valuemax: null,
    valuemin: null,
    position: 0,
    correction_general: "",
    correction_time_general: "",
    discard_value: "",
  };

  sensorsCopy = {
    id: 0,
    type: "",
    metric: "",
    description: "",
    errorvalue: null,
    valuemax: null,
    valuemin: null,
    position: 0,
    correction_general: "",
    correction_time_general: "",
    discard_value: "",
  };

  searchAuxArray = {
    value: "",
  };

  ngOnInit(): void { // Inicializa
    this.getSensors(this.order, this.ordAux);
    this.readStorage();
  }

  ngOnDestroy() {
    this.storageService.setSearch('')
    this.storageService.setPerPage('15')
    this.storageService.setPage('1')
    //this.temp1.clearInterval();
    //this.temp2.clearInterval();
    //this.temp3.clearInterval();
    //this.temp4.clearInterval();
  }

  /* GET */

  getSensorsVoid() { // Obtiene los sensores sin pasar arámetros
    this.getSensors(this.order, this.ordAux);
  }

  getSensorsLocal(id: any, ord: any) { // Ordena columnas en local
    this.order = id;
    this.storageService.setPerPage(this.quantPage.toString())
    this.getSensors(id, ord);
    const sectionElement = this.elementRef.nativeElement.querySelector(".mark_select");
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  getSensors(id: any, ord: any) {// Obtiene los sesnores pasando parametros de ordenación
    this.order = id;
    this.rute = this.rutaActiva.routerState.snapshot.url;
    this.searchAux = this.searchAuxArray.value || "search";
    this.charging = true;
    this.data = [];

    this.http.get(`${this.getSensor}/${this.searchAux}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`, this.httpOptionsService.getHttpOptions())
      .subscribe(
        (data: any) => {
          this.charging = false;
          if (data && data.length > 0 && data[0].total) {
            this.totalPages = Math.ceil(data[0].total / this.quantPage);
            this.total = data[0].total;
          }
          else {
            this.totalPages = 0;
            this.total = 0;
          }
          this.data = data;

          if (this.data.length < this.quantPage) {
            this.totalPage = this.total;
          }
          else {
            this.totalPage = this.quantPage * this.currentPage;
          }
        },
        (error) => {
          console.error(error);
        }
      );

    const sectionElement = this.elementRef.nativeElement.querySelector(".mark_select");
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  orderColumn(idActual: any) { // Ordena columnas haciendo una consulta

    if (!this.change && idActual != this.actId) {
      this.http.get(`${this.getId}/${idActual}`, this.httpOptionsService.getHttpOptions())
        .subscribe(
          (data: any) => {
            this.sensors = data[0];
            //console.log(this.sensors)
            this.actId = idActual;
            this.id = idActual;
            //this.openEdit();
            this.state = 2;
            let sensors = { ...this.sensors };
            this.sensorsCopy = {
              id: sensors.id,
              type: sensors.type,
              metric: sensors.metric,
              description: sensors.description,
              errorvalue: sensors.errorvalue,
              valuemax: sensors.valuemax,
              valuemin: sensors.valuemin,
              position: sensors.position,
              correction_general: sensors.correction_general,
              correction_time_general: sensors.correction_time_general,
              discard_value: sensors.discard_value,
            };
            //this.openClouse();
          },
          (error) => {
            console.error(error);
          }
        );
    }
  }

  /* BÚSQUEDA */

  textSearch(event: any) { // Busca por texto
    this.storageService.setSearch(this.searchAuxArray.value)
    this.currentPage = 1;
    clearTimeout(this.temp4);
    var $this = this;

    this.temp4 = setTimeout(() => {
      if (event.keyCode != 13) {
        $this.getSensors(this.order, this.ordAux);
      }
    }, 500);
  }

  rechargeForm() { // recarga sensor a su valor anterior
    this.sensors = {
      id: this.sensorsCopy.id,
      type: this.sensorsCopy.type,
      metric: this.sensorsCopy.metric,
      description: this.sensorsCopy.description,
      errorvalue: this.sensorsCopy.errorvalue,
      valuemax: this.sensorsCopy.valuemax,
      valuemin: this.sensorsCopy.valuemin,
      position: this.sensorsCopy.position,
      correction_general: this.sensorsCopy.correction_general,
      correction_time_general: this.sensorsCopy.correction_time_general,
      discard_value: this.sensorsCopy.discard_value,
    };
    this.change = false;
  }

  deleteSearch() {// Borra texto de busqueda
    this.Page(1);
    this.totalPages = 5;
    this.currentPage = 1;
    this.quantPage = 15;
    this.page = 1;
    this.searchAuxArray.value = "";
    this.storageService.setSearch(this.searchAuxArray.value)
    this.getSensors(this.order, this.ordAux);
  }

  /* PAGINACIÓN */

  firstPage(): void { // Primera pagina
    if (this.currentPage != 1) {
      this.currentPage = 1;
      this.storageService.setPage(this.currentPage.toString())
      this.getSensorsVoid();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage - 10 > 1) {
      this.currentPage = this.currentPage - 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getSensorsVoid();
    }
    else {
      this.currentPage = 1;
      this.storageService.setPage(this.currentPage.toString())
      this.getSensorsVoid();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.storageService.setPage(this.currentPage.toString())
      this.getSensorsVoid();
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage = num;
    this.storageService.setPage(this.currentPage.toString())
    this.getSensorsVoid();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.storageService.setPage(this.currentPage.toString())
      this.getSensorsVoid();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage + 10 < this.totalPages) {
      this.currentPage = this.currentPage + 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getSensorsVoid();
    }
    else {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getSensorsVoid();
    }

  }

  lastPage(): void { // Ultima pagina
    if (this.currentPage != this.totalPages) {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getSensorsVoid();
    }
  }

  /* STORAGE */

  readStorage() { // Recupera datos en local storage
    let pageString = this.storageService.getPage() ?? "1";
    this.currentPage = parseInt(pageString, 10);
    pageString = this.storageService.getPerPage() ?? "15";
    this.quantPage = parseInt(pageString, 10);
    this.searchAuxArray.value = this.storageService.getSearch() ?? "";
    if (this.searchAuxArray.value != "") {
      //this.searched= true;
      clearTimeout(this.temp1);
      var $this = this;
      this.temp3 = setTimeout(() => {
        $this.getSensors(this.order, this.ordAux);
      }, 1);
    }
  }

}

