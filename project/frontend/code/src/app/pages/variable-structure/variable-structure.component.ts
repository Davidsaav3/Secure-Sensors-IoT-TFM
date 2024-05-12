import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { HttpOptionsService } from '../../services/httpOptions.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: "app-variable-structure",
  templateUrl: "./variable-structure.component.html",
  styleUrls: ["../../app.component.css"],
})

export class VariableStructureComponent implements OnInit, OnDestroy {

  resultsPerPag = environment.resultsPerPag;

  constructor(private httpOptionsService: HttpOptionsService, private storageService: StorageService, private http: HttpClient, public rutaActiva: Router, private elementRef: ElementRef) { }

  getEstructure: string = environment.baseUrl + environment.url.variableDataStructure;
  postStructure: string = environment.baseUrl + environment.url.variableDataStructure;
  duplicateEstructure: string = environment.baseUrl + environment.url.variableDataStructure + "/duplicate";

  totalPages = 5;
  currentPage = 1;
  quantPage = 15;
  page = 1;
  total = 0;
  totalPage = 0;

  alt1 = true;
  alt2 = true;
  alt3 = true;

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

  searchParameter = "search";
  order = "description";
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

  structure = {
    id: 0,
    description: "",
    structure: "",
    initial_byte: "",
  };

  structureCopy = {
    id: 0,
    description: "",
    structure: "",
    initial_byte: "",
  };

  search = {
    value: "",
  };

  ngOnInit(): void { // Inicializa
    this.getStructure(this.order, this.ordAux);
    this.readStorage();
  }

