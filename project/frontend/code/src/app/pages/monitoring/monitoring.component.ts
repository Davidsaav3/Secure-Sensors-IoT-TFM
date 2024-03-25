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
  resultsPerPag = environment.resultsPerPag;
  @HostListener("window:resize", ["$event"])
  onResize() {
    window.resizeBy(-1, 0);
    this.resize();
  }

  constructor(private http: HttpClient,public rutaActiva: Router, private elementRef: ElementRef) {
    this.resize();
  }

  getConecction: string = environment.baseUrl+environment.log+"/get";
  postConecction: string = environment.baseUrl+environment.log;
  duplicateConecction: string = environment.baseUrl+environment.log+"/duplicate";
  getId: string = environment.baseUrl+environment.log+"/id";
  date: any;

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
  timeout: any = null;
  
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

  conecctions = {
    id: 0,
    user_id: "",
    username: "",
    log_date: "",
    log_code: "",
    log_message: "",
    log_trace: "",
  };

  conecctionsCopy = {
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

  ngOnInit(): void { // Inicializa
    this.getConecctions(this.order, this.ordAux);
    this.createDate();
  }

  /* GET */

  getConecctionsVoid() { // Obtiene los conexiones sin pasar arámetros
    this.getConecctions(this.order, this.ordAux);
  }

  getConecctionsLocal(id: any, ord: any) { // Ordena columnas en local
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
      this.getConecctions(id, ord);
    }

    const sectionElement = this.elementRef.nativeElement.querySelector(".mark_select");
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  getConecctions(id: any, ord: any) {// Obtiene los sesnores pasando parametros de ordenación
    let token = localStorage.getItem('token') ?? ''; 
    let headers = new HttpHeaders().set('Authorization', `${token}`);

    this.order = id;
    this.rute = this.rutaActiva.routerState.snapshot.url;
    this.searchAux = this.searchAuxArray.value || "search";
    this.charging = true;
    this.data = [];

    this.http.get(`${this.getConecction}/${this.searchAux}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`, {headers})
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
        console.log(this.formatDateTime(data.log_date))

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
    let token = localStorage.getItem('token') ?? ''; 
    let headers = new HttpHeaders().set('Authorization', `${token}`);

    if (!this.change && idActual != this.actId) {
      this.http.get(`${this.getId}/${idActual}`, {headers})
      .subscribe(
        (data: any) => {
          this.conecctions = data[0];
          this.actId = idActual;
          this.id = idActual;
          this.openEdit();
          this.state = 2;
          let conecctions = { ...this.conecctions };
          this.conecctionsCopy = {
            id: conecctions.id,
            user_id: conecctions.user_id ,
            username: conecctions.username, 
            log_date: conecctions.log_date, 
            log_code: conecctions.log_code, 
            log_message: conecctions.log_message, 
            log_trace: conecctions.log_trace

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

  newConecction(form: any) {
    let token = localStorage.getItem('token') ?? ''; 

    this.state = 1;
    if (form.valid) {
      const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}`})};
      this.http.post(this.postConecction, JSON.stringify(this.conecctions), httpOptions)
        .subscribe(
          (data: any) => {
            this.id = data.id;
            this.alertNew = true;
  
            setTimeout(() => {
              this.alertNew = false;
            }, 2000);
  
            this.openClouse();
            this.conecctions.id = data.id;
            let conecctions = { ...this.conecctions };
            this.data.push(conecctions);
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

    this.conecctions = {
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

  editConecction(form: any) { // Guardar datos de la conexión editado
    let token = localStorage.getItem('token') ?? ''; 

    if (form.valid) {
      const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}`})};
      this.http.put(this.postConecction, JSON.stringify(this.conecctions), httpOptions)
        .subscribe(
          (response: any) => {
            // Respuesta
          },
          (error) => {
            console.error("Error:", error);
          }
        );
      this.data = this.data.filter((data: { id: number }) => data.id !== this.conecctions.id);
      let conecctions = this.conecctions;
      this.data.push(conecctions);
      this.data.sort((a: any, b: any) => {return a.description - b.description;});
      this.actId = this.conecctions.id;
      this.openEdit();
      this.state = 2;
      this.saveOk = true;

      setTimeout(() => {
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

  duplicateConecctions(num: any, type: any) { // Obtiene el nombre de la conexión duplicada
    let token = localStorage.getItem('token') ?? ''; 
    let headers = new HttpHeaders().set('Authorization', `${token}`);

    if (!this.change && !this.change) {
      this.http.get(`${this.duplicateConecction}/${type}`, {headers})
      .subscribe(
        (data: any) => {
          this.conecctions = this.data.find((objeto: { id: any }) => objeto.id == num);
          this.openClouse();
          this.state = 0;
    
          this.http.get(`${this.getId}/${this.conecctions.id}`, {headers})
            .subscribe(
              (data1: any) => {
                this.conecctions = data1[0];
                this.actId = this.conecctions.id;
                this.id = this.conecctions.id;
                let conecctions = { ...this.conecctions };
                this.conecctionsCopy = {
                  id: conecctions.id,
                  user_id: conecctions.user_id ,
                  username: conecctions.username, 
                  log_date: conecctions.log_date, 
                  log_code: conecctions.log_code, 
                  log_message: conecctions.log_message, 
                  log_trace: conecctions.log_trace
                };
                this.openNew(
                  '',
                  this.conecctions.user_id,
                  this.conecctions.username, 
                  this.conecctions.log_date, 
                  this.conecctions.log_code, 
                  this.conecctions.log_message,    
                  this.conecctions.log_trace
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

  deleteconecctions(idActual: any) { // Elimina conexión
    let token = localStorage.getItem('token') ?? ''; 
    let headers = new HttpHeaders().set('Authorization', `${token}`);

    var conecctions2 = {
      id: this.id,
    };
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}`
      }),
      body: conecctions2,
    };

    this.http.delete(this.postConecction, options).subscribe(
        (response: any) => {
          // Realiza acciones con la respuesta si es necesario
          //console.log('conecctions eliminados:', response);
        },
        (error: any) => {
          console.error('Error al eliminar conexón:', error);
        }
      );
    this.alertDelete = true;

    setTimeout(() => {
      this.alertDelete = false;
    }, 2000);

    this.data = this.data.filter((objeto: { id: any }) => objeto.id != idActual);
    this.clouse();
  }

  /* BÚSQUEDA */

  textSearch(event: any) { // Busca por texto
    this.currentPage = 1;
    clearTimeout(this.timeout);
    var $this = this;

    this.timeout = setTimeout(() => {
      if (event.keyCode != 13) {
        $this.getConecctions(this.order, this.ordAux);
        $this.openClouse();
      }
    }, 500);
  }

  rechargeForm() { // recarga conexión a su valor anterior
    this.conecctions = {
      id: this.conecctionsCopy.id,
      user_id: this.conecctionsCopy.user_id ,
      username: this.conecctionsCopy.username, 
      log_date: this.conecctionsCopy.log_date, 
      log_code: this.conecctionsCopy.log_code, 
      log_message: this.conecctionsCopy.log_message, 
      log_trace: this.conecctionsCopy.log_trace
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
    this.getConecctions(this.order, this.ordAux);
  }

  /* TARJETAS */

  openClouse() { // Abre y cierra la tarjeta de conexiones
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
      this.getConecctionsVoid();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage - 10 > 1) {
      this.currentPage = this.currentPage - 10;
      this.getConecctionsVoid();
    } 
    else {
      this.currentPage = 1;
      this.getConecctionsVoid();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getConecctionsVoid();
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage = num;
    this.getConecctionsVoid();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getConecctionsVoid();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage + 10 < this.totalPages) {
      this.currentPage = this.currentPage + 10;
      this.getConecctionsVoid();
    } 
    else {
      this.currentPage = this.totalPages;
      this.getConecctionsVoid();
    }
  }

  lastPage(): void { // Ultima pagina
    if (this.currentPage != this.totalPages) {
      this.currentPage = this.totalPages;
      this.getConecctionsVoid();
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
