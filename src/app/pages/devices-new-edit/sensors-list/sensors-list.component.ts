import { Component, OnInit} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Injectable } from '@angular/core';
import { DataSharingService } from '../../../services/data_sharing.service';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-sensors-list',
  templateUrl: './sensors-list.component.html',
  styleUrls: ['../../../app.component.css']
})

export class SensorsListComponent  implements OnInit{

  constructor(private rutaActiva: ActivatedRoute,private dataSharingService: DataSharingService) { }
  get_sensors: string = 'http://localhost:5172/api/get/sensors_types';
  id_device_sensors_devices: string = 'http://localhost:5172/api/id_device/sensors_devices';
  id_sensors: string = 'http://localhost:5172/api/id/sensors_types';
  id= parseInt(this.rutaActiva.snapshot.params['id']);

  view_can= 1;
  activeLang='en';
  search_1='orden';
  search_2='id';
  show_map= true;
  delete_it: any;
  show_large= true;
  duplicate= false;

  select_sensors = {
    sensors : [
      {
        id: 1, 
        type: '',    
        metric: '', 
        description: '',
        errorvalue: 1,
        valuemax: 1,
        valuemin: 1,
        position: 0,
        correction_specific: '',
        correction_time_specific: '',
      }]
  }

  sensors = {
    sensors : [
      {
        id: 1, 
        enable: 0, 
        id_device: this.id,
        id_type_sensor: 1,
        datafield: '',
        nodata: true,
        orden: 1,
        type_name: 1,
        correction_specific: '',
        correction_time_specific: '',
      }]
  }

  ngOnInit(): void { // Inicialización
    setTimeout(() =>{this.getDevices('id')}, 50);
    setInterval(() => {
      this.dataSharingService.sharedAmp$.subscribe(data => {
        this.show_large= data;
      });
    }, 10);
  }

  getOrden(num: any){ // Asocia un order al sensor segun su type
    setTimeout(() =>{
      fetch(`${this.id_sensors}/${this.sensors.sensors[num].id_type_sensor}`)
      .then(response => response.json())
      .then(data => {
        this.sensors.sensors[num].orden= data[0].position;
      })
    }, 10);
    this.updatesharedList();
  }

  getDevices(id: any){ // Obtener datos del dispositivo
    if(id!='id'){
      this.search_1= id;
    }
    fetch(`${this.id_device_sensors_devices}/${this.id}/${this.search_1}`)
    .then(response => response.json())
    .then(data => {
      this.sensors.sensors= data;
    })
    .catch(error => {
      console.error(error); 
    });
    let search_1= 'Buscar';
    let order= 'ASC';
    fetch(`${this.get_sensors}/${search_1}/${this.search_2}/${order}`)
    .then((response) => response.json())
    .then(data => {
      this.select_sensors.sensors= data;
    })
  }

  addSensor(){ // Añadir a lista compartida
    let sensors_aux = {
      id: this.sensors.sensors.length, 
      enable: 0, 
      id_device: this.id,
      id_type_sensor: 1,
      datafield: '',
      nodata: true,
      orden: 1,
      type_name: 1,
      correction_specific: '',
      correction_time_specific: '',
    }
    this.sensors.sensors.push(sensors_aux);
    this.show_map= true;
    this.updatesharedList();
  }

  deleteSensor(){ // Elimina sensor de la lista
    this.sensors.sensors= this.sensors.sensors.filter((item) => item == this.delete_it)
    this.updatesharedAct();
  }

  addShareSensor(id: any){ // Añadir a lista compartida
    this.delete_it= id;
    this.sensors.sensors= this.sensors.sensors.filter((item) => item.id != this.delete_it)
    this.updatesharedList();
  }
  updatesharedList() { // Enviar sensores a device-edit
    //console.log(this.sensors.sensors)
    this.dataSharingService.updatesharedList(this.sensors.sensors);
    this.updatesharedAct();
  }
  updatesharedAct() { // Enviar 
    this.dataSharingService.updatesharedAct(true);
  }

}
