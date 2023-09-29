import { Component, OnInit, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import { DataSharingService } from "../../services/data_sharing.service";
import { DevicesMapComponent } from "./devices-map/devices-map.component";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-devices-new-edit",
  templateUrl: "./devices-new-edit.component.html",
  styleUrls: ["../../app.component.css"],
})

export class DevicesNewEditComponent implements OnInit {

  sharedLat: any = "";
  sharedLon: any = "";
  date: any;
  
  state = 0; // 0 new // 1 duplicate // 2 edit
  rute = "";
  ruteAux: any;
  cont = 0;

  @HostListener("window:resize", ["$event"])
  
  onResize() {
    window.resizeBy(-1, 0);
    this.resize();
  }

  constructor(private router: Router,private dataSharingService: DataSharingService,private rutaActiva: ActivatedRoute,) {
    this.rute = this.router.routerState.snapshot.url;
    this.ruteAux = this.rute.split("/");
    this.createDate();
    
    if (this.ruteAux[2] == "new") {
      fetch(`${this.getStructureList}`)
        .then((response) => response.json())
        .then((quotesData) => {
          this.structures.structure = quotesData.data_estructure;
          this.auxFixed = quotesData.data_estructure[0].id_estructure;
          this.devices.id_data_estructure = this.auxFixed;
        });
    }
  }

  idDevice: string = "http://localhost:5172/api/device_configurations/id";
  postDevice: string = "http://localhost:5172/api/device_configurations";
  maxDevice: string = "http://localhost:5172/api/device_configurations/max";
  getStructureList: string = "http://localhost:5172/api/data_structure/get_list";
  duplicateDevice: string = "http://localhost:5172/api/device_configurations/duplicate";
  getSensorsList: string = "http://localhost:5172/api/sensors_types/get_list";

  id = parseInt(this.rutaActiva.snapshot.params["id"]);

  alt1 = true;
  alt2 = true;
  alt3 = true;
  alt4 = true;
  alt5 = true;
  alt6 = true;

  activeLang = environment.languageLang[0];
  mark = "position1";
  exp = false;
  data: any;
  idMax = 2;
  width = 0;

  eraseAux = false;
  deleteAux = -1;
  actNot = false;
  changed = false;
  showLarge = true;
  deleteId: any;
  auxFixed = 0;
  auxVariable = 0;
  actOk = false;
  showMap = true;
  showForm = true;
  viewRec = false;
  saved = false;

  lon: any;
  lat: any;
  cota: any;
  timezone: any;

  devices = {
    id: "",
    uid: "",
    alias: "",
    origin: "",
    description_origin: "",
    application_id: "",
    topic_name: "",
    typemeter: "",
    lat: this.sharedLat,
    lon: this.sharedLon,
    cota: 0,
    timezone: "Brussels, Copenhagen, Madrid, Paris",
    organizationid: "",
    enable: 0,
    createdAt: "",
    updatedAt: "",
    id_data_estructure: this.auxFixed,
    structure_name: "",
    variable_configuration: 0,
    sensors: [
      {
        id: 1,
        enable: 0,
        id_device: 0,
        id_type_sensor: 0,
        datafield: "",
        nodata: true,
        orden: 1,
        type_name: "",
        correction_specific: "",
        correction_time_specific: "",
        topic_specific: "",
        position: 0,
      },
    ],
  };

  selectSensors = {
    sensors: [
      {
        id: 1,
        type: "",
        position: 0,
      },
    ],
  };

  structures = {
    structure: [
      {
        id_estructure: 1,
        description: "",
        configuration: "",
      },
    ],
  };

