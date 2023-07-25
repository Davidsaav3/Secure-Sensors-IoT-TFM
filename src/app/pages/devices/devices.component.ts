import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';

interface MarkerAndColor {
  color: string;
  marker: mapboxgl.Marker;
  name: string;
  enable: number; 
  data: any;
}

(mapboxgl as any).accessToken= 'pk.eyJ1IjoiZGF2aWRzYWF2MyIsImEiOiJjbGl1cmZ4NG8wMTZqM2ZwNW1pcW85bGo4In0.ye1F3KfhnRZruosNYoAYYQ';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['../../app.component.css']
})
export class DevicesComponent implements AfterViewInit, OnDestroy{

  @ViewChild('map') divMap?: ElementRef;
  constructor(private router: Router) { }

  zoom: number = 1.5;
  map?: mapboxgl.Map;
  currentLngLat: mapboxgl.LngLat = new mapboxgl.LngLat(-0.5098796883778505, 38.3855908932305);
  markers: MarkerAndColor[] = [];
  topLeftCoordinates: string= '';
  topRightCoordinates: string= '';
  bottomLeftCoordinates: string= '';
  bottomRightCoordinates: string= '';
  date_show: any;
  geojson: any;
  geojson2: any;
  array_sensors: any;
  pag_tam:any;
  pag_pag: any;
  lat: any;
  lon: any;

  pos_x_1= '0';
  pos_x_2= '0';
  pos_y_1= '0';
  pos_y_2= '0';
  start= true;

  /**/
  
  max_device: string = 'http://localhost:5172/api/max/device_configurations';
  get_device: string = 'http://localhost:5172/api/get/device_configurations';
  id_device_sensors_devices: string = 'http://localhost:5172/api/id_device/sensors_devices';
  get_sensors: string = 'http://localhost:5172/api/get/sensors_types';
  totalPages = 5;
  currentPage = 1;
  quantPage = 10;
  page= 1;
  total= 0;
  cosa= 0;
  color_map= 'streets-v12';

  charging= false;
  mark= 'uid';
  data: any[]= [];
  data2: any[]= [];
  rute='';
  id_1= 'orden';
  id= 1;
  timeout: any = null;
  dup_ok=false;
  dup_not=false;
  search_text='Buscar';
  ord_asc= 'ASC';
  search_2= 'id';
  open_map_list= true;
  view_dup= 10000;
  pencil_dup= 10000;
  pencil_dup1= false;
  view_list=false;
  view_map=false;

  alt_1_a=true;
  alt_1_b=false;
  alt_2_a=true;
  alt_2_b=false;
  alt_3_a=true;
  alt_3_b=false;  
  alt_4_a=true;
  alt_4_b=false;  
  alt_5_a=true;
  alt_5_b=false;

  select_sensors_1 = {
    sensors : [{
      id: -1, 
      name: 'Cualquier sensor',    
      metric: '', 
      description: '',
      errorvalue: 1,
      valuemax: 1,
      valuemin: 1,
      position: '',
      correction_general: null,
      correction_time_general: null,
      id_data_estructure: 1,
    }]
  }

  select_sensors_2 = {
    sensors : [{
      id: -1, 
      name: 'Cualquier sensor',    
      metric: '', 
      description: '',
      errorvalue: 1,
      valuemax: 1,
      valuemin: 1,
      position: '',
      correction_general: null,
      correction_time_general: null,
      id_data_estructure: 1,
    }]
  }

  select_sensors_3 = {
    sensors : [{
      id: -1, 
      name: '',    
      metric: '', 
      description: '',
      errorvalue: 1,
      valuemax: 1,
      valuemin: 1,
      position: '',
      correction_general: null,
      correction_time_general: null,
      id_data_estructure: 1,
    }]
  }

  aux1 = {
    id: '',
  }

  search = {
    value: '', 
    sel_type: 0,
    sensors_act: 2,
    devices_act: 2
  }

  ngOnInit(): void { // Inicialización
    this.getorderDevices();
    this.select_sensors_2.sensors= [];
    this.readStorage();
  }

