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
  ruteAux: any;

  @HostListener('window:resize', ['$event'])
    onResize(event: any) {
    window.resizeBy(-1, 0);
    this.resize();
  }

  constructor(private router: Router, private dataSharingService: DataSharingService,private rutaActiva: ActivatedRoute,private DevicesMapComponent: DevicesMapComponent) { 
    this.rute= this.router.routerState.snapshot.url;
    this.ruteAux = this.rute.split('/');
    this.createDate();
    //console.log(this.ruteAux[2])
    if(this.ruteAux[2]=='new'){
    fetch(`${this.get_structure_list}`)
      .then((response) => response.json())
      .then(quotesData => {
        this.structures.structure = quotesData.data_estructure;
        this.auxFixed= quotesData.data_estructure[0].id_estructure;
        this.devices.id_data_estructure= this.auxFixed;
        //console.log(this.auxFixed)
      });  
    }
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

  alt1=true;
  alt2=true;
  alt3=true;
  alt4=true;
  alt5=true;
  alt6=true;

  mark= 'position';
  showLarge= true;
  deleteId: any;
  auxFixed= 0;
  auxVariable= 0;
  exp= false;
  lon: any;
  lat: any;
  cota: any;
  timezone: any;
  aux1= false;
  aux2= -1;
  activeLang = environment.languageLang[0];
  show_map=true;
  show_form= true;
  viewRec= false;
  saved= false;
  actOk= false;
  actNot= false;
  changed= false;
  data: any;
  idMax= 2;
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
    cota: 0,
    timezone: 'Brussels, Copenhagen, Madrid, Paris',
    organizationid: '',
    enable: 0,
    createdAt: '',
    updatedAt: '',
    id_data_estructure: this.auxFixed,
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
      topic_specific: '', 
      position: 0,
    }],
  }

  selectSensors = {
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
    this.devices.sensors= [];
    this.rute= this.router.routerState.snapshot.url;
    this.ruteAux = this.rute.split('/');
    this.getStructure(0);
    
    fetch(`${this.get_sensors_list}`)
    .then((response) => response.json())
    .then(data => {
      this.selectSensors.sensors= data;
    })

    if(this.ruteAux[2]=='edit'){
        this.showLarge= false;
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
    if(this.ruteAux[2]=='new'){
      fetch(this.max_device)
      .then(response => response.json())
      .then(data => {
        this.idMax= parseInt(data.id);  
        if(this.id<this.idMax){
          this.state= 1;
        }
        if(this.id>=this.idMax){
          this.state= 0;
        }

        if(this.state==1){ // 1. Duplicate
          fetch(`${this.id_device}/${this.id}`)
          .then(response => response.json())
          .then(data => {
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
        if(this.state==0){ // 0. New
          this.devices.lat= 0;
          this.devices.lon= 0;
          this.dataSharingService.updatesharedLon(0);
          this.dataSharingService.updatesharedLat(0);
        }
      })
      this.getShared()
      this.createDate();
    }
    setInterval(() => {
      this.dataSharingService.sharedAct$.subscribe(data => {
        if(data!=false){
          this.changed= data;
        }
      });
      this.readStorage();
    }, 10);
    this.onResize(0);
    this.showLarge= false;
  }

  getDevices(){ // Obtener Dispositivos
    fetch(`${this.id_device}/${this.id}`)
    .then(response => response.json())
    .then(data => {
      this.devices= data[0];
      this.createDate();
      this.devices.createdAt= this.formatDateTime(data[0].createdAt);
      this.devices.updatedAt= this.formatDateTime(data[0].updatedAt);
      this.getStructure(data[0].variable_configuration);
      if(data[0].id_data_estructure==undefined || data[0].id_data_estructure==null){
        this.devices.id_data_estructure= this.auxFixed;
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
          topic_specific: '',
          position: 0,
        }]
        this.devices.sensors= sensors_aux;
        fetch(this.post_device, {
          method: "PUT",body: JSON.stringify(this.devices),headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
        this.devices.sensors= [];
      }
      else{
        fetch(this.post_device, {
          method: "PUT",body: JSON.stringify(this.devices),headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
      }
      this.actOk= true;

      setTimeout(() => {
        this.actOk= false;
      }, 2000);

      this.saved= true;
    }
    this.changed= false;
    this.devices.updatedAt= this.formatDateTime(this.date);
  }

  newSensors() { // Guardar nuevos sensores de los dispositivos
    if(this.state==0){
      this.changed= false;
      setTimeout(() => {
        this.router.navigate([`/devices/edit/${this.id}`]);
      }, 100);
    }
    if(this.state==1){
      this.devices.sensors.forEach((sensor: { id_device: number; }) => {
        sensor.id_device = this.idMax;
      });
      this.devices.createdAt= this.date;
      this.changed= false;
      setTimeout(() => {
        this.router.navigate([`/devices/edit/${this.idMax}`]);
      }, 100);
    }
    return;
  }

  newDevice(form: any) { // Guardar Dispositivos
    this.createDate();
    this.devices.createdAt= this.date;
    this.devices.updatedAt= this.date;
    this.getShared()
    //console.log(this.devices)

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
          topic_specific: '',
          position: 0,
        }]
        this.devices.sensors= sensors_aux;
        fetch(this.post_device, {
          method: "POST",body: JSON.stringify(this.devices),headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
        this.devices.sensors= [];
      }
      else{
        fetch(this.post_device, {
          method: "POST",body: JSON.stringify(this.devices),headers: {"Content-type": "application/json; charset=UTF-8"}
        })
        .then(response => response.json()) 
      }
      this.newSensors();
    }
  }

  getShared(){ // Recupera datos compartidos
    this.dataSharingService.sharedLat$.subscribe(data => {
      this.devices.lat = data;
    });
    this.dataSharingService.sharedLon$.subscribe(data => {
      this.devices.lon = data;
    });
    this.dataSharingService.updatesharedAct(false);
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

  rechargeMap(){ // Recargar mapa
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
    this.dataSharingService.updatesharedAct(false);
    this.cont++;
  }

  showForm(){ // Expandir formulario
    this.show_form=true;
    if(this.ruteAux[2]=='edit'){
      this.onResize(0);
    }  
  }

  hideForm(){ // Contrarer formulario
    this.show_form=false;
    if(this.ruteAux[2]=='edit'){
      this.onResize(0);
    }
  }

  showMap(){ // Expandir mapa
    this.showLarge= true;
    this.show_map=false;
  }

  hideMap(){ // Contrarer mapa
    this.show_map=true;
    this.showLarge= false;
  }

  readStorage() { // Recupera datos de local storage
    this.activeLang = localStorage.getItem('activeLang') ?? 'es';
  }

  getStructureList(event: any){ 
    let num= event.target.checked ? 1 : 0;
    //console.log(num)
    this.getStructure(num);
    setTimeout(() => {
      this.devices.variable_configuration= num;
      if(num==0){
        this.devices.id_data_estructure= this.auxFixed;
      }
      if(num==1){
        this.devices.id_data_estructure= this.auxVariable;
      }
    }, 1);
  }

  getStructure(num: any){ // optener estructuras de datos
    fetch(`${this.get_structure_list}`)
      .then((response) => response.json())
      .then(quotesData => {
        if(num==1){
          this.structures.structure = quotesData.variable_data_structure;
        }     
        else{
          this.structures.structure = quotesData.data_estructure;
        }   
        this.auxVariable= quotesData.variable_data_structure[0].id_estructure;
        this.auxFixed= quotesData.data_estructure[0].id_estructure;
      });   
  }

  deleteMarker(){ // eliminar chinchetas del mapa
    this.devices.lat= null;
    this.devices.lon= null;
    this.devices.cota= 0;
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

  getOrder(num: any, num2: any){ // Asocia un order al sensor segun su type
    let cosita: any;
    cosita= this.selectSensors.sensors.find((objeto: { id: any; }) => objeto.id == num2);
    if(cosita!=undefined){
      this.devices.sensors[num].orden= cosita.position;
    }
  }

  addSensor(){ // Añadir a lista compartida
    let sensors_aux = {
      id: this.devices.sensors.length, 
      enable: 0, 
      id_device: this.id,
      id_type_sensor: this.selectSensors.sensors[0].id,
      datafield: '',
      nodata: true,
      orden: 1,
      type_name: '',
      correction_specific: '',
      correction_time_specific: '',
      topic_specific: '',
      position: 0,
    }
    this.devices.sensors.push(sensors_aux);
    this.show_map= true;
    this.changed= true;
  }

  deleteSensor(id: any){ // Añadir a lista compartida
    this.deleteId= id;
    this.devices.sensors= this.devices.sensors.filter((item) => item.id != this.deleteId)
    this.changed= true;
  }

  getSensorsLocal(id: any,ord: any){ // Ordenar columnas
    this.mark= id;

    if (ord == 'ASC') {
      if (id == 'position') {
        this.devices.sensors.sort((a: any, b: any) => Number(a.position) - Number(b.position));
      }
      if (id == 'datafield') {
        this.devices.sensors.sort((a: any, b: any) => a.datafield.localeCompare(b.datafield));
      }
      if (id == 'nodata') {
        this.devices.sensors.sort((a: any, b: any) => a.nodata.localeCompare(b.nodata));
      }
      if (id == 'correction_specific') {
        this.devices.sensors.sort((a: any, b: any) => a.correction_specific.localeCompare(b.correction_specific));
      }
      if (id == 'correction_time_specific') {
        this.devices.sensors.sort((a: any, b: any) => a.correction_time_specific.localeCompare(b.correction_time_specific));
      }
      if (id == 'topic_specific') {
        this.devices.sensors.sort((a: any, b: any) => a.topic_specific.localeCompare(b.topic_specific));
      }
    }
    if (ord == 'DESC') {
      if (id == 'position') {
        this.devices.sensors.sort((a: any, b: any) => Number(b.position) - Number(a.position));
      }
      if (id == 'datafield') {
        this.devices.sensors.sort((a: any, b: any) => b.datafield.localeCompare(a.datafield));
      }
      if (id == 'nodata') {
        this.devices.sensors.sort((a: any, b: any) => b.nodata.localeCompare(a.nodata));
      }
      if (id == 'correction_specific') {
        this.devices.sensors.sort((a: any, b: any) => b.correction_specific.localeCompare(a.correction_specific));
      }
      if (id == 'correction_time_specific') {
        this.devices.sensors.sort((a: any, b: any) => b.correction_time_specific.localeCompare(a.correction_time_specific));
      }
      if (id == 'topic_specific') {
        this.devices.sensors.sort((a: any, b: any) => b.topic_specific.localeCompare(a.topic_specific));
      }
    }
    //console.log(this.devices.sensors)
  }
}
