import {AfterViewInit,Component,ElementRef,OnDestroy,ViewChild,Injectable,} from "@angular/core";
import * as mapboxgl from "mapbox-gl";
import { ActivatedRoute } from "@angular/router";
import { DataSharingService } from "../../../services/data_sharing.service";
import { Router } from "@angular/router";

interface MarkerAndColor {
  color: string;
  marker: mapboxgl.Marker;
}

(mapboxgl as any).accessToken =
  "pk.eyJ1IjoiZGF2aWRzYWF2MyIsImEiOiJjbGl1cmZ4NG8wMTZqM2ZwNW1pcW85bGo4In0.ye1F3KfhnRZruosNYoAYYQ";

@Component({
  selector: "app-devices-map",
  templateUrl: "./devices-map.component.html",
  styleUrls: ["../../../app.component.css"],
})

@Injectable({
  providedIn: "root",
})

export class DevicesMapComponent implements AfterViewInit, OnDestroy {

  rute = "";
  ruteAux: any;
  sharedLat: any = 38.3855908932305;
  sharedLon: any = -0.5098796883778505;
  sharedCota: any = 10;
  currentLngLat: mapboxgl.LngLat = new mapboxgl.LngLat(
    this.sharedLon,
    this.sharedLat
  );

  constructor(private rutaActiva: ActivatedRoute,public rute1: Router,private dataSharingService: DataSharingService) {
    this.rute = this.rute1.routerState.snapshot.url;
    this.ruteAux = this.rute.split("/");
    if (this.ruteAux[2] == "edit") {
      this.dataSharingService.sharedLat$.subscribe((data) => {
        this.sharedLat = data;
      });
      this.dataSharingService.sharedLon$.subscribe((data) => {
        this.sharedLon = data;
      });
      this.currentLngLat = new mapboxgl.LngLat(this.sharedLon, this.sharedLat); //setTimeout
    }
  }

  @ViewChild("map") divMap?: ElementRef;
  maxDevice: string = "http://localhost:5172/api/device_configurations/max";
  id = parseInt(this.rutaActiva.snapshot.params["id"]);
  zoom: number = 10;
  map?: mapboxgl.Map;
  markers: MarkerAndColor[] = [];
  colorMap = "streets-v12";
  idMax = 1;
  state = -1;

  ngOnInit(): void {
    // Inicializador
    fetch(this.maxDevice)
      .then((response) => response.json())
      .then((data) => {
        this.idMax = parseInt(data.id) - 1;
        if (this.id <= this.idMax) {
          this.state = 1;
        }
        if (this.id > this.idMax) {
          this.state = 0;
        }
      });

    setTimeout(() => {
      this.readStorage();
      this.rute = this.rute1.routerState.snapshot.url;
      this.ruteAux = this.rute.split("/");
      this.dataSharingService.sharedLat$.subscribe((data) => {
        this.sharedLat = data;
      });
      this.dataSharingService.sharedLon$.subscribe((data) => {
        this.sharedLon = data;
      });
      if (this.ruteAux[2] == "edit" ||(this.ruteAux[2] == "new" && this.state == 1)) {
        this.currentLngLat = new mapboxgl.LngLat(
          this.sharedLon,
          this.sharedLat
        );
      }
    }, 100);
  }

