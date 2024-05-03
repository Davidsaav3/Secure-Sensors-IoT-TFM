import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, HostListener, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { HttpOptionsService } from '../../services/httpOptions.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: "app-users",
  templateUrl: "./users.component.html",
  styleUrls: ["../../app.component.css"],
})

export class UsersComponent implements OnInit, OnDestroy {
  resultsPerPag = environment.resultsPerPag;
  @HostListener("window:resize", ["$event"])
  onResize() {
    window.resizeBy(-1, 0);
    this.resize();
  }

  constructor(private httpOptionsService: HttpOptionsService, private storageService: StorageService, private http: HttpClient, public rutaActiva: Router, private elementRef: ElementRef) {
    this.resize();
  }

  getUser: string = environment.baseUrl + environment.url.users + "";
  postUser: string = environment.baseUrl + environment.url.users;
  postUserRevoke: string = environment.baseUrl + environment.url.users + "/revoke";
  duplicateUser: string = environment.baseUrl + environment.url.users + "/duplicate";
  getId: string = environment.baseUrl + environment.url.users + "/id";

  currentDate = this.getCurrentDate();

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

  show = false;
  showAux = true;
  dupOk = false;
  dupNot = false;
  viewDup = -1;
  pencilDup = -1;

  passwordPattern = environment.password_pattern;;

  searchAux = "search";
  order = "user";
  ordAux = "ASC";

  alertDelete: any = false;
  notDelete: any = false;
  alertNew: any = false;
  notNew: any = false;
  saveOk: any = false;
  saveNot: any = false;
  alertRep: any = false;
  notRep: any = false;

  temp1: any = null;
  temp2: any = null;
  temp3: any = null;
  temp4: any = null;
  temp5: any = null;
  temp6: any = null;

  users = {
    id: 0,
    user: "",
    password: "",
    change_password: true,
    token: "",
    enabled: 1,
    revoke_date: "24-02-2001"
  };

  usersCopy = {
    id: 0,
    user: "",
    password: "",
    change_password: true,
    token: "",
    enabled: 1,
    revoke_date: "24-02-2001"
  };

  searchAuxArray = {
    value: "",
  };

  passwordFieldType = 'password';

  ngOnInit(): void { // Inicializa
    this.getUsers(this.order, this.ordAux);
    this.readStorage();
  }

  ngOnDestroy() {
    //this.temp1.clearInterval();
    //this.temp2.clearInterval();
    //this.temp3.clearInterval();
    //this.temp4.clearInterval();
    //this.temp5.clearInterval();
    //this.temp6.clearInterval();
    this.storageService.setSearch('')
    this.storageService.setPerPage('15')
    this.storageService.setPage('1')
  }

  getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = ('0' + (now.getMonth() + 1)).slice(-2);
    const day = ('0' + now.getDate()).slice(-2);
    const hours = ('0' + now.getHours()).slice(-2);
    const minutes = ('0' + now.getMinutes()).slice(-2);
    const seconds = ('0' + now.getSeconds()).slice(-2);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
    this.storageService.setPerPage(this.quantPage.toString())

