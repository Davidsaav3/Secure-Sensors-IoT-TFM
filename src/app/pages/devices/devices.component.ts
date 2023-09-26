import {AfterViewInit,Component,ElementRef,OnDestroy,ViewChild,} from "@angular/core";
import { Router } from "@angular/router";
import * as mapboxgl from "mapbox-gl";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "src/app/environments/environment";

interface MarkerAndColor {
  color: string;
  marker: mapboxgl.Marker;
  name: string;
  enable: number;
  data: any;
}

(mapboxgl as any).accessToken ="pk.eyJ1IjoiZGF2aWRzYWF2MyIsImEiOiJjbGl1cmZ4NG8wMTZqM2ZwNW1pcW85bGo4In0.ye1F3KfhnRZruosNYoAYYQ";

@Component({
  selector: "app-devices",
  templateUrl: "./devices.component.html",
  styleUrls: ["../../app.component.css"],
})

export class DevicesComponent implements AfterViewInit, OnDestroy {
  @ViewChild("map") divMap?: ElementRef;
  styleSelector: mapboxgl.Map | undefined;
  constructor(private router: Router, private translate: TranslateService) {}

  maxDevice: string = "http://localhost:5172/api/device_configurations/max";
  getDevice: string = "http://localhost:5172/api/device_configurations/get";
  getSensorsList: string = "http://localhost:5172/api/sensors_types/get_list";

  dataAux: any[] = [];
  first = false;
  resultsPerPag = environment.resultsPerPag;
  zoom: number = 7;
  map?: mapboxgl.Map;
  currentLngLat: mapboxgl.LngLat = new mapboxgl.LngLat(
    -0.5098796883778505,
    38.3855908932305
  );
  markers: MarkerAndColor[] = [];
  geojson: any;
  geojsonAux: any;
  arraySensors: any;
  lat: any;
  lon: any;
  state = "0";
  idsParam: any;
  searchAux = false;
  firstTime = true;
  pagTam: any;
  pag: any;
  posX1 = "0";
  posX2 = "0";
  posY1 = "0";
  posY2 = "0";
  layerList: any;

  totalPages = 5;
  currentPage = 1;
  quantPage = 15;
  page = 1;
  total = 0;
  totalPage = 0;

  colorMap = "streets-v12";
  charging = false;
  mark = "uid";
  data: any[] = [];
  rute = "";
  id = 1;
  timeout: any = null;
  dupOk = false;
  dupNot = false;
  searchText = "Buscar";
  ordAux = "ASC";
  openAux = true;
  viewDup = -10;
  pencilDup = -10;
  viewList = false;
  viewMap = false;
  showPop: any;

  alt1 = true;
  alt2 = true;
  alt3 = true;
  alt4 = true;
  alt5 = true;

