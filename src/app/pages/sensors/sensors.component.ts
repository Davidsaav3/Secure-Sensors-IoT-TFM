import { Component ,ElementRef, OnInit, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from "../../environments/environment"

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['../../app.component.css']
})

export class SensorsComponent implements OnInit{

  resultsPerPag= environment.resultsPerPag;
  @HostListener('window:resize', ['$event'])
    onResize(event: any) {
    window.resizeBy(-1, 0);
    this.resize();
  }

  constructor(public rutaActiva: Router, private elementRef: ElementRef) {
    this.resize();
  }

  get_sensors: string = 'http://localhost:5172/api/sensors_types/get';
  post_sensors: string = 'http://localhost:5172/api/sensors_types';
  delete_sensors: string = 'http://localhost:5172/api/sensors_types';
  update_sensors: string = 'http://localhost:5172/api/sensors_types';
  duplicate_sensor: string = 'http://localhost:5172/api/sensors_types/duplicate';

  totalPages = 5;
  currentPage = 1;
  quantPage = 15;
  page= 1;
  total= 0;
  totalPage= 0;

  alt1=true;
  alt2=true;
  alt3=true;
  alt4=true;
  alt5=true;
  alt6=true;
  alt7=true;

  actId= '';
  charging= false;
  data: any;
  width= 0;
  rute='';
  viewDup= -1;
  pencilDup= -1;
  timeout: any = null;
  state= 0;
  show=false;
  showAux= true;
  alertDelete: any= false;
  alertNew: any= false;
  notDelete: any= false;
  notNew: any= false;
  saveOk: any= false;
  saveNot: any= false;
  saved= false;
  change= false;
  dupOk=false;
  dupNot=false;
  id= 0;
  search='Buscar';
  order= 'position';
  orderAux= 'ASC';

  sensors = {
    id: '', 
    type: '',    
    metric: '', 
    description: '',
    errorvalue: null,
    valuemax: null,
    valuemin: null,
    position: 0,
    correction_general: '',
    correction_time_general: '',
  }

  sensorsCopy = {
    id: '', 
    type: '',    
    metric: '', 
    description: '',
    errorvalue: null,
    valuemax: null,
    valuemin: null,
    position: 0,
    correction_general: '',
    correction_time_general: '',
  }

  searchArray = {
    value: '', 
  }

  ngOnInit(): void { // Inicializador
    this.getSensors(this.order,this.orderAux);
  }

  getSensorsVoid(){ // Obtener sensores sin parámetros
    this.getSensors(this.order,this.orderAux);
  }