    if (this.totalPages <= 1 && false) {
      if (ord == "ASC") {
        if (id == "user") {
          this.data.sort((a: any, b: any) => { return a.user - b.user; });
        }
        if (id == "password") {
          this.data.sort((a: any, b: any) => a.password.localeCompare(b.password));
        }
      }
      if (ord == "DESC") {
        if (id == "user") {
          this.data.sort((a: any, b: any) => { return b.user - a.user; });
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

  getUsers(id: any, ord: any) {// Obtiene los usuarios pasando parametros de ordenación
    this.order = id;
    this.rute = this.rutaActiva.routerState.snapshot.url;
    this.searchAux = this.searchAuxArray.value || "search";
    this.charging = true;
    this.data = [];

    this.http.get(`${this.getUser}/${this.searchAux}/${this.order}/${ord}/${this.currentPage}/${this.quantPage}`, this.httpOptionsService.getHttpOptions())
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

    if (!this.change && idActual != this.actId) {
      this.http.get(`${this.getId}/${idActual}`, this.httpOptionsService.getHttpOptions())
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
              user: users.user,
              password: users.password,
              change_password: users.change_password,
              token: users.token,
              enabled: users.enabled,
              revoke_date: users.revoke_date
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

  newUser() {
    this.state = 1;
    this.http.post(this.postUser, JSON.stringify(this.users), this.httpOptionsService.getHttpOptions())
      .subscribe(
        (data: any) => {
          this.id = data.id;
          this.alertNew = true;

          this.temp1 = setTimeout(() => {
            this.alertNew = false;
          }, 2000);

          this.openClouse();
          this.users.id = data.id;
          let users = { ...this.users };
          this.data.push(users);
          this.data.sort((a: { user: string }, b: { user: any }) => {
            if (typeof a.user === "string" && typeof b.user === "string") {
              return a.user.localeCompare(b.user);
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
          this.notRep = true;
          this.temp2 = setTimeout(() => {
            this.notRep = false;
          }, 2000);
          console.error("Error:", error);
        }
      );
    this.change = false;

  }

  openNew(id: any, user: any, password: any, change_password: any, token: any, enabled: any, revoke_date: any) { // Abre Nuevo usuario

    this.users = {
      id: id,
      user: user,
      password: password,
      change_password: change_password,
      token: token,
      enabled: enabled,
      revoke_date: revoke_date
    };

    this.show = true;
    this.openClouse();
  }

  transformPassword(password: string): string {
    return '*'.repeat(password.length);
  }

  /* EDIT */

  editUser(form: any) { // Guardar datos del usuario editado
    if (form.valid) {
      this.http.put(this.postUser, JSON.stringify(this.users), this.httpOptionsService.getHttpOptions())
        .subscribe(
          () => {
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
      this.data.sort((a: any, b: any) => { return a.user - b.user; });
      this.actId = this.users.id;
      this.openEdit();
      this.state = 2;
      this.saveOk = true;

      this.temp3 = setTimeout(() => {
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
    let token = this.storageService.getToken() ?? '';
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
      () => {
        this.alertDelete = true;
        this.temp4 = setTimeout(() => {
          this.alertDelete = false;
        }, 2000);

        this.data = this.data.filter((objeto: { id: any }) => objeto.id != idActual);
        this.clouse();
      },
      (error: any) => {
        console.error('Error al eliminar usuario:', error);
      }
    );
  }

  /* BÚSQUEDA */

  textSearch(event: any) { // Busca por texto
    this.storageService.setSearch(this.searchAuxArray.value)
    this.currentPage = 1;
    clearTimeout(this.temp5);
    var $this = this;
    this.temp5 = setTimeout(() => {
      if (event.keyCode != 13) {
        $this.getUsers(this.order, this.ordAux);
        $this.openClouse();
      }
    }, 500);
  }

  rechargeForm() { // recarga usuario a su valor anterior
    this.users = {
      id: this.usersCopy.id,
      user: this.usersCopy.user,
      password: this.usersCopy.password,
      change_password: this.usersCopy.change_password,
      token: this.usersCopy.token,
      enabled: this.usersCopy.enabled,
      revoke_date: this.usersCopy.revoke_date
    };
    this.change = false;
  }

  revokeUser(idActual: any) { // Quita token del usuario
    let users = {
      id: idActual,
    };
    this.http.post(this.postUserRevoke, JSON.stringify(users), this.httpOptionsService.getHttpOptions())
      .subscribe(
        () => {
          // Respuesta
        },
        (error) => {
          console.error("Error:", error);
        }
      );
    this.state = 2;
    this.saveOk = true;

    this.temp6 = setTimeout(() => {
      this.saveOk = false;
    }, 2000);

    this.saved = true;
    this.change = false;
  }

  deleteSearch() {// Borra texto de busqueda
    this.Page(1);
    this.totalPages = 5;
    this.currentPage = 1;
    this.quantPage = 15;
    this.page = 1;
    this.searchAuxArray.value = "";
    this.storageService.setSearch(this.searchAuxArray.value)
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
    this.actId = -1;
  }

  clouseAll() { // Cierra todas las tarjetas
    this.showAux = false;
    this.show = false;
    this.openClouse();
    this.storageService.setPage(this.currentPage.toString())
    this.change = false;
  }

  resize(): void { // Redimensiona tarjetas
    this.width = window.innerWidth;
  }

  /* PAGINACIÓN */

  firstPage(): void { // Primera pagina
    if (this.currentPage != 1) {
      this.currentPage = 1;
      this.storageService.setPage(this.currentPage.toString())
      this.getUsersVoid();
    }
  }

  previousPage10(): void { // 10 paginas mas
    if (this.currentPage - 10 > 1) {
      this.currentPage = this.currentPage - 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getUsersVoid();
    }
    else {
      this.currentPage = 1;
      this.storageService.setPage(this.currentPage.toString())
      this.getUsersVoid();
    }
  }

  previousPage(): void { // Pagina anterior
    if (this.currentPage > 1) {
      this.currentPage--;
      this.storageService.setPage(this.currentPage.toString())
      this.getUsersVoid();
    }
  }

  Page(num: any): void { // Pagina actual
    this.currentPage = num;
    this.storageService.setPage(this.currentPage.toString())
    this.getUsersVoid();
  }

  nextPage(): void { // Pagina siguiente
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.storageService.setPage(this.currentPage.toString())
      this.getUsersVoid();
    }
  }

  nextPage10(): void { // 10 paginas menos
    if (this.currentPage + 10 < this.totalPages) {
      this.currentPage = this.currentPage + 10;
      this.storageService.setPage(this.currentPage.toString())
      this.getUsersVoid();
    }
    else {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getUsersVoid();
    }
  }

  lastPage(): void { // Ultima pagina
    if (this.currentPage != this.totalPages) {
      this.currentPage = this.totalPages;
      this.storageService.setPage(this.currentPage.toString())
      this.getUsersVoid();
    }
  }

  removeSpaces(event: any) {
    event.target.value = event.target.value.replace(/\s/g, ''); // Esto elimina todos los espacios en blanco
  }

  readStorage() { // Recupera datos en local storage
    let pageString = this.storageService.getPage() ?? "1";
    this.currentPage = parseInt(pageString, 10);
    pageString = this.storageService.getPerPage() ?? "15";
    this.quantPage = parseInt(pageString, 10);
    this.searchAuxArray.value = this.storageService.getSearch() ?? "";
    if (this.searchAuxArray.value != "") {
      //this.searched= true;
      clearTimeout(this.temp1);
      var $this = this;
      this.temp3 = setTimeout(() => {
        $this.getUsers(this.order, this.ordAux);
        $this.openClouse();
      }, 1);
    }
  }
}
