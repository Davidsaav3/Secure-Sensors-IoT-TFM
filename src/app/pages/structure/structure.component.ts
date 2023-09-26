import { Component, OnInit, ElementRef} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from "../../environments/environment"

@Component({
  selector: 'app-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['../../app.component.css']
})

export class StructureComponent implements OnInit{

  resultsPerPag= environment.resultsPerPag;
  constructor(public rutaActiva: Router, private elementRef: ElementRef) {
    fetch(`${this.get_variable_structure_list}`)
    .then((response) => response.json())
    .then(quotesData => {
      this.aux = quotesData[0].id;
      //console.log(quotesData[0].id)
    }); 
  }

  get_estructure: string = 'http://localhost:5172/api/data_structure/get';
  post_estructure: string = 'http://localhost:5172/api/data_structure';
  delete_estructure: string = 'http://localhost:5172/api/data_structure';
  update_estructure: string = 'http://localhost:5172/api/data_structure';
  duplicate_estructure: string = 'http://localhost:5172/api/data_structure/duplicate';
  get_variable_structure_list: string = 'http://localhost:5172/api/variable_data_structure/get_list';

  totalPages = 5;
  currentPage = 1;
  quantPage = 15;
  page= 1;
  total= 0;
  totalPage= 0;

  aux= 1;
  alt1=true;
  alt2=true;
  alt3=true;
  alt4=true;

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
  searchAux='Buscar';
  order= 'description';
  ordAux= 'ASC';

  estructure = {
    id_estructure: '', 
    description: null,    
    configuration: null, 
    identifier_code: null, 
    id_variable_data_structure: 1, 
    variable_description: '',
  }

  estructureCopy = {
    id_estructure: '', 
    description: null,    
    configuration: null, 
    identifier_code: null, 
    id_variable_data_structure: 1, 
    variable_description: '',
  }

  estructureVariable = {
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
    this.getStructure(this.order,this.ordAux);
    this.openClouse();
    this.getStructureList();
  }

  getStructureVoid(){ // Obtener sin parámetros
    this.getStructure(this.order,this.ordAux);
  }

  getStructure(id: any,ord: any){ // Obtener todos los estructuras
    this.order= id;
    this.rute= this.rutaActiva.routerState.snapshot.url;
    if(this.search.value==''){
      this.searchAux= 'Buscar';
    }
    else{
      this.searchAux= this.search.value;
    }

    this.charging= true;
    this.data= [];
    fetch(`${this.get_estructure}/${this.searchAux}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`)
    .then((response) => response.json())
    .then(data => {
      this.charging= false
      if (data && data.length > 0 && data[0].total) {
        this.totalPages = Math.ceil(data[0].total / this.quantPage);
        this.total = data[0].total;
      } else {
        this.totalPages = 0;
        this.total = 0;
      }
      this.data = data
      if(this.data.length<this.quantPage){
        this.totalPage= this.total;
      }
      else{
        this.totalPage= this.quantPage*this.currentPage;
      }
    });
  }

  getStructureList(){ // optener lista de estructuras de datos
    fetch(`${this.get_variable_structure_list}`)
      .then((response) => response.json())
      .then(quotesData => {
        this.estructureVariable.structure = quotesData;
      });   
  }

