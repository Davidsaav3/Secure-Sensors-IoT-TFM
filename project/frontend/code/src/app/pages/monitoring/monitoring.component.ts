import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ClipboardService } from 'ngx-clipboard';
import { environment } from "../../environments/environment";
import { HttpOptionsService } from '../../services/httpOptions.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: "app-monitoring",
  templateUrl: "./monitoring.component.html",
  styleUrls: ["../../app.component.css"],
})

export class MonitoringComponent implements OnInit, OnDestroy {
  parseInt() {
    throw new Error('Method not implemented.');
  }

  resultsPerPag = environment.resultsPerPag;

  constructor(private httpOptionsService: HttpOptionsService, private storageService: StorageService, private http: HttpClient, public rutaActiva: Router, private elementRef: ElementRef) {

  }

  getMonitorings: string = environment.baseUrl + environment.url.monitoring;
  getId: string = environment.baseUrl + environment.url.monitoring + "/id";
  date: any;

  mostrarTooltip = false;
  totalPages = 5;
  currentPage = 1;
  quantPage = 15;
  page = 1;
  total = 0;
  totalPage = 0;

  alt1 = false;
  alt2 = true;
  alt3 = true;
  alt4 = true;
  alt5 = true;
  alt6 = true;
  alt7 = true;
  alt8 = true;
  alt9 = true;

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
  order = "log_date";
  ordAux = "DESC";

  alertDelete: any = false;
  notDelete: any = false;
  alertNew: any = false;
  notNew: any = false;
  saveOk: any = false;
  saveNot: any = false;
  changeCopy1 = 0;
  changeCopy2 = 0;

  temp1: any = null;
  temp2: any = null;
  temp3: any = null;
  temp4: any = null;

  monitoring = {
    id: 0,
    user_id: "",
    username: "",
    log_date: "",
    log_code: "",
    log_message: "",
    log_trace: "",
  };

  monitoringCopy = {
    id: 0,
    user_id: "",
    username: "",
    log_date: "",
    log_code: "",
    log_message: "",
    log_trace: "",

  };

  searchAuxArray = {
    value: "",
  };

  ngOnInit(): void { // Inicializa
    this.getMonitoring(this.order, this.ordAux);
    this.createDate();
    this.readStorage();
  }

  ngOnDestroy() {
    if(this.temp1!=null) 
      clearTimeout(this.temp1);
    if(this.temp2!=null) 
      clearTimeout(this.temp2);
    if(this.temp3!=null) 
      clearTimeout(this.temp3);
    if(this.temp4!=null) 
      clearTimeout(this.temp4);
    
    this.storageService.setSearch('')
    this.storageService.setPerPage('15')
    this.storageService.setPage('1')
  }

  copyToClipboard(textToCopy: string) {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          if(environment.verbose) console.log('Texto copiado al portapapeles: ', textToCopy);
        })
        .catch((error) => {
          console.error('Error al copiar texto al portapapeles: ', error);
        });
    }
  }

  /* GET */

  getMonitoringVoid() { // Obtiene los logs sin pasar arámetros
    this.getMonitoring(this.order, this.ordAux);
  }

  getMonitoringLocal(id: any, ord: any) { // Ordena columnas en local
    this.order = id;
    this.storageService.setPerPage(this.quantPage.toString())
    this.getMonitoring(id, ord);
    const sectionElement = this.elementRef.nativeElement.querySelector(".mark_select");
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  getMonitoring(id: any, ord: any) {// Obtiene los sesnores pasando parametros de ordenación
    this.order = id;
    this.rute = this.rutaActiva.routerState.snapshot.url;
    this.searchAux = this.searchAuxArray.value || "search";
    this.charging = true;
    this.data = [];

    this.http.get(`${this.getMonitorings}/${this.searchAux}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`, this.httpOptionsService.getHttpOptions())
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
          this.data.log_date = this.formatDateTime(data.log_date);

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

  /* BÚSQUEDA */

  textSearch(event: any) { // Busca por texto
    this.storageService.setSearch(this.searchAuxArray.value)
    this.currentPage = 1;
    clearTimeout(this.temp4);
    var $this = this;

    this.temp4 = setTimeout(() => {
      if (event.keyCode != 13) {
        $this.getMonitoring(this.order, this.ordAux);
      }
    }, 500);
  }

  deleteSearch() {// Borra texto de busqueda
    this.Page(1);
    this.totalPages = 5;
    this.currentPage = 1;
    this.quantPage = 15;
    this.page = 1;
    this.searchAuxArray.value = "";
    this.storageService.setSearch(this.searchAuxArray.value)
    this.getMonitoring(this.order, this.ordAux);
  }

  /* PAGINACIÓN */

  firstPage(): void { // Primera pagina
    if (this.currentPage != 1) {
      this.currentPage = 1;
      this.storageService.setPage(this.currentPage.toString())
      this.getMonitoringVoid();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage - 10 > 1) {
      this.currentPage = this.currentPage - 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getMonitoringVoid();
    }
    else {
      this.currentPage = 1;
      this.storageService.setPage(this.currentPage.toString())
      this.getMonitoringVoid();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.storageService.setPage(this.currentPage.toString())
      this.getMonitoringVoid();
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage = num;
    this.storageService.setPage(this.currentPage.toString())
    this.getMonitoringVoid();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.storageService.setPage(this.currentPage.toString())
      this.getMonitoringVoid();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage + 10 < this.totalPages) {
      this.currentPage = this.currentPage + 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getMonitoringVoid();
    }
    else {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getMonitoringVoid();
    }
  }

  lastPage(): void { // Ultima pagina
    if (this.currentPage != this.totalPages) {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getMonitoringVoid();
    }
  }

  /* DATE */

  createDate() { // Fecha actual
    this.date = this.formatDateTime(new Date());
  }

  formatDateTime(date2: any) { // Formato fecha
    let dat = "";
    const date = new Date(date2);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    dat = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    if (isNaN(date.getFullYear())) {
      dat = "";
    }
    return dat;
  }

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
        $this.getMonitoring(this.order, this.ordAux);
      }, 1);
    }
  }
}
