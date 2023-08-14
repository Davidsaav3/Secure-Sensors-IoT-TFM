import { Component ,ElementRef, OnInit, HostListener} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['../../app.component.css']
})

export class SensorsComponent implements OnInit{

  public activeLang = 'es';
  @HostListener('window:resize', ['$event'])
    onResize(event: any) {
    window.resizeBy(-1, 0);
    this.resize();
  }

  constructor(public rutaActiva: Router, private elementRef: ElementRef) {
    this.resize();
  }

  max_sensors: string = 'http://localhost:5172/api/max/sensors_types';
  get_sensors: string = 'http://localhost:5172/api/get/sensors_types';
  post_sensors: string = 'http://localhost:5172/api/post/sensors_types';
  delete_sensors: string = 'http://localhost:5172/api/delete/sensors_types';
  update_sensors: string = 'http://localhost:5172/api/update/sensors_types';
  id_sensors: string = 'http://localhost:5172/api/id/sensors_types';

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
    correction_general: null,
    correction_time_general: null,
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
    correction_general: null,
    correction_time_general: null,
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

  editSensor(form: any) { // Guardar datos de sensores editado
    if (form.valid) {
      fetch(this.update_sensors, {
        method: "POST",body: JSON.stringify(this.sensors),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => response.json()) 
      this.save_ok= true;
      setTimeout(() => {
        this.save_ok= false;
      }, 2000);
      this.getSensors(this.mark,this.ord_asc);
      this.saved= true;
    }
    this.change=false;
  }

  newSensor(form: any) { // Guardar datos de sensores nuevo
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
      })
    }
    this.change=false;
    this.change=false;
    this.getSensors(this.mark,this.ord_asc);
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
        //this.change= true;
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
    this.openClouse();
  }

  hide(){ 
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

  clouse(){  // cerrar tarjeta
    this.show= false;
    this.state=-1;
    this.openClouse();
    this.change=false;
    this.change=false;
  }

  orderColumn(id_actual: any){ // Ordenar columnas
    if(!this.change && !this.change && id_actual!=this.act_id){
      this.act_id= id_actual;
       this.openEdit();
      this.state=2;
      fetch(`${this.id_sensors}/${id_actual}`)
      .then(response => response.json())
      .then(data => {
        this.sensors= data[0];
        //console.log(data[0].sensors_copy)
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
  
  textSearch(event: any) { // search por texto
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

  deleteSearch(){ // Borrar search
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
      correction_general: null,
      correction_time_general: null,
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

  /*
  new Promise((resolve, reject) => {
    fetch(`${this.id_sensors}/${num}`)
    .then(response => response.json())
    .then(data => {
      this.sensors= data[0];
      resolve(this.sensors);
    })
    .catch(error => {
      console.error(error); 
      reject(error);
    });
  })
  .then(data => {
    //this.getSensors(this.mark,this.ord_asc);
  })
  .catch(error => {
    console.error('Error al obtener los datos:', error);
  })
  */
}