  getStructureLocal(id: any,ord: any){ // Ordenar columnas local
    this.order= id;

    if(this.totalPages<=1 && false){
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
    }
    else{
      this.getStructure(id,ord);
    }
    const sectionElement = this.elementRef.nativeElement.querySelector('.mark_select');
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  editStructure(form: any, num: any) { // Guardar datos de estructura editada
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
      }

      this.save_ok= true;
      setTimeout(() => {
        this.save_ok= false;
      }, 2000);

      this.saved= true;
      this.change=false;
    }
  }

  newStructure(form: any) { // Guardar datos de estructura nueva
    this.state= 1;
    if (form.valid) {
      fetch(this.post_estructure, {
        method: "POST",body: JSON.stringify(this.estructure),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la solicitud");
        }
        return response.json();
      })
      .then((data) => {
        this.id= data.id;
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

  duplicateStructure(num: any, description: any){ // Duplicar estructura
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
        this.openNew('1',data,this.estructure.configuration,this.estructure.identifier_code,this.estructure.id_variable_data_structure,this.estructure.variable_description);
        this.change= true;
      })
      .catch((error) => {
        console.error('Error al verificar la descripción duplicada:', error);
      });
    }
  }

  deleteStructure(id_actual: any){ // Eliminar sensor
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

  update(){ // Guardar estructuras en el popup de salir sin guardar
   if(this.show==true && (this.state==0 || this.state==1)){
    this.newStructure(this.estructure);
   }
   if(this.show==false && this.state==2){
    this.editStructure(this.estructure,-1);
   }
  }
  
  clouse(){ // Cerrar estructura 
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
      const objetoEnData= this.data.find((objeto: { id_estructure: any; }) => objeto.id_estructure == id_actual);
      this.estructure = { ...objetoEnData };
      this.estructureCopy = {
        id_estructure: this.estructure.id_estructure, 
        description: this.estructure.description,    
        configuration: this.estructure.configuration, 
        identifier_code: this.estructure.identifier_code, 
        id_variable_data_structure: this.estructure.id_variable_data_structure, 
        variable_description: this.estructure.variable_description,
      }
      this.openClouse();
    }
  }
  
  textSearch(event: any) { // Busqueda por texto
    this.currentPage= 1;
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout( () => {
      if (event.keyCode != 13) {
        $this.getStructure(this.order,this.ordAux);
        $this.openClouse();
      }
    }, 500);
  }

  openClouse(){  // Abrir y cerrar tarjetas
    if (this.show==true) {
      this.show_3= false;
    }
    else{
      this.show_3= true;
    }
  }

  deleteSearch(){ // Borrar busqueda por texto
    this.Page(1);
    this.totalPages = 5;
    this.currentPage = 1;
    this.quantPage = 15;
    this.page= 1;
    this.search.value= '';
    this.getStructure(this.order,this.ordAux);
  }

  openNew(id_estructure: any,description:any,configuration:any,identifier_code:any,id_variable_data_structure:any,variable_description:any){ // Abrir Nuevo sensor
    if(id_estructure==''){
      this.estructureCopy.id_variable_data_structure = this.aux;
      this.estructure = {
        id_estructure: id_estructure, 
        description: description,    
        configuration: configuration, 
        identifier_code: identifier_code, 
        id_variable_data_structure: this.aux, 
        variable_description: variable_description,
      }
    }
    else{
      this.estructureCopy.id_variable_data_structure = id_variable_data_structure;
      this.estructure = {
        id_estructure: id_estructure, 
        description: description,    
        configuration: configuration, 
        identifier_code: identifier_code, 
        id_variable_data_structure: id_variable_data_structure, 
        variable_description: variable_description,
      }
    }
    
    this.act_id= '1';
    this.show= true;
    this.openClouse();
    this.state= 1;
  }

  openEdit(){ // Abrir Editar estructura
    this.show= true;
    this.state= 2;
    this.show_3= false;
  }

  recharge(){ // Recargar campos a sus valores originales
    this.change= false;
    this.estructure = {
      id_estructure: this.estructureCopy.id_estructure, 
      description: this.estructureCopy.description,    
      configuration: this.estructureCopy.configuration, 
      identifier_code: this.estructureCopy.identifier_code, 
      id_variable_data_structure: this.estructureCopy.id_variable_data_structure, 
      variable_description: this.estructureCopy.variable_description,
    }
  }

  clouseAll(){ // Cerrar todas las estructuras
    this.show_3= false;
    this.show= false;
    this.openClouse();
    this.change=false;
  }

  /* PAGINACIÓN */

  firstPage(): void { // Primera pagina
    if(this.currentPage!=1){
      this.currentPage= 1;
      this.getStructureVoid()
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage-10 > 1) {
      this.currentPage= this.currentPage-10;
      this.getStructureVoid()
    }
    else{
      this.currentPage= 1;
      this.getStructureVoid()
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getStructureVoid()
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage= num;
    this.getStructureVoid()
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getStructureVoid()
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage+10 < this.totalPages) {
      this.currentPage= this.currentPage+10;
      this.getStructureVoid()
    }
    else{
      this.currentPage= this.totalPages;
      this.getStructureVoid()
    }
  }

  lastPage(): void { // Ultima pagina
    if(this.currentPage!=this.totalPages){
      this.currentPage= this.totalPages;
      this.getStructureVoid()
    }
  }
}