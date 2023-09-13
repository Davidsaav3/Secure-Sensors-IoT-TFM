import { Component, OnInit, HostListener, ElementRef} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from "../../environments/environment"

@Component({
  selector: 'app-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['../../app.component.css']
})

export class StructureComponent implements OnInit{

  @HostListener('window:resize')
  leng_name= environment.lenguaje_name;
  leng_lang= environment.lenguaje_lang;
  public active_lang = environment.lenguaje_lang[0];
  results_per_pag= environment.results_per_pag;

  constructor(public rutaActiva: Router, private elementRef: ElementRef) {
    this.resize();
  }

  get_estructure: string = 'http://localhost:5172/api/data_structure/get';
  post_estructure: string = 'http://localhost:5172/api/data_structure/post';
  delete_estructure: string = 'http://localhost:5172/api/data_structure/delete';
  update_estructure: string = 'http://localhost:5172/api/data_structure/update';
  duplicate_estructure: string = 'http://localhost:5172/api/data_structure/duplicate';
  get_variable_structure_list: string = 'http://localhost:5172/api/variable_data_structure/get_list';

  totalPages = 5;
  currentPage = 1;
  quantPage = 15;
  page= 1;
  total= 0;
  total_page= 0;

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
  view_dup= -1;
  pencil_dup= -1;
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
  search_1='Buscar';
  order= 'description';
  ord_asc= 'ASC';

  estructure = {
    id_estructure: '', 
    description: '',    
    configuration: '', 
    identifier_code: '', 
    id_variable_data_structure: 0, 
    variable_description: '',
  }

  estructure_copy = {
    id_estructure: '', 
    description: '',    
    configuration: '', 
    identifier_code: '', 
    id_variable_data_structure: 0, 
    variable_description: '',
  }

  estructure_variable = {
    structure : [{
      id: 1, 
      description: '',
      structure: '',
      initial_byte: 0
      }]
  }

  search = {
    value: '', 
  }

  ngOnInit(): void { // Inicializador
    this.getEstructure(this.order,this.ord_asc);
    this.openClouse();
  }

  getEstructureVoid(){ // Obtener sin parámetros
    this.getEstructure(this.order,this.ord_asc);
  }

  getEstructure(id: any,ord: any){ // Obtener todos los estructuras
    this.order= id;
    this.rute= this.rutaActiva.routerState.snapshot.url;
    if(this.search.value==''){
      this.search_1= 'Buscar';
    }
    else{
      this.search_1= this.search.value;
    }

    this.charging= true;
    this.data= [];
    fetch(`${this.get_estructure}/${this.search_1}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`)
    .then((response) => response.json())
    .then(quotesData => {
      this.charging= false
      this.totalPages= Math.ceil(quotesData[0].total/this.quantPage);
      this.total= quotesData[0].total;
      this.data = quotesData
      if(this.data.length<this.quantPage){
        this.total_page= this.total;
      }
      else{
        this.total_page= this.quantPage*this.currentPage;
      }
    });
    this.getstructuresList();
  }

  getstructuresList(){ // optener estructuras de datos
    fetch(`${this.get_variable_structure_list}`)
      .then((response) => response.json())
      .then(quotesData => {
        console.log(quotesData)
        this.estructure_variable.structure = quotesData;
      });   
  }