  selectSensors1 = {
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

  sensor: any = {
    id: 0,
    enable: 1,
    type_name: "David",
  };

  selectSensors2 = {
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

  search = {
    value: "",
    sel_type: 0,
    sensorsAct: 2,
    devicesAct: 2,
  };

  ngOnInit(): void {
    // Inicialización
    this.initFilters();
    this.selectSensors2.sensors = [];
    this.readStorage();

    fetch(`${this.getSensorsList}`)
      .then((response) => response.json())
      .then((data) => {
        data.unshift({
          id: -3,
          type: this.translate.instant("text_1"),
        });

        data.unshift({
          id: -2,
          type: this.translate.instant("text_2"),
        });

        this.selectSensors1.sensors = data;
        for (let index = 0; index < data.length; index++) {
          this.selectSensors1.sensors[index].name = data[index].type;
        }
      });
  }

  orderDevices(id: any, ordAux: any) {
    // Ordenar dispositivos
    this.deleteMarker();
    this.mark = id;
    this.ordAux = ordAux;
    this.getDevices("0");
  }

  getDevices(num: any) {
    // Consulta de los dispositivos
    this.state = num;
    if (this.state == "1") {
      this.deleteMarker();
    }
    setTimeout(() => {
      if (this.search.value == "") {
        this.searchText = "Buscar";
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
        // Map
        console.log(this.data.length);
        console.log(this.dataAux.length);
        console.log(this.data);

        if ((this.dataAux.length != this.data.length && this.data.length != 0) ||this.dataAux.length == 0 /* || this.searchAux*/) {
          this.dataAux = this.data;
          console.log("hey");
          this.cleanMap();
          if (this.showPop) {
            this.showPop.remove();
          }

          setTimeout(() => {
            this.mapListeners();
          }, 100);
          //this.searchAux= false;
        }

        console.log(this.data);
        //console.log(this.markers)

        this.getMapDevices("1")
          .then((data) => {
            //this.deleteMarker();
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

            //console.log(this.data)
            console.log(this.markers);

            setTimeout(() => {
              if (this.map != null) {
                let contenido;
                let cont = [];
                let cont2 = "";

                //console.log(this.markers)
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
                //console.log(cont)
                this.geojsonAux = {
                  features: cont,
                };
                //console.log(this.geojsonAux.features[0])
                if (!this.map.getSource("places")) {
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
          })
          .catch((error) => {
            console.error("Error al obtener los datos:", error);
          });
      }

      //

      if (this.openAux == true) {
        // List
        this.data = [];
        this.charging = true;
        fetch(`${this.getDevice}/0/${this.searchText}/${this.mark}/${this.ordAux}/${this.arraySensors}/${this.search.sensorsAct}/${this.search.devicesAct}/${this.currentPage}/${this.quantPage}/${posX1}/${posX2}/${posY1}/${posY2}`)
          .then((response) => response.json())
          .then((data) => {
            console.log(data);
            this.charging = false;
            if (data && data.length > 0 && data[0].total) {
              this.totalPages = Math.ceil(data[0].total / this.quantPage);
              this.total = data[0].total;
            } 
            else {
              this.totalPages = 0;
              this.total = 0;
            }
            //
            this.data = data;
            const deviceIds = this.data.map((device) => device.id);
            this.idsParam = deviceIds.join(",");

            if (this.data.length < this.quantPage) {
              this.totalPage = this.total;
            } 
            else {
              this.totalPage = this.quantPage * this.currentPage;
            }
          });
      }
    }, 1);
  }

  getMapDevices(num: any) {
    // optiene dispositivos
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
    if (this.searchAux) {
      //console.log('searchAux')
      this.ngOnDestroy();
      this.newMap();
      //this.cleanMap();
      //this.ngOnDestroy();
      //this.newMap();
      //this.mapListeners();
      this.searchAux = false;
    }
    this.charging = true;
    return new Promise((resolve, reject) => {
      fetch(`${this.getDevice}/1/${this.searchText}/${this.mark}/${this.ordAux}/${this.arraySensors}/${this.search.sensorsAct}/${this.search.devicesAct}/${this.pagTam}/${this.pag}/${posX1}/${posX2}/${posY1}/${posY2}`)
        .then((response) => response.json())
        .then((data) => {
          this.charging = false;
          if (JSON.stringify(this.data.map((item) => item.id)) !=JSON.stringify(data.map((item: { id: any }) => item.id))) {
            this.data = [];
            this.data = data;
            const deviceIds = this.data.map((device) => device.id);
            this.idsParam = deviceIds.join(",");
            if (this.first == false) {
              this.ngOnDestroy();
              this.newMap();
              this.first = true;
              this.dataAux = this.data;
            }
            if (this.searchAux) {
              //console.log('searchAux')
              this.ngOnDestroy();
              this.newMap();
              //this.cleanMap();
              //this.ngOnDestroy();
              //this.newMap();
              //this.mapListeners();
              this.searchAux = false;
            }
            resolve(this.data);
          }
        })
        .catch((error) => {
          console.error(error);
          reject(error);
        });
    });
  }

  cleanMap() {
    if (this.map != undefined) {
      this.deleteMarker();
      this.deleteMarker();
      this.deleteMarker();
      this.deleteMarker();
      this.deleteMarker();
      this.deleteMarker();
      this.deleteMarker();

      if (this.map.getLayer("places")) {
        this.map.removeLayer("places");
      }
      if (this.map.getSource("places")) {
        this.map.removeSource("places");
      }
    }
  }

  deleteSearch() {
    // Eliminar filtros
    this.totalPages = 5;
    this.currentPage = 1;
    this.quantPage = 15;
    this.page = 1;
    this.selectSensors2.sensors = [];
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

  filterDevices() {
    // Filtra por devices
    //this.ngOnDestroy();
    //this.newMap();
    this.searchAux = true;
    this.selectSensorsAux.sensors = [];
    if (this.selectSensors2.sensors.length == 0) {
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
      this.getDevices("1");
    } 
    else {
      this.selectSensorsAux.sensors = [];
      for (let index = 0; index < this.selectSensors2.sensors.length; index++) {
        if (this.selectSensors2.sensors[index].id >= 0) {
          this.selectSensorsAux.sensors.push(this.selectSensors2.sensors[index]);
          this.getDevices("1");
        }
        if (this.selectSensors2.sensors.length == 1 && this.selectSensors2.sensors[index].id < 0) {
          this.selectSensorsAux.sensors.push(this.selectSensors2.sensors[index]);
          this.selectSensors2.sensors = [];
          this.selectSensors2.sensors.push(this.selectSensorsAux.sensors[index] );
          this.getDevices("1");
        }
        if (this.selectSensors2.sensors.length > 1 && this.selectSensors2.sensors[index].id < 0) {
          this.selectSensors2.sensors = [];
          this.selectSensors2.sensors = this.selectSensorsAux.sensors;
        }
        if (this.selectSensors2.sensors.length == 0) {
          this.selectSensors2.sensors = [];
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
          this.getDevices("1");
        }
      }
    }
  }

  getDevicesLocal(id: any, ord: any) {
    // Ordenar columnas
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

  initFilters() {
    // Inicializa filtros
    this.deleteMarker();
    this.rute = this.router.routerState.snapshot.url;
    fetch(this.maxDevice)
      .then((response) => response.json())
      .then((data) => {
        this.id = parseInt(data.id);
      });
    this.orderDevices("uid", "ASC");
  }

  openMap() {
    // Abrir mapa
    this.openAux = false;
    this.getDevices("1");
    this.saveStorage();
  }

  openList() {
    // Abrir lista
    this.openAux = true;
    this.getDevices("0");
    this.saveStorage();
  }

  onKeySearch(event: any) {
    // Busqueda por texto
    this.currentPage = 1;
    this.deleteSearch();
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout(function () {
      if (event.keyCode != 13) {
        $this.getDevices("1");
      }
    }, 1);
  }

  deleteText() {
    // Limpiar cuadro de texto
    this.search.value = "";
  }

  /* PAGINACIÓN */

  firstPage(): void {
    // Primera pagina
    if (this.currentPage != 1) {
      this.currentPage = 1;
      this.getDevices("0");
    }
  }

  previousPage10(): void {
    // 10 paginas mas
    if (this.currentPage - 10 > 1) {
      this.currentPage = this.currentPage - 10;
      this.getDevices("0");
    } 
    else {
      this.currentPage = 1;
      this.getDevices("0");
    }
  }

  previousPage(): void {
    // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getDevices("0");
    }
  }

  Page(num: any): void {
    // Pagina actual
    this.currentPage = num;
    this.getDevices("0");
  }

  nextPage(): void {
    // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getDevices("0");
    }
  }

  nextPage10(): void {
    // 10 paginas menos
    if (this.currentPage + 10 < this.totalPages) {
      this.currentPage = this.currentPage + 10;
      this.getDevices("0");
    } 
    else {
      this.currentPage = this.totalPages;
      this.getDevices("0");
    }
  }

  lastPage(): void {
    // Ultima pagina
    if (this.currentPage != this.totalPages) {
      this.currentPage = this.totalPages;
      this.getDevices("0");
    }
  }

  /* MAPA */

  ngAfterViewInit(): void {
    // Después de ngOnInit
    this.ngOnDestroy();
    this.newMap();
    this.firstTime = false;
  }

  newMap() {
    // Crea el mapa
    if (this.firstTime == false) {
      this.map = new mapboxgl.Map({
        container: this.divMap?.nativeElement,
        style: "mapbox://styles/mapbox/" + this.colorMap,
        center: [this.currentLngLat.lng, this.currentLngLat.lat],
        zoom: this.zoom,
      });
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
            });
          },
          (error) => {
            this.map = new mapboxgl.Map({
              container: this.divMap?.nativeElement,
              style: "mapbox://styles/mapbox/" + this.colorMap,
              center: [-3.7034137886912504, 40.41697654880073],
              zoom: this.zoom,
            });
            console.log("Error geo", error);
          }
        );
      } 
      else {
        this.map = new mapboxgl.Map({
          container: this.divMap?.nativeElement,
          style: "mapbox://styles/mapbox/" + this.colorMap,
          center: [-3.7034137886912504, 40.41697654880073],
          zoom: this.zoom,
        });
        console.log("Geo no compatible");
      }
    }
    this.auxInit();
  }

  getCornerCoordinates() {
    // Obtener cordenadas
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

  auxInit() {
    // Auxiliar de Init
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

      /*if (layerList != null) {
        let inputs = layerList.getElementsByTagName('input');
        console.log(inputs)
        if (inputs != null) {
          const inputArray = Array.from(inputs);
          for (const input of inputArray) {
            input.onclick = (layer: any) => {
              const layerId = layer.target.id;
              if (this.map != null) {
                this.map.setStyle('mapbox://styles/mapbox/' + layerId);
              }
            };
      
          }
        }
      }*/
      if (!this.map) throw "Mapa no inicializado";
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

      if (this.map != undefined && this.search.value == "" && this.selectSensorsAux.sensors[0].id == -1 && this.search.devicesAct == 2) {
        this.map.on("moveend", () => {
          if (this.openAux == false) 
            this.getDevices("0");
        });
      }

      this.mapListeners();
    }
  }

  changeMapStyle(event: any): void {
    // Cambiar apariencia del mapa
    if (this.map) {
      this.colorMap = event;
      this.saveStorage();
      this.map.setStyle("mapbox://styles/mapbox/" + event);
    }
  }

  ngOnDestroy(): void {
    // Eliminar mapa
    this.map?.remove();
  }

  mapListeners() {
    // Listeners del mapa
    this.showPop = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    if (this.map != null) {
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

  addMarker(
    lngLat: mapboxgl.LngLat,
    color: string,
    name: string,
    enable: number,
    data: any
  ) {
    // Añadir chincheta
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

  deleteMarker() {
    // Eliminar chincheta
    for (let index = 0; index < this.markers.length; index++) {
      this.markers[index].marker.remove();
    }
    this.data = [];
    this.markers = [];
    let contenidoSuperpuesto = document.getElementsByClassName("marker_text");
    for (let i = 0; i < contenidoSuperpuesto.length; i++) {
      contenidoSuperpuesto[i].remove();
    }
  }

  /* Funciones Auxiliares */

  saveStorage() {
    // Guarda datos
    localStorage.setItem("openAux", this.openAux.toString());
    localStorage.setItem("colorMap", this.colorMap);
  }
  readStorage() {
    // Recupera datos
    this.openAux = JSON.parse(localStorage.getItem("openAux") ?? "");
    this.colorMap = localStorage.getItem("colorMap") ?? "0";
  }

  formatDateTime(date2: any) {
    // Formato de la fecha
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