  getSensors(id: any, ord: any) { // Obtiene los sesnores
    this.order = id;
    this.rute = this.rutaActiva.routerState.snapshot.url;
    this.search = this.searchArray.value || 'Buscar';
    this.charging = true;
    this.data= [];

    fetch(`${this.get_sensors}/${this.search}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`)
      .then((response) => response.json())
      .then(quotesData => {
        this.charging = false;
        this.totalPages = Math.ceil(quotesData[0].total / this.quantPage);
        this.total = quotesData[0].total;
        this.data = quotesData;

        if (this.data.length < this.quantPage) {
          this.totalPage = this.total;
        } else {
          this.totalPage = this.quantPage * this.currentPage;
        }
      });
  
    const sectionElement = this.elementRef.nativeElement.querySelector('.mark_select');
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getSensorsLocal(id: any,ord: any){ // Ordenar columnas local
    this.order= id;

    if(this.totalPages<=1){
      if (ord == 'ASC') {
        if (id == 'position') {
          this.data.sort((a: any, b: any) => {return a.position - b.position;});
        }
        if (id == 'type') {
          this.data.sort((a: any, b: any) => a.type.localeCompare(b.type));
        }
        if (id == 'metric') {
          this.data.sort((a: any, b: any) => a.metric.localeCompare(b.metric));
        }
        if (id == 'description') {
          this.data.sort((a: any, b: any) => a.description.localeCompare(b.description));
        }
        if (id == 'correction_general') {
          this.data.sort((a: any, b: any) => {const valorA = a.correction_general || "";const valorB = b.correction_general || "";return valorA.localeCompare(valorB);});
        }
        if (id == 'correction_time_general') {
          this.data.sort((a: any, b: any) => {const valorA = a.correction_time_general || "";const valorB = b.correction_time_general || "";return valorA.localeCompare(valorB);});
        }
      }
      if (ord == 'DESC') {
        if (id == 'position') {
          this.data.sort((a: any, b: any) => {return b.position - a.position;});
        }
        if (id == 'type') {
          this.data.sort((a: any, b: any) => b.type.localeCompare(a.type));
        }
        if (id == 'metric') {
          this.data.sort((a: any, b: any) => b.metric.localeCompare(a.metric));
        }
        if (id == 'description') {
          this.data.sort((a: any, b: any) => b.description.localeCompare(a.description));
        }
        if (id == 'correction_general') {
          this.data.sort((a: any, b: any) => {const valorA = b.correction_general || "";const valorB = a.correction_general || "";return valorA.localeCompare(valorB);});
        }
        if (id == 'correction_time_general') {
          this.data.sort((a: any, b: any) => {const valorA = b.correction_time_general || "";const valorB = a.correction_time_general || "";return valorA.localeCompare(valorB);});
        }
      }
    }
    else{
      this.getSensors(id,ord);
    }
    
    const sectionElement = this.elementRef.nativeElement.querySelector('.mark_select');
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  editSensor(form: any) { // Guardar datos de sensores editado
    if (form.valid) {
      fetch(this.update_sensors, {
        method: "PUT",body: JSON.stringify(this.sensors),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => response.json())
      this.data = this.data.filter((data: { id: string; }) => data.id !== this.sensors.id);
      let sensors = this.sensors;
      this.data.push(sensors)
      this.data.sort((a:any,b:any) => {return a.position-b.position;});
      this.actId= this.sensors.id.toString();
      this.openEdit();
      this.state=2;
      this.saveOk= true;
      
      setTimeout(() => {
        this.saveOk= false;
      }, 2000);
    }
    this.saved= true;
    this.change=false;
  }

  newSensor(form: any) { // Guardar datos de sensores nuevos
    this.state= 1;
    if (form.valid) {
      fetch(this.post_sensors, {
        method: "POST",body: JSON.stringify(this.sensors),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la solicitud");
        }
        return response.json();
      })
      .then((data) => {
        this.id= data.id;
        this.alertNew= true;

        setTimeout(() => {
          this.alertNew= false;
        }, 2000);

        this.openClouse();
        let sensors =this.sensors;
        this.data.push(sensors)
        this.data.sort((a: { position: string; }, b: { position: any; }) => {
          if (typeof a.position === 'string' && typeof b.position === 'string') {
            return a.position.localeCompare(b.position);
          } 
          else {
            return 1;
          }
        });
        this.actId= this.id.toString();
        this.openEdit();
        this.state=2;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
      this.change=false;
    }
  }

  duplicateSensor(num: any, type: any){ // Duplicar sensor
    if(!this.change && !this.change){
      fetch(`${this.duplicate_sensor}/${type}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error en la red');
        }
        return response.text();
      })
      .then((data) => {
        this.sensors= this.data.find((objeto: { id: any; }) => objeto.id == num);
        this.openClouse();
        this.state= 0;
        this.openNew('', data, this.sensors.metric, this.sensors.description, this.sensors.errorvalue, this.sensors.valuemax, this.sensors.valuemin, this.sensors.position, this.sensors.correction_general, this.sensors.correction_time_general);
        this.change= true;
      })
      .catch((error) => {
        console.error('Error al verificar la descripción duplicada:', error);
      });
    }
  }

  deleteSensor(id_actual: any){ // Eliminar sensor
    var sensors2 = {
      id: id_actual,    
    }
    fetch(this.delete_sensors, {
      method: "DELETE",body: JSON.stringify(sensors2),headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => response.json()) 
    this.alertDelete= true;
    setTimeout(() => {
      this.alertDelete= false;
    }, 2000);
    this.data= this.data.filter((objeto: { id: any; }) => objeto.id != id_actual)
    this.clouse();
  }

  clouse(){ // Cerrar panel lateral
    this.show= false;
    this.state=-1;
    this.openClouse();
    this.change=false;
  }

  resize(): void{ // Redimensionar tarjeta sensores
    this.width = window.innerWidth;
  }

  orderColumn(id_actual: any){ // Ordenar columnas
    if(!this.change && !this.change && id_actual!=this.actId){
      this.actId= id_actual;
      this.openEdit();
      this.state=2;
      const objetoEnData = this.data.find((objeto: { id: any; }) => objeto.id == id_actual);
      this.sensors = { ...objetoEnData };
      this.sensorsCopy = {
        id: this.sensors.id, 
        type: this.sensors.type,    
        metric: this.sensors.metric, 
        description: this.sensors.description,
        errorvalue: this.sensors.errorvalue,
        valuemax: this.sensors.valuemax,
        valuemin: this.sensors.valuemin,
        position: this.sensors.position,
        correction_general: this.sensors.correction_general,
        correction_time_general: this.sensors.correction_time_general,
      }
      this.openClouse();
    }
  }
  
  textSearch(event: any) { // Busqueda por texto
    this.currentPage= 1;
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout( () => {
      if (event.keyCode != 13) {
        $this.getSensors(this.order,this.orderAux);
        $this.openClouse();
      }
    }, 500);
  }

  openClouse(){  // Abrir y cerrar tarjeta sensores
    if (this.show==true) {
      this.showAux= false;
    }
    else{
      this.showAux= true;
    }
  }

  deleteSearch(){ // Borrar busqueda
    this.searchArray.value= '';
    this.getSensors(this.order,this.orderAux);
  }

  openNew(id: any, type: any,metric: any,description: any,errorvalue: any,valuemax: any,valuemin: null,position: any,correction_general: any,correction_time_general: any){ // Abrir Nuevo sensor
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
    }
    this.show= true;
    this.openClouse();
  }

  openEdit(){ // Abrir Editar sensor
    this.show= true;
    this.state= 2;
    this.showAux= false;
  }

  recharge(){ // recargar sensores a sus valores anteriores
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
    }
    this.change= false;
  }

  clouseAll(){ // Cerrar todas las pestañas
    this.showAux= false;
    this.show= false;
    this.openClouse();
    this.change=false;
    this.change=false;
  }

  /* PAGINACIÓN */

  firstPage(): void { // Primera pagina
    if(this.currentPage!=1){
      this.currentPage= 1;
      this.getSensorsVoid();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage-10 > 1) {
      this.currentPage= this.currentPage-10;
      this.getSensorsVoid();
    }
    else{
      this.currentPage= 1;
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
    this.currentPage= num;
    this.getSensorsVoid();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getSensorsVoid();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage+10 < this.totalPages) {
      this.currentPage= this.currentPage+10;
      this.getSensorsVoid();
    }
    else{
      this.currentPage= this.totalPages;
      this.getSensorsVoid();
    }
  }

  lastPage(): void { // Ultima pagina
    if(this.currentPage!=this.totalPages){
      this.currentPage= this.totalPages;
      this.getSensorsVoid();
    }
  }

  /**/

}