  ngAfterViewInit(): void {
    // Se ejecuta despues de ngOnInit
    setTimeout(() => {
      if (this.ruteAux[2] == "new" && this.state == 0) {
        if (!this.divMap) throw "No hay mapa";
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              this.map = this.createMap([
                position.coords.longitude,
                position.coords.latitude,
              ]);
              this.auxInit();
            },
            (error) => {
              this.map = this.createMap([
                -3.7036360462944913, 40.41686882952129,
              ]);
              console.log("Error geo", error);
              this.auxInit();
            }
          );
        } 
        else {
          this.map = this.createMap([-3.7036360462944913, 40.41686882952129]);
          console.log("Geo no compatible");
          this.auxInit();
        }
      }
      //
      if (this.ruteAux[2] == "edit" ||(this.ruteAux[2] == "new" && this.state == 1)) {
        this.deleteMarker();
        this.map = this.createMap(this.currentLngLat);
        this.currentLngLat = new mapboxgl.LngLat(
          this.sharedLon,
          this.sharedLat
        );
        this.createMarker(this.currentLngLat);
        this.auxInit();
      }
    }, 100);
  }

  auxInit() {
    // Auxiliar de ngAfterViewInit
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

      this.map.on("click", (e) => {
        this.deleteMarker();
        this.createMarker(e.lngLat.wrap());
        this.updatesharedAct();
      });

      let layerList = document.getElementById("menu");
      if (layerList != null) {
        let inputs = layerList.getElementsByTagName("input");
        if (inputs != null) {
          const inputArray = Array.from(inputs);

          for (const input of inputArray) {
            input.onclick = (layer: any) => {
              if (this.map != null) {
                this.map.setStyle("mapbox://styles/mapbox/" + this.colorMap);
              }
            };
          }
        }
      }
    }

    if (this.map != undefined) {
      this.map.on("style.load", () => {
        if (this.map != undefined) {
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
            if (this.map != undefined) {
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
        }
      });
    }

    setInterval(() => {
      try {
        this.dataSharingService.sharedLat$.subscribe((data) => {
          this.sharedLat = data;
        });
        this.dataSharingService.sharedLon$.subscribe((data) => {
          this.sharedLon = data;
        });
        if (this.sharedLat != this.currentLngLat.lat ||this.sharedLon != this.currentLngLat.lng) {
          this.deleteMarker();
          this.currentLngLat = new mapboxgl.LngLat(
            this.sharedLon,
            this.sharedLat
          );
          this.createMarker(this.currentLngLat);
        }
      } 
      catch (error) {
        //this.ngOnDestroy();
      }
    }, 50);
    //
    setInterval(() => {
      try {
        if (this.map) {
          this.map.resize();
        }
      } 
      catch (error) {
        //this.ngOnDestroy();
      }
    }, 10);
  }

  createMap(pos: any) {
    // crea el mapa
    if (!this.divMap) throw "No hay mapa";
    this.ngOnDestroy();
    this.map = new mapboxgl.Map({
      container: this.divMap.nativeElement,
      style: "mapbox://styles/mapbox/" + this.colorMap,
      center: pos,
      zoom: this.zoom,
    });
    return this.map;
  }

  changeMapStyle(event: any): void {
    // Cambiar apariencia del mapa
    if (this.map) {
      this.colorMap = event;
      this.saveStorage();
      this.map.setStyle("mapbox://styles/mapbox/" + event);
    }
  }

  ngOnDestroy() {
    // Destructor
    try {
      if (this.map) {
        this.map.remove();
      }
    } catch (error) {
      console.error("Error al eliminar el mapa:", error);
    }
  }

  showMap() {
    // Redimesiona mapa
    try {
      if (this.map) {
        this.map.resize();
      }
    } catch (error) {
      this.ngOnDestroy();
    }
  }

  updatesharedLat() {
    // Actualizar Latitud
    this.dataSharingService.updatesharedLat(this.sharedLat);
  }

  updatesharedLon() {
    // ctualizar Longitud
    this.dataSharingService.updatesharedLon(this.sharedLon);
  }

  /* //////////// MAPA /////////////// */

  createMarker(marker: mapboxgl.LngLat) {
    // Añade chincheta (1)
    if (!this.map) return;
    const color = "#0dcaf0";
    const lngLat = marker;
    this.addMarker(lngLat, color);
  }

  updatesharedAct() {
    // Enviar act
    this.dataSharingService.updatesharedAct(true);
  }

  addMarker(lngLat: mapboxgl.LngLat, color: string) {
    // Crear chincheta (2)
    if (!this.map) return;
    this.markers = [];
    this.markers.splice(0, 1);

    const marker = new mapboxgl.Marker({
      color: "#0dcaf0",
      draggable: false,
    })
      .setLngLat(lngLat)
      .addTo(this.map);
    this.markers.push({ color, marker });

    if (this.ruteAux[2] == "new") {
      this.saveStorage();
      marker.on("dragend", () => this.saveStorage());
    }

    this.sharedLat = lngLat.lat;
    this.sharedLon = lngLat.lng;
    this.updatesharedLat();
    this.updatesharedLon();
  }

  deleteMarker() {
    // Quita chincheta
    for (let index = 0; index < this.markers.length; index++) {
      this.markers[index].marker.remove();
    }
    let contenidoSuperpuesto = document.getElementsByClassName("marker_text");
    for (let i = 0; i < contenidoSuperpuesto.length; i++) {
      contenidoSuperpuesto[i].remove();
    }
  }

  saveStorage() {
    // Guarda datos
    localStorage.setItem("colorMap", this.colorMap);
  }

  readStorage() {
    // Recupera datos
    this.colorMap = localStorage.getItem("colorMap") ?? "0";
  }
}
