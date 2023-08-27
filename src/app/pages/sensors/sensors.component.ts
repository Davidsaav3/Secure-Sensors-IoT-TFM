import { Component ,ElementRef, OnInit, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from "../../../../environments/environment"

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['../../app.component.css']
})

export class SensorsComponent implements OnInit{
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

  max_sensors: string = 'http://localhost:5172/api/sensors_types/max';
  get_sensors: string = 'http://localhost:5172/api/sensors_types/get';
  post_sensors: string = 'http://localhost:5172/api/sensors_types/post';
  delete_sensors: string = 'http://localhost:5172/api/sensors_types/delete';
  update_sensors: string = 'http://localhost:5172/api/sensors_types/update';
  id_sensors: string = 'http://localhost:5172/api/sensors_types/id';

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
  view_dup= 1000;
  pencil_dup= 1000;
  timeout: any = null;
  state= 0;
  show=false;
  show_3= true;
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
  type_2='';

  search_1='Buscar';
  search_2='type';
  mark= 'position';
  ord_asc= 'ASC';

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

  aux_1 = {
    id: '',
  }

  search = {
    value: '', 
  }

  ngOnInit(): void { // Inicializador
    this.getSensors(this.mark,this.ord_asc);
    this.openClouse();
  }

  getSensors(id: any,ord: any){ // Obtener todos los sensores
      this.mark= id;
      this.rute= this.rutaActiva.routerState.snapshot.url;
      if(id!='id'){
        this.search_2= id;
      }
      if(this.search.value==''){
        this.search_1= 'Buscar';
      }
      else{
        this.search_1= this.search.value;
      }
      this.charging= true;
      fetch(`${this.get_sensors}/${this.search_1}/${this.search_2}/${ord}`)
      .then((response) => response.json())
      .then(quotesData => {
        this.charging= false
        this.data = quotesData
      });      
      const sectionElement = this.elementRef.nativeElement.querySelector('.mark_select');
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth' });
      }
  }

  getEstructureButton(id: any,ord: any){ // Ordenar columnas
    this.mark= id;
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

  editSensor(form: any) { // Guardar datos de sensores editado
    if (form.valid) {
      fetch(this.update_sensors, {
        method: "POST",body: JSON.stringify(this.sensors),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => response.json())
      this.data = this.data.filter((data: { id: string; }) => data.id !== this.sensors.id);
      let sensors = {
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
      .then(response => response.json()) 
      this.alert_new= true;
      setTimeout(() => {
        this.alert_new= false;
      }, 2000);
      this.openClouse();
  
      fetch(this.max_sensors)
      .then(response => response.json())
      .then(data => {
        this.id= parseInt(data[0].id+1);
        let sensors = {
          id: this.id, 
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
        this.data.push(sensors)
        this.data.sort((a:any,b:any) => {return a.position-b.position;});

        this.act_id= this.id.toString();
        this.openEdit();
        this.state=2;
      })
    }
    this.change=false;
  }
  
  resize(): void{ // Redimensionar pantalla
    this.width = window.innerWidth;
  }

  duplicateSensor(num: any, type: any){ // Duplicar sensor
    if(!this.change && !this.change){
      this.aux_1 = {
        id: num,    
      }   
      this.search_1= 'Buscar';
      let ord= 'ASC';
      fetch(`${this.get_sensors}/${this.search_1}/${this.search_2}/${ord}`)
      .then((response) => response.json())
      .then(data => {
        let contador = 1;
        let nombresExistentes = new Set();
        for (let index = 0; index < data.length; index++) {
          nombresExistentes.add(data[index].type);
        }
        let type_2= type;
        while(nombresExistentes.has(type_2)) {
          type_2 = `${type}_${contador}`;
          contador++;
        }
        this.openNew();
        fetch(`${this.id_sensors}/${num}`)
        .then(response => response.json())
        .then(data => {
          this.sensors= data[0];
        })
        .catch(error => {
          console.error(error); 
        });
        this.openClouse();
       
        fetch(this.max_sensors)
        .then(response => response.json())
        .then(data => {
          this.id= parseInt(data[0].id);
          this.sensors.id= data[0].id;
          this.sensors.type= type_2;
        })
        this.state= 0;
      })
    }
  }

  deleteSensor(id_actual: any){ // Eliminar sensor
    var sensors2 = {
      id: id_actual,    
    }
    fetch(this.delete_sensors, {
      method: "POST",body: JSON.stringify(sensors2),headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => response.json()) 
    this.alert_delete= true;
    setTimeout(() => {
      this.alert_delete= false;
    }, 2000);
    this.getSensors(this.mark,this.ord_asc);
    this.clouse();
  }

  hide(){  // Ocultar tarjeta lateral
    this.alert_delete= false;
    this.alert_new= false;
  }

  update(){ // Guardar sensores en el popup de salir sin guardar
   if(this.show==true && this.state==1){
    this.newSensor(this.sensors);
   }
   if(this.show==false && this.state==2){
    this.editSensor(this.sensors);
   }
  }

  clouse(){  // Cerrar panel lateral
    this.show= false;
    this.state=-1;
    this.openClouse();
    this.change=false;
    this.change=false;
  }

  orderColumn(id_actual: any){ // Ordenar columnas (Peticion API)
    if(!this.change && !this.change && id_actual!=this.act_id){
      this.act_id= id_actual;
       this.openEdit();
      this.state=2;
      fetch(`${this.id_sensors}/${id_actual}`)
      .then(response => response.json())
      .then(data => {
        this.sensors= data[0];
        this.sensors_copy.id= data[0].id;
        this.sensors_copy.type= data[0].type; 
        this.sensors_copy.metric= data[0].metric;
        this.sensors_copy.description= data[0].description;
        this.sensors_copy.errorvalue= data[0].errorvalue;
        this.sensors_copy.valuemax= data[0].valuemax;
        this.sensors_copy.valuemin= data[0].valuein;
        this.sensors_copy.position= data[0].position;
        this.sensors_copy.correction_general= data[0].correction_general;
        this.sensors_copy.correction_time_general= data[0].correction_time_general;
      })
      .catch(error => {
        console.error(error); 
      });
      this.openClouse();
    }
  }
  
  textSearch(event: any) { // Busqueda por texto
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout( () => {
      if (event.keyCode != 13) {
        $this.getSensors(this.mark,this.ord_asc);
        $this.openClouse();
      }
    }, 500);
  }

  openClouse(){  // Logica abrir y cerrar tarjetas
    if (this.show==true) {
      this.show_3= false;
    }
    else{
      this.show_3= true;
    }
  }

  deleteSearch(){ // Borrar busqueda
    this.search.value= '';
    this.getSensors(this.mark,this.ord_asc);
  }

  openNew(){ // Abrir Nuevo sensor
    this.sensors = {
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
    this.show= true;
    this.openClouse();
    this.state= 1;
  }

  openEdit(){ // Abrir Editar sensor
    this.show= true;
    this.state= 2;
    this.show_3= false;
  }

  recharge(){ // recargar sensores
    this.change= false;
    this.sensors= this.sensors_copy;
  }

  clouseAll(){ // Cerrar todas las pestañas
    this.show_3= false;
    this.show= false;
    this.openClouse();
    this.change=false;
    this.change=false;
  }

}