  ngOnDestroy() { // Destructor
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

  getStructureVoid() { // Obtiene estructuras sin parámetros
    this.getStructure(this.order, this.ordAux);
  }

  getStructureLocal(id: any, ord: any) { // Ordena las columnas de forma local
    this.order = id;
    this.storageService.setPerPage(this.quantPage.toString())

    if (this.totalPages <= 1 && false) {
    }
    else {
      this.getStructure(id, ord);
    }
    const sectionElement = this.elementRef.nativeElement.querySelector(".mark_select");
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  getStructure(id: any, ord: any) { // Obtiene todas las estructuras
    this.order = id;
    this.rute = this.rutaActiva.routerState.snapshot.url;
    if (this.search.value == "") {
      this.searchParameter = "search";
    }
    else {
      this.searchParameter = this.search.value;
    }
    this.charging = true;
    this.data = [];
    this.http.get(`${this.getEstructure}/${this.searchParameter}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`, this.httpOptionsService.getHttpOptions())
      .subscribe((data: any) => {
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
      }, (error) => {
        if(environment.verbose_error) console.error(error);
      });
  }

  orderColumn(idActual: any) { // Ordena las columnas con una consulta
    this.show = true;
    if (!this.change && !this.change && idActual != this.actId) {
      this.actId = idActual;
      this.id = idActual;
      this.openEdit();
      this.state = 2;
      const objetoEnData = this.data.find(
        (objeto: { id: any }) => objeto.id == idActual
      );
      this.structure = { ...objetoEnData };
      this.structureCopy = {
        id: this.structure.id,
        description: this.structure.description,
        structure: this.structure.structure,
        initial_byte: this.structure.initial_byte,
      };
      this.openClouse();
    }
  }

  /* NEW */

  newStructure(form: any) { // Guardar los datos de una estructura nueva
    this.state = 1;
    if (form.valid) {
      this.http.post(this.postStructure, this.structure, this.httpOptionsService.getHttpOptions())
        .subscribe(
          (data: any) => {
            this.id = data.id;
            this.alertNew = true;

            this.temp1 = setTimeout(() => {
              this.alertNew = false;
            }, 2000);

            this.openClouse();
            let structure = {
              id: this.id,
              description: this.structure.description,
              structure: this.structure.structure,
              initial_byte: this.structure.initial_byte,
            };
            this.data.push(structure);
            this.data.sort((a: { description: string }, b: { description: any }) => { return a.description.localeCompare(b.description); });
            this.actId = this.id;
            this.openEdit();
            this.state = 2;
          },
          (error) => {
            if(environment.verbose_error) console.error("Error:", error);
          }
        );

      this.change = false;
    }
  }

  openNew(id: any, description: any, structure: any, initial_byte: any) { // Abre una nueva estructura
    this.structure = {
      id: id,
      description: description,
      structure: structure,
      initial_byte: initial_byte,
    };
    this.actId = 1;
    this.show = true;
    this.openClouse();
    this.state = 1;
  }

  /* EDIT */

  editStructure() { // Guarda datos editados de estructura (popup salir sin guardar)
    if (this.show == true && (this.state == 0 || this.state == 1)) {
      this.newStructure(this.structure);
    }
    if (this.show == false && this.state == 2) {
      this.editStructureAux(this.structure);
    }
  }

  editStructureAux(form: any) { // Guardar datos de estructura
    if (form.valid) {
      this.http.put(this.postStructure, this.structure, this.httpOptionsService.getHttpOptions())
        .subscribe(
          () => {
            // Respuesta
          },
          (error) => {
            if(environment.verbose_error) console.error(error);
          }
        );
      this.data = this.data.filter((data: { id: string }) => parseInt(data.id) !== this.structure.id);
      let structure = this.structure;
      this.data.push(structure);
      this.data.sort((a: { description: string }, b: { description: any }) => { return a.description.localeCompare(b.description); });
      this.actId = this.structure.id;
      this.openEdit();
      this.state = 2;

      this.saveOk = true;
      this.temp2 = setTimeout(() => {
        this.saveOk = false;
      }, 2000);

      this.saved = true;
      this.change = false;
    }
  }

  openEdit() { // Abre Edición de estructura
    this.show = true;
    this.state = 2;
    this.showAux = false;
  }

  /* DUPLICATE */

  duplicateStructure(num: any, description: any) { // Obtiene el nombre de una estructura duplicada
    if (!this.change && !this.change) {
      this.http.get(`${this.duplicateEstructure}/${description}`, this.httpOptionsService.getHttpOptions()).subscribe(
        (data: any) => {
          this.structure = this.data.find((objeto: { id: any }) => objeto.id == num);
          this.openClouse();
          this.state = 0;
          this.openNew('', data.duplicatedDescription, this.structure.structure, this.structure.initial_byte);
          this.change = true;
        },
        (error) => {
          if(environment.verbose_error) console.error('Error al verificar la descripción duplicada:', error);
        }
      );
    }
  }

  /* DELETE */

  deleteStructure(idActual: any) { // Elimina una estructura
    let token = this.storageService.getToken() ?? '';

    var structure2 = {
      id: this.id,
    };
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}` }),
      body: JSON.stringify(structure2),

    };

    this.http.delete(this.postStructure, httpOptions).subscribe(
      () => {
        // Procesa la respuesta aquí si es necesario
      },
      (error: any) => {
        if(environment.verbose_error) console.error(error);
      }
    );
    this.alertDelete = true;

    this.temp3 = setTimeout(() => {
      this.alertDelete = false;
    }, 2000);

    this.data = this.data.filter(
      (objeto: { id: any }) => objeto.id != idActual
    );
    this.openClouse();
  }

  /* BÚSQUEDA */

  textSearch(event: any) { // Busqueda por texto
    this.storageService.setSearch(this.search.value)
    this.currentPage = 1;
    clearTimeout(this.temp4);
    var $this = this;
    this.temp4 = setTimeout(() => {
      if (event.keyCode != 13) {
        $this.getStructure(this.order, this.ordAux);
        $this.openClouse();
      }
    }, 500);
  }

  rechargeForm() { // Recargar campos a sus valores originales
    this.change = false;
    this.structure = {
      id: this.structureCopy.id,
      description: this.structureCopy.description,
      structure: this.structureCopy.structure,
      initial_byte: this.structureCopy.initial_byte,
    };
  }

  deleteSearch() { // Borrar campo de busqueda
    this.Page(1);
    this.totalPages = 5;
    this.currentPage = 1;
    this.quantPage = 15;
    this.page = 1;
    this.search.value = "";
    this.storageService.setSearch(this.search.value)
    this.getStructure(this.order, this.ordAux);
  }

  /* TARJETAS */

  openClouse() { // Abre y cierra tarjetas estructuras
    if (this.show == true) {
      this.showAux = false;
    }
    else {
      this.showAux = true;
    }
  }

  clouse() { // Cierra tarjetas de estructuras
    this.show = false;
    this.openClouse();
    this.change = false;
    this.actId = -1;
  }

  clouseAll() { // Cerrar todas las tarjetas de estructuras
    this.showAux = false;
    this.show = false;
    this.openClouse();
    this.change = false;
  }

  /* PAGINACIÓN */

  firstPage(): void { // Primera pagina
    if (this.currentPage != 1) {
      this.currentPage = 1;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructureVoid();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage - 10 > 1) {
      this.currentPage = this.currentPage - 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructureVoid();
    }
    else {
      this.currentPage = 1;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructureVoid();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructureVoid();
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage = num;
    this.storageService.setPage(this.currentPage.toString())
    this.getStructureVoid();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructureVoid();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage + 10 < this.totalPages) {
      this.currentPage = this.currentPage + 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructureVoid();
    }
    else {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructureVoid();
    }
  }

  lastPage(): void { // Ultima pagina
    if (this.currentPage != this.totalPages) {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructureVoid();
    }
  }

  readStorage() { // Recupera datos en local storage
    let pageString = this.storageService.getPage() ?? "1";
    this.currentPage = parseInt(pageString, 10);
    pageString = this.storageService.getPerPage() ?? "15";
    this.quantPage = parseInt(pageString, 10);
    this.search.value = this.storageService.getSearch() ?? "";
    if (this.search.value != "") {
      //this.searched= true;
      clearTimeout(this.temp1);
      var $this = this;
      this.temp3 = setTimeout(() => {
        $this.getStructure(this.order, this.ordAux);
        $this.openClouse();
      }, 1);
    }
  }
}