  ngOnInit(): void { // Inicializa
    this.devices.sensors = [];
    this.rute = this.router.routerState.snapshot.url;
    this.ruteAux = this.rute.split("/");
    this.getStructure(0);

    fetch(`${this.getSensorsList}`)
      .then((response) => response.json())
      .then((data) => {
        this.selectSensors.sensors = data;
      });

    if (this.ruteAux[2] == "edit") {
      this.showLarge = false;
      this.getDevices();

      setTimeout(() => {
        this.dataSharingService.sharedLat$.subscribe((data) => {
          this.devices.lat = data;
        });
        this.dataSharingService.sharedLon$.subscribe((data) => {
          this.devices.lon = data;
        });
      }, 1000);
      
    }
    //
    if (this.ruteAux[2] == "new") {
      fetch(this.maxDevice)
        .then((response) => response.json())
        .then((data) => {
          this.idMax = parseInt(data.id);
          if (this.id < this.idMax) {
            this.state = 1;
          }
          if (this.id >= this.idMax) {
            this.state = 0;
          }

          if (this.state == 1) {
            // 1. Duplicate
            fetch(`${this.idDevice}/${this.id}`)
              .then((response) => response.json())
              .then((data) => {
                this.devices = data[0];
                this.lat = this.devices.lat;
                this.lon = this.devices.lon;
                this.cota = this.devices.cota;
                this.timezone = this.devices.timezone;

                this.createDate();
                this.devices.createdAt = this.formatDateTime(this.date);
                this.devices.updatedAt = this.formatDateTime(this.date);

                for (let index = 0; index < this.devices.sensors.length; index++) {
                  this.devices.sensors[index].id_device= this.idMax;
                }
              })
              .catch((error) => {
                console.error(error);
              });
            this.changed = true;
            //
            setTimeout(() => {
              fetch(`${this.duplicateDevice}/${this.devices.uid}`)
                .then((response) => {
                  if (!response.ok) {
                    throw new Error("Error de la red");
                  }
                  return response.text();
                })
                .then((data) => {
                  this.devices.uid = data;
                })
                .catch((error) => {
                  console.error(
                    "Error al verificar la descripción duplicada:",
                    error
                  );
                });
            }, 200);
          }
          if (this.state == 0) {
            // 0. New
            this.devices.lat = 0;
            this.devices.lon = 0;
            this.dataSharingService.updateSharedLon(0);
            this.dataSharingService.updateSharedLat(0);
          }
        });
      this.getShared();
      this.createDate();
    }

    setInterval(() => {
      this.dataSharingService.sharedAct$.subscribe((data) => {
        if (data != false) {
          this.changed = data;
        }
      });
      this.readStorage();
    }, 10);

    this.onResize();
    this.showLarge = false;
  }

  /* GET */

  getDevices() { // Obtene el Dispositivo
    fetch(`${this.idDevice}/${this.id}`)
      .then((response) => response.json())
      .then((data) => {
        this.devices = data[0];
        this.createDate();
        this.devices.createdAt = this.formatDateTime(data[0].createdAt);
        this.devices.updatedAt = this.formatDateTime(data[0].updatedAt);
        this.getStructure(data[0].variable_configuration);
        if (data[0].id_data_estructure == undefined ||data[0].id_data_estructure == null) {
          this.devices.id_data_estructure = this.auxFixed;
        }
        if (data[0].variable_configuration == undefined ||data[0].variable_configuration == null) {
          this.devices.variable_configuration = 0;
        }
        console.log(this.devices.lat)
        console.log(this.devices.lon)
        this.updateSharedLat();
        this.updateSharedLon();
      })
      .catch((error) => {
        console.error(error);
      });
  }

  getSensorsLocal(id: any, ord: any) { // Ordena columnas de sensores
    this.mark = id;

    if (ord == "ASC") {
      if (id == "position") {
        this.devices.sensors.sort((a: any, b: any) => Number(a.position) - Number(b.position));
      }
      if (id == "datafield") {
        this.devices.sensors.sort((a: any, b: any) =>a.datafield.localeCompare(b.datafield));
      }
      if (id == "nodata") {
        this.devices.sensors.sort((a: any, b: any) =>a.nodata.localeCompare(b.nodata));
      }
      if (id == "correction_specific") {
        this.devices.sensors.sort((a: any, b: any) =>a.correction_specific.localeCompare(b.correction_specific));
      }
      if (id == "correction_time_specific") {
        this.devices.sensors.sort((a: any, b: any) =>a.correction_time_specific.localeCompare(b.correction_time_specific));
      }
      if (id == "topic_specific") {
        this.devices.sensors.sort((a: any, b: any) =>a.topic_specific.localeCompare(b.topic_specific));
      }
    }
    if (ord == "DESC") {
      if (id == "position") {
        this.devices.sensors.sort((a: any, b: any) => Number(b.position) - Number(a.position));
      }
      if (id == "datafield") {
        this.devices.sensors.sort((a: any, b: any) =>b.datafield.localeCompare(a.datafield));
      }
      if (id == "nodata") {
        this.devices.sensors.sort((a: any, b: any) =>b.nodata.localeCompare(a.nodata));
      }
      if (id == "correction_specific") {
        this.devices.sensors.sort((a: any, b: any) =>b.correction_specific.localeCompare(a.correction_specific));
      }
      if (id == "correction_time_specific") {
        this.devices.sensors.sort((a: any, b: any) =>b.correction_time_specific.localeCompare(a.correction_time_specific));
      }
      if (id == "topic_specific") {
        this.devices.sensors.sort((a: any, b: any) =>b.topic_specific.localeCompare(a.topic_specific));
      }
    }
  }

