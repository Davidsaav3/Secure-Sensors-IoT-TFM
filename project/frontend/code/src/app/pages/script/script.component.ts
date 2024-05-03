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
//@ViewChild('logTrace', {static: false}) logTraceElement1: ElementRef | undefined;
//@ViewChild('logTrace', {static: false}) logTraceElement2: ElementRef | undefined;
//@ViewChild('logPar', {static: false}) logParElement: ElementRef | undefined;

backendStatus: boolean = false; 
  backendURL: string = "http://localhost:5172/api/script";
  date= '';
  status= '';
  postSensors: string = environment.baseUrl+environment.url.script;

  getScripts: string = environment.baseUrl+environment.url.script+"";
  postScript: string = environment.baseUrl+environment.url.script;
  duplicateScripts: string = environment.baseUrl+environment.url.script+"/duplicate";
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
  ordAux = "DESC";

  alertDelete: any = false;
  notDelete: any = false;
  alertNew: any = false;
  notNew: any = false;
  saveOk: any = false;
  saveNot: any = false;
  changeCopy1= 0;
  changeCopy2= 0;

  script = {
    id: 0,
    user_id: "",
    username: "",
    log_date: "",
    log_code: "",
    log_message: "",
    log_trace: "",
  };

  scriptCopy = {
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
    this.getScript(this.order, this.ordAux);
    this.createDate();
    this.readStorage();
  }

  ngOnDestroy(){
    //this.temp1.clearInterval();
    //this.temp2.clearInterval();
    //this.temp3.clearInterval();
    //this.temp4.clearInterval();
    this.storageService.setSearch('')
    this.storageService.setPerPage('15')
    this.storageService.setPage('1')
  }

  setScript(status: any): void {
    let status1 = {
      status: status,
    };
    this.http.post(this.backendURL+"/script", JSON.stringify(status1), this.httpOptionsService.getHttpOptions()).subscribe(
      () => {
        //console.log("Solicitud POST enviada exitosamente.");
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
          //console.log('Texto copiado al portapapeles: ', textToCopy);
        })
        .catch((error) => {
          console.error('Error al copiar texto al portapapeles: ', error);
        });
    }
  }

  /* GET */

  getScriptVoid() { // Obtiene los logs sin pasar arámetros
    this.getScript(this.order, this.ordAux);
  }

  getScriptLocal(id: any, ord: any) { // Ordena columnas en local
    this.order = id;
    this.storageService.setPerPage(this.quantPage.toString())

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
      this.getScript(id, ord);
    }

    const sectionElement = this.elementRef.nativeElement.querySelector(".mark_select");
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  getScript(id: any, ord: any) {// Obtiene los sesnores pasando parametros de ordenación
    this.order = id;
    this.rute = this.rutaActiva.routerState.snapshot.url;
    this.searchAux = this.searchAuxArray.value || "search";
    this.charging = true;
    this.data = [];

    this.http.get(`${this.getScripts}/${this.searchAux}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`, this.httpOptionsService.getHttpOptions())
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
    if (!this.change && idActual != this.actId) {
      this.http.get(`${this.getId}/${idActual}`, this.httpOptionsService.getHttpOptions())
      .subscribe(
        (data: any) => {
          this.script = data[0];
          this.actId = idActual;
          this.id = idActual;
          this.openEdit();
          this.state = 2;
          let script = { ...this.script };
          this.scriptCopy = {
            id: script.id,
            user_id: script.user_id ,
            username: script.username, 
            log_date: script.log_date, 
            log_code: script.log_code, 
            log_message: script.log_message, 
            log_trace: script.log_trace

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

  newScript(form: any) {
    this.state = 1;
    if (form.valid) {
      this.http.post(this.postScript, JSON.stringify(this.script), this.httpOptionsService.getHttpOptions())
        .subscribe(
          (data: any) => {
            this.id = data.id;
            this.alertNew = true;
  
            this.temp1= setTimeout(() => {
              this.alertNew = false;
            }, 2000);
  
            this.openClouse();
            this.script.id = data.id;
            let script = { ...this.script };
            this.data.push(script);
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

    this.script = {
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

  editScript(form: any) { // Guardar datos de la conexión editado
    if (form.valid) {
      this.http.put(this.postScript, JSON.stringify(this.script), this.httpOptionsService.getHttpOptions())
        .subscribe(
          (response: any) => {
            // Respuesta
          },
          (error) => {
            console.error("Error:", error);
          }
        );
      this.data = this.data.filter((data: { id: number }) => data.id !== this.script.id);
      let script = this.script;
      this.data.push(script);
      this.data.sort((a: any, b: any) => {return a.description - b.description;});
      this.actId = this.script.id;
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

  duplicateScript(num: any, type: any) { // Obtiene el nombre de la conexión duplicada
    if (!this.change && !this.change) {
      this.http.get(`${this.duplicateScripts}/${type}`, this.httpOptionsService.getHttpOptions())
      .subscribe(
        (data: any) => {
          this.script = this.data.find((objeto: { id: any }) => objeto.id == num);
          this.openClouse();
          this.state = 0;
    
          this.http.get(`${this.getId}/${this.script.id}`, this.httpOptionsService.getHttpOptions())
            .subscribe(
              (data1: any) => {
                this.script = data1[0];
                this.actId = this.script.id;
                this.id = this.script.id;
                let script = { ...this.script };
                this.scriptCopy = {
                  id: script.id,
                  user_id: script.user_id ,
                  username: script.username, 
                  log_date: script.log_date, 
                  log_code: script.log_code, 
                  log_message: script.log_message, 
                  log_trace: script.log_trace
                };
                this.openNew(
                  '',
                  this.script.user_id,
                  this.script.username, 
                  this.script.log_date, 
                  this.script.log_code, 
                  this.script.log_message,    
                  this.script.log_trace
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

  deletescript(idActual: any) { // Elimina conexión
    let token = this.storageService.getToken() ?? ''; 

    var script2 = {
      id: this.id,
    };
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}`
      }),
      body: script2,
    };

    this.http.delete(this.postScript, options).subscribe(
        (response: any) => {
          // Realiza acciones con la respuesta si es necesario
          //console.log('script eliminados:', response);
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
    this.storageService.setSearch(this.searchAuxArray.value)
    this.currentPage = 1;
    clearTimeout(this.temp4);
    var $this = this;

    this.temp4 = setTimeout(() => {
      if (event.keyCode != 13) {
        $this.getScript(this.order, this.ordAux);
        $this.openClouse();
      }
    }, 500);
  }

  rechargeForm() { // recarga conexión a su valor anterior
    this.script = {
      id: this.scriptCopy.id,
      user_id: this.scriptCopy.user_id ,
      username: this.scriptCopy.username, 
      log_date: this.scriptCopy.log_date, 
      log_code: this.scriptCopy.log_code, 
      log_message: this.scriptCopy.log_message, 
      log_trace: this.scriptCopy.log_trace
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
    this.getScript(this.order, this.ordAux);
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
      this.storageService.setPage(this.currentPage.toString())
      this.getScriptVoid();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage - 10 > 1) {
      this.currentPage = this.currentPage - 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getScriptVoid();
    } 
    else {
      this.currentPage = 1;
      this.storageService.setPage(this.currentPage.toString())
      this.getScriptVoid();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.storageService.setPage(this.currentPage.toString())
      this.getScriptVoid();
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage = num;
    this.storageService.setPage(this.currentPage.toString())
    this.getScriptVoid();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.storageService.setPage(this.currentPage.toString())
      this.getScriptVoid();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage + 10 < this.totalPages) {
      this.currentPage = this.currentPage + 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getScriptVoid();
    } 
    else {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getScriptVoid();
    }
  }

  lastPage(): void { // Ultima pagina
    if (this.currentPage != this.totalPages) {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getScriptVoid();
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

  readStorage() { // Recupera datos en local storage
    let pageString = this.storageService.getPage() ?? "1"; 
    this.currentPage = parseInt(pageString, 10);
    pageString = this.storageService.getPerPage() ?? "15"; 
    this.quantPage = parseInt(pageString, 10);
    this.searchAuxArray.value = this.storageService.getSearch() ?? "";
    if(this.searchAuxArray.value!=""){
      //this.searched= true;
      clearTimeout(this.temp1);
      var $this = this;
      this.temp3 = setTimeout( () => {
        $this.getScript(this.order, this.ordAux);
        $this.openClouse();
      }, 1);
    }
  }
  
}