  orderDevices(id: any, ord_asc: any){ // ordenar dispositivos
    //this.newMap();
    this.deleteMarker();
    this.mark= id;
    this.ord_asc= ord_asc;
    this.devices();
  }

  devices(){ // obtener dispositivos
    this.deleteMarker();
    setTimeout(() =>{
      //this.deleteMarker()

      if(this.search.value==''){
        this.search_text= 'Buscar';
      }
      else{
        this.search_text= this.search.value;
      }
      let pos_x_1= '0';
      let pos_x_2= '0';
      let pos_y_1= '0';
      let pos_y_2= '0';
      let array= [];
      for (let index = 0; index < this.select_sensors_3.sensors.length; index++) {
        array.push(this.select_sensors_3.sensors[index].id);
      }
      this.array_sensors = array.join(',');
      this.pag_tam= 1;
      this.pag_pag= 100000;

      if(this.open_map_list==false){ // MAP //
        this.getDatos('1')
        .then(data => {
          for(let quote of this.data) {
            let color= '#198754';
            if(quote.enable==0){
              color= '#dc3545';
            }
            if(quote.enable==1){
              color= '#198754';
            }
            let coords = new mapboxgl.LngLat( quote.lon, quote.lat );
            let name=quote.uid;
            let enable=parseInt(quote.id);
            this.addMarker( coords, color , name, enable, quote);
          }
  
          //console.log(this.data2)
  
          setTimeout(()=>{
            if(this.map!=null){
              //
              let contenido;
              let cont= [];
              let cont2='';
              
              for (let index = 0; index < this.markers.length; index++) {
                cont2='';
                //console.log(this.data2)
                //console.log(this.data2[index][0].id_device)
                //console.log(this.markers[index].data.id)
                if(this.data2[index].length>0 && this.data2[index][0].id_device==this.markers[index].data.id){
                  for (let index3 = 0; index3 < this.data2[index].length; index3++) {
                    if(this.data2[index][index3].enable==false){
                      cont2+= `<span class="badge rounded-pill text-bg-danger d-inline-block me-2 mb-1">
                      <p style="font-size: small;" class="mb-0 d-none d-md-none d-lg-block">${this.data2[index][index3].type_name}</p>
                    </span>`
                    }
                    if(this.data2[index][index3].enable==true){
                      cont2+= `<span class="badge rounded-pill text-bg-success d-inline-block me-2 mb-1">
                      <p style="font-size: small; font-weight: 500;" class="mb-0 d-none d-md-none d-lg-block">${this.data2[index][index3].type_name}</p>
                    </span>`
                    }
                  }
                } 
                
                contenido= `<p style="font-size: x-large;" class="m-0 p-0 pb-2"><strong>${this.markers[index].name}</strong></p>`
                if(this.markers[index].data.uid!=''){
                  contenido+= `<p style="font-size: medium;" class="p-0 m-0" ><strong>Uid </strong> ${this.markers[index].data.uid}</p>`
                } 
                if(this.markers[index].data.alias!=''){
                  contenido+= `<p style="font-size: medium;" class="p-0 m-0"><strong>Alias </strong> ${this.markers[index].data.alias}</p>`
                }   
                if(cont2.length>0){
                  contenido+= `<div style="display: inline-block; height: min-content;" class="pt-3">${cont2}</div>`
                }                    
  
                cont.push({
                  'type': 'Feature',
                  'properties': {
                    'description': contenido
                  },
                    'geometry': {
                      'type': 'Point',
                      'coordinates': [this.markers[index].marker.getLngLat().lng,this.markers[index].marker.getLngLat().lat]
                  }
                })
    
              
                
              }            
              //console.log(cont)
              this.geojson2 = { 
                'features': 
                cont
              };
              //console.log(this.geojson2.features[0])
              this.map.addSource('places', {'type': 'geojson',
              'data': {
                'type': 'FeatureCollection',
                'features': this.geojson2.features
              }
              });
  
  
            } 
    
            if(this.map!=null){
              this.map.addLayer({
                'id': 'places',
                'type': 'circle',
                'source': 'places',
                'paint': {
                'circle-radius': 50,
                'circle-color': '#FFFFFF', 
                'circle-opacity': 0
                }
              });
    
            }
            let layers;
            if (this.map != null) {
              layers = this.map.getStyle().layers;
            }
            let labelLayerId;
            if (layers !== undefined) {
              const labelLayer = layers.find(
                (layer) => layer.type == 'symbol' && layer.layout && layer.layout['text-field']
              );
              if (labelLayer) {
                labelLayerId = labelLayer.id;
              }
            } 
          }, 100);
        
        })
        .catch(error => {
          console.error('Error al obtener los datos:', error);
        });
      }
      
      if(this.open_map_list==true){ // LIST //
        fetch(`${this.get_device}/0/${this.search_text}/${this.mark}/${this.ord_asc}/${this.array_sensors}/${this.search.sensors_act}/${this.search.devices_act}/${this.pag_tam}/${this.pag_pag}/${pos_x_1}/${pos_x_2}/${pos_y_1}/${pos_y_2}`)
        .then((response) => response.json())
        .then(data => {
          this.charging= false;
          this.totalPages= Math.ceil(data.length/this.quantPage);
          this.total= data.length;
        })
        this.getDatos('0') 
      }
      
    }, 1);
  }

