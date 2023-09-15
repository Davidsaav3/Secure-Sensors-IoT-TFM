import { Component , OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DataSharingService } from '../../services/data_sharing.service';
import { DevicesMapComponent } from './devices-map/devices-map.component';
import { environment } from "../../environments/environment"

@Component({
  selector: 'app-devices-new-edit',
  templateUrl: './devices-new-edit.component.html',
  styleUrls: ['../../app.component.css']
})
export class DevicesNewEditComponent implements OnInit{

  sharedLat: any = '';
  sharedLon: any = '';
  cont= 0;
  date: any;
  state= 0; // 0 new // 1 duplicate // 2 edit //
  rute='';
  rute_2: any;

  @HostListener('window:resize', ['$event'])
    onResize(event: any) {
    window.resizeBy(-1, 0);
    this.resize();
  }

  constructor(private router: Router, private dataSharingService: DataSharingService,private rutaActiva: ActivatedRoute,private DevicesMapComponent: DevicesMapComponent) { 
    this.rute= this.router.routerState.snapshot.url;
    this.rute_2 = this.rute.split('/');
    this.createDate();
  }

  deleteDevice_device: string = 'http://localhost:5172/api/device_configurations';
  update_device: string = 'http://localhost:5172/api/device_configurations';
  id_device: string = 'http://localhost:5172/api/device_configurations/id';
  post_sensors_devices: string = 'http://localhost:5172/api/sensors_devices';
  post_device: string = 'http://localhost:5172/api/device_configurations';
  max_device: string = 'http://localhost:5172/api/device_configurations/max';
  get_structure_list: string = 'http://localhost:5172/api/data_structure/get_list';
  duplicate_device: string = 'http://localhost:5172/api/device_configurations/duplicate';
  get_sensors_list: string = 'http://localhost:5172/api/sensors_types/get_list';

  id= parseInt(this.rutaActiva.snapshot.params['id']);

  show_large= true;
  view_can= -1;
  delete_it: any;
  /* */
  lon: any;
  lat: any;
  cota: any;
  timezone: any;
  view_can_2= false;
  leng_name= environment.lenguaje_name;
  leng_lang= environment.lenguaje_lang;
  active_lang = environment.lenguaje_lang[0];
  show_map=true;
  show_form= true;
  view_rec= false;
  saved= false;
  act_ok= false;
  act_not= false;
  changed= false;
  data: any;
  id_max= 2;
  width= 0;

  devices = {    
    id: '',    
    uid: '',    
    alias: '', 
    origin: '',
    description_origin: '',
    application_id: '',
    topic_name: '',
    typemeter: '',
    lat: this.sharedLat,
    lon: this.sharedLon,
    cota: 10,
    timezone: 'Brussels, Copenhagen, Madrid, Paris',
    organizationid: '',
    enable: 0,
    createdAt: '',
    updatedAt: '',
    id_data_estructure: 1,
    structure_name: '',
    variable_configuration: 0,
    sensors: [{
      id: 1, 
      enable: 0, 
      id_device: 0,
      id_type_sensor: 0,
      datafield: '',
      nodata: true,
      orden: 1,
      type_name: '',
      correction_specific: '',
      correction_time_specific: '',
      position: 0,
    }],
  }

  select_sensors = {
    sensors : [
      {
        id: 1, 
        type: '',    
        position: 0,
      }]
  }

  structures = {
    structure : [{
        id_estructure: 1, 
      description: '',
      configuration: ''
      }]
  }

  ngOnInit(): void { // Inicializador
    this.rute= this.router.routerState.snapshot.url;
    this.rute_2 = this.rute.split('/');
    this.getstructures(0);

    fetch(`${this.get_sensors_list}`)
    .then((response) => response.json())
    .then(data => {
      this.select_sensors.sensors= data;
    })

    if(this.rute_2[2]=='edit'){
        this.show_large= false;
        this.getDevices()

        this.dataSharingService.sharedLat$.subscribe(data => {
          this.devices.lat = data;
        });
        this.dataSharingService.sharedLon$.subscribe(data => {
          this.devices.lon = data;
        });
        this.updatesharedLat();
        this.updatesharedLon();
    }
    //    
    if(this.rute_2[2]=='new'){
      fetch(this.max_device)
      .then(response => response.json())
      .then(data => {
        this.id_max= parseInt(data.id);  
        if(this.id<this.id_max){
          this.state= 1;
        }
        if(this.id>=this.id_max){
          this.state= 0;
        }

        if(this.state==1){ // Duplicate
          fetch(`${this.id_device}/${this.id}`)
          .then(response => response.json())
          .then(data => {
            console.log(data)
            this.devices= data[0];
            this.lat= this.devices.lat;
            this.lon= this.devices.lon;
            this.cota= this.devices.cota;
            this.timezone= this.devices.timezone;

            this.createDate();
            this.devices.createdAt= this.formatDateTime(this.date);
          })
          .catch(error => {
            console.error(error); 
          }); 
          this.changed= true;
          //
          setTimeout(() => {
            fetch(`${this.duplicate_device}/${this.devices.uid}`)
            .then((response) => {
              if (!response.ok) {
                throw new Error('Error de la red');
              }
              return response.text();
            })
            .then((data) => {
              this.devices.uid= data;
            })
            .catch((error) => {
              console.error('Error al verificar la descripción duplicada:', error);
            });
          }, 100);
        }
        if(this.state==0){
          this.devices.lat= 0;
          this.devices.lon= 0;
          this.dataSharingService.updatesharedLon(0);
          this.dataSharingService.updatesharedLat(0);
        }
      })
      this.getShared()
      this.createDate();
    }
    this.onResize(0);
    this.show_large= false;
  }

