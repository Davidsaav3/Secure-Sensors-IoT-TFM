import { Component , OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DataSharingService } from '../../../services/data_sharing.service';
import { DevicesMapComponent } from '../devices-map/devices-map.component';

@Component({
  selector: 'app-devices-new-edit',
  templateUrl: './devices-new-edit.component.html',
  styleUrls: ['../../../app.component.css']
})
export class DevicesNewEditComponent implements OnInit{

  sharedLat: any = '';
  sharedLon: any = '';
  date= '';
  state= 0; //0 new //1 duplicate // 2 edit
  rute='';
  rute2: any;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    window.resizeBy(-1, 0);
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
  id= parseInt(this.rutaActiva.snapshot.params['id']);

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
    timezone: '+01:00',
    organizationid: '',
    enable: 0,
    createdAt: '',
    updatedAt: '',
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
      }]
  }


  ngOnInit(): void { // Inicializador
    this.rute= this.router.routerState.snapshot.url;
    this.rute2 = this.rute.split('/');
    
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
            fetch(`${this.get_device}/Buscar/uid/-1/2/1/100000/ASC/0/0/0/0/2`)
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
  this.dataSharingService.sharedLat$.subscribe(data => {
    this.devices.lat = data;
  });
  this.dataSharingService.sharedLon$.subscribe(data => {
    this.devices.lon = data;
  });
  this.dataSharingService.sharedList$.subscribe(data => {
    this.sensors.sensors= data;
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
    console.log(devices.id)
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
  }

  showForm(){ // Expandir formulario
    this.show_form=true;
    this.dataSharingService.updatesharedAmp(true);
    if(this.rute2[2]=='edit'){
      this.onResize(0);
    }  }
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
  
  /*
  showMap(){ // Ampliar mapa
    this.show_map=true;
    this.DevicesMapComponent.showMap();
  }
  hideMap(){ // Desamplair mapa
    this.show_map=false;
    this.DevicesMapComponent.showMap();
  }
  showForm(){ // Ampliar formulario
    this.dataSharingService.updatesharedAmp(true);
    this.show_form=false;
  }
  hideForm(){ // Desamplair formulario
    this.show_form=true;
    this.dataSharingService.updatesharedAmp(false);
  }
  */

  getShsareSensors(){  // Obtener sensores de otro componente
    this.dataSharingService.sharedList$.subscribe(data => {
      this.sensors.sensors= data;
    });
  }

  createDate(){ // Genera fecha
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    this.date= `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
