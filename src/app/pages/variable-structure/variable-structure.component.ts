import { Component, OnInit, ElementRef} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from "../../environments/environment"

@Component({
  selector: 'app-variable-structure',
  templateUrl: './variable-structure.component.html',
  styleUrls: ['../../app.component.css']
})

export class VariableStructureComponent implements OnInit{

  resultsPerPag= environment.resultsPerPag;
  constructor(public rutaActiva: Router, private elementRef: ElementRef) {}

  getEstructure: string = 'http://localhost:5172/api/variable_data_structure/get';
  postStructure: string = 'http://localhost:5172/api/variable_data_structure';
  deleteEstructure: string = 'http://localhost:5172/api/variable_data_structure';
  updateStructure: string = 'http://localhost:5172/api/variable_data_structure';
  duplicateEstructure: string = 'http://localhost:5172/api/variable_data_structure/duplicate';

  totalPages = 5;
  currentPage = 1;
  quantPage = 15;
  page= 1;
  total= 0;
  totalPage= 0;

  alt1=true;
  alt2=true;
  alt3=true;

  actId= 0;
  charging= false;
  data: any;
  width= 0;
  rute='';
  viewDup= -1;
  pencilDup= -1;
  timeout: any = null;
  state= 1;
  show=false;
  showAux= true;
  alertDelete: any= false;
  alertNew: any= false;
  notDelete: any= false;
  notNew: any= false;
  saveOk: any= false;
  saveNot: any= false;
  saved= false;
  change= false;
  dupOk=false;
  dupNot=false;
  id= 0;
  searchParameter='Buscar';
  order= 'description';
  ordAux= 'ASC';

  structure = {
    id: 0, 
    description: '',    
    structure: '', 
    initial_byte: '', 
  }

  structureCopy = {
    id: 0, 
    description: '',    
    structure: '', 
    initial_byte: '', 
  }

  search = {
    value: '', 
  }

  ngOnInit(): void { // Inicializador
    this.getStructure(this.order,this.ordAux);
    this.openClouse();
  }

  getStructureVoid(){ // Obtener estructura sin parámetros
    this.getStructure(this.order,this.ordAux);
  }