  getDevices(){ // Obtener Dispositivos
    fetch(`${this.id_device}/${this.id}`)
    .then(response => response.json())
    .then(data => {
      console.log(data)
      this.devices= data[0];
      this.createDate();
      this.devices.createdAt= this.formatDateTime(data[0].createdAt);
      this.devices.updatedAt= this.formatDateTime(data[0].updatedAt);
      this.getstructures(data[0].variable_configuration);
      if(data[0].id_data_estructure==undefined || data[0].id_data_estructure==null){
        this.devices.id_data_estructure= 1;
      }
      if(data[0].variable_configuration==undefined || data[0].variable_configuration==null){
        this.devices.variable_configuration= 0;
      }
    })
    .catch(error => {
      console.error(error); 
    });
  }

  editDevices(form: any) { // Guardar Dispositivo
    this.getShared()
    this.createDate();
    this.devices.updatedAt= this.date;
    if (form.valid) {
      if(this.devices.sensors.length==0){
        let sensors_aux =  [{
          id: -1, 
          enable: 0, 
          id_device: this.id,
          id_type_sensor: 0,
          datafield: '',
          nodata: true,
          orden: 1,
          type_name: '',
          correction_specific: '',
          correction_time_specific: '',
          position: 0,
        }]
        this.devices.sensors= [];
        this.devices.sensors= sensors_aux;
      }
      fetch(this.update_device, {
        method: "PUT",body: JSON.stringify(this.devices),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => response.json()) 
      this.act_ok= true;

      setTimeout(() => {
        this.act_ok= false;
      }, 2000);

      this.saved= true;
    }
    this.editSensor();
    this.changed= false;
    this.devices.updatedAt= this.formatDateTime(this.date);
  }

  editSensor() { // Guardar nuevos sensores de los dispositivos
    this.post();
    this.changed= false;
    return;
  }

  newSensor() { // Guardar nuevos sensores de los dispositivos
    if(this.state==0){
      this.post();
      this.changed= false;
      setTimeout(() => {
        this.router.navigate([`/devices/edit/${this.id}`]);
      }, 100);
    }
    if(this.state==1){
      this.devices.sensors.forEach((sensor: { id_device: number; }) => {
        sensor.id_device = this.id_max;
      });
      this.devices.createdAt= this.data;
      this.post();
      this.changed= false;
      setTimeout(() => {
        this.router.navigate([`/devices/edit/${this.id_max}`]);
      }, 100);
    }
    return;
  }

  post(){ // Consulta de nuevo dispositivo

    if(this.devices.sensors.length==0){
      let sensors_aux = {
        sensors : [{
            id: -1, 
            enable: 0, 
            id_device: this.id,
            id_type_sensor: 0,
            datafield: '',
            nodata: true,
            orden: 0,
            type_name: 0,
          }]
      }
      
      //console.log(this.sensors)
      /*fetch(this.post_sensors_devices, {
        method: "POST",body: JSON.stringify(sensors_aux),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => response.json()) */
    }
    else{
      /*setTimeout(() => {
        //console.log(this.sensors)
        fetch(this.post_sensors_devices, {
          method: "POST",body: JSON.stringify(this.sensors),headers: {"Content-type": "application/json; charset=UTF-8"}
        })    
        .then(response => response.json()) 
      }, 100);*/
    }
  }

  newDevice(form: any) { // Guardar Dispositivos
    this.createDate();
    this.devices.createdAt= this.date;
    this.devices.updatedAt= this.date;
    this.getShared()

    if (form.valid) {
      if(this.devices.sensors.length==0){
        let sensors_aux =  [{
          id: -1, 
          enable: 0, 
          id_device: this.id,
          id_type_sensor: 0,
          datafield: '',
          nodata: true,
          orden: 1,
          type_name: '',
          correction_specific: '',
          correction_time_specific: '',
          position: 0,
        }]
        this.devices.sensors= [];
        this.devices.sensors= sensors_aux;
      }
      fetch(this.post_device, {
        method: "POST",body: JSON.stringify(this.devices),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => response.json()) 
      this.newSensor();
    }
  }

  getShared(){ // Aux recupera datos compartidos
    this.dataSharingService.sharedLat$.subscribe(data => {
      this.devices.lat = data;
    });
    this.dataSharingService.sharedLon$.subscribe(data => {
      this.devices.lon = data;
    });
  }

  deleteDevice(id_actual: any){ // Eliminar Dispositivo
    var devices = {
      id: id_actual,    
    }
    fetch(this.deleteDevice_device, {
      method: "DELETE",body: JSON.stringify(devices),headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => response.json()) 

    setTimeout(() => {
      this.router.navigate(['/devices']);
    }, 100);
  }

  updatesharedLat() { // Actualizar Latitud
    setTimeout(() => {
      this.dataSharingService.updatesharedLat(this.devices.lat);
    }, 100);
  }
  updatesharedLon() { // Actualizar Longitud
    setTimeout(() => {
      this.dataSharingService.updatesharedLon(this.devices.lon);
    }, 100);
  }

  recharge_map(){ // Recargar mapa
    fetch(`${this.id_device}/${this.id}`)
    .then(response => response.json())
    .then(data => {
      this.devices.lat= data[0].lat;
      this.devices.lon= data[0].lon;
      this.devices.cota= data[0].cota;
      this.devices.timezone= data[0].timezone;
      this.updatesharedLat();
      this.updatesharedLon();
    })
    .catch(error => {
      console.error(error); 
    }); 
    this.changed= false;
  }

  recharge(){ // Recargar campos a sus valores originales
    this.ngOnInit()
    this.changed= false;
    this.cont++;
  }

  showForm(){ // Expandir formulario
    this.show_form=true;
    if(this.rute_2[2]=='edit'){
      this.onResize(0);
    }  
  }

  hideForm(){ // Contrarer formulario
    this.show_form=false;
    if(this.rute_2[2]=='edit'){
      this.onResize(0);
    }
  }

  showMap(){ // Expandir mapa
    this.show_large= true;
    this.show_map=false;
  }

  hideMap(){ // Contrarer mapa
    this.show_map=true;
    this.show_large= false;
  }

  readStorage() { // Recupera datos de local storage
    this.active_lang = localStorage.getItem('active_lang') ?? 'es';
  }

  getStructureaux(event: any){
    this.getstructures(event.target.checked ? 1 : 0);
    let num= event.target.checked ? 1 : 0;
    this.devices.variable_configuration= num;
    this.devices.id_data_estructure= 1;
  }

  getstructures(num: any){ // optener estructuras de datos
    fetch(`${this.get_structure_list}`)
      .then((response) => response.json())
      .then(quotesData => {
        if(num==1){
          this.structures.structure = quotesData.variable_data_structure;
        }     
        else{
          this.structures.structure = quotesData.data_estructure;
        }   
      });   
  }

  deleteMarker(){ // eliminar elementos del mapa
    this.devices.lat= null;
    this.devices.lon= null;
    this.devices.cota= 10;
    this.devices.timezone= 'Brussels, Copenhagen, Madrid, Paris';
    this.updatesharedLat();
    this.updatesharedLon();
  }

  createDate(){ // Genera fecha
    this.date= this.formatDateTime(new Date());
  }

  resize(): void{ // Redimensionar pantalla
    this.width = window.innerWidth;
  }

  formatDateTime(date2: any) { // Formato fecha
    let dat='';
    const date = new Date(date2)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    dat= `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    if(isNaN(date.getFullYear())){
      dat= '';
    }
    return dat;
  }

  /* */

  getOrden(num: any, num2: any){ // Asocia un order al sensor segun su type
    let cosita: any;
    cosita= this.select_sensors.sensors.find((objeto: { id: any; }) => objeto.id == num2);
    if(cosita!=undefined){
      this.devices.sensors[num].orden= cosita.position;
    }
  }

  addSensor(){ // Añadir a lista compartida
    let sensors_aux = {
      id: this.devices.sensors.length, 
      enable: 0, 
      id_device: this.id,
      id_type_sensor: this.select_sensors.sensors[0].id,
      datafield: '',
      nodata: true,
      orden: 1,
      type_name: '',
      correction_specific: '',
      correction_time_specific: '',
      position: 0,
    }
    this.devices.sensors.push(sensors_aux);
    this.show_map= true;
    this.changed= true;
  }

  deleteSensor(id: any){ // Añadir a lista compartida
    this.delete_it= id;
    this.devices.sensors= this.devices.sensors.filter((item) => item.id != this.delete_it)
    this.changed= true;
  }
}
