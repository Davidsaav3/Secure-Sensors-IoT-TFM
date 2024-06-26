import { Component, OnInit, ElementRef, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StorageService } from '../../services/storage.service';
import { HttpOptionsService } from '../../services/httpOptions.service';

@Component({
  selector: "app-structure",
  templateUrl: "./structure.component.html",
  styleUrls: ["../../app.component.css"],
})

export class StructureComponent implements OnInit, OnDestroy {

  resultsPerPag = environment.resultsPerPag;
  getVariableStructureList: string = environment.domain + environment.baseUrl + environment.url.variableDataStructure + "/get_list";

  constructor(private httpOptionsService: HttpOptionsService, private storageService: StorageService, private http: HttpClient, public rutaActiva: Router, private elementRef: ElementRef) {
    this.http.get(`${this.getVariableStructureList}`, this.httpOptionsService.getHttpOptions())
      .subscribe((quotesData: any) => {
        this.aux = quotesData[0].id;
      }, (error) => {
        if (environment.verbose_error) console.error("Error al obtener datos de estructura variable:", error);
      });
  }

  getEstructure: string = environment.domain + environment.baseUrl + environment.url.dataStructure;
  postEstructure: string = environment.domain + environment.baseUrl + environment.url.dataStructure;
  duplicateEstructure: string = environment.domain + environment.baseUrl + environment.url.dataStructure + "/duplicate";

  totalPages = 5;
  currentPage = 1;
  quantPage = 15;
  page = 1;
  total = 0;
  totalPage = 0;

  aux = 1;
  alt1 = true;
  alt2 = true;
  alt3 = true;
  alt4 = true;

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

  estructure = {
    id_estructure: "",
    description: null,
    configuration: null,
    identifier_code: null,
    id_variable_data_structure: 1,
    variable_description: "",
  };

  estructureCopy = {
    id_estructure: "",
    description: null,
    configuration: null,
    identifier_code: null,
    id_variable_data_structure: 1,
    variable_description: "",
  };

  estructureVariable = {
    structure: [
      {
        id: 0,
        description: "",
        structure: "",
        initial_byte: 0,
      },
    ],
  };

  search = {
    value: "",
  };

  ngOnInit(): void { // Inicializa
    this.getStructures(this.order, this.ordAux);
    this.getStructuresList();
    this.readStorage();
  }

  ngOnDestroy() {
    if (this.temp1 != null)
      clearTimeout(this.temp1);
    if (this.temp2 != null)
      clearTimeout(this.temp2);
    if (this.temp3 != null)
      clearTimeout(this.temp3);
    if (this.temp4 != null)
      clearTimeout(this.temp4);

    this.storageService.setSearch('')
    this.storageService.setPerPage('15')
    this.storageService.setPage('1')
  }

  /* GET */

  getStructuresVoid() { // Obtiene estructura de datos sin parámetros
    this.getStructures(this.order, this.ordAux);
  }