  getStructure(num: any) { // Obtiene las listas de estructuras de datos
    fetch(`${this.getStructureList}`)
      .then((response) => response.json())
      .then((quotesData) => {
        if (num == 1) {
          this.structures.structure = quotesData.variable_data_structure;
        } 
        else {
          this.structures.structure = quotesData.data_estructure;
        }
        this.auxVariable = quotesData.variable_data_structure[0].id_estructure;
        this.auxFixed = quotesData.data_estructure[0].id_estructure;
      });
  }

  /* NEW */

  newDevices(form: any) { // Guardar la información del Dispositivo
    this.createDate();
    this.devices.createdAt = this.date;
    this.devices.updatedAt = this.date;
    this.getShared();
    //console.log(this.devices)

    if (form.valid) {
      if (this.devices.sensors.length == 0) {
        let sensors_aux = [
          {
            id: -1,
            enable: 0,
            id_device: this.id,
            id_type_sensor: 0,
            datafield: "",
            nodata: true,
            orden: 1,
            type_name: "",
            correction_specific: "",
            correction_time_specific: "",
            topic_specific: "",
            position: 0,
          },
        ];
        this.devices.sensors = sensors_aux;
        fetch(this.postDevice, {
          method: "POST",
          body: JSON.stringify(this.devices),
          headers: { "Content-type": "application/json; charset=UTF-8" },
        }).then((response) => response.json());
        this.devices.sensors = [];
      } 
      else {
        fetch(this.postDevice, {
          method: "POST",
          body: JSON.stringify(this.devices),
          headers: { "Content-type": "application/json; charset=UTF-8" },
        }).then((response) => response.json());
      }
      this.newSensors();
    }
  }

  newSensors() { // Guardar los nuevos sensores de los dispositivos
    if (this.state == 0) {
      this.changed = false;
      setTimeout(() => {
        this.router.navigate([`/devices/edit/${this.id}`]);
      }, 100);
    }
    if (this.state == 1) {
      this.devices.sensors.forEach((sensor: { id_device: number }) => {
        sensor.id_device = this.idMax;
      });
      this.devices.createdAt = this.date;
      this.changed = false;
      setTimeout(() => {
        this.router.navigate([`/devices/edit/${this.idMax}`]);
      }, 100);
    }
    return;
  }

  /* EDIT */

  editDevices(form: any) { // Edita la información del Dispositivo
    this.getShared();
    this.createDate();
    this.devices.updatedAt = this.date;
    if (form.valid) {
      if (this.devices.sensors.length == 0) {
        let sensors_aux = [
          {
            id: -1,
            enable: 0,
            id_device: this.id,
            id_type_sensor: 0,
            datafield: "",
            nodata: true,
            orden: 1,
            type_name: "",
            correction_specific: "",
            correction_time_specific: "",
            topic_specific: "",
            position: 0,
          },
        ];
        this.devices.sensors = sensors_aux;
        fetch(this.postDevice, {
          method: "PUT",
          body: JSON.stringify(this.devices),
          headers: { "Content-type": "application/json; charset=UTF-8" },
        }).then((response) => response.json());
        this.devices.sensors = [];
      } 
      else {
        fetch(this.postDevice, {
          method: "PUT",
          body: JSON.stringify(this.devices),
          headers: { "Content-type": "application/json; charset=UTF-8" },
        }).then((response) => response.json());
      }
      this.actOk = true;

      setTimeout(() => {
        this.actOk = false;
      }, 2000);

      this.saved = true;
    }
    this.changed = false;
    this.devices.updatedAt = this.formatDateTime(this.date);
  }

  /* DELET */

  deleteDevices(idActual: any) { // Elimina el Dispositivo
    var devices = {
      id: idActual,
    };
    fetch(this.postDevice, {
      method: "DELETE",
      body: JSON.stringify(devices),
      headers: { "Content-type": "application/json; charset=UTF-8" },
    }).then((response) => response.json());

    setTimeout(() => {
      this.router.navigate(["/devices"]);
    }, 100);
  }

  /* SENSORS LIST */