  getDatos(num: any) {
    this.getCornerCoordinates();
    let pos_x_1= '0';
    let pos_x_2= '0';
    let pos_y_1= '0';
    let pos_y_2= '0';
    this.pag_tam= this.currentPage;
    this.pag_pag= this.quantPage;

    if(num=='1'){
      pos_x_1= this.pos_x_1;
      pos_x_2= this.pos_x_2;
      pos_y_1= this.pos_y_1;
      pos_y_2= this.pos_y_2;
      this.pag_tam= 1;
      this.pag_pag= 10000;
    }

    this.charging= true;
    return new Promise((resolve, reject) => {
        fetch(`${this.get_device}/0/${this.search_text}/${this.mark}/${this.ord_asc}/${this.array_sensors}/${this.search.sensors_act}/${this.search.devices_act}/${this.pag_tam}/${this.pag_pag}/${pos_x_1}/${pos_x_2}/${pos_y_1}/${pos_y_2}`)
        .then((response) => response.json())
        .then(data => {
          this.data= data;
          for (let quote of this.data) {
              fetch(`${this.id_device_sensors_devices}/${quote.id}/${this.id_1}`)
              .then(response => response.json())
              .then(data => {
                quote.sensor= data;
                this.data2.push(data);

                this.charging= false;
                resolve(data); 
              })
              .catch(error => {
                console.error(error); 
                reject(error); 
              });  
          }
          if(this.data.length<this.quantPage){
            this.cosa= this.total;
          }
          else{
            this.cosa= this.quantPage*this.currentPage;
          }
        })
    });
  }
  
  deleteSearch(){ // Eliminar filtros
    this.search.value= '';
    this.totalPages = 5;
    this.currentPage = 1;
    this.quantPage = 10;
    this.page= 1;
    this.search.value= '';
    this.select_sensors_2.sensors= [];
    this.select_sensors_3.sensors= [];
    this.select_sensors_3.sensors.push({
      id: -1, 
      name: '',    
      metric: '', 
      description: '',
      errorvalue: 1,
      valuemax: 1,
      valuemin: 1,
      position: '',
      correction_general: null,
      correction_time_general: null,
      id_data_estructure: 1,
    });
    this.search.devices_act= 2;
    this.search.sensors_act= 2;
    this.Page(1);
  }

  deleteSensors(){
    this.select_sensors_2.sensors= [];
    this.select_sensors_3.sensors= [];
    this.select_sensors_3.sensors.push({
      id: -1, 
      name: '',    
      metric: '', 
      description: '',
      errorvalue: 1,
      valuemax: 1,
      valuemin: 1,
      position: '',
      correction_general: null,
      correction_time_general: null,
      id_data_estructure: 1,
    });
    this.Page(1);
  }

