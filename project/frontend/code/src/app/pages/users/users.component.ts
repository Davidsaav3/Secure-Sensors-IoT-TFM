import { Component, ElementRef, OnInit, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["../../app.component.css"],
})

export class UsersComponent implements OnInit {
  resultsPerPag = environment.resultsPerPag;
  @HostListener("window:resize", ["$event"])
  onResize() {
    window.resizeBy(-1, 0);
    this.resize();
  }

  constructor(private http: HttpClient,public rutaActiva: Router, private elementRef: ElementRef) {
    this.resize();
  }

  getUser: string = environment.baseUrl+environment.users+"/get";
  postUser: string = environment.baseUrl+environment.users;
  duplicateUser: string = environment.baseUrl+environment.users+"/duplicate";
  getId: string = environment.baseUrl+environment.users+"/id";

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
  alt6 = true;
  alt7 = true;

  actId = 0;
  id = 0;
  state = -1;
  data: any;
  rute = "";
  charging = false;
  saved = false;
  change = false;
  width = 0;
  timeout: any = null;
  change2= false;
  
  show = false;
  showAux = true;
  dupOk = false;
  dupNot = false;
  viewDup = -1;
  pencilDup = -1;

  passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;

  searchAux = "search";
  order = "email";
  ordAux = "ASC";

  alertDelete: any = false;
  notDelete: any = false;
  alertNew: any = false;
  notNew: any = false;
  saveOk: any = false;
  saveNot: any = false;

  users = {
    id: 0,
    email: "",
    password: "",
    change_password: true,
    token: ""
  };

  usersCopy = {
    id: 0,
    email: "",
    password: "",
    change_password: true,
    token: ""
  };

  searchAuxArray = {
    value: "",
  };

  passwordFieldType = 'password';

  ngOnInit(): void { // Inicializa
    this.getUsers(this.order, this.ordAux);
  }

  togglePasswordType() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  /* GET */

  getUsersVoid() { // Obtiene los usuarios sin pasar arámetros
    this.getUsers(this.order, this.ordAux);
  }

  getUsersLocal(id: any, ord: any) { // Ordena columnas en local
    this.order = id;

    if (this.totalPages <= 1 && false) {
      if (ord == "ASC") {
        if (id == "email") {
          this.data.sort((a: any, b: any) => {return a.email - b.email;});
        }
        if (id == "password") {
          this.data.sort((a: any, b: any) => a.password.localeCompare(b.password));
        }
      }
      if (ord == "DESC") {
        if (id == "email") {
          this.data.sort((a: any, b: any) => {return b.email - a.email;});
        }
        if (id == "password") {
          this.data.sort((a: any, b: any) => b.password.localeCompare(a.password));
        }
      }
    } 
    else {
      this.getUsers(id, ord);
    }

    const sectionElement = this.elementRef.nativeElement.querySelector(".mark_select");
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  getUsers(id: any, ord: any) {// Obtiene los sesnores pasando parametros de ordenación
    let token = localStorage.getItem('token') ?? ''; 
    let headers = new HttpHeaders().set('Authorization', `${token}`);

    this.order = id;
    this.rute = this.rutaActiva.routerState.snapshot.url;
    this.searchAux = this.searchAuxArray.value || "search";
    this.charging = true;
    this.data = [];

    this.http.get(`${this.getUser}/${this.searchAux}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`, {headers})
    .subscribe(
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
  
        if (this.data.length < this.quantPage) {
          this.totalPage = this.total;
        } 
        else {
          this.totalPage = this.quantPage * this.currentPage;
        }
      },
      (error) => {
        console.error(error);
      }
    );

    const sectionElement = this.elementRef.nativeElement.querySelector(".mark_select");
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  orderColumn(idActual: any) { // Ordena columnas haciendo una consulta
    let token = localStorage.getItem('token') ?? ''; 
    let headers = new HttpHeaders().set('Authorization', `${token}`);

    if (!this.change && idActual != this.actId) {
      this.http.get(`${this.getId}/${idActual}`, {headers})
      .subscribe(
        (data: any) => {
          this.users = data[0];
          this.actId = idActual;
          this.id = idActual;
          this.openEdit();
          this.state = 2;
          let users = { ...this.users };
          this.usersCopy = {
            id: users.id,
            email: users.email,
            password: users.password,
            change_password: users.change_password,
            token: users.token
          };
          this.openClouse();
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }
  
  /* NEW */

  newUser(form: any) {
    let token = localStorage.getItem('token') ?? ''; 

    this.state = 1;
    if (form.valid) {
      const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}`})};
      this.http.post(this.postUser, JSON.stringify(this.users), httpOptions)
        .subscribe(
          (data: any) => {
            this.id = data.id;
            this.alertNew = true;
  
            setTimeout(() => {
              this.alertNew = false;
            }, 2000);
  
            this.openClouse();
            this.users.id = data.id;
            let users = { ...this.users };
            this.data.push(users);
            this.data.sort((a: { email: string }, b: { email: any }) => {
              if (typeof a.email === "string" && typeof b.email === "string") {
                return a.email.localeCompare(b.email);
              } 
              else {
                return 1;
              }
            });
            this.actId = this.id;
            this.openEdit();
            this.state = 2;
          },
          (error) => {
            console.error("Error:", error);
          }
        );
      this.change = false;
    }
  }

  openNew(id:any,email:any,password:any,change_password:any,token:any) { // Abre Nuevo usuario

    this.users = {
      id: id,
      email: email,
      password: password,
      change_password: change_password,
      token: token
    };

    this.show = true;
    this.openClouse();
  }

  transformPassword(password: string): string {
    return '*'.repeat(password.length);
  }
  
  /* EDIT */

  editUser(form: any) { // Guardar datos del usuario editado
    let token = localStorage.getItem('token') ?? ''; 

    if (form.valid) {
      const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}`})};
      this.http.put(this.postUser, JSON.stringify(this.users), httpOptions)
        .subscribe(
          (response: any) => {
            this.openEdit();
            // Respuesta
          },
          (error) => {
            console.error("Error:", error);
          }
        );
      this.data = this.data.filter((data: { id: number }) => data.id !== this.users.id);
      let users = this.users;
      this.data.push(users);
      this.data.sort((a: any, b: any) => {return a.email - b.email;});
      this.actId = this.users.id;
      this.openEdit();
      this.state = 2;
      this.saveOk = true;

      setTimeout(() => {
        this.saveOk = false;
      }, 2000);
    }
    this.saved = true;
    this.change = false;
  }
  