  addSensor() { // Añadir sensor a la lista de sensores
    let sensors_aux = {
      id: this.devices.sensors.length,
      enable: 0,
      id_device: this.id,
      id_type_sensor: this.selectSensors.sensors[0].id,
      datafield: "",
      nodata: true,
      orden: 1,
      type_name: "",
      correction_specific: "",
      correction_time_specific: "",
      topic_specific: "",
      position: 0,
    };
    this.devices.sensors.push(sensors_aux);
    this.changed = true;
  }

  getOrder(num: any, num2: any) { // Obtiene el orden del sensor segun su tipo
    let cosita: any;
    cosita = this.selectSensors.sensors.find((objeto: { id: any }) => objeto.id == num2);
    if (cosita != undefined) {
      this.devices.sensors[num].orden = cosita.position;
    }
  }

  deleteSensor(id: any) { // Elimina sensor de lista de sensores
    this.deleteId = id;
    this.devices.sensors = this.devices.sensors.filter((item) => item.id != this.deleteId);
    this.changed = true;
  }

  /* RECHARGE */
  
  rechargeMap() { // Recargar mapa a su estado anterior a la edición sin guardado
    fetch(`${this.idDevice}/${this.id}`)
      .then((response) => response.json())
      .then((data) => {
        this.devices.lat = data[0].lat;
        this.devices.lon = data[0].lon;
        this.devices.cota = data[0].cota;
        this.devices.timezone = data[0].timezone;
        this.updateSharedLat();
        this.updateSharedLon();
      })
      .catch((error) => {
        console.error(error);
      });
    this.changed = false;
  }

  rechargeForm() { // Recargar los campos del dispositivo a sus valores originales
    this.ngOnInit();
    this.dataSharingService.updateSharedAct(false);
    this.cont++;
    this.changed = false;
  }

  /* AUX */

  deleteMarker() { // eliminar chincheta del mapa
    this.devices.lat = null;
    this.devices.lon = null;
    this.devices.cota = 0;
    this.devices.timezone = "Brussels, Copenhagen, Madrid, Paris";
    this.updateSharedLat();
    this.updateSharedLon();
  }

  resize(): void { // Redimensiona la pantalla
    this.width = window.innerWidth;
  }

  /* SHARED */

  getShared() { // Recupera datos compartidos con (devices-map)
    this.dataSharingService.sharedLat$.subscribe((data) => {
      this.devices.lat = data;
    });
    this.dataSharingService.sharedLon$.subscribe((data) => {
      this.devices.lon = data;
    });
    this.dataSharingService.updateSharedAct(false);
  }

  updateSharedLat() { // Actualiza la Latitud (devices-map)
    setTimeout(() => {
      this.dataSharingService.updateSharedLat(this.devices.lat);
    }, 100);
  }

  updateSharedLon() { // Actualiza la Longitud (devices-map)
    setTimeout(() => {
      this.dataSharingService.updateSharedLon(this.devices.lon);
    }, 100);
  }

  /* TARJETAS */

  formShow() { // Expandir tarjeta formulario
    this.showForm = true;
    if (this.ruteAux[2] == "edit") {
      this.onResize();
    }
  }

  formHide() { // Contrarer tarjeta formulario
    this.showForm = false;
    if (this.ruteAux[2] == "edit") {
      this.onResize();
    }
  }

  mapShow() { // Expandir tarjeta mapa
    this.showLarge = true;
    this.showMap = false;
  }

  mapHide() { // Contrarer tarjeta mapa
    this.showMap = true;
    this.showLarge = false;
  }

  /* LOCAL STORAGE */

  readStorage() { // Recupera datos de local storage
    this.activeLang = localStorage.getItem("activeLang") ?? "es";
  }

  getStructuresList(event: any) {
    let num = event.target.checked ? 1 : 0;
    this.getStructure(num);
    setTimeout(() => {
      this.devices.variable_configuration = num;
      if (num == 0) {
        this.devices.id_data_estructure = this.auxFixed;
      }
      if (num == 1) {
        this.devices.id_data_estructure = this.auxVariable;
      }
    }, 1);
  }

  /* DATE */

  createDate() { // Fecha actual
    this.date = this.formatDateTime(new Date());
  }

  formatDateTime(date2: any) { // Formato fecha
    let dat = "";
    const date = new Date(date2);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    dat = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    if (isNaN(date.getFullYear())) {
      dat = "";
    }
    return dat;
  }
}