  orderSelect(){
    this.newMap();
    this.timeout = setTimeout( () => {
      this.select_sensors_3.sensors= [];
      if(this.select_sensors_2.sensors.length==0){
        this.select_sensors_3.sensors.push({
          id: -1, 
          name: '',    
          metric: '', 
          description: '',
          errorvalue: 1,
          valuemax: 1,
          valuemin: 1,
          position: '',
          correction_general: null,
          correction_time_general: null,
          id_data_estructure: 1,
        });
        this.devices();    
      }
      else{
        this.select_sensors_3.sensors= [];
        for (let index = 0; index < this.select_sensors_2.sensors.length; index++) {
          if(this.select_sensors_2.sensors[index].id>=0){
            this.select_sensors_3.sensors.push(this.select_sensors_2.sensors[index]);
            //console.log("1")
            this.devices();    
          }
          if(this.select_sensors_2.sensors.length==1 && this.select_sensors_2.sensors[index].id<0){
            this.select_sensors_3.sensors.push(this.select_sensors_2.sensors[index]);
            this.select_sensors_2.sensors= [];
            this.select_sensors_2.sensors.push(this.select_sensors_3.sensors[index]);
            //console.log("2")
            this.devices();    
          }
          if(this.select_sensors_2.sensors.length>1 && this.select_sensors_2.sensors[index].id<0){
            this.select_sensors_2.sensors= [];
            this.select_sensors_2.sensors= this.select_sensors_3.sensors;
            //console.log("3")
          }
          if(this.select_sensors_2.sensors.length==0){
            this.select_sensors_2.sensors= [];
            this.select_sensors_3.sensors.push({
              id: -1, 
              name: '',    
              metric: '', 
              description: '',
              errorvalue: 1,
              valuemax: 1,
              valuemin: 1,
              position: '',
              correction_general: null,
              correction_time_general: null,
              id_data_estructure: 1,
            });            
            this.devices();
            //console.log("4")    
          }
        }
      }
      
      //(this.select_sensors_3.sensors)
    }, 1);
  }

  getorderDevices(){
    this.deleteMarker(); 
    this.rute= this.router.routerState.snapshot.url;
    fetch(this.max_device)
    .then(response => response.json())
    .then(data => {
      //console.log("zona 5")
      this.id= parseInt(data[0].id)+1;
    })

    let search_text= 'Buscar';
    let ord_asc= 'ASC';
    fetch(`${this.get_sensors}/${search_text}/${this.search_2}/${ord_asc}`)
    .then((response) => response.json())
    .then(data => {
      //console.log("zona 6")
      data.unshift({
        id: -3, 
        type: 'Todos los sensores',    
        metric: '', 
        description: '',
        errorvalue: 1,
        valuemax: 1,
        valuemin: 1,
        position: '',
        correction_general: null,
        correction_time_general: null,
      });

      data.unshift({
        id: -2, 
        type: 'Sin sensores',    
        metric: '', 
        description: '',
        errorvalue: 1,
        valuemax: 1,
        valuemin: 1,
        position: '',
        correction_general: null,
        correction_time_general: null,
      });

      this.select_sensors_1.sensors= data;
      for (let index = 0; index < data.length; index++) {
        this.select_sensors_1.sensors[index].name= data[index].type;
      }
    })
    this.orderDevices('uid','ASC');
  }

  openMap(){ // Abrir mapa
    this.open_map_list= false;
    this.devices();  
    this.saveStorage();
  }
  openList(){ // Abrir lista
    this.open_map_list= true;
    this.devices(); 
    this.saveStorage();
  }

  onKeySearch(event: any) { // Busqueda por texto
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout(function () {
      if (event.keyCode != 13) {
        $this.devices();
      }
    }, 1);
  }

  deleteText(){ // Limpiar cuadro de texto
    this.search.value= '';
  }

  /**/

  firstPage(): void { // Primera pagina
    if(this.currentPage!=1){
      this.currentPage= 1;
      this.devices();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage-10 > 1) {
      this.currentPage= this.currentPage-10;
      this.devices();
    }
    else{
      this.currentPage= 1;
      this.devices();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.devices();
    }
  }

