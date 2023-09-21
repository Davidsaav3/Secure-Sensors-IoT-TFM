import { Component ,ElementRef, OnInit, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from "../../environments/environment"

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['../../app.component.css']
})

export class SensorsComponent implements OnInit{
  results_per_pag= environment.results_per_pag;
  leng_name= environment.lenguaje_name;
  leng_lang= environment.lenguaje_lang;
  public activeLang = environment.lenguaje_lang[0];
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
  total_page= 0;

  alt_1_a=true;
  alt_1_b=false;
  alt_2_a=true;
  alt_2_b=false;
  alt_3_a=true;
  alt_3_b=false;  
  alt_4_a=true;
  alt_4_b=false;  
  alt_5_a=true;
  alt_5_b=false;
  alt_6_a=true;
  alt_6_b=false;  
  alt_7_a=true;
  alt_7_b=false;

  act_id= '';
  charging= false;
  data: any;
  width= 0;
  rute='';
  view_dup= -1;
  pencil_dup= -1;
  timeout: any = null;
  state= 0;
  show=false;
  show_2= true;
  alert_delete: any= false;
  alert_new: any= false;
  not_delete: any= false;
  not_new: any= false;
  save_ok: any= false;
  save_not: any= false;
  saved= false;
  change= false;
  dup_ok=false;
  dup_not=false;
  id= 0;
  search='Buscar';
  order= 'position';
  order_asc= 'ASC';

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

  sensors_copy = {
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

  search_array = {
    value: '', 
  }

  ngOnInit(): void { // Inicializador
    this.getSensors(this.order,this.order_asc);
  }

  getstructureVoid(){ // Obtener estructura sin parámetros
    this.getSensors(this.order,this.order_asc);
  }

  getSensors(id: any, ord: any) { // Obtiene los sesnores
    this.order = id;
    this.rute = this.rutaActiva.routerState.snapshot.url;
    this.search = this.search_array.value || 'Buscar';
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
          this.total_page = this.total;
        } else {
          this.total_page = this.quantPage * this.currentPage;
        }
      });
  
    const sectionElement = this.elementRef.nativeElement.querySelector('.mark_select');
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getsensorsButton(id: any,ord: any){ // Ordenar columnas
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
      this.act_id= this.sensors.id.toString();
      this.openEdit();
      this.state=2;
      this.save_ok= true;
      
      setTimeout(() => {
        this.save_ok= false;
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
        this.alert_new= true;

        setTimeout(() => {
          this.alert_new= false;
        }, 2000);

        this.openClouse();
        let sensors =this.sensors;
        this.data.push(sensors)
        this.data.sort((a: { position: string; }, b: { position: any; }) => {
          if (typeof a.position === 'string' && typeof b.position === 'string') {
            return a.position.localeCompare(b.position);
          } else {
            return 1;
          }
        });
        this.act_id= this.id.toString();
        this.openEdit();
        this.state=2;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
      this.change=false;
    }
  }

  duplicateSensor(num: any, type: any){ // Duplicar senso
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
    this.alert_delete= true;
    setTimeout(() => {
      this.alert_delete= false;
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

  resize(): void{ // Redimensionar pantalla
    this.width = window.innerWidth;
  }

  orderColumn(id_actual: any){ // Ordenar columnas
    if(!this.change && !this.change && id_actual!=this.act_id){
      this.act_id= id_actual;
      this.openEdit();
      this.state=2;
      const objetoEnData = this.data.find((objeto: { id: any; }) => objeto.id == id_actual);
      this.sensors = { ...objetoEnData };
      this.sensors_copy = {
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
        $this.getSensors(this.order,this.order_asc);
        $this.openClouse();
      }
    }, 500);
  }

  openClouse(){  // Logica abrir y cerrar tarjetas
    if (this.show==true) {
      this.show_2= false;
    }
    else{
      this.show_2= true;
    }
  }

  deleteSearch(){ // Borrar busqueda
    this.search_array.value= '';
    this.getSensors(this.order,this.order_asc);
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
    this.show_2= false;
  }

  recharge(){ // recargar sensores
    this.sensors = {
      id: this.sensors_copy.id, 
      type: this.sensors_copy.type,    
      metric: this.sensors_copy.metric, 
      description: this.sensors_copy.description,
      errorvalue: this.sensors_copy.errorvalue,
      valuemax: this.sensors_copy.valuemax,
      valuemin: this.sensors_copy.valuemin,
      position: this.sensors_copy.position,
      correction_general: this.sensors_copy.correction_general,
      correction_time_general: this.sensors_copy.correction_time_general,
    }
    this.change= false;
  }

  clouseAll(){ // Cerrar todas las pestañas
    this.show_2= false;
    this.show= false;
    this.openClouse();
    this.change=false;
    this.change=false;
  }

  /* PAGINACIÓN */

  firstPage(): void { // Primera pagina
    if(this.currentPage!=1){
      this.currentPage= 1;
      this.getstructureVoid();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage-10 > 1) {
      this.currentPage= this.currentPage-10;
      this.getstructureVoid();
    }
    else{
      this.currentPage= 1;
      this.getstructureVoid();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getstructureVoid();
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage= num;
    this.getstructureVoid();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getstructureVoid();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage+10 < this.totalPages) {
      this.currentPage= this.currentPage+10;
      this.getstructureVoid();
    }
    else{
      this.currentPage= this.totalPages;
      this.getstructureVoid();
    }
  }

  lastPage(): void { // Ultima pagina
    if(this.currentPage!=this.totalPages){
      this.currentPage= this.totalPages;
      this.getstructureVoid();
    }
  }

  /**/

}
