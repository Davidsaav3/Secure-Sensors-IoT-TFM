import { environment } from "../../environments/environment";
import { Component, ElementRef, ViewChild, OnInit, OnDestroy, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ClipboardService } from 'ngx-clipboard';
import { StorageService } from '../../services/storage.service';
import { HttpOptionsService } from '../../services/httpOptions.service';

@Component({
  selector: "app-script",
  templateUrl: "./script.component.html",
  styleUrls: ["../../app.component.css"],
})

export class ScriptComponent implements OnInit, OnDestroy {
  parseInt(arg0: any) {
  throw new Error('Method not implemented.');
} 

resultsPerPag = environment.resultsPerPag;
@HostListener("window:resize", ["$event"])
@ViewChild('logTrace', {static: false}) logTraceElement1: ElementRef | undefined;
@ViewChild('logTrace', {static: false}) logTraceElement2: ElementRef | undefined;
@ViewChild('logPar', {static: false}) logParElement: ElementRef | undefined;

backendStatus: boolean = false; 
  backendURL: string = "http://localhost:5172/api/script";
  date= '';
  status= '';
  postSensors: string = environment.baseUrl+environment.url.script;

  getMonitorings: string = environment.baseUrl+environment.url.script+"";
  postMonitoring: string = environment.baseUrl+environment.url.script;
  duplicateMonitorings: string = environment.baseUrl+environment.url.script+"/duplicate";
  getId: string = environment.baseUrl+environment.url.script+"/id";
  date_2: any;

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

  temp1: any = null;
  temp2: any = null;
  temp3: any = null;
  temp4: any = null;

  show = false;
  showAux = true;
  dupOk = false;
  dupNot = false;
  viewDup = -1;
  pencilDup = -1;

  searchAux = "search";
  order = "log_date";
  ordAux = "ASC";