  Page(num: any): void {
    this.currentPage= num;
    this.devices();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.devices();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage+10 < this.totalPages) {
      this.currentPage= this.currentPage+10;
      this.devices();
    }
    else{
      this.currentPage= this.totalPages;
      this.devices();
    }
  }

  lastPage(): void { // Ultima pagina
    if(this.currentPage!=this.totalPages){
      this.currentPage= this.totalPages;
      this.devices();
    }
  }

  /**/

  ngAfterViewInit(): void { // Después de ngOnInit
    this.newMap();
    this.start= false;
  }

  newMap(){
    if(this.start==false){
        this.map = new mapboxgl.Map({
            container: this.divMap?.nativeElement, 
            style: 'mapbox://styles/mapbox/'+this.color_map,
            center: [this.currentLngLat.lng, this.currentLngLat.lat],
            zoom: this.zoom, 
        });
        this.auxInit();
    }
    else{
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(position => { 
            this.map = new mapboxgl.Map({
                container: this.divMap?.nativeElement, 
                style: 'mapbox://styles/mapbox/'+this.color_map,
                center: [position.coords.longitude, position.coords.latitude],
                zoom: this.zoom, 
            });
            this.auxInit();
          },
          (error) => {
            this.map = new mapboxgl.Map({
              container: this.divMap?.nativeElement, 
              style: 'mapbox://styles/mapbox/'+this.color_map, 
              center: [-3.7034137886912504,40.41697654880073],
              zoom: this.zoom, 
          });
            console.log("Error geo", error);
            this.auxInit()
          }
        );
      } 
      else {
        this.map = new mapboxgl.Map({
          container: this.divMap?.nativeElement, 
          style: 'mapbox://styles/mapbox/'+this.color_map, 
          center: [-3.7034137886912504,40.41697654880073],
          zoom: this.zoom, 
        });      
        console.log("Geo no compatible");
        this.auxInit();
      }
    }
  }

  getCornerCoordinates() { // Obtener cordenadas
    let bounds;
    if(this.map!=null){
      bounds = this.map.getBounds();
    }
    if(bounds!=null){
      this.pos_x_1= bounds.getSouthWest().lng.toFixed(6);
      this.pos_x_2= bounds.getNorthEast().lng.toFixed(6);
      this.pos_y_1= bounds.getSouthWest().lat.toFixed(6);
      this.pos_y_2= bounds.getNorthEast().lat.toFixed(6);
    }
  }

  auxInit(){ // Auxiliar de Init
    if(this.map!=undefined){
      this.map.addControl(
        new mapboxgl.GeolocateControl({
        positionOptions: {
        enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
        })
      );
      this.map.addControl(new mapboxgl.NavigationControl());

      /*this.map.on('moveend', () => {
        this.getCornerCoordinates();
      });
      this.map.on('zoom', () => {
          this.getCornerCoordinates();
      });      
      this.map.on('zoom', () => {
          this.getCornerCoordinates();
      });*/
      if(this.search.value=='' && this.select_sensors_3.sensors[0].id==-1 && this.search.devices_act==2){
        this.map.on('zoomend', () => {
          //this.getCornerCoordinates();
          this.devices();
        });
      }
      /*this.map.on('move', () => {
        this.getCornerCoordinates();
      });*/


      let layerList = document.getElementById('menu');
      if (layerList != null) {
        let inputs = layerList.getElementsByTagName('input');
        if (inputs != null) {
          const inputArray = Array.from(inputs); // Convertir a array
          
          for (const input of inputArray) {
            input.onclick = (layer: any) => {
              const layerId = layer.target.id;
              if (this.map != null) {
                //console.log(layerId)
                //console.log(this.color_map)
                this.map.setStyle('mapbox://styles/mapbox/' + this.color_map);
              }
            };
            
          }
        }
      }
      this.mapListeners();
    }
  }

  ngOnDestroy(): void { // Elimina mapa
    this.map?.remove();
  }

  mapListeners() { // Listeners del mapa
    if ( !this.map ) throw 'Mapa no inicializado';
    this.map.on('zoom', (ev) => {
      this.zoom = this.map!.getZoom();
    });
    this.map.on('zoomend', (ev) => {
      if ( this.map!.getZoom() < 18 ) return;
      this.map!.zoomTo(18);
    });
    this.map.on('move', () => {
      this.currentLngLat = this.map!.getCenter();
    });
    const popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });
      
    if(this.map!=null){
      this.map.on('mouseenter', 'places', (e) => {
      if(this.map!=undefined){
          this.map.getCanvas().style.cursor = 'pointer';
          
          if(e!=null && e.features!=null && e.features[0]!=null && e.features[0].geometry!=null && e.features[0].properties!=null){
            let coordinates;
            if (e.features[0].geometry.type == 'Point') {
              coordinates = e.features[0].geometry.coordinates.slice();
            }
            const description = e.features[0].properties["description"];
            if(coordinates!=undefined){
              while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
              }
              const [firstNumber, secondNumber] =coordinates;
              popup.setLngLat([firstNumber, secondNumber]).setHTML(description).addTo(this.map);
            }
          }
        }
      });
      this.map.on('mouseleave', 'places', () => {
        if(this.map!=undefined){
          this.map.getCanvas().style.cursor = '';
          popup.remove();
        }
      });
    }
  }

  /* */

  addMarker( lngLat: mapboxgl.LngLat, color: string , name: string, enable: number, data: any) { // Añadir chincheta
    if ( !this.map ) return;
    const marker = new mapboxgl.Marker({
      color: color,
      draggable: false,
    })
    .setLngLat( lngLat )
    .addTo( this.map );  
    marker.on('click', function() {
    });

      this.geojson = {
        'id': 'FeatureCollection',
        'type': 'FeatureCollection',
        'features': [
          {
          'type': 'Feature',
          'properties': {
            'id': enable,
            'color': color,
            'name': name,
            'description': ``
          },
          'geometry': {
          'type': 'Point',
          'coordinates1': lngLat.lng,
          'coordinates2': lngLat.lat,
          }
          }
          ]
        };
         
        for (const marker of this.geojson.features) {
        const el = document.createElement('div');
        el.className = 'marker_text';
        el.style.backgroundSize = '100%';
        el.style.marginTop = '10px';
        el.innerHTML= `<p class="p-0 m-0" style="font-size:large; color:white; -webkit-text-stroke: 0.5px black">${marker.properties.name}</p>`;
         
        el.addEventListener('click', () => {
          const url = `/devices/edit/${marker.properties.id}`; 
          window.open(url, '_blank');
        });
         
        const coords = new mapboxgl.LngLat( marker.geometry.coordinates1, marker.geometry.coordinates2 );
        new mapboxgl.Marker(el)
        .setLngLat(coords)
        .addTo(this.map);
      }
    this.markers.push({ color, marker, name, enable, data});
  }

  deleteMarker() { // Eliminar chincheta
    for (let index = 0; index < this.markers.length; index++) {
      this.markers[index].marker.remove();
    }
    this.data2= [];
    this.markers= [];
    let contenidoSuperpuesto = document.getElementsByClassName('marker_text');
    for (let i = 0; i < contenidoSuperpuesto.length; i++) {
      contenidoSuperpuesto[i].remove();
    }
    if(this.map!=undefined){
      //this.map.removeSource('places');
    }
   // console.log(this.markers);
  }

  saveStorage() { // Guarda datos
    localStorage.setItem('open_map_list', this.open_map_list.toString());
    localStorage.setItem('color_map', this.color_map);
    //console.log("pongo")
  }
  readStorage() { // Recupera datos
    this.open_map_list = JSON.parse(localStorage.getItem('open_map_list') ?? '');
    this.color_map = localStorage.getItem('color_map') ?? '0';
    //console.log(this.color_map)
  }

  formatDateTime(date2: any) {
    let dat='';
    const date = new Date(date2)
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    dat= `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    if(date2==null){
      dat= '';
    }
    return dat;
  }

}
