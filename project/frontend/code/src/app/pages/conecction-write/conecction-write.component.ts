import { Component, ElementRef, OnDestroy, OnInit, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../services/storage.service';
import { HttpOptionsService } from '../../services/httpOptions.service';

@Component({
  selector: "app-conecction-write",
  templateUrl: "./conecction-write.component.html",
  styleUrls: ["../../app.component.css"],
})

export class ConecctionWriteComponent implements OnInit, OnDestroy {
  resultsPerPag = environment.resultsPerPag;
  @HostListener("window:resize", ["$event"])
  onResize() {
    window.resizeBy(-1, 0);
    this.resize();
  }

  constructor(private httpOptionsService: HttpOptionsService,private storageService: StorageService,private http: HttpClient,public rutaActiva: Router, private elementRef: ElementRef) {
    this.resize();
  }

  getConecction: string = environment.baseUrl+environment.url.conecctionWrite+"";
  postConecction: string = environment.baseUrl+environment.url.conecctionWrite;
  duplicateConecction: string = environment.baseUrl+environment.url.conecctionWrite+"/duplicate";
  getId: string = environment.baseUrl+environment.url.conecctionWrite+"/id";
  getIdSecret: string = environment.baseUrl+environment.url.conecctionWrite+"/secret";

  passwordFieldType = 'password';
  passwordPattern = environment.password_pattern;;

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
  showPass= false;

  searchAux = "search";
  order = "description";
  ordAux = "ASC";

  alertDelete: any = false;
  notDelete: any = false;
  alertNew: any = false;
  notNew: any = false;
  saveOk: any = false;
  saveNot: any = false;

  conecctions = {
    id: 0,
    description: "",
    authorization: "", 
    urlIngest: "", 
    enabled: true
  };

  conecctionsSecret = {
    id: 0,
    authorization: "", 
  };

  conecctionsCopy = {
    id: 0,
    description: "",
    authorization: "", 
    urlIngest: "", 
    enabled: true
  };

  searchAuxArray = {
    value: "",
  };

  users = {
    id: this.id,
    password: "",
  };

  ngOnInit(): void { // Inicializa
    this.getConecctions(this.order, this.ordAux);
  }

  ngOnDestroy(){
    //this.temp1.clearInterval();
    //this.temp2.clearInterval();
    //this.temp3.clearInterval();
    //this.temp4.clearInterval();
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
    let token = this.storageService.getToken() ?? ''; 
    

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
    let token = this.storageService.getToken() ?? ''; 
    

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
            description: conecctions.description ,
            authorization: conecctions.authorization, 
            urlIngest: conecctions.urlIngest, 
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

  getSecret(idActual: any) { // Obtiene secreto
    this.users.id= this.id;    
    this.http.post(this.getIdSecret, JSON.stringify(this.users), this.httpOptionsService.getHttpOptions())
    .subscribe(
      (data: any) => {
        this.conecctionsSecret = data[0];
        //console.log(data[0])
        this.showPass= true;
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

  openNew(id:any,description:any,authorization:any,urlIngest:any,enabled:any) { // Abre Nueva conexion

    this.conecctions = {
      id: id,
      description: description ,
      authorization: authorization, 
      urlIngest: urlIngest, 
      enabled: enabled,
    };

    this.show = true;
    this.openClouse();
  }


  /* EDIT */

  editConecction(form: any) { // Guardar datos de la conexión editado
    if (form.valid) {
      this.http.put(this.postConecction, JSON.stringify(this.conecctions), this.httpOptionsService.getHttpOptions())
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

      this.temp2 = setTimeout(() => {
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
    let token = this.storageService.getToken() ?? ''; 
    

    if (!this.change && !this.change) {
      this.http.get(`${this.duplicateConecction}/${type}`, this.httpOptionsService.getHttpOptions()).subscribe(
        (data: any) => {
          this.conecctions = this.data.find((objeto: { id: any }) => objeto.id == num);
          this.openClouse();
          this.state = 0;
          this.openNew(
            '',
            data.duplicatedescription,
            '', 
            this.conecctions.urlIngest, 
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
        (response: any) => {
          // Realiza acciones con la respuesta si es necesario
          //console.log('conecctions eliminados:', response);
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
      authorization: this.conecctionsCopy.authorization,
      urlIngest: this.conecctionsCopy.urlIngest,
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
  
  togglePasswordType() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  resetPass(){
    this.showPass= false;
    this.users.password= "";
  }
}