  getStructure(id: any,ord: any){ // Obtener todas las estructuras
    this.order= id;
    this.rute= this.rutaActiva.routerState.snapshot.url;
    if(this.search.value==''){
      this.searchParameter= 'Buscar';
    }
    else{
      this.searchParameter= this.search.value;
    }
    this.charging= true;
    this.data= [];
    fetch(`${this.getEstructure}/${this.searchParameter}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`)
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

  getStructureLocal(id: any,ord: any){ // Ordenar columnas local
    this.order= id;
    if(this.totalPages<=1 && false){
      if (ord == 'ASC') {
        if (id == 'description') {
          this.data.sort((a: any, b: any) => a.description.localeCompare(b.description));
        }
        if (id == 'structure') {
          this.data.sort((a: any, b: any) => a.structure.localeCompare(b.structure));
        }
        if (id == 'initial_byte') {
          this.data.sort((a: any, b: any) => a.initial_byte.localeCompare(b.initial_byte));
        }
      }
      if (ord == 'DESC') {
        if (id == 'description') {
          this.data.sort((a: any, b: any) => b.description.localeCompare(a.description));
        }
        if (id == 'structure') {
          this.data.sort((a: any, b: any) => b.structure.localeCompare(a.structure));
        }
        if (id == 'initial_byte') {
          this.data.sort((a: any, b: any) => b.initial_byte.localeCompare(a.initial_byte));
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

  editStructure(form: any) { // Guardar datos de estructuras editado
    if (form.valid) {
      fetch(this.updateStructure, {
        method: "PUT",body: JSON.stringify(this.structure),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => response.json()) 
      this.data = this.data.filter((data: { id: string; }) => parseInt(data.id) !== this.structure.id);
      let structure= this.structure;
      this.data.push(structure)
      this.data.sort((a: { description: string; }, b: { description: any; }) => {
        return a.description.localeCompare(b.description);
      });
      this.actId= this.structure.id;
      this.openEdit();
      this.state=2;
      
      this.saveOk= true;
      setTimeout(() => {
        this.saveOk= false;
      }, 2000);

      this.saved= true;
      this.change=false;
    }
  }

  newStructure(form: any) { // Guardar datos de estructura nueva
    console.log(this.structure)
    this.state= 1;
    if (form.valid) {
      fetch(this.postStructure, {
        method: "POST",body: JSON.stringify(this.structure),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la solicitud");
        }
        return response.json()
      })
      .then((data) => {
        this.id= data.id;
        this.alertNew= true;

        setTimeout(() => {
          this.alertNew= false;
        }, 2000);

        this.openClouse();
        let structure = {
          id: this.id, 
          description: this.structure.description,    
          structure: this.structure.structure, 
          initial_byte: this.structure.initial_byte, 
        }
        this.data.push(structure)
        this.data.sort((a: { description: string; }, b: { description: any; }) => {
          return a.description.localeCompare(b.description);
        });
        this.actId= this.id;
        this.openEdit();
        this.state=2;
      })
      .catch((error) => {
        console.error("Error:", error);
      });
      this.change=false;
    }
  }

  duplicateStructure(num: any, description: any){ // Obtener nombre duplicado de estructura
    if(!this.change && !this.change){
      fetch(`${this.duplicateEstructure}/${description}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error de la red');
        }
        return response.text();
      })
      .then((data) => {
        this.structure= this.data.find((objeto: { id: any; }) => objeto.id == num);
        this.openClouse();
        this.state= 0;
        this.openNew('',data,this.structure.structure,this.structure.initial_byte);
        this.change= true;
      })
      .catch((error) => {
        console.error('Error al verificar la descripción duplicada:', error);
      });
    }
  }

  deleteStructure(id_actual: any){ // Eliminar estructura
    var structure2 = {
      id: this.id,    
    }
    fetch(this.deleteEstructure, {
      method: "DELETE",body: JSON.stringify(structure2),headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => response.json()) 
    this.alertDelete= true;
    setTimeout(() => {
      this.alertDelete= false;
    }, 2000);
    this.data= this.data.filter((objeto: { id: any; }) => objeto.id != id_actual)
    this.openClouse();
  }

  update(){ // Guardar estructuras (popup salir sin guardar)
   if(this.show==true && (this.state==0 || this.state==1)){
    this.newStructure(this.structure);
   }
   if(this.show==false && this.state==2){
    this.editStructure(this.structure);
   }
  }

  orderColumn(id_actual: any){ // Ordenar columnas
    this.show= true;
    if(!this.change && !this.change && id_actual!=this.actId){
      this.actId= id_actual;
      this.id= id_actual;
      this.openEdit();
      this.state=2;
      const objetoEnData= this.data.find((objeto: { id: any; }) => objeto.id == id_actual);
      this.structure = { ...objetoEnData };
      this.structureCopy = {
        id: this.structure.id, 
        description: this.structure.description,    
        structure: this.structure.structure, 
        initial_byte: this.structure.initial_byte, 
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

  openClouse(){ // Logica abrir y cerrar estructuras
    if (this.show==true) {
      this.showAux= false;
    }
    else{
      this.showAux= true;
    }
  }
    
  clouse(){ // Cerrar estructura 
    this.show= false;
    this.openClouse();
    this.change=false;
  }

  deleteSearch(){ // Borrar campo de busqueda
    this.Page(1);
    this.totalPages = 5;
    this.currentPage = 1;
    this.quantPage = 15;
    this.page= 1;
    this.search.value= '';
    this.getStructure(this.order,this.ordAux);
  }

  openNew(id: any,description:any,structure:any, initial_byte:any){ // Abrir Nueva estructura
    this.structure = {
      id: id, 
      description: description,    
      structure: structure, 
      initial_byte: initial_byte, 
    }
    this.actId= 1;
    this.show= true;
    this.openClouse();
    this.state= 1;
  }

  openEdit(){ // Abrir Edición de estructura
    this.show= true;
    this.state= 2;
    this.showAux= false;
  }

  recharge(){ // Recargar campos a sus valores originales
    this.change= false;
    this.structure = {
      id: this.structureCopy.id, 
      description: this.structureCopy.description,    
      structure: this.structureCopy.structure, 
      initial_byte: this.structureCopy.initial_byte, 
    }
  }

  clouseAll(){ // Cerrar todas las estructuras
    this.showAux= false;
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
