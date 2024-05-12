import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { HttpOptionsService } from '../../services/httpOptions.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: "app-conecction-read",
  templateUrl: "./conecction-read.component.html",
  styleUrls: ["../../app.component.css"],
})

export class ConecctionReadComponent implements OnInit, OnDestroy {
  resultsPerPag = environment.resultsPerPag;
  @HostListener("window:resize", ["$event"])
  onResize() {
    window.resizeBy(-1, 0);
    this.resize();
  }

  constructor(private httpOptionsService: HttpOptionsService, private storageService: StorageService, private http: HttpClient, public rutaActiva: Router, private elementRef: ElementRef) {
    this.resize();
  }

  getConecction: string = environment.baseUrl + environment.url.conecctionRead;
  postConecction: string = environment.baseUrl + environment.url.conecctionRead;
  duplicateConecction: string = environment.baseUrl + environment.url.conecctionRead + "/duplicate";
  getId: string = environment.baseUrl + environment.url.conecctionRead + "/id";
  getIdSecret: string = environment.baseUrl + environment.url.conecctionRead + "/secret";

  passwordFieldType = 'password';
  passwordPattern = environment.password_pattern;;

  totalPages = 5;
  currentPage = 1;
  quantPage = 15;
  page = 1;
  total = 0;
  totalPage = 0;
  showPass = false;

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
  order = "description";
  ordAux = "ASC";

  alertDelete: any = false;
  notDelete: any = false;
  alertNew: any = false;
  notNew: any = false;
  saveOk: any = false;
  saveNot: any = false;

  users = {
    id: this.id,
    password: "",
  };

  conecctions = {
    id: 0,
    description: "",
    mqttQeue: "",
    appID: "",
    accessKey: "",
    subscribe: "",
    enabled: true
  };

  conecctionsSecret = {
    id: 0,
    accessKey: "",
  };

  conecctionsCopy = {
    id: 0,
    description: "",
    mqttQeue: "",
    appID: "",
    accessKey: "",
    subscribe: "",
    enabled: true
  };

  searchAuxArray = {
    value: "",
  };

