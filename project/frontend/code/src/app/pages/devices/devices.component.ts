import {AfterViewInit,Component,ElementRef, OnDestroy, OnInit, ViewChild,} from "@angular/core";
import { Router } from "@angular/router";
import * as mapboxgl from "mapbox-gl";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "src/app/environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { StorageService } from '../../services/storage.service';
import { HttpOptionsService } from '../../services/httpOptions.service';

interface MarkerAndColor {
  color: string;
  marker: mapboxgl.Marker;
  name: string;
  enable: number;
  data: any;
}

(mapboxgl as any).accessToken =environment.accessTokenMap;

@Component({
  selector: "app-devices",
  templateUrl: "./devices.component.html",
  styleUrls: ["../../app.component.css"],
})

export class DevicesComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild("map") divMap?: ElementRef;
  styleSelector: mapboxgl.Map | undefined;

  constructor(private httpOptionsService: HttpOptionsService,private storageService: StorageService,public sanitizer: DomSanitizer, private http: HttpClient,private router: Router, private translate: TranslateService) {}

  getDevice: string = environment.baseUrl+environment.url.deviceConfigurations+"";
  getSensorsList: string = environment.baseUrl+environment.url.sensorsTypes+"/get_list";

  zoom: number = 7;
  map?: mapboxgl.Map;
  markers: MarkerAndColor[] = [];
  geojson: any;
  geojsonAux: any;
  arraySensors: any;
  colorMap = environment.defaultMapsStyle;
  layerList: any;
  lat: any;
  lon: any;
  currentLngLat: mapboxgl.LngLat = new mapboxgl.LngLat(
    -0.5098796883778505,
    38.3855908932305
  );
  currentRotation= 0;
  currentPitch = 0;   
  pass2= false; 

  resultsPerPag = environment.resultsPerPag;
  data: any[] = [];
  rute = "";

  temp1: any = null;
  temp2: any = null;
  temp3: any = null;

  idsParam: any;
  idsParam1: any;
  searchAux = false;
  pagTam: any;
  pag: any;
  viewList = false;
  viewMap = false;
  showPop: any;
  searchText = "search";
  ordAux = "ASC"; 
  searched= false;

  charging = false;
  mark = "uid";

  posX1 = "0";
  posX2 = "0";
  posY1 = "0";
  posY2 = "0";

  dupOk = false;
  dupNot = false;
  openAux = true;
  viewDup = -10;
  pencilDup = -10;

  totalPages = 5;
  currentPage = 1;
  quantPage = 15;
  page = 1;
  total = 0;
  totalPage = 0;

  alt1 = true;
  alt2 = true;
  alt3 = true;
  alt4 = true;
  alt5 = true;

  selectSensors = {
    sensors: [
      {
        id: -1,
        name: "Cualquier sensor",
        metric: "",
        description: "",
        errorvalue: 1,
        valuemax: 1,
        valuemin: 1,
        position: "",
        correction_general: null,
        correction_time_general: null,
        id_data_structure: 1,
      },
    ],
  };

  selectSensorsCopy = {
    sensors: [
      {
        id: -1,
        name: "Cualquier sensor",
        metric: "",
        description: "",
        errorvalue: 1,
        valuemax: 1,
        valuemin: 1,
        position: "",
        correction_general: null,
        correction_time_general: null,
        id_data_structure: 1,
        data_estructure: "",
        variable_data_structure: "",
      },
    ],
  };

  selectSensorsAux = {
    sensors: [
      {
        id: -1,
        name: "",
        metric: "",
        description: "",
        errorvalue: 1,
        valuemax: 1,
        valuemin: 1,
        position: "",
        correction_general: null,
        correction_time_general: null,
        id_data_structure: 1,
      },
    ],
  };

  sensor: any = {
    id: 0,
    enable: 0,
    type_name: "",
  };

  search = {
    value: "",
    sel_type: 0,
    sensorsAct: 2,
    devicesAct: 2,
  };

  ngOnInit(): void { // Inicialización
    this.initFilters();
    this.selectSensors.sensors = [];

    this.http.get(this.getSensorsList, this.httpOptionsService.getHttpOptions()).subscribe(
      (data: any) => {
        data.unshift({
          id: -3,
          type: this.translate.instant('text_1'),
        });

        data.unshift({
          id: -2,
          type: this.translate.instant('text_2'),
        });
        this.selectSensorsCopy.sensors = data;
        for (let index = 0; index < data.length; index++) {
          this.selectSensorsCopy.sensors[index].name = data[index].type;
        }
      },
      (error:any) => {
        console.error('Error al obtener datos:', error);
      }
    );
    this.readStorage();
  }

  ngOnDestroy(){
    //this.temp1.clearInterval();
    //this.temp2.clearInterval();
    //this.temp3.clearInterval();
    this.map?.remove();
    this.storageService.setSearch('')
    this.storageService.setPerPage('15')
    this.storageService.setPage('1')
  }

  ngAfterViewInit(): void { // Se ejecuta después de ngOnInit
    this.createMap();
    //console.log('Versión de Mapbox GL JS:', mapboxgl.version);
  }

  auxInit() { // Auxiliar de ngOnInit
    if (this.map != undefined) {
      this.map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        })
      );
    this.map.addControl(new mapboxgl.NavigationControl());
    }
    this.mapListeners();
  }

  /* GET */
  
  orderDevices(id: any, ordAux: any) { // Ordena dispositivos
    //this.deleteMarker();
    this.mark = id;
    this.ordAux = ordAux;
    this.getDevices();
  }

  sanitizeId(id: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(id).toString();
  }

  getDevices() { // Obtiene los dispositivos
    let token = this.storageService.getToken() ?? ''; 
    

    //console.log(this.search.value)
    this.temp1= setTimeout(() => { // Asincrono
      if (this.search.value == "") {
        this.searchText = "search";
      } 
      else {
        this.searchText = this.search.value;
      }
      let posX1 = "0";
      let posX2 = "0";
      let posY1 = "0";
      let posY2 = "0";
      let array = [];
      for (let index = 0;index < this.selectSensorsAux.sensors.length;index++) {
        array.push(this.selectSensorsAux.sensors[index].id);
      }
      this.arraySensors = array.join(",");
      this.pagTam = 1;
      this.pag = 100000;

      if (this.openAux == false) {

        this.getMapDevices("1")
          .then((pass) => {
            if (pass || this.searched) {
              //console.log(this.data)

              this.searched= false;
              for (let index = 0; index < this.markers.length; index++) {
                this.markers[index].marker.remove();
              }
              this.markers = [];

            for (let quote of this.data) {
              let color = "#198754";
              if (quote.enable == 0) {
                color = "#dc3545";
              }
              if (quote.enable == 1) {
                color = "#198754";
              }
              let coords = new mapboxgl.LngLat(quote.lon, quote.lat);
              let name = quote.uid;
              let enable = parseInt(quote.id);
              this.addMarker(coords, color, name, enable, quote);
            }
            //console.log(this.markers)
            //console.log(this.markers);

            this.temp2= setTimeout(() => { // Asincrono
              if (this.map != null) {
                let contenido;
                let cont = [];
                let cont2 = "";

                for (let index = 0; index < this.markers.length; index++) {
                  cont2 = "";
                  if (this.data != undefined &&this.data != null &&this.data[index] != undefined &&this.data[index] != null) {
                    for (let index3 = 0;index3 < this.data[index].sensors.length;index3++) {
                      if (this.data[index].sensors[index3].enable == 0) {
                        cont2 += `<span class="badge rounded-pill text-bg-danger d-inline-block me-2 mb-1">
                                    <p style="font-size: small;" class="mb-0">${this.data[index].sensors[index3].type_name}</p>
                                  </span>`;
                      }
                      if (this.data[index].sensors[index3].enable == 1) {
                        cont2 += `<span class="badge rounded-pill text-bg-success d-inline-block me-2 mb-1">
                                    <p style="font-size: small; font-weight: 500;" class="mb-0">${this.data[index].sensors[index3].type_name}</p>
                                  </span>`;
                      }
                    }
                  }

                  contenido = ``;
                  if (this.markers[index].data.uid != "") {
                    contenido += `<p style="font-size: large;" class="p-0 m-0" ><strong>${this.markers[index].data.uid}</strong> (Uid)</p>`;
                  }
                  if (this.markers[index].data.alias != "") {
                    contenido += `<p style="font-size: medium;" class="p-0 m-0" ><strong>${this.markers[index].data.alias}</strong> (Alias)</p>`;
                  }
                  if (cont2.length > 0) {
                    contenido += `<div style="display: inline-block; height: min-content;" class="pt-3">${cont2}</div>`;
                  }

                  cont.push({
                    type: "Feature",
                    properties: {
                      description: contenido,
                    },
                    geometry: {
                      type: "Point",
                      coordinates: [
                        this.markers[index].marker.getLngLat().lng,
                        this.markers[index].marker.getLngLat().lat,
                      ],
                    },
                  });
                }
                this.geojsonAux = {
                  features: cont,
                };
                if (this.map.getLayer("places")) {
                  this.map.removeLayer("places");
                }
                if (this.map.getSource("places")) {
                  this.map.removeSource("places");
                }
                if (this.map != null && !this.map.getSource("places")) {
                  this.map.addSource("places", {
                    type: "geojson",
                    data: {
                      type: "FeatureCollection",
                      features: this.geojsonAux.features,
                    },
                  });
                }
              }

              if (this.map != null && !this.map.getLayer("places")) {
                this.map.addLayer({
                  id: "places",
                  type: "circle",
                  source: "places",
                  paint: {
                    "circle-radius": 50,
                    "circle-color": "#FFFFFF",
                    "circle-opacity": 0,
                  },
                });
              }
              let layers;
              if (this.map != null) {
                layers = this.map.getStyle().layers;
              }
              let labelLayerId;
              if (layers !== undefined) {
                const labelLayer = layers.find(
                  (layer) =>
                    layer.type == "symbol" &&
                    layer.layout &&
                    layer.layout["text-field"]
                );
                if (labelLayer) {
                  labelLayerId = labelLayer.id;
                }
                if (this.map != undefined &&!this.map.getLayer("add-3d-buildings")) {
                  this.map.addLayer(
                    {
                      id: "add-3d-buildings",
                      source: "composite",
                      "source-layer": "building",
                      filter: ["==", "extrude", "true"],
                      type: "fill-extrusion",
                      minzoom: 15,
                      paint: {
                        "fill-extrusion-color": "#aaa",

                        "fill-extrusion-height": [
                          "interpolate",
                          ["linear"],
                          ["zoom"],
                          15,
                          0,
                          15.05,
                          ["get", "height"],
                        ],
                        "fill-extrusion-base": [
                          "interpolate",
                          ["linear"],
                          ["zoom"],
                          15,
                          0,
                          15.05,
                          ["get", "min_height"],
                        ],
                        "fill-extrusion-opacity": 0.6,
                      },
                    },
                    labelLayerId
                  );
                }
              }
            }, 100);
          }
          })
          .catch((error:any) => {
            console.error("Error al obtener los datos:", error);
          });
      }


      if (this.openAux == true) {
        // List
        this.data = [];
        this.charging = true;
        this.http.get(`${this.getDevice}/0/${this.searchText}/${this.mark}/${this.ordAux}/${this.arraySensors}/${this.search.sensorsAct}/${this.search.devicesAct}/${this.currentPage}/${this.quantPage}/${posX1}/${posX2}/${posY1}/${posY2}`, this.httpOptionsService.getHttpOptions()).subscribe(
          (data: any) => {
            this.charging = false;
    
            if (data && data.length > 0 && data[0].total) {
              this.totalPages = Math.ceil(data[0].total / this.quantPage);
              this.total = data[0].total;
            } 
            else {
              this.totalPages = 0;
              this.total = 0;
            }
    
            this.data = data;
            const deviceIds = this.data.map((device) => device.id);
            this.idsParam = deviceIds.join(",");
    
            if (this.data.length < this.quantPage) {
              this.totalPage = this.total;
            } 
            else {
              this.totalPage = this.quantPage * this.currentPage;
            }
          },
          (error) => {
            console.error('Error al obtener datos:', error);
          }
        );
      }
    }, 1);
  }
  
  getMapDevices(num: any) { // Auxiliar de orderDevices (Map)
    let token = this.storageService.getToken() ?? ''; 
    

    this.getCornerCoordinates();
    let posX1 = "0";
    let posX2 = "0";
    let posY1 = "0";
    let posY2 = "0";
    this.pagTam = this.currentPage;
    this.pag = this.quantPage;

    if (num == "1") {
      posX1 = this.posX1;
      posX2 = this.posX2;
      posY1 = this.posY1;
      posY2 = this.posY2;
      this.pagTam = 1;
      this.pag = 10000;
    }

    this.charging = true;
    return new Promise((resolve, reject) => {
      this.http.get(`${this.getDevice}/1/${this.searchText}/${this.mark}/${this.ordAux}/${this.arraySensors}/${this.search.sensorsAct}/${this.search.devicesAct}/${this.pagTam}/${this.pag}/${posX1}/${posX2}/${posY1}/${posY2}`, this.httpOptionsService.getHttpOptions()).subscribe(
      (data: any) => {
        let pass = false;
        this.charging = false;
        const deviceIds1 = data.map((device: { id: any }) => device.id);
        this.idsParam1 = deviceIds1.join(",");

        if (this.idsParam != this.idsParam1 || this.searched) {
          pass = true;

          if (!this.searched) {
            const newDataIds = data.map((item: { id: any }) => item.id);
            const newElements = data.filter(
              (item: any) => !this.data.some((existingItem) => existingItem.id === item.id)
            );
            const removedElements = this.data.filter(
              (existingItem) => !newDataIds.includes(existingItem.id)
            );

            this.data.push(...newElements);
            this.data = data.filter(
              (item: { id: any }) => !removedElements.some((removedItem) => removedItem.id === item.id)
            );

            const deviceIds = this.data.map((device) => device.id);
            this.idsParam = this.idsParam1;
          } 
          else {
            this.data = [];
            this.data = data;
            const deviceIds = this.data.map((device) => device.id);
            this.idsParam = deviceIds.join(",");
          }

          if (this.searched) {
            this.cleanMap();
          }
          resolve(pass);
        }
      },
      (error) => {
        console.error(error);
        reject(error);
      }
    );
  })
  }
  
    
  

  createMap() { // Crea el mapa    
    if (this.searched) {
      this.map = new mapboxgl.Map({
        container: this.divMap?.nativeElement,
        style: "mapbox://styles/mapbox/" + this.colorMap,
        center: [this.currentLngLat.lng, this.currentLngLat.lat],
        zoom: this.zoom,
        bearing: this.currentRotation,
        pitch: this.currentPitch,
      });
      this.auxInit();
      this.map.setMaxZoom(22);
      this.map.boxZoom.disable();
    } 
    else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.map = new mapboxgl.Map({
              container: this.divMap?.nativeElement,
              style: "mapbox://styles/mapbox/" + this.colorMap,
              center: [position.coords.longitude, position.coords.latitude],
              zoom: this.zoom,
              bearing: this.currentRotation,
              pitch: this.currentPitch,
            });
            this.auxInit();
            this.map.setMaxZoom(22);
            this.map.boxZoom.disable();
          },
          (error) => {
            this.map = new mapboxgl.Map({
              container: this.divMap?.nativeElement,
              style: "mapbox://styles/mapbox/" + this.colorMap,
              center: [-3.7034137886912504, 40.41697654880073],
              zoom: this.zoom,
              bearing: this.currentRotation,
              pitch: this.currentPitch,
            });
            //console.log("Error geo", error);
            this.auxInit();
            this.map.setMaxZoom(22);
            this.map.boxZoom.disable();
          }
        );
      } 
      else {
        this.map = new mapboxgl.Map({
          container: this.divMap?.nativeElement,
          style: "mapbox://styles/mapbox/" + this.colorMap,
          center: [-3.7034137886912504, 40.41697654880073],
          zoom: this.zoom,
          bearing: this.currentRotation,
          pitch: this.currentPitch,
        });
        //console.log("Geo no compatible");
        this.auxInit();
        this.map.setMaxZoom(22);
        this.map.boxZoom.disable();
      }
    }
  }

  /* MAP AUX */

  mapListeners() { // Listeners del mapa
    if (this.map != null) {

    this.map.on("zoom", (ev) => {
      this.zoom = this.map!.getZoom();
    });
    this.map.on("zoomend", (ev) => {
      if (this.map!.getZoom() < 18) return;
      this.map!.zoomTo(18);
    });
    this.map.on("move", () => {
      this.currentLngLat = this.map!.getCenter();
    });
    this.map.on("rotate", () => {
      this.currentRotation = this.map!.getBearing();
    });
    this.map.on("pitch", () => {
      this.currentPitch = this.map!.getPitch();
    });
    this.map.on("moveend", () => {
      if (this.openAux == false) 
        this.getDevices();
    });

    this.showPop = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

      this.map.on("mouseenter", "places", (e) => {
        if (this.map != undefined) {
          this.map.getCanvas().style.cursor = "pointer";

          if (e != null && e.features != null && e.features[0] != null &&  e.features[0].geometry != null &&e.features[0].properties != null) {
            let coordinates;
            if (e.features[0].geometry.type == "Point") {
              coordinates = e.features[0].geometry.coordinates.slice();
            }
            const description = e.features[0].properties["description"];
            if (coordinates != undefined) {
              while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
              }
              const [firstNumber, secondNumber] = coordinates;
              this.showPop
                .setLngLat([firstNumber, secondNumber])
                .setHTML(description)
                .addTo(this.map);
            }
          }
        }
      });
      this.map.on("mouseleave", "places", () => {
        if (this.map != undefined) {
          this.map.getCanvas().style.cursor = "";
          this.showPop.remove();
        }
      });
    }
  }

  getCornerCoordinates() { // Obtener cordenadas de las esquinas del mapa
    let bounds;
    if (this.map != null) {
      bounds = this.map.getBounds();
    }
    if (bounds != null) {
      this.posX1 = bounds.getSouthWest().lng.toFixed(6);
      this.posX2 = bounds.getNorthEast().lng.toFixed(6);
      this.posY1 = bounds.getSouthWest().lat.toFixed(6);
      this.posY2 = bounds.getNorthEast().lat.toFixed(6);
    }
  }

  changeMapStyle(event: any): void { // Cambiar el estilo del mapa
    if (this.map) {
      this.colorMap = event;
      this.saveStorage();
      this.map.setStyle("mapbox://styles/mapbox/" + event);
    }
    this.searched= true;
    this.getDevices();
  }

  cleanMap() {
    if (this.map != undefined) {
      if (this.map.getLayer("places")) {
        this.map.removeLayer("places");
      }
      if (this.map.getSource("places")) {
        this.map.removeSource("places");
      }
      const elementsToDelete  = document.querySelectorAll(".marker_text");
      elementsToDelete.forEach((element) => {
        element.remove(); // Elimina el elemento del DOM
      });
      for (let index = 0; index < this.markers.length; index++) {
        this.markers[index].marker.remove();
      }
    }
  }

  /* FILTERS */

  initFilters() { // Inicializa los filtros del mapa
    this.rute = this.router.routerState.snapshot.url;
    this.orderDevices("uid", "ASC");
  }

  filterDevices() { // Activa los filtros del mapa
    this.searched= true;
    this.searchAux = true;
    this.selectSensorsAux.sensors = [];
    if (this.selectSensors.sensors.length == 0) {
      this.selectSensorsAux.sensors.push({
        id: -1,
        name: "",
        metric: "",
        description: "",
        errorvalue: 1,
        valuemax: 1,
        valuemin: 1,
        position: "",
        correction_general: null,
        correction_time_general: null,
        id_data_structure: 1,
      });
      this.getDevices();
    } 
    else {
      this.selectSensorsAux.sensors = [];
      for (let index = 0; index < this.selectSensors.sensors.length; index++) {
        if (this.selectSensors.sensors[index].id >= 0) {
          this.selectSensorsAux.sensors.push(this.selectSensors.sensors[index]);
          this.getDevices();
        }
        if (this.selectSensors.sensors.length == 1 && this.selectSensors.sensors[index].id < 0) {
          this.selectSensorsAux.sensors.push(this.selectSensors.sensors[index]);
          this.selectSensors.sensors = [];
          this.selectSensors.sensors.push(this.selectSensorsAux.sensors[index] );
          this.getDevices();
        }
        if (this.selectSensors.sensors.length > 1 && this.selectSensors.sensors[index].id < 0) {
          this.selectSensors.sensors = [];
          this.selectSensors.sensors = this.selectSensorsAux.sensors;
        }
        if (this.selectSensors.sensors.length == 0) {
          this.selectSensors.sensors = [];
          this.selectSensorsAux.sensors.push({
            id: -1,
            name: "",
            metric: "",
            description: "",
            errorvalue: 1,
            valuemax: 1,
            valuemin: 1,
            position: "",
            correction_general: null,
            correction_time_general: null,
            id_data_structure: 1,
          });
          this.getDevices();
        }
      }
    }
  }

  getDevicesLocal(id: any, ord: any) { // Ordenación de las columnas
    this.storageService.setPerPage(this.quantPage.toString())
    //this.order= id;
    if (this.totalPages <= 1 && false) {
      if (ord == "ASC") {
        if (id == "uid") {
          this.data.sort((a: any, b: any) => a.uid.localeCompare(b.uid));
        }
        if (id == "topic_name") {
          this.data.sort((a: any, b: any) =>a.topic_name.localeCompare(b.topic_name));
        }
        if (id == "application_id") {
          this.data.sort((a: any, b: any) =>a.application_id.localeCompare(b.application_id));
        }
        if (id == "data_estructure") {
          this.data.sort((a: any, b: any) =>a.data_estructure.localeCompare(b.data_estructure));
        }
        if (id == "updatedAt") {
          this.data.sort((a: any, b: any) => {
            const valorA = a.updatedAt || "";
            const valorB = b.updatedAt || "";
            return valorA.localeCompare(valorB);
          });
        }
      }
      if (ord == "DESC") {
        if (id == "uid") {
          this.data.sort((a: any, b: any) => b.uid.localeCompare(a.uid));
        }
        if (id == "topic_name") {
          this.data.sort((a: any, b: any) =>b.topic_name.localeCompare(a.topic_name));
        }
        if (id == "application_id") {
          this.data.sort((a: any, b: any) =>b.application_id.localeCompare(a.application_id));
        }
        if (id == "data_estructure") {
          this.data.sort((a: any, b: any) =>b.data_estructure.localeCompare(a.data_estructure));
        }
        if (id == "updatedAt") {
          this.data.sort((a: any, b: any) => {
            const valorA = b.updatedAt || "";
            const valorB = a.updatedAt || "";
            return valorA.localeCompare(valorB);
          });
        }
      }
    } 
    else {
      this.orderDevices(id, ord);
    }
  }

  /* MAP MARKERS */

  addMarker(lngLat: mapboxgl.LngLat,color: string,name: string,enable: number,data: any) { // Añadir chincheta en el mapa
    if (!this.map) return;
    const marker = new mapboxgl.Marker({
      color: color,
      draggable: false,
    })
      .setLngLat(lngLat)
      .addTo(this.map);
    marker.on("click", function () {});

    this.geojson = {
      id: "FeatureCollection",
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            id: enable,
            color: color,
            name: name,
            description: ``,
          },
          geometry: {
            type: "Point",
            coordinates1: lngLat.lng,
            coordinates2: lngLat.lat,
          },
        },
      ],
    };

    for (const marker of this.geojson.features) {
      const el = document.createElement("div");
      el.className = "marker_text";
      el.style.backgroundSize = "100%";
      el.style.marginTop = "10px";
      el.innerHTML = `<p class="p-0 m-0" style="font-size:large; color:white; -webkit-text-stroke: 0.5px black">${marker.properties.name}</p>`;
      el.addEventListener("click", () => {
        const url = `/devices/edit/${marker.properties.id}`;
        window.open(url, "_blank");
      });

      const coords = new mapboxgl.LngLat(
        marker.geometry.coordinates1,
        marker.geometry.coordinates2
      );
      new mapboxgl.Marker(el).setLngLat(coords).addTo(this.map);
    }
    this.markers.push({ color, marker, name, enable, data });
  }

  /* BÚSCAR */

  onKeySearch(event: any) { // Busqueda por texto
    this.storageService.setSearch(this.search.value)
    this.searched= true;
    this.currentPage = 1;
    this.deleteSearch();
    clearTimeout(this.temp1);
    var $this = this;
    this.temp3 = setTimeout(function () {
      if (event.keyCode != 13) {
        $this.getDevices();
      }
    }, 1);
  }

  deleteSearch() { // Limpia todos los filtros
    this.totalPages = 5;
    this.currentPage = 1;
    this.quantPage = 15;
    this.page = 1;
    this.selectSensors.sensors = [];
    this.selectSensorsAux.sensors = [];
    this.selectSensorsAux.sensors.push({
      id: -1,
      name: "",
      metric: "",
      description: "",
      errorvalue: 1,
      valuemax: 1,
      valuemin: 1,
      position: "",
      correction_general: null,
      correction_time_general: null,
      id_data_structure: 1,
    });
    this.search.devicesAct = 2;
    this.search.sensorsAct = 2;
    this.Page(1);
  }

  deleteSearch2(){
    this.search.value = "";
    this.storageService.setSearch(this.search.value)
  }

  deleteText() { // Limpiar busqueda por texto
    this.search.value = "";
    this.storageService.setSearch(this.search.value)
    this.getDevices();
  }

  /* TARJETAS */

  openMap() { // Abrir tarjeta mapa
    this.openAux = false;
    this.getDevices();
    this.saveStorage();
  }

  openList() { // Abrir tarjeta lista dispositivos
    this.openAux = true;
    this.getDevices();
    this.saveStorage();
  }

  /* PAGINACIÓN */

  firstPage(): void { // Primera pagina
    if (this.currentPage != 1) {
      this.currentPage = 1;
      this.storageService.setPage(this.currentPage.toString())
      this.getDevices();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage - 10 > 1) {
      this.currentPage = this.currentPage - 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getDevices();
    } 
    else {
      this.currentPage = 1;
      this.storageService.setPage(this.currentPage.toString())
      this.getDevices();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.storageService.setPage(this.currentPage.toString())
      this.getDevices();
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage = num;
    this.storageService.setPage(this.currentPage.toString())
    this.getDevices();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getDevices();
      this.storageService.setPage(this.currentPage.toString())
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage + 10 < this.totalPages) {
      this.currentPage = this.currentPage + 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getDevices();
    } 
    else {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getDevices();
    }
  }

  lastPage(): void { // Ultima pagina
    if (this.currentPage != this.totalPages) {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getDevices();
    }
  }

  /* LOCAL STORAGE */

  saveStorage() { // Guarda datos en local storage
    this.storageService.setOpen(this.openAux.toString())
    this.storageService.setMap(this.colorMap)
  }

  readStorage() { // Recupera datos en local storage
    let pageString= this.storageService.getOpen() ?? "true"
    this.openAux = JSON.parse(pageString);
    this.colorMap = this.storageService.getMap() ?? environment.defaultMapsStyle;
    pageString = this.storageService.getPage() ?? "1"; 
    this.currentPage = parseInt(pageString, 10);
    pageString = this.storageService.getPerPage() ?? "15"; 
    this.quantPage = parseInt(pageString, 10);
    this.search.value = this.storageService.getSearch() ?? "";
    if(this.search.value!=""){
      this.searched= true;
      clearTimeout(this.temp1);
      var $this = this;
      this.temp3 = setTimeout(function () {
        $this.getDevices();
      }, 1);
    }
  }

  /* DATE */

  formatDateTime(date2: any) { // Formatea la fecha
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