  alertDelete: any = false;
  notDelete: any = false;
  alertNew: any = false;
  notNew: any = false;
  saveOk: any = false;
  saveNot: any = false;
  changeCopy1= 0;
  changeCopy2= 0;

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
    log_message : "",
    log_trace: "",

  };

  searchAuxArray = {
    value: "",
  };

  constructor(private httpOptionsService: HttpOptionsService, private storageService: StorageService,private clipboardService: ClipboardService, private http: HttpClient,public rutaActiva: Router, private elementRef: ElementRef) {
  }

  ngOnInit(): void {
    this.getMonitoring(this.order, this.ordAux);
    this.createDate();
  }

  ngOnDestroy(){
    //this.temp1.clearInterval();
    //this.temp2.clearInterval();
    //this.temp3.clearInterval();
    //this.temp4.clearInterval();
  }

  setScript(status: any): void {
    let status1 = {
      status: status,
      status2: localStorage.getItem('status')
    };
    let token = this.storageService.getToken() ?? ''; 
    this.http.post(this.backendURL+"/script", JSON.stringify(status1), this.httpOptionsService.getHttpOptions()).subscribe(
      () => {
        console.log("Solicitud POST enviada exitosamente.");
      },
      (error) => {
        console.error("Error al enviar la solicitud POST:", error);
      }
    );
  }

  /* */
  
  copyToClipboard(textToCopy: string) {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          console.log('Texto copiado al portapapeles: ', textToCopy);
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

    if (this.totalPages <= 1 && false) {
      if (ord == "ASC") {
        if (id == "description") {
          this.data.sort((a: any, b: any) => {return a.description - b.description;});
        }
        if (id == "type") {
          this.data.sort((a: any, b: any) => a.type.localeCompare(b.type));
        }
        if (id == "metric") {
          this.data.sort((a: any, b: any) => a.metric.localeCompare(b.metric));
        }
        if (id == "description") {
          this.data.sort((a: any, b: any) => a.description.localeCompare(b.description));
        }
        if (id == "correction_general") {
          this.data.sort((a: any, b: any) => {
            const valorA = a.correction_general || "";
            const valorB = b.correction_general || "";
            return valorA.localeCompare(valorB);
          });
        }
        if (id == "correction_time_general") {
          this.data.sort((a: any, b: any) => {
            const valorA = a.correction_time_general || "";
            const valorB = b.correction_time_general || "";
            return valorA.localeCompare(valorB);});
        }
      }
      if (ord == "DESC") {
        if (id == "description") {
          this.data.sort((a: any, b: any) => {return b.description - a.description;});
        }
        if (id == "type") {
          this.data.sort((a: any, b: any) => b.type.localeCompare(a.type));
        }
        if (id == "metric") {
          this.data.sort((a: any, b: any) => b.metric.localeCompare(a.metric));
        }
        if (id == "description") {
          this.data.sort((a: any, b: any) => b.description.localeCompare(a.description));
        }
        if (id == "correction_general") {
          this.data.sort((a: any, b: any) => {
            const valorA = b.correction_general || "";
            const valorB = a.correction_general || "";
            return valorA.localeCompare(valorB);
          });
        }
        if (id == "correction_time_general") {
          this.data.sort((a: any, b: any) => {
            const valorA = b.correction_time_general || "";
            const valorB = a.correction_time_general || "";
            return valorA.localeCompare(valorB);
          });
        }
      }
    } 
    else {
      this.getMonitoring(id, ord);
    }

    const sectionElement = this.elementRef.nativeElement.querySelector(".mark_select");
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  getMonitoring(id: any, ord: any) {// Obtiene los sesnores pasando parametros de ordenación
    let token = this.storageService.getToken() ?? ''; 
    let headers = new HttpHeaders().set('Authorization', `${token}`);

    this.order = id;
    this.rute = this.rutaActiva.routerState.snapshot.url;
    this.searchAux = this.searchAuxArray.value || "search";
    this.charging = true;
    this.data = [];

    this.http.get(`${this.getMonitorings}/${this.searchAux}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`, {headers})
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

  orderColumn(idActual: any) { // Ordena columnas haciendo una consulta
    let token = this.storageService.getToken() ?? ''; 
    let headers = new HttpHeaders().set('Authorization', `${token}`);

    if (!this.change && idActual != this.actId) {
      this.http.get(`${this.getId}/${idActual}`, {headers})
      .subscribe(
        (data: any) => {
          this.monitoring = data[0];
          this.actId = idActual;
          this.id = idActual;
          this.openEdit();
          this.state = 2;
          let monitoring = { ...this.monitoring };
          this.monitoringCopy = {
            id: monitoring.id,
            user_id: monitoring.user_id ,
            username: monitoring.username, 
            log_date: monitoring.log_date, 
            log_code: monitoring.log_code, 
            log_message: monitoring.log_message, 
            log_trace: monitoring.log_trace

          };
          this.openClouse();
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }
  
  /* NEW */

  newMonitoring(form: any) {
    this.state = 1;
    if (form.valid) {
      this.http.post(this.postMonitoring, JSON.stringify(this.monitoring), this.httpOptionsService.getHttpOptions())
        .subscribe(
          (data: any) => {
            this.id = data.id;
            this.alertNew = true;
  
            this.temp1= setTimeout(() => {
              this.alertNew = false;
            }, 2000);
  
            this.openClouse();
            this.monitoring.id = data.id;
            let monitoring = { ...this.monitoring };
            this.data.push(monitoring);
            this.data.sort((a: { description: string }, b: { description: any }) => {
              if (typeof a.description === "string" && typeof b.description === "string") {
                return a.description.localeCompare(b.description);
              } 
              else {
                return 1;
              }
            });
            this.actId = this.id;
            this.openEdit();
            this.state = 2;
          },
          (error) => {
            console.error("Error:", error);
          }
        );
      this.change = false;
    }
  }

  openNew(id:any,user_id:any,username:any,log_date:any,log_code:any,log_message:any, log_trace:any) { // Abre Nueva conexion

    this.monitoring = {
      id: id,
      user_id: user_id ,
      username: username, 
      log_date: log_date, 
      log_code: log_code, 
      log_message: log_message,
      log_trace: log_trace, 
    };

    this.show = true;
    this.openClouse();
  }


  /* EDIT */

  editMonitoring(form: any) { // Guardar datos de la conexión editado
    if (form.valid) {
      this.http.put(this.postMonitoring, JSON.stringify(this.monitoring), this.httpOptionsService.getHttpOptions())
        .subscribe(
          (response: any) => {
            // Respuesta
          },
          (error) => {
            console.error("Error:", error);
          }
        );
      this.data = this.data.filter((data: { id: number }) => data.id !== this.monitoring.id);
      let monitoring = this.monitoring;
      this.data.push(monitoring);
      this.data.sort((a: any, b: any) => {return a.description - b.description;});
      this.actId = this.monitoring.id;
      this.openEdit();
      this.state = 2;
      this.saveOk = true;

      this.temp2= setTimeout(() => {
        this.saveOk = false;
      }, 2000);
    }
    this.saved = true;
    this.change = false;
  }
  
  openEdit() { // Abre Editar conexión
    this.show = true;
    this.state = 2;
    this.showAux = false;
  }

  /* DUPLICATE */

  duplicateMonitoring(num: any, type: any) { // Obtiene el nombre de la conexión duplicada
    let token = this.storageService.getToken() ?? ''; 
    let headers = new HttpHeaders().set('Authorization', `${token}`);

    if (!this.change && !this.change) {
      this.http.get(`${this.duplicateMonitorings}/${type}`, {headers})
      .subscribe(
        (data: any) => {
          this.monitoring = this.data.find((objeto: { id: any }) => objeto.id == num);
          this.openClouse();
          this.state = 0;
    
          this.http.get(`${this.getId}/${this.monitoring.id}`, {headers})
            .subscribe(
              (data1: any) => {
                this.monitoring = data1[0];
                this.actId = this.monitoring.id;
                this.id = this.monitoring.id;
                let monitoring = { ...this.monitoring };
                this.monitoringCopy = {
                  id: monitoring.id,
                  user_id: monitoring.user_id ,
                  username: monitoring.username, 
                  log_date: monitoring.log_date, 
                  log_code: monitoring.log_code, 
                  log_message: monitoring.log_message, 
                  log_trace: monitoring.log_trace
                };
                this.openNew(
                  '',
                  this.monitoring.user_id,
                  this.monitoring.username, 
                  this.monitoring.log_date, 
                  this.monitoring.log_code, 
                  this.monitoring.log_message,    
                  this.monitoring.log_trace
                );
              },
              (error) => {
                console.error(error);
              }
            );
          this.change = true;
        },
        (error) => {
          console.error("Error al verificar la descripción duplicada:", error);
        }
      );
    }
  }

  /* DELETE */

  deletemonitoring(idActual: any) { // Elimina conexión
    let token = this.storageService.getToken() ?? ''; 
    let headers = new HttpHeaders().set('Authorization', `${token}`);

    var monitoring2 = {
      id: this.id,
    };
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}`
      }),
      body: monitoring2,
    };

    this.http.delete(this.postMonitoring, options).subscribe(
        (response: any) => {
          // Realiza acciones con la respuesta si es necesario
          //console.log('monitoring eliminados:', response);
        },
        (error: any) => {
          console.error('Error al eliminar conexón:', error);
        }
      );
    this.alertDelete = true;

    this.temp3= setTimeout(() => {
      this.alertDelete = false;
    }, 2000);

    this.data = this.data.filter((objeto: { id: any }) => objeto.id != idActual);
    this.clouse();
  }

  /* BÚSQUEDA */

  textSearch(event: any) { // Busca por texto
    this.currentPage = 1;
    clearTimeout(this.temp4);
    var $this = this;

    this.temp4 = setTimeout(() => {
      if (event.keyCode != 13) {
        $this.getMonitoring(this.order, this.ordAux);
        $this.openClouse();
      }
    }, 500);
  }

  rechargeForm() { // recarga conexión a su valor anterior
    this.monitoring = {
      id: this.monitoringCopy.id,
      user_id: this.monitoringCopy.user_id ,
      username: this.monitoringCopy.username, 
      log_date: this.monitoringCopy.log_date, 
      log_code: this.monitoringCopy.log_code, 
      log_message: this.monitoringCopy.log_message, 
      log_trace: this.monitoringCopy.log_trace
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
    this.getMonitoring(this.order, this.ordAux);
  }

  /* TARJETAS */

  openClouse() { // Abre y cierra la tarjeta de logs
    if (this.show == true) {
      this.showAux = false;
    } 
    else {
      this.showAux = true;
    }
  }

  clouse() { // Cierra tarjetas
    this.show = false;
    this.state = -1;
    this.openClouse();
    this.change = false;
    this.actId= -1;
  }

  clouseAll() { // Cierra todas las tarjetas
    this.showAux = false;
    this.show = false;
    this.openClouse();
    this.change = false;
  }

  resize(): void { // Redimensiona tarjetas
    this.width = window.innerWidth;
  }

  /* PAGINACIÓN */

  firstPage(): void { // Primera pagina
    if (this.currentPage != 1) {
      this.currentPage = 1;
      this.getMonitoringVoid();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage - 10 > 1) {
      this.currentPage = this.currentPage - 10;
      this.getMonitoringVoid();
    } 
    else {
      this.currentPage = 1;
      this.getMonitoringVoid();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getMonitoringVoid();
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage = num;
    this.getMonitoringVoid();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getMonitoringVoid();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage + 10 < this.totalPages) {
      this.currentPage = this.currentPage + 10;
      this.getMonitoringVoid();
    } 
    else {
      this.currentPage = this.totalPages;
      this.getMonitoringVoid();
    }
  }

  lastPage(): void { // Ultima pagina
    if (this.currentPage != this.totalPages) {
      this.currentPage = this.totalPages;
      this.getMonitoringVoid();
    }
  }

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
  
}