  ngOnInit(): void { // Inicializa
    this.getConecctions(this.order, this.ordAux);
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

  /* GET */

  getConecctionsVoid() { // Obtiene los conexiones sin pasar arámetros
    this.getConecctions(this.order, this.ordAux);
  }

  getConecctionsLocal(id: any, ord: any) { // Ordena columnas en local
    this.order = id;
    this.storageService.setPerPage(this.quantPage.toString())

    if (this.totalPages <= 1 && false) {
      if (ord == "ASC") {
        if (id == "description") {
          this.data.sort((a: any, b: any) => { return a.description - b.description; });
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
            return valorA.localeCompare(valorB);
          });
        }
      }
      if (ord == "DESC") {
        if (id == "description") {
          this.data.sort((a: any, b: any) => { return b.description - a.description; });
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
    this.order = id;
    this.rute = this.rutaActiva.routerState.snapshot.url;
    this.searchAux = this.searchAuxArray.value || "search";
    this.charging = true;
    this.data = [];

    this.http.get(`${this.getConecction}/${this.searchAux}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`, this.httpOptionsService.getHttpOptions())
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
            this.conecctions = data[0];
            this.actId = idActual;
            this.id = idActual;
            this.openEdit();
            this.state = 2;
            let conecctions = { ...this.conecctions };
            this.conecctionsCopy = {
              id: conecctions.id,
              description: conecctions.description,
              mqttQeue: conecctions.mqttQeue,
              appID: conecctions.appID,
              accessKey: conecctions.accessKey,
              subscribe: conecctions.subscribe,
              enabled: conecctions.enabled
            };
            this.openClouse();
          },
          (error) => {
            console.error(error);
          }
        );
    }
  }

  getSecret() { // Obtiene secreto
    this.users.id = this.id;
    this.http.post(this.getIdSecret, JSON.stringify(this.users), this.httpOptionsService.getHttpOptions())
      .subscribe(
        (data: any) => {
          this.conecctionsSecret = data[0];
          if(environment.verbose) console.log(data[0])
          this.showPass = true;
        },
        (error) => {
          console.error(error);
        }
      );
  }

  /* NEW */

  newConecction(form: any) {
    if (form.valid) {
      this.http.post(this.postConecction, JSON.stringify(this.conecctions), this.httpOptionsService.getHttpOptions())
        .subscribe(
          (data: any) => {
            this.id = data.id;
            this.alertNew = true;

            this.temp1 = setTimeout(() => {
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
          },
          (error) => {
            console.error("Error:", error);
          }
        );
      this.change = false;
    }
  }

  openNew(id: any, description: any, mqttQeue: any, appID: any, accessKey: any, subscribe: any, enabled: any) { // Abre Nueva conexion

    this.conecctions = {
      id: id,
      description: description,
      mqttQeue: mqttQeue,
      appID: appID,
      accessKey: accessKey,
      subscribe: subscribe,
      enabled: enabled
    };

    this.show = true;
    this.openClouse();
  }


  /* EDIT */

  editConecction(form: any) { // Guardar datos de la conexión editado  
    if (form.valid) {
      if(environment.verbose) console.log(this.conecctions)
      this.http.put(this.postConecction, JSON.stringify(this.conecctions), this.httpOptionsService.getHttpOptions())
        .subscribe(
          () => {
            // Manejar la respuesta
          },
          (error) => {
            console.error("Error:", error);
          }
        );

      // Eliminar la conexión anterior del arreglo y agregar la conexión editada
      this.data = this.data.filter((data: { id: number }) => data.id !== this.conecctions.id);
      let conecctions = this.conecctions;
      this.data.push(conecctions);

      // Ordenar el arreglo por descripción (asumiendo que 'description' es una propiedad de 'conecctions')
      this.data.sort((a: any, b: any) => {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
      });

      // Establecer el ID actual y abrir el modo de edición
      this.actId = this.conecctions.id;
      this.openEdit();
      this.state = 2;
      this.saveOk = true;

      // Ocultar el mensaje de éxito después de 2 segundos
      this.temp2 = setTimeout(() => {
        this.saveOk = false;
      }, 2000);
    }
    // Marcar que se ha guardado y desmarcar el cambio
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
    if (!this.change && !this.change) {
      this.http.get(`${this.duplicateConecction}/${type}`, this.httpOptionsService.getHttpOptions()).subscribe(
        (data: any) => {
          this.conecctions = this.data.find((objeto: { id: any }) => objeto.id == num);
          this.openClouse();
          this.state = 0;
          this.openNew(
            '',
            data.duplicatedDescription,
            this.conecctions.mqttQeue,
            this.conecctions.appID,
            '',
            this.conecctions.subscribe,
            this.conecctions.enabled
          );
          this.change = true;
        },
        (error) => {
          console.error('Error al verificar la descripción duplicada:', error);
        }
      );
    }
  }

  /* DELETE */

  deleteconecctions(idActual: any) { // Elimina conexión
    let token = this.storageService.getToken() ?? '';


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
      () => {
        // Realiza acciones con la respuesta si es necesario
        if(environment.verbose) console.log('conecctions eliminados:');
      },
      (error: any) => {
        console.error('Error al eliminar conexón:', error);
      }
    );
    this.alertDelete = true;

    this.temp3 = setTimeout(() => {
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
        $this.getConecctions(this.order, this.ordAux);
        $this.openClouse();
      }
    }, 500);
  }

  rechargeForm() { // recarga conexión a su valor anterior
    this.conecctions = {
      id: this.conecctionsCopy.id,
      description: this.conecctionsCopy.description,
      mqttQeue: this.conecctionsCopy.mqttQeue,
      appID: this.conecctionsCopy.appID,
      accessKey: this.conecctionsCopy.accessKey,
      subscribe: this.conecctionsCopy.subscribe,
      enabled: this.conecctionsCopy.enabled
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
    this.actId = -1;
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
      this.getConecctionsVoid();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage - 10 > 1) {
      this.currentPage = this.currentPage - 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getConecctionsVoid();
    }
    else {
      this.currentPage = 1;
      this.storageService.setPage(this.currentPage.toString())
      this.getConecctionsVoid();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.storageService.setPage(this.currentPage.toString())
      this.getConecctionsVoid();
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage = num;
    this.storageService.setPage(this.currentPage.toString())
    this.getConecctionsVoid();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.storageService.setPage(this.currentPage.toString())
      this.getConecctionsVoid();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage + 10 < this.totalPages) {
      this.currentPage = this.currentPage + 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getConecctionsVoid();
    }
    else {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getConecctionsVoid();
    }
  }

  lastPage(): void { // Ultima pagina
    if (this.currentPage != this.totalPages) {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getConecctionsVoid();
    }
  }

  togglePasswordType() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  resetPass() {
    this.showPass = false;
    this.users.password = "";
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
        $this.getConecctions(this.order, this.ordAux);
        $this.openClouse();
      }, 1);
    }
  }
}
