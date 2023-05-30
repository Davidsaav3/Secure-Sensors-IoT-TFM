import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-devices-list',
  templateUrl: './devices-list.component.html',
  styleUrls: ['../../../app.component.css']
})
export class DevicesListComponent implements OnInit{
  title = 'HTTP using native fetch API';
  private url: string = 'http://localhost:5172/api/get/device_configurations';
  data: any;
  private url2: string = 'http://localhost:5172/api/id_device/sensors_devices/1';
  mostrar=true;
  private url3: string = 'http://localhost:5172/api/duplicate/device_configurations';
  data3: any;
  apiUrl: string = 'http://localhost:5172/api/id_device/sensors_devices';

  timeout: any = null;
  dup_ok=false;
  dup_not=false;
  buscar='Buscar';

  busqueda = {
    value: '', 
  }

  contenido = {
    sensors : [
      {
        id: '',    
        enable: '', 
        id_device: '',
        id_type_sensor: '',
        datafield: '',
        nodata: '',
        orden: '',
        type_name: '',
        sensor : [
          {
            id: '1',    
            enable: 1, 
            type_name: '',
          },
        ]
      }]
  }

  data2 = {
    sensors : [
      {
        id: '1',    
        enable: 1, 
        type_name: '',
      },
    ]
  }

  update = {
    id_device: '1'
  };

  contenido3 = {
    id: 1,    
  }

  duplicate(){
    fetch(this.url3, {
      method: "POST",
      body: JSON.stringify(this.contenido3),
      headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => response.json()) 
    this.dup_ok=true;
  }

  obtener(id_actual: any){
    const url2 = `${this.apiUrl}/${id_actual}`;
    fetch(url2)
    .then(response => response.json())
    .then(data3 => {
      this.contenido.sensors[id_actual].sensor.push(data3);
    })
    .catch(error => {
      console.error(error); 
    });

  }

  onKeySearch(event: any) {
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout(function () {
      if (event.keyCode != 13) {
        $this.get();
      }
    }, 500);
  }

  ngOnInit(): void {
    this.get();
    this.get();
  }

  borrar(){
    this.busqueda.value= '';
  }

  get(){
    if(this.busqueda.value==''){
      this.buscar= 'Buscar';
    }
    else{
      this.buscar= this.busqueda.value;
    }
    const url2 = `${this.url}/${this.buscar}`;
    console.log(url2)
    fetch(url2)
    .then((response) => response.json())
    .then(data => {
      this.data= data;
      for (let x of this.data) {
          const url1 = `${this.apiUrl}/${x.id}`;
          fetch(url1)
          .then(response => response.json())
          .then(data3 => {
            x.sensor= data3;
          
          })
          .catch(error => {
            console.error(error); 
          });     
      }
    })
    
  }
}