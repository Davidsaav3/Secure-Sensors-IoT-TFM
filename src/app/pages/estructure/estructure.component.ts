import { Component , OnInit, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from "../../../../environments/environment"

@Component({
  selector: 'app-estructure',
  templateUrl: './estructure.component.html',
  styleUrls: ['../../app.component.css']
})

export class EstructureComponent implements OnInit{

  @HostListener('window:resize')
  leng_name= environment.lenguaje_name;
  leng_lang= environment.lenguaje_lang;
  public activeLang = environment.lenguaje_lang[0];

  constructor(public rutaActiva: Router) {
    this.resize();
  }

  max_estructure: string = 'http://localhost:5172/api/max/data_estructure';
  get_estructure: string = 'http://localhost:5172/api/get/data_estructure';
  post_estructure: string = 'http://localhost:5172/api/post/data_estructure';
  delete_estructure: string = 'http://localhost:5172/api/delete/data_estructure';
  update_estructure: string = 'http://localhost:5172/api/update/data_estructure';
  id_estructure: string = 'http://localhost:5172/api/id/data_estructure';

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
  alt_6_a=true;
  alt_6_b=false;  
  alt_7_a=true;
  alt_7_b=false;

  act_id= '';
  charging= false;
  data: any;
  width= 0;
  rute='';
  view_dup= 1000;
  pencil_dup= 1000;
  timeout: any = null;
  state= 1;
  show=false;
  show_3= true;
  alert_delete: any= false;
  alert_new: any= false;
  not_delete: any= false;
  not_new: any= false;
  save_ok: any= false;
  save_not: any= false;
  saved= false;
  change= false;
  dup_ok=false;
  dup_not=false;
  id= 0;
  type_2='';

  search_1='Buscar';
  search_2='type';
  mark= 'description';
  ord_asc= 'ASC';

  estructure = {
    id_estructure: '', 
    description: '',    
    configuration: '', 
  }

  estructure_copy = {
    id_estructure: '', 
    description: '',    
    configuration: '', 
  }

  aux_1 = {
    id_estructure: '',
  }

  search = {
    value: '', 
  }

  ngOnInit(): void { // Inicializador
    this.getEstructure(this.mark,this.ord_asc);
    this.openClouse();
  }

  getEstructure(id: any,ord: any){ // Obtener todos los estructuras
    this.mark= id;
    this.rute= this.rutaActiva.routerState.snapshot.url;
    if(id!='id'){
      this.search_2= id;
    }
    if(this.search.value==''){
      this.search_1= 'Buscar';
    }
    else{
      this.search_1= this.search.value;
    }
    this.charging= true;
    fetch(`${this.get_estructure}/${this.search_1}/${this.search_2}/${ord}`)
    .then((response) => response.json())
    .then(quotesData => {
      this.charging= false
      this.data = quotesData
    });
  }

  getEstructureButton(id: any,ord: any){
    this.mark= id;
    if (ord == 'ASC') {
      if (id == 'description') {
        this.data.sort((a: any, b: any) => a.description.localeCompare(b.description));
      }
      if (id == 'configuration') {
        this.data.sort((a: any, b: any) => a.configuration.localeCompare(b.configuration));
      }
    }
    if (ord == 'DESC') {
      if (id == 'description') {
        this.data.sort((a: any, b: any) => b.description.localeCompare(a.description));
      }
      if (id == 'configuration') {
        this.data.sort((a: any, b: any) => b.configuration.localeCompare(a.configuration));
      }
    }
  }

  editEstructure(form: any) { // Guardar datos de estructuras editado
    if (form.valid) {
      fetch(this.update_estructure, {
        method: "POST",body: JSON.stringify(this.estructure),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => response.json()) 
      this.data = this.data.filter((data: { id_estructure: string; }) => data.id_estructure !== this.estructure.id_estructure);
      let estructure = {
        id_estructure: this.estructure.id_estructure, 
        description: this.estructure.description,    
        configuration: this.estructure.configuration, 
      }
      this.data.push(estructure)
      this.data.sort((a: { description: string; }, b: { description: any; }) => {
        return a.description.localeCompare(b.description);
      });
      this.act_id= this.estructure.id_estructure.toString();
      this.openEdit();
      this.state=2;

      this.save_ok= true;
      setTimeout(() => {
        this.save_ok= false;
      }, 2000);

      //this.getEstructure(this.mark,this.ord_asc);
      this.saved= true;
      this.change=false;
      //this.getEstructure(this.mark,this.ord_asc);
    }
  }

  newEstructure(form: any) { // Guardar datos de estructuras nuevo
    this.state= 1;
    if (form.valid) {
      //console.log(this.estructure.id_estructure)
      fetch(this.post_estructure, {
        method: "POST",body: JSON.stringify(this.estructure),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => response.json()) 
      this.alert_new= true;
      setTimeout(() => {
        this.alert_new= false;
      }, 2000);
      this.openClouse();
      //this.getEstructure(this.mark,this.ord_asc);

      fetch(this.max_estructure)
      .then(response => response.json())
      .then(data => {
        this.id= parseInt(data[0].id_estructure+1);
        let estructure = {
          id_estructure: this.id.toString(), 
          description: this.estructure.description,    
          configuration: this.estructure.configuration, 
        }
        console.log(estructure.id_estructure)
        this.data.push(estructure)
        this.data.sort((a: { description: string; }, b: { description: any; }) => {
          return a.description.localeCompare(b.description);
        });
        this.act_id= this.id.toString();
        this.openEdit();
        this.state=2;
      })
      this.change=false;
    }
  }
  
  resize(): void{ // Redimensionar pantalla
    this.width = window.innerWidth;
  }

  duplicateEstructure(num: any, description: any){ // Duplicar sensor
    this.act_id= '1';
    
    if(!this.change && !this.change){
      this.aux_1 = {
        id_estructure: num,    
      }   
      this.search_1= 'Buscar';
      let ord= 'ASC';
      fetch(`${this.get_estructure}/${this.search_1}/${this.search_2}/${ord}`)
      .then((response) => response.json())
      .then(data => {
        let contador = 1;
        let nombresExistentes = new Set();
        for (let index = 0; index < data.length; index++) {
          nombresExistentes.add(data[index].description);
        }
        let description_2= description;
        while(nombresExistentes.has(description_2)) {
          description_2 = `${description}_${contador}`;
          contador++;
        }
        this.openNew();
        fetch(`${this.id_estructure}/${num}`)
        .then(response => response.json())
        .then(data => {
          this.estructure= data[0];
        })
        .catch(error => {
          console.error(error); 
        });
        this.openClouse();
        //
        fetch(this.max_estructure)
        .then(response => response.json())
        .then(data => {
          this.id= parseInt(data[0].id);
          this.estructure.id_estructure= data[0].id_estructure;
          this.estructure.description= description_2;
        })
        //this.change= true;
        this.state= 0;
      })
    }
    
  }

  deleteEstructure(id_actual: any){ // Eliminar sensor
    console.log(id_actual)
    var estructure2 = {
      id_estructure: this.act_id,    
    }
    fetch(this.delete_estructure, {
      method: "POST",body: JSON.stringify(estructure2),headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => response.json()) 
    this.alert_delete= true;
    setTimeout(() => {
      this.alert_delete= false;
    }, 2000);
    this.getEstructure(this.mark,this.ord_asc);
    this.getEstructure(this.mark,this.ord_asc);
    this.openClouse();
  }

  hide(){ 
    this.alert_delete= false;
    this.alert_new= false;
  }

  update(){ // Guardar estructuras en el popup de salir sin guardar
   if(this.show==true && (this.state==0 || this.state==1)){
    this.newEstructure(this.estructure);
   }
   if(this.show==false && this.state==2){
    this.editEstructure(this.estructure);
   }
  }

  clouse(){ 
    this.show= false;
    this.openClouse();
    this.change=false;
  }

  orderColumn(id_actual: any){ // Ordenar columnas
    this.show= true;
    if(!this.change && !this.change && id_actual!=this.act_id){
      this.act_id= id_actual;
       this.openEdit();
      this.state=2;
      fetch(`${this.id_estructure}/${id_actual}`)
      .then(response => response.json())
      .then(data => {
        this.estructure= data[0];

        this.estructure_copy.id_estructure= data[0].id_estructure;
        this.estructure_copy.description= data[0].description;
        this.estructure_copy.configuration= data[0].configuration;
      })
      .catch(error => {
        console.error(error); 
      });
      this.openClouse();
    }
  }
  
  textSearch(event: any) { // search por texto
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout( () => {
      if (event.keyCode != 13) {
        $this.getEstructure(this.mark,this.ord_asc);
        $this.openClouse();
      }
    }, 500);
  }

  openClouse(){  // Logica abrir y cerrar tarjetas
    if (this.show==true) {
      this.show_3= false;
    }
    else{
      this.show_3= true;
    }
  }

  deleteSearch(){ // Borrar search
    this.search.value= '';
    this.getEstructure(this.mark,this.ord_asc);
  }

  openNew(){ // Abrir Nuevo sensor
    this.estructure = {
      id_estructure: '', 
      description: '',    
      configuration: '', 
    }
    this.act_id= '1';
    this.show= true;
    this.openClouse();
    this.state= 1;
  }

  openEdit(){ // Abrir Editar sensor
    this.show= true;
    this.state= 2;
    this.show_3= false;
  }

  recharge(){
    this.change= false;
    this.estructure= this.estructure_copy;
  }

  clouseAll(){ // Cerrar todas las pestañas
    this.show_3= false;
    this.show= false;
    this.openClouse();
    this.change=false;
  }
}