  openEdit() { // Abre Editar usuario
    this.show = true;
    this.state = 2;
    this.showAux = false;
  }


  /* DELETE */

  deleteUsers(idActual: any) { // Elimina usuario
    let token = localStorage.getItem('token') ?? ''; 

    var users2 = {
      id: this.id,
    };
    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}`
      }),
      body: users2,
    };

    this.http.delete(this.postUser, options).subscribe(
        (response: any) => {
          // Realiza acciones con la respuesta si es necesario
          //console.log('Users eliminados:', response);
        },
        (error: any) => {
          console.error('Error al eliminar usuario:', error);
        }
      );
    this.alertDelete = true;

    setTimeout(() => {
      this.alertDelete = false;
    }, 2000);

    this.data = this.data.filter((objeto: { id: any }) => objeto.id != idActual);
    this.clouse();
  }

  /* BÚSQUEDA */

  textSearch(event: any) { // Busca por texto
    this.currentPage = 1;
    clearTimeout(this.timeout);
    var $this = this;

    this.timeout = setTimeout(() => {
      if (event.keyCode != 13) {
        $this.getUsers(this.order, this.ordAux);
        $this.openClouse();
      }
    }, 500);
  }

  rechargeForm() { // recarga usuario a su valor anterior
    this.users = {
      id: this.usersCopy.id,
      email: this.usersCopy.email,
      password: this.usersCopy.password,
      change_password: this.usersCopy.change_password,
      token: this.usersCopy.token
    };
    this.change = false;
  }

  deleteSearch() {// Borra texto de busqueda
    this.Page(1);
    this.totalPages = 5;
    this.currentPage = 1;
    this.quantPage = 15;
    this.page = 1;
    this.searchAuxArray.value = "";
    this.getUsers(this.order, this.ordAux);
  }

  /* TARJETAS */

  openClouse() { // Abre y cierra la tarjeta de usuarios
    if (this.show == true) {
      this.showAux = false;
    } 
    else {
      this.showAux = true;
    }
  }

  clouse() { // Cierra tarjetas
    this.show = false;
    this.state = -1;
    this.openClouse();
    this.change = false;
    this.actId= -1;
  }

  clouseAll() { // Cierra todas las tarjetas
    this.showAux = false;
    this.show = false;
    this.openClouse();
    this.change = false;
  }

  resize(): void { // Redimensiona tarjetas
    this.width = window.innerWidth;
  }

  /* PAGINACIÓN */

  firstPage(): void { // Primera pagina
    if (this.currentPage != 1) {
      this.currentPage = 1;
      this.getUsersVoid();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage - 10 > 1) {
      this.currentPage = this.currentPage - 10;
      this.getUsersVoid();
    } 
    else {
      this.currentPage = 1;
      this.getUsersVoid();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getUsersVoid();
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage = num;
    this.getUsersVoid();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getUsersVoid();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage + 10 < this.totalPages) {
      this.currentPage = this.currentPage + 10;
      this.getUsersVoid();
    } 
    else {
      this.currentPage = this.totalPages;
      this.getUsersVoid();
    }
  }

  lastPage(): void { // Ultima pagina
    if (this.currentPage != this.totalPages) {
      this.currentPage = this.totalPages;
      this.getUsersVoid();
    }
  }
}
