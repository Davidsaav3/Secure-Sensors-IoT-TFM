import { Component , OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DataSharingService } from '../../services/data_sharing.service';
import { DevicesMapComponent } from './devices-map/devices-map.component';

@Component({
  selector: 'app-devices-new-edit',
  templateUrl: './devices-new-edit.component.html',
  styleUrls: ['../../app.component.css']
})
export class DevicesNewEditComponent implements OnInit{

  sharedLat: any = '';
  sharedLon: any = '';
  date: any;
  state= 0; //0 new //1 duplicate // 2 edit
  rute='';
  rute2: any;

  @HostListener('window:resize', ['$event'])
    onResize(event: any) {
    window.resizeBy(-1, 0);
    this.resize();
  }

  constructor(private router: Router, private dataSharingService: DataSharingService,private rutaActiva: ActivatedRoute,private DevicesMapComponent: DevicesMapComponent) { 
    this.rute= this.router.routerState.snapshot.url;
    this.rute2 = this.rute.split('/');
    this.createDate();
  }

  deleteDevice_device: string = 'http://localhost:5172/api/delete/device_configurations';
  update_device: string = 'http://localhost:5172/api/update/device_configurations';
  id_device: string = 'http://localhost:5172/api/id/device_configurations';
  deleteDevice_all_sensors_devices: string = 'http://localhost:5172/api/delete_all/sensors_devices';
  post_sensors_devices: string = 'http://localhost:5172/api/post/sensors_devices';
  post_device: string = 'http://localhost:5172/api/post/device_configurations';
  delete_all_sensors_devices: string = 'http://localhost:5172/api/delete_all/sensors_devices';
  max_device: string = 'http://localhost:5172/api/max/device_configurations';
  get_device: string = 'http://localhost:5172/api/get/device_configurations';
  get_estructure: string = 'http://localhost:5172/api/get/data_estructure/Buscar/id_estructure/ASC';

  id= parseInt(this.rutaActiva.snapshot.params['id']);

