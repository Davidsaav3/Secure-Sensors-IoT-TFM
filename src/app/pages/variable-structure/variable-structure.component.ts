import { Component, OnInit, HostListener, ElementRef} from '@angular/core';
import { Router } from '@angular/router';
import { environment } from "../../environments/environment"

@Component({
  selector: 'app-variable-structure',
  templateUrl: './variable-structure.component.html',
  styleUrls: ['../../app.component.css']
})

export class VariableStructureComponent implements OnInit{

  @HostListener('window:resize')
  leng_name= environment.lenguaje_name;
  leng_lang= environment.lenguaje_lang;
  public active_lang = environment.lenguaje_lang[0];
  results_per_pag= environment.results_per_pag;

  constructor(public rutaActiva: Router, private elementRef: ElementRef) {
    this.resize();
  }

  get_structure: string = 'http://localhost:5172/api/variable_data_structure/get';
  post_structure: string = 'http://localhost:5172/api/variable_data_structure/post';
  delete_structure: string = 'http://localhost:5172/api/variable_data_structure/delete';
  update_structure: string = 'http://localhost:5172/api/variable_data_structure/update';
  duplicate_structure: string = 'http://localhost:5172/api/variable_data_structure/duplicate';

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

  structure = {
    id: '', 
    description: '',    
    structure: '', 
    initial_byte: '', 
  }

  structure_copy = {
    id: '', 
    description: '',    
    structure: '', 
    initial_byte: '', 
  }

  search = {
    value: '', 
  }

  ngOnInit(): void { // Inicializador
    this.getstructure(this.order,this.ord_asc);
    this.openClouse();
  }

  getstructureVoid(){ // Obtener sin parámetros
    this.getstructure(this.order,this.ord_asc);
  }

  getstructure(id: any,ord: any){ // Obtener todos los estructuras
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
    fetch(`${this.get_structure}/${this.search_1}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`)
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
  }

  getstructureButton(id: any,ord: any){ // Ordenar columnas
    this.order= id;
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
    const sectionElement = this.elementRef.nativeElement.querySelector('.mark_select');
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  editstructure(form: any) { // Guardar datos de estructuras editado
    if (form.valid) {
      fetch(this.update_structure, {
        method: "PUT",body: JSON.stringify(this.structure),headers: {"Content-type": "application/json; charset=UTF-8"}
      })
      .then(response => response.json()) 
      this.data = this.data.filter((data: { id: string; }) => data.id !== this.structure.id);
      let structure= this.structure;
      this.data.push(structure)
      this.data.sort((a: { description: string; }, b: { description: any; }) => {
        return a.description.localeCompare(b.description);
      });
      this.act_id= this.structure.id.toString();
      this.openEdit();
      this.state=2;
      
      this.save_ok= true;
      setTimeout(() => {
        this.save_ok= false;
      }, 2000);

      this.saved= true;
      this.change=false;
    }
  }

  newstructure(form: any) { // Guardar datos de estructura nueva
    this.state= 1;
    if (form.valid) {
      fetch(this.post_structure, {
        method: "POST",body: JSON.stringify(this.structure),headers: {"Content-type": "application/json; charset=UTF-8"}
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
        let structure = {
          id: this.id.toString(), 
          description: this.structure.description,    
          structure: this.structure.structure, 
          initial_byte: this.structure.initial_byte, 
        }
        this.data.push(structure)
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

  duplicatstructure(num: any, description: any){ // Duplicar sensor
    if(!this.change && !this.change){
      fetch(`${this.duplicate_structure}/${description}`)
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

  deletstructure(id_actual: any){ // Eliminar sensor
    var structure2 = {
      id: this.act_id,    
    }
    fetch(this.delete_structure, {
      method: "DELETE",body: JSON.stringify(structure2),headers: {"Content-type": "application/json; charset=UTF-8"}
    })
    .then(response => response.json()) 
    this.alert_delete= true;
    setTimeout(() => {
      this.alert_delete= false;
    }, 2000);
    this.data= this.data.filter((objeto: { id: any; }) => objeto.id != id_actual)
    this.openClouse();
  }

  hide(){ // Cerrar alerta
    this.alert_delete= false;
    this.alert_new= false;
  }

  update(){ // Guardar estructuras en el popup de salir sin guardar
   if(this.show==true && (this.state==0 || this.state==1)){
    this.newstructure(this.structure);
   }
   if(this.show==false && this.state==2){
    this.editstructure(this.structure);
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
      this.structure= this.data.find((objeto: { id: any; }) => objeto.id == id_actual);
      this.structure_copy= this.structure;
      this.openClouse();
    }
  }
  
  textSearch(event: any) { // Busqueda textual
    this.currentPage= 1;
    clearTimeout(this.timeout);
    var $this = this;
    this.timeout = setTimeout( () => {
      if (event.keyCode != 13) {
        $this.getstructure(this.order,this.ord_asc);
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
    this.getstructure(this.order,this.ord_asc);
  }

  openNew(id: any,description:any,structure:any, initial_byte:any){ // Abrir Nuevo sensor
    this.structure = {
      id: id, 
      description: description,    
      structure: structure, 
      initial_byte: initial_byte, 
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
    this.structure= this.structure_copy;
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
      this.getstructureVoid()
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage-10 > 1) {
      this.currentPage= this.currentPage-10;
      this.getstructureVoid()
    }
    else{
      this.currentPage= 1;
      this.getstructureVoid()
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getstructureVoid()
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage= num;
    this.getstructureVoid()
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getstructureVoid()
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage+10 < this.totalPages) {
      this.currentPage= this.currentPage+10;
      this.getstructureVoid()
    }
    else{
      this.currentPage= this.totalPages;
      this.getstructureVoid()
    }
  }

  lastPage(): void { // Ultima pagina
    if(this.currentPage!=this.totalPages){
      this.currentPage= this.totalPages;
      this.getstructureVoid()
    }
  }

  /**/
}
