import { Component, OnInit, ElementRef } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: "app-structure",
  templateUrl: "./structure.component.html",
  styleUrls: ["../../app.component.css"],
})

export class StructureComponent implements OnInit {

  resultsPerPag = environment.resultsPerPag;
  getVariableStructureList: string =environment.baseUrl+environment.variableDataStructure+"/get_list";

  constructor(private http: HttpClient,public rutaActiva: Router, private elementRef: ElementRef) {
    this.http.get(`${this.getVariableStructureList}`)
    .subscribe((quotesData: any) => {
      this.aux = quotesData[0].id;
    }, (error) => {
      console.error("Error al obtener datos de estructura variable:", error);
    });
  }

  getEstructure: string = environment.baseUrl+environment.dataStructure+"/get";
  postEstructure: string = environment.baseUrl+environment.dataStructure;
  duplicateEstructure: string =environment.baseUrl+environment.dataStructure+"/duplicate";

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
  timeout: any = null;
  
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
    this.http.get(`${this.getEstructure}/${this.searchAux}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`)
    .subscribe((data: any) => {
      this.charging = false;
      if (data && data.length > 0 && data[0].total) {
        this.totalPages = Math.ceil(data[0].total / this.quantPage);
        this.total = data[0].total;
      } else {
        this.totalPages = 0;
        this.total = 0;
      }
      this.data = data;
      if (this.data.length < this.quantPage) {
        this.totalPage = this.total;
      } else {
        this.totalPage = this.quantPage * this.currentPage;
      }
    }, (error) => {
      console.error("Error al obtener datos de estructura:", error);
    });
  }

  getStructuresLocal(id: any, ord: any) { // Ordena las columnas en local
    this.order = id;

    if (this.totalPages <= 1 && false) {
      if (ord == "ASC") {
        if (id == "description") {
          this.data.sort((a: any, b: any) =>a.description.localeCompare(b.description));
        }
        if (id == "configuration") {
          this.data.sort((a: any, b: any) =>a.configuration.localeCompare(b.configuration));
        }
        if (id == "identifier_code") {
          this.data.sort((a: any, b: any) =>a.identifier_code.localeCompare(b.identifier_code));
        }
        if (id == "id_variable_data_structure") {
          this.data.sort((a: any, b: any) =>a.id_variable_data_structure.localeCompare(b.id_variable_data_structure));
        }
      }
      if (ord == "DESC") {
        if (id == "description") {
          this.data.sort((a: any, b: any) =>b.description.localeCompare(a.description));
        }
        if (id == "configuration") {
          this.data.sort((a: any, b: any) =>b.configuration.localeCompare(a.configuration));
        }
        if (id == "identifier_code") {
          this.data.sort((a: any, b: any) =>b.identifier_code.localeCompare(a.identifier_code));
        }
        if (id == "id_variable_data_structure") {
          this.data.sort((a: any, b: any) =>b.id_variable_data_structure.localeCompare(a.id_variable_data_structure));
        }
      }
    } else {
      this.getStructures(id, ord);
    }
    const sectionElement =this.elementRef.nativeElement.querySelector(".mark_select");
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
 
    this.http.get(`${this.getVariableStructureList}`)
      .subscribe(
        (quotesData: any) => {
          this.estructureVariable.structure.unshift(...quotesData);
        },
        (error) => {
          console.error("Error al obtener datos de estructura variable:", error);
        }
      );
  }

  /* NEW */

  newStructures(form: any) { // Guardar datos de estructura de datoss nueva
    this.state = 1;
    if (form.valid) {
      const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json; charset=UTF-8'})};
      this.http.post(this.postEstructure, JSON.stringify(this.estructure), httpOptions)
        .subscribe(
          (data: any) => {
            this.id = data.id;
            this.alertNew = true;
  
            setTimeout(() => {
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
            this.data.sort((a: { description: string }, b: { description: any }) => {return a.description.localeCompare(b.description);});
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

  openNew(id_estructure: any,description: any,configuration: any, identifier_code: any,id_variable_data_structure: any,variable_description: any) { // Abre Nueva estructura de datos
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
      const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json; charset=UTF-8'})};
      this.http.put(this.postEstructure, JSON.stringify(this.estructure), httpOptions)
        .subscribe(
          (data: any) => {
            // Respuesta
          },
          (error) => {
            console.error("Error:", error);
          }
        );
      this.data = this.data.filter((data: { id_estructure: string }) =>data.id_estructure !== this.estructure.id_estructure);
      let estructure = this.estructure;
      this.data.push(estructure);
      this.data.sort((a: { description: string }, b: { description: any }) => {return a.description.localeCompare(b.description);});
      this.actId = parseInt(this.estructure.id_estructure);
      this.openEdit();
      this.state = 2;

      if (num >= 0) {
        this.data[num].variable_description =this.estructure.variable_description;
      }

      this.saveOk = true;
      setTimeout(() => {
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

  duplicateStructures(num: any, description: any) { // Obtiene nombre de estructura de datos duplicada
    if (!this.change && !this.change) {
      this.http.get(`${this.duplicateEstructure}/${description}`).subscribe(
      (data: any) => {
        this.openClouse();
        this.state = 0;
        this.openNew("1", data.duplicatedDescription, this.estructure.configuration, this.estructure.identifier_code, this.estructure.id_variable_data_structure, this.estructure.variable_description);
        this.change = true;
      }, (error:any) => {
        console.error("Error al verificar la descripción duplicada:", error);
      });
    }
  }

  /* DELETE */

  deleteStructures(idActual: any) { // Elimina estructura de datos
    var estructure2 = {
      id_estructure: this.id,
    };
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8'
      }),
      body: JSON.stringify(estructure2)
    };
  
    this.http.delete(this.postEstructure, httpOptions)
      .subscribe(
        (data: any) => {
          // Manejar la respuesta aquí si es necesario
        },
        (error) => {
          console.error("Error:", error);
        }
      );

    this.alertDelete = true;

    setTimeout(() => {
      this.alertDelete = false;
    }, 2000);

    this.data = this.data.filter((objeto: { id_estructure: any }) => objeto.id_estructure != idActual);
    this.openClouse();
  }

  /* BÚSQUEDA */

  textSearch(event: any) { // Busca por texto
    this.currentPage = 1;
    clearTimeout(this.timeout);
    var $this = this;

    this.timeout = setTimeout(() => {
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
    this.getStructures(this.order, this.ordAux);
  }

  /* TAEJETAS */

  clouse() { // Cierra tarjeta estructura de datos
    this.show = false;
    this.openClouse();
    this.change = false;    
    this.actId= -1; 
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
    this.openClouse();
    this.change = false;
  }

  /* PAGINACIÓN */

  firstPage(): void { // Primera pagina
    if (this.currentPage != 1) {
      this.currentPage = 1;
      this.getStructuresVoid();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage - 10 > 1) {
      this.currentPage = this.currentPage - 10;
      this.getStructuresVoid();
    } 
    else {
      this.currentPage = 1;
      this.getStructuresVoid();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getStructuresVoid();
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage = num;
    this.getStructuresVoid();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getStructuresVoid();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage + 10 < this.totalPages) {
      this.currentPage = this.currentPage + 10;
      this.getStructuresVoid();
    } 
    else {
      this.currentPage = this.totalPages;
      this.getStructuresVoid();
    }
  }

  lastPage(): void { // Ultima pagina
    if (this.currentPage != this.totalPages) {
      this.currentPage = this.totalPages;
      this.getStructuresVoid();
    }
  }
}