  view_can= false;
  activeLang='en';
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
    estructure_name: ''
  }

  sensors = {
    sensors : [{
        id: 1, 
        enable: 0, 
        id_device: this.id,
        id_type_sensor: 1,
        datafield: '',
        nodata: true,
        orden: 1,
        type_name: 1,
      }]
  }

  estructures = {
    estructure : [{
        id_estructure: 1, 
       description: '',
       configuration: ''
      }]
  }

  select_sensors = { // [NEW]
    sensors : [
      {
        id: -1, 
        name: 'Todos los Sensores',    
        metric: '', 
        description: '',
        errorvalue: 1,
        valuemax: 1,
        valuemin: 1,
        position: 0,
        correction_general: null,
        correction_time_general: null,
      }]
  }

  resize(): void{ // Redimensionar pantalla
    this.width = window.innerWidth;
  }

  ngOnInit(): void { // Inicializador
    this.rute= this.router.routerState.snapshot.url;
    this.rute2 = this.rute.split('/');
    this.getEstructures();

    if(this.rute2[2]=='edit'){
        this.dataSharingService.updatesharedAmp(false);
        this.getDevices()
        this.getShsareSensors();

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
    if(this.rute2[2]=='new'){
        fetch(this.max_device)
        .then(response => response.json())
        .then(data => {
          this.id_max= parseInt(data[0].id)+1;    
          if(this.id<this.id_max){
            this.state= 1;
          }
          if(this.id>=this.id_max){
            this.state= 0;
          }
    
          if(this.state==1){
            fetch(`${this.id_device}/${this.id}`)
            .then(response => response.json())
            .then(data => {
              this.devices= data[0];
            })
            .catch(error => {
              console.error(error); 
            }); 
            this.changed= true;
            //
            fetch(`${this.get_device}/1/Buscar/uid/ASC/-1/2/2/1/100000/0/0/0/0`)
            .then((response) => response.json())
            .then(data => {
              let contador = 1;
              let nombresExistentes = new Set();
              for (let index = 0; index < data.length; index++) {
                nombresExistentes.add(data[index].uid);
              }
        
              let uid_2= this.devices['uid'];
              while(nombresExistentes.has(uid_2)) {
                uid_2 = `${this.devices['uid']}_${contador}`;
                contador++;
              }
              this.devices.uid= uid_2;
            })
          }
        })
        this.dataSharingService.updatesharedAmp(false);
        this.dataSharingService.sharedLat$.subscribe(data => {
          this.devices.lat = data;
        });
        this.dataSharingService.sharedLon$.subscribe(data => {
          this.devices.lon = data;
        });
        this.dataSharingService.sharedList$.subscribe(data => {
          this.sensors.sensors= data;
        });
        this.createDate();
    }
    setInterval(() => {
      this.dataSharingService.sharedAct$.subscribe(data => {
        if(data!=false){
          this.changed= data;
        }
      });
    }, 500);
    this.onResize(0);
    this.dataSharingService.updatesharedAmp(false);  
  }

  getDevices(){ // Obtener Dispositivos
    fetch(`${this.id_device}/${this.id}`)
    .then(response => response.json())
    .then(data => {
      this.devices= data[0];
    })
    .catch(error => {
      console.error(error); 
    });
  }

  editDevices(form: any) { // Guardar Dispositivo
    this.dataSharingService.sharedLat$.subscribe(data => {
      this.devices.lat = data;
    });
    this.dataSharingService.sharedLon$.subscribe(data => {
      this.devices.lon = data;
    });
    this.dataSharingService.sharedList$.subscribe(data => {
      this.sensors.sensors= data;
      //console.log(this.sensors.sensors)
    });
    
    this.devices.updatedAt= this.date;
    this.getShsareSensors();
    if (form.valid) {
      fetch(this.update_device, {
        method: "POST",body: JSON.stringify(this.devices),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => response.json()) 
      this.act_ok= true;
      this.saved= true;
    }
    this.editSensor();
  }

  editSensor() { // Guardar Sensores
    var devices4 = {
      id: this.id,   
    }

    fetch(this.deleteDevice_all_sensors_devices, {
      method: "POST",body: JSON.stringify(devices4),headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => response.json()) 
    for(let quote of this.sensors.sensors) {
      fetch(this.post_sensors_devices, {
        method: "POST",body: JSON.stringify(quote),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => response.json()) 
    }
    return;
  }

  newSensor() { // Guardar sensores
    var select_sensors = {
      id: this.id,   
    }
    if(this.state==0){
      fetch(this.delete_all_sensors_devices, {
        method: "POST",body: JSON.stringify(select_sensors),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => response.json()) 
    }

    if(this.state==0){
      for(let quote of this.sensors.sensors) {
        fetch(this.post_sensors_devices, {
          method: "POST",body: JSON.stringify(quote),headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
      }
    }
    if(this.state==1){
      for(let quote of this.sensors.sensors) {
        quote.id_device= this.id_max;
        fetch(this.post_sensors_devices, {
          method: "POST",body: JSON.stringify(quote),headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
      }
    }
    this.router.navigate(['/devices']);
    return;
}

newDevice(form: any) { // Guardar Dispositivos
  this.createDate();
  this.devices.createdAt= this.date;
  this.dataSharingService.sharedLat$.subscribe(data => {
    this.devices.lat = data;
  });
  this.dataSharingService.sharedLon$.subscribe(data => {
    this.devices.lon = data;
  });
  this.dataSharingService.sharedList$.subscribe(data => {
    this.sensors.sensors= data;
    //console.log(this.sensors.sensors)
  });
  
  if (form.valid) {
    fetch(this.post_device, {
      method: "POST",body: JSON.stringify(this.devices),headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => response.json()) 
  }
  this.newSensor();
}

  deleteDevice(id_actual: any){ // Eliminar Dispositivo
    var devices = {
      id: id_actual,    
    }
    //console.log(devices.id)
    fetch(this.deleteDevice_device, {
      method: "POST",body: JSON.stringify(devices),headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => response.json()) 
    this.router.navigate(['/devices']);
  }

  updatesharedLat() { // Actualizar Latitud
    this.dataSharingService.updatesharedLat(this.devices.lat);
  }
  updatesharedLon() { // Actualizar Longitud
    this.dataSharingService.updatesharedLon(this.devices.lon);
  }

  recharge(){ // Recargar
    this.ngOnInit()
    this.changed= false;
    this.dataSharingService.updatesharedAct(false);
  }

  showForm(){ // Expandir formulario
    this.show_form=true;
    this.dataSharingService.updatesharedAmp(true);
    if(this.rute2[2]=='edit'){
      this.onResize(0);
    }  
  }
  hideForm(){ // Contrarer formulario
    this.show_form=false;
    this.dataSharingService.updatesharedAmp(false);
    if(this.rute2[2]=='edit'){
      this.onResize(0);
    }
  }
  showMap(){ // Expandir mapa
    this.dataSharingService.updatesharedAmp(true);
    this.show_map=false;
  }
  hideMap(){ // Contrarer mapa
    this.show_map=true;
    this.dataSharingService.updatesharedAmp(false);
  }

  getShsareSensors(){  // Obtener sensores de otro componente
    this.dataSharingService.sharedList$.subscribe(data => {
      this.sensors.sensors= data;
    });
  }

  getEstructures(){
    fetch(`${this.get_estructure}`)
      .then((response) => response.json())
      .then(quotesData => {
        this.estructures.estructure = quotesData;
      });   
  }

  deleteMarker(){
    this.devices.lat= null;
    this.devices.lon= null;
    this.devices.cota= 10;
    this.devices.timezone= 'Brussels, Copenhagen, Madrid, Paris';
    this.updatesharedLat();
    this.updatesharedLon();
  }

  createDate(){ // Genera fecha
    const currentDate = new Date();
    this.date= currentDate.toISOString();
  }
}