  getStructures(id: any, ord: any) { // Obtiene todas las estructuras de datos
    this.order = id;
    this.rute = this.rutaActiva.routerState.snapshot.url;
    if (this.search.value == "") {
      this.searchAux = "search";
    }
    else {
      this.searchAux = this.search.value;
    }

    this.charging = true;
    this.data = [];
    this.http.get(`${this.getEstructure}/${this.searchAux}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`, this.httpOptionsService.getHttpOptions())
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
        if (environment.verbose_error) console.error("Error al obtener datos de estructura:", error);
      });
  }

  getStructuresLocal(id: any, ord: any) { // Ordena las columnas en local
    this.order = id;
    this.storageService.setPerPage(this.quantPage.toString())

    if (this.totalPages <= 1 && false) {
      if (ord == "ASC") {
        if (id == "description") {
          this.data.sort((a: any, b: any) => a.description.localeCompare(b.description));
        }
        if (id == "configuration") {
          this.data.sort((a: any, b: any) => a.configuration.localeCompare(b.configuration));
        }
        if (id == "identifier_code") {
          this.data.sort((a: any, b: any) => a.identifier_code.localeCompare(b.identifier_code));
        }
        if (id == "id_variable_data_structure") {
          this.data.sort((a: any, b: any) => a.id_variable_data_structure.localeCompare(b.id_variable_data_structure));
        }
      }
      if (ord == "DESC") {
        if (id == "description") {
          this.data.sort((a: any, b: any) => b.description.localeCompare(a.description));
        }
        if (id == "configuration") {
          this.data.sort((a: any, b: any) => b.configuration.localeCompare(a.configuration));
        }
        if (id == "identifier_code") {
          this.data.sort((a: any, b: any) => b.identifier_code.localeCompare(a.identifier_code));
        }
        if (id == "id_variable_data_structure") {
          this.data.sort((a: any, b: any) => b.id_variable_data_structure.localeCompare(a.id_variable_data_structure));
        }
      }
    }
    else {
      this.getStructures(id, ord);
    }
    const sectionElement = this.elementRef.nativeElement.querySelector(".mark_select");
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  orderColumn(idActual: any) { // Ordenar las columnas con una consulta
    this.show = true;
    if (!this.change && !this.change && idActual != this.actId) {
      this.actId = idActual;
      this.id = idActual;
      this.openEdit();
      this.state = 2;
      const objetoEnData = this.data.find((objeto: { id_estructure: any }) => objeto.id_estructure == idActual);
      this.estructure = { ...objetoEnData };
      this.estructureCopy = {
        id_estructure: this.estructure.id_estructure,
        description: this.estructure.description,
        configuration: this.estructure.configuration,
        identifier_code: this.estructure.identifier_code,
        id_variable_data_structure: this.estructure.id_variable_data_structure,
        variable_description: this.estructure.variable_description,
      };
      this.openClouse();
    }
  }

  getStructuresList() {
    this.http.get(`${this.getVariableStructureList}`, this.httpOptionsService.getHttpOptions())
      .subscribe(
        (quotesData: any) => {
          this.estructureVariable.structure.unshift(...quotesData);
        },
        (error) => {
          if (environment.verbose_error) console.error("Error al obtener datos de estructura variable:", error);
        }
      );
  }

  /* NEW */

  newStructures(form: any) { // Guardar datos de estructura de datoss nueva
    this.state = 1;
    if (form.valid) {
      this.http.post(this.postEstructure, JSON.stringify(this.estructure), this.httpOptionsService.getHttpOptions())
        .subscribe(
          (data: any) => {
            this.id = data.id;
            this.alertNew = true;

            this.temp1 = setTimeout(() => {
              this.alertNew = false;
            }, 2000);

            this.openClouse();
            let estructure = {
              id_estructure: this.id,
              description: this.estructure.description,
              configuration: this.estructure.configuration,
              identifier_code: this.estructure.identifier_code,
              id_variable_data_structure: this.estructure.id_variable_data_structure,
            };
            this.data.push(estructure);
            this.data.sort((a: { description: string }, b: { description: any }) => { return a.description.localeCompare(b.description); });
            this.actId = this.id;
            this.openEdit();
            this.state = 2;
          },
          (error) => {
            if (environment.verbose_error) console.error("Error:", error);
          }
        );

      this.change = false;
    }
  }

  openNew(id_estructure: any, description: any, configuration: any, identifier_code: any, id_variable_data_structure: any, variable_description: any) { // Abre Nueva estructura de datos
    if (id_estructure == "") {
      this.estructureCopy.id_variable_data_structure = this.aux;
      this.estructure = {
        id_estructure: id_estructure,
        description: description,
        configuration: configuration,
        identifier_code: identifier_code,
        id_variable_data_structure: this.aux,
        variable_description: variable_description,
      };
    }
    else {
      this.estructureCopy.id_variable_data_structure = id_variable_data_structure;
      this.estructure = {
        id_estructure: id_estructure,
        description: description,
        configuration: configuration,
        identifier_code: identifier_code,
        id_variable_data_structure: id_variable_data_structure,
        variable_description: variable_description,
      };
    }

    this.actId = 1;
    this.show = true;
    this.openClouse();
    this.state = 1;
  }

  /* EDIT */

  editStructures() { // Guardar la estructura editada (popup)
    if (this.show == true && (this.state == 0 || this.state == 1)) {
      this.newStructures(this.estructure);
    }
    if (this.show == false && this.state == 2) {
      this.editStructuresAux(this.estructure, -1);
    }
  }

  editStructuresAux(form: any, num: any) { // Guardar datos de estructura editada
    if (form.valid) {
      this.http.put(this.postEstructure, JSON.stringify(this.estructure), this.httpOptionsService.getHttpOptions())
        .subscribe(
          (data: any) => {
            // Respuesta
          },
          (error) => {
            if (environment.verbose_error) console.error("Error:", error);
          }
        );
      this.data = this.data.filter((data: { id_estructure: string }) => data.id_estructure !== this.estructure.id_estructure);
      let estructure = this.estructure;
      this.data.push(estructure);
      this.data.sort((a: { description: string }, b: { description: any }) => { return a.description.localeCompare(b.description); });
      this.actId = parseInt(this.estructure.id_estructure);
      this.openEdit();
      this.state = 2;

      if (num >= 0) {
        this.data[num].variable_description = this.estructure.variable_description;
      }

      this.saveOk = true;
      this.temp2 = setTimeout(() => {
        this.saveOk = false;
      }, 2000);

      this.saved = true;
      this.change = false;
    }
  }

  openEdit() { // Abre tarjeta Editar estructura de datos
    this.show = true;
    this.state = 2;
    this.showAux = false;
  }

  /* DUPLICATE */

  duplicateStructures(description: any) { // Obtiene nombre de estructura de datos duplicada
    if (!this.change && !this.change) {
      this.http.get(`${this.duplicateEstructure}/${description}`, this.httpOptionsService.getHttpOptions()).subscribe(
        (data: any) => {
          this.openClouse();
          this.state = 0;
          this.openNew("1", data.duplicatedDescription, this.estructure.configuration, this.estructure.identifier_code, this.estructure.id_variable_data_structure, this.estructure.variable_description);
          this.change = true;
        }, (error: any) => {
          if (environment.verbose_error) console.error("Error al verificar la descripción duplicada:", error);
        });
    }
  }

  /* DELETE */

  deleteStructures(idActual: any) { // Elimina estructura de datos
    let token = this.storageService.getToken() ?? '';

    var estructure2 = {
      id_estructure: this.id,
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}`
      }),
      body: JSON.stringify(estructure2)
    };

    this.http.delete(this.postEstructure, httpOptions)
      .subscribe(
        (data: any) => {
          // Manejar la respuesta aquí si es necesario
        },
        (error) => {
          if (environment.verbose_error) console.error("Error:", error);
        }
      );

    this.alertDelete = true;

    this.temp3 = setTimeout(() => {
      this.alertDelete = false;
    }, 2000);

    this.data = this.data.filter((objeto: { id_estructure: any }) => objeto.id_estructure != idActual);
    this.openClouse();
  }

  /* BÚSQUEDA */

  textSearch(event: any) { // Busca por texto
    this.storageService.setSearch(this.search.value)
    this.currentPage = 1;
    clearTimeout(this.temp4);
    var $this = this;

    this.temp4 = setTimeout(() => {
      if (event.keyCode != 13) {
        $this.getStructures(this.order, this.ordAux);
        $this.openClouse();
      }
    }, 500);
  }

  rechargeForm() {// Recargar campos a sus valores originales
    this.change = false;
    this.estructure = {
      id_estructure: this.estructureCopy.id_estructure,
      description: this.estructureCopy.description,
      configuration: this.estructureCopy.configuration,
      identifier_code: this.estructureCopy.identifier_code,
      id_variable_data_structure: this.estructureCopy.id_variable_data_structure,
      variable_description: this.estructureCopy.variable_description,
    };
  }

  deleteSearch() { // Borrar busqueda por texto
    this.Page(1);
    this.totalPages = 5;
    this.currentPage = 1;
    this.quantPage = 15;
    this.page = 1;
    this.search.value = "";
    this.storageService.setSearch(this.search.value)
    this.getStructures(this.order, this.ordAux);
  }

  /* TAEJETAS */

  clouse() { // Cierra tarjeta estructura de datos
    this.show = false;
    this.openClouse();
    this.change = false;
    this.actId = -1;
  }

  openClouse() { // Abre y cierra tarjetas de estructuras de datos
    if (this.show == true) {
      this.showAux = false;
    }
    else {
      this.showAux = true;
    }
  }

  clouseAll() { // Cerrar todas las tarjetas de estructuras
    this.showAux = false;
    this.show = false;
    this.storageService.setPage(this.currentPage.toString())
    this.openClouse();
    this.change = false;
  }

  /* PAGINACIÓN */

  firstPage(): void { // Primera pagina
    if (this.currentPage != 1) {
      this.currentPage = 1;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructuresVoid();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage - 10 > 1) {
      this.currentPage = this.currentPage - 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructuresVoid();
    }
    else {
      this.currentPage = 1;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructuresVoid();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructuresVoid();
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage = num;
    this.storageService.setPage(this.currentPage.toString())
    this.getStructuresVoid();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructuresVoid();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage + 10 < this.totalPages) {
      this.currentPage = this.currentPage + 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructuresVoid();
    }
    else {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructuresVoid();
    }
  }

  lastPage(): void { // Ultima pagina
    if (this.currentPage != this.totalPages) {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getStructuresVoid();
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
        $this.getStructures(this.order, this.ordAux);
        $this.openClouse();
      }, 1);
    }
  }
}