  getEstructureButton(id: any,ord: any){ // Ordenar columnas
    this.order= id;
    if (ord == 'ASC') {
      if (id == 'description') {
        this.data.sort((a: any, b: any) => a.description.localeCompare(b.description));
      }
      if (id == 'configuration') {
        this.data.sort((a: any, b: any) => a.configuration.localeCompare(b.configuration));
      }
      if (id == 'identifier_code') {
        this.data.sort((a: any, b: any) => a.identifier_code.localeCompare(b.identifier_code));
      }
      if (id == 'id_variable_data_structure') {
        this.data.sort((a: any, b: any) => a.id_variable_data_structure.localeCompare(b.id_variable_data_structure));
      }
    }
    if (ord == 'DESC') {
      if (id == 'description') {
        this.data.sort((a: any, b: any) => b.description.localeCompare(a.description));
      }
      if (id == 'configuration') {
        this.data.sort((a: any, b: any) => b.configuration.localeCompare(a.configuration));
      }
      if (id == 'identifier_code') {
        this.data.sort((a: any, b: any) => b.identifier_code.localeCompare(a.identifier_code));
      }
      if (id == 'id_variable_data_structure') {
        this.data.sort((a: any, b: any) => b.id_variable_data_structure.localeCompare(a.id_variable_data_structure));
      }
    }
    const sectionElement = this.elementRef.nativeElement.querySelector('.mark_select');
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  editEstructure(form: any, num: any) { // Guardar datos de estructuras editado
    console.log(num)
    if (form.valid) {
      fetch(this.update_estructure, {
        method: "PUT",body: JSON.stringify(this.estructure),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => response.json()) 
      this.data = this.data.filter((data: { id_estructure: string; }) => data.id_estructure !== this.estructure.id_estructure);
      let estructure= this.estructure;
      this.data.push(estructure)
      this.data.sort((a: { description: string; }, b: { description: any; }) => {
        return a.description.localeCompare(b.description);
      });
      this.act_id= this.estructure.id_estructure.toString();
      this.openEdit();
      this.state=2;
      
      if(num>=0){
        this.data[num].variable_description= this.estructure.variable_description;
        //console.log(this.data[num].variable_description)
      }

      this.save_ok= true;
      setTimeout(() => {
        this.save_ok= false;
      }, 2000);

      this.saved= true;
      this.change=false;
    }
  }

  newEstructure(form: any) { // Guardar datos de estructura nueva
    this.state= 1;
    if (form.valid) {
      fetch(this.post_estructure, {
        method: "POST",body: JSON.stringify(this.estructure),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la solicitud");
        }
        return response.json(); // Parsear la respuesta JSON
      })
      .then((data) => {
        this.id= data.id; // Obtener el ID autogenerado
        this.alert_new= true;

        setTimeout(() => {
          this.alert_new= false;
        }, 2000);

        this.openClouse();
        let estructure = {
          id_estructure: this.id.toString(), 
          description: this.estructure.description,    
          configuration: this.estructure.configuration, 
          identifier_code: this.estructure.identifier_code, 
          id_variable_data_structure: this.estructure.id_variable_data_structure, 
        }
        this.data.push(estructure)
        this.data.sort((a: { description: string; }, b: { description: any; }) => {
          return a.description.localeCompare(b.description);
        });
        this.act_id= this.id.toString();
        this.openEdit();
        this.state=2;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
      this.change=false;
    }
  }

  duplicateEstructure(num: any, description: any){ // Duplicar sensor
    if(!this.change && !this.change){
      fetch(`${this.duplicate_estructure}/${description}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error de la red');
        }
        return response.text();
      })
      .then((data) => {
        this.estructure= this.data.find((objeto: { id_estructure: any; }) => objeto.id_estructure == num);
        this.openClouse();
        this.state= 0;
        this.openNew('',data,this.estructure.configuration,this.estructure.identifier_code,this.estructure.id_variable_data_structure,this.estructure.variable_description);
        this.change= true;
      })
      .catch((error) => {
        console.error('Error al verificar la descripción duplicada:', error);
      });
    }
  }

  deleteEstructure(id_actual: any){ // Eliminar sensor
    var estructure2 = {
      id_estructure: this.act_id,    
    }
    fetch(this.delete_estructure, {
      method: "DELETE",body: JSON.stringify(estructure2),headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => response.json()) 
    this.alert_delete= true;
    setTimeout(() => {
      this.alert_delete= false;
    }, 2000);
    this.data= this.data.filter((objeto: { id_estructure: any; }) => objeto.id_estructure != id_actual)
    this.openClouse();
  }

  hide(){ // Cerrar alerta
    this.alert_delete= false;
    this.alert_new= false;
  }

  update(){ // Guardar estructuras en el popup de salir sin guardar
   if(this.show==true && (this.state==0 || this.state==1)){
    this.newEstructure(this.estructure);
   }
   if(this.show==false && this.state==2){
    this.editEstructure(this.estructure,-1);
   }
  }

  resize(): void{ // Redimensionar pantalla
    this.width = window.innerWidth;
  }
  
  clouse(){ // Cerrar tarjeta 
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
      this.estructure= this.data.find((objeto: { id_estructure: any; }) => objeto.id_estructure == id_actual);
      this.estructure_copy= this.estructure;
      this.openClouse();
    }
  }
  
  textSearch(event: any) { // Busqueda textual
    this.currentPage= 1;
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout( () => {
      if (event.keyCode != 13) {
        $this.getEstructure(this.order,this.ord_asc);
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

  deleteSearch(){ // Borrar busqueda textual
    this.search.value= '';
    this.getEstructure(this.order,this.ord_asc);
  }

  openNew(id_estructure: any,description:any,configuration:any,identifier_code:any,id_variable_data_structure:any,variable_description:any){ // Abrir Nuevo sensor
    this.estructure = {
      id_estructure: id_estructure, 
      description: description,    
      configuration: configuration, 
      identifier_code: identifier_code, 
      id_variable_data_structure: id_variable_data_structure, 
      variable_description: variable_description,
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

  recharge(){ // Recargar campos a sus valores originales
    this.change= false;
    this.estructure= this.estructure_copy;
  }

  clouseAll(){ // Cerrar todas las pestañas
    this.show_3= false;
    this.show= false;
    this.openClouse();
    this.change=false;
  }

  /* PAGINACIÓN */

  firstPage(): void { // Primera pagina
    if(this.currentPage!=1){
      this.currentPage= 1;
      this.getEstructureVoid()
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage-10 > 1) {
      this.currentPage= this.currentPage-10;
      this.getEstructureVoid()
    }
    else{
      this.currentPage= 1;
      this.getEstructureVoid()
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getEstructureVoid()
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage= num;
    this.getEstructureVoid()
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getEstructureVoid()
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage+10 < this.totalPages) {
      this.currentPage= this.currentPage+10;
      this.getEstructureVoid()
    }
    else{
      this.currentPage= this.totalPages;
      this.getEstructureVoid()
    }
  }

  lastPage(): void { // Ultima pagina
    if(this.currentPage!=this.totalPages){
      this.currentPage= this.totalPages;
      this.getEstructureVoid()
    }
  }

  /**/
}