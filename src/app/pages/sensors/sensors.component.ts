import { Component, ElementRef, OnInit, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-sensors",
  templateUrl: "./sensors.component.html",
  styleUrls: ["../../app.component.css"],
})

export class SensorsComponent implements OnInit {
  resultsPerPag = environment.resultsPerPag;
  @HostListener("window:resize", ["$event"])
  onResize() {
    window.resizeBy(-1, 0);
    this.resize();
  }

  constructor(public rutaActiva: Router, private elementRef: ElementRef) {
    this.resize();
  }

  getSensor: string = "http://localhost:5172/api/sensors_types/get";
  postSensors: string = "http://localhost:5172/api/sensors_types";
  duplicateSensor: string = "http://localhost:5172/api/sensors_types/duplicate";
  getId: string = "http://localhost:5172/api/sensors_types/id";

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
  state = 1;
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
  order = "position";
  ordAux = "ASC";

  alertDelete: any = false;
  notDelete: any = false;
  alertNew: any = false;
  notNew: any = false;
  saveOk: any = false;
  saveNot: any = false;

  sensors = {
    id: "",
    type: "",
    metric: "",
    description: "",
    errorvalue: null,
    valuemax: null,
    valuemin: null,
    position: 0,
    correction_general: "",
    correction_time_general: "",
  };

  sensorsCopy = {
    id: "",
    type: "",
    metric: "",
    description: "",
    errorvalue: null,
    valuemax: null,
    valuemin: null,
    position: 0,
    correction_general: "",
    correction_time_general: "",
  };

  searchAuxArray = {
    value: "",
  };

  ngOnInit(): void { // Inicializa
    this.getSensors(this.order, this.ordAux);
  }

  /* GET */

  getSensorsVoid() { // Obtiene los sensores sin pasar arámetros
    this.getSensors(this.order, this.ordAux);
  }

  getSensorsLocal(id: any, ord: any) { // Ordena columnas en local
    this.order = id;

    if (this.totalPages <= 1 && false) {
      if (ord == "ASC") {
        if (id == "position") {
          this.data.sort((a: any, b: any) => {return a.position - b.position;});
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
        if (id == "position") {
          this.data.sort((a: any, b: any) => {return b.position - a.position;});
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
      this.getSensors(id, ord);
    }

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

    fetch(`${this.getSensor}/${this.searchAux}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`)
      .then((response) => response.json())
      .then((data) => {
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
      });

    const sectionElement = this.elementRef.nativeElement.querySelector(".mark_select");
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  orderColumn(idActual: any) { // Ordena columnas haciendo una consulta
    if (!this.change && !this.change && idActual != this.actId) {
      fetch(`${this.getId}/${idActual}`)
        .then((response) => response.json())
        .then((data) => {
          this.sensors = data[0];
          this.actId = idActual;
          this.id = idActual;
          this.openEdit();
          this.state = 2;
          //const objetoEnData = this.data.find((objeto: { id: any; }) => objeto.id == idActual);
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
          };
          this.openClouse();
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }
  
  /* NEW */

  newSensor(form: any) { // Guardar datos de sensores nuevos
    this.state = 1;
    if (form.valid) {
      fetch(this.postSensors, {
        method: "POST",
        body: JSON.stringify(this.sensors),
        headers: { "Content-type": "application/json; charset=UTF-8" },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error en la solicitud");
          }
          return response.json();
        })
        .then((data) => {
          this.id = data.id;
          this.alertNew = true;

          setTimeout(() => {
            this.alertNew = false;
          }, 2000);

          this.openClouse();
          let sensors = this.sensors;
          this.data.push(sensors);
          this.data.sort((a: { position: string }, b: { position: any }) => {
            if (typeof a.position === "string" && typeof b.position === "string") {
              return a.position.localeCompare(b.position);
            } 
            else {
              return 1;
            }
          });
          this.actId = this.id;
          this.openEdit();
          this.state = 2;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      this.change = false;
    }
  }

  openNew(id: any,type: any,metric: any,description: any,errorvalue: any,valuemax: any,valuemin: null,position: any,correction_general: any,correction_time_general: any) { // Abre Nuevo sensor
    this.sensors = {
      id: id,
      type: type,
      metric: metric,
      description: description,
      errorvalue: errorvalue,
      valuemax: valuemax,
      valuemin: valuemin,
      position: position,
      correction_general: correction_general,
      correction_time_general: correction_time_general,
    };
    this.show = true;
    this.openClouse();
  }


  /* EDIT */

  editSensor(form: any) { // Guardar datos del sensor editado
    if (form.valid) {
      fetch(this.postSensors, {
        method: "PUT",
        body: JSON.stringify(this.sensors),
        headers: { "Content-type": "application/json; charset=UTF-8" },
      }).then((response) => response.json());
      this.data = this.data.filter((data: { id: string }) => data.id !== this.sensors.id);
      let sensors = this.sensors;
      this.data.push(sensors);
      this.data.sort((a: any, b: any) => {return a.position - b.position;});
      this.actId = parseInt(this.sensors.id);
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
  
  openEdit() { // Abre Editar sensor
    this.show = true;
    this.state = 2;
    this.showAux = false;
  }

  /* DUPLICATE */

  duplicateSensors(num: any, type: any) { // Obtiene el nombre del sensor duplicado
    if (!this.change && !this.change) {
      fetch(`${this.duplicateSensor}/${type}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Error en la red");
          }
          return response.text();
        })
        .then((data) => {
          this.sensors = this.data.find((objeto: { id: any }) => objeto.id == num);
          this.openClouse();
          this.state = 0;
          this.openNew("",data,this.sensors.metric,this.sensors.description,this.sensors.errorvalue,this.sensors.valuemax,this.sensors.valuemin,this.sensors.position,this.sensors.correction_general,this.sensors.correction_time_general);
          this.change = true;
        })
        .catch((error) => {
          console.error("Error al verificar la descripción duplicada:", error);
        });
    }
  }

  /* DELETE */

  deleteSensors(idActual: any) { // Elimina sensor
    var sensors2 = {
      id: this.id,
    };
    fetch(this.postSensors, {
      method: "DELETE",
      body: JSON.stringify(sensors2),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    }).then((response) => response.json());
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
        $this.getSensors(this.order, this.ordAux);
        $this.openClouse();
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
    this.getSensors(this.order, this.ordAux);
  }

  /* TARJETAS */

  openClouse() { // Abre y cierra la tarjeta de sensores
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
  }

  clouseAll() { // Cierra todas las tarjetas
    this.showAux = false;
    this.show = false;
    this.openClouse();
    this.change = false;
    this.change = false;
  }

  resize(): void { // Redimensiona tarjetas
    this.width = window.innerWidth;
  }

  /* PAGINACIÓN */

  firstPage(): void { // Primera pagina
    if (this.currentPage != 1) {
      this.currentPage = 1;
      this.getSensorsVoid();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage - 10 > 1) {
      this.currentPage = this.currentPage - 10;
      this.getSensorsVoid();
    } 
    else {
      this.currentPage = 1;
      this.getSensorsVoid();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getSensorsVoid();
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage = num;
    this.getSensorsVoid();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getSensorsVoid();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage + 10 < this.totalPages) {
      this.currentPage = this.currentPage + 10;
      this.getSensorsVoid();
    } 
    else {
      this.currentPage = this.totalPages;
      this.getSensorsVoid();
    }
  }

  lastPage(): void { // Ultima pagina
    if (this.currentPage != this.totalPages) {
      this.currentPage = this.totalPages;
      this.getSensorsVoid();
    }
  }
}
