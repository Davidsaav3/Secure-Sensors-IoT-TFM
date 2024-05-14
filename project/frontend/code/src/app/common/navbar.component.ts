import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { environment } from "../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ViewChild, ElementRef, Renderer2, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { HttpOptionsService } from '../services/httpOptions.service';

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["../app.component.css"],
})

export class NavbarComponent implements OnInit, OnDestroy {

  @ViewChild('confirmDeleteModal2') confirmDeleteModal2!: ElementRef;
  @ViewChild('confirmDeleteModal3') confirmDeleteModal3!: ElementRef;
  @ViewChild('openModalButton') openModalButton: ElementRef | undefined;
  @ViewChild('clouseModalButton') clouseModalButton: ElementRef | undefined;

  deviceConfigurations = environment.rute.deviceConfigurations;
  sensorsTypes = environment.rute.sensorsTypes;
  dataStructure = environment.rute.dataStructure;
  variableDataStructure = environment.rute.variableDataStructure;
  login = environment.rute.login;
  users = environment.rute.users;
  conecctionRead = environment.rute.conecctionRead;
  conecctionWrite = environment.rute.conecctionWrite;
  script = environment.rute.script;
  monitoring = environment.rute.monitoring;

  lengName = environment.languageName;
  lengLang = environment.languageLang;
  activeLang = environment.languageLang[0];
  rute = "";
  isActive: boolean = false;
  ruteAux: any;
  name = "settings"
  change1 = false;
  change2 = false;
  passwordPattern = environment.password_pattern;
  alerts = false;
  change_password = false;
  username = "davidsaav";
  id = 1;
  token = '';
  token2 = '';

  alertPassOk = false;
  alertUserOk = false;
  alertPassNot = false;
  alertUserNot = false;
  contador = 0;

  postUser: string = environment.domain + environment.baseUrl + environment.url.users;
  getScriptStatus: string = environment.domain + environment.baseUrl + environment.url.script + '/script-status';

  but = false;
  changed = false;
  scriptEnable = false;

  status = 2;
  date = '';

  temp1: any;
  temp2: any;
  temp3: any;
  temp4: any;
  temp5: any;
  temp6: any = null;
  temp7: any = null;

  formapassword = {
    id: this.id,
    password: "",
  };

  formuserdata = {
    id: this.id,
    user: "",
  };

  constructor(private httpOptionsService: HttpOptionsService, private storageService: StorageService, public authService: AuthService, private renderer: Renderer2, private http: HttpClient, private translate: TranslateService, public router: Router) {
    this.rute = this.router.routerState.snapshot.url;
    this.ruteAux = this.rute.split("/");
  }

  passwordFieldType = 'password';
  passwordFieldType1 = 'password';
  consecutivoFallos1 = 0;
  consecutivoFallos2 = 0;

  ngOnInit(): void { // Inicializa
    if (this.authService.isAuthenticated()) {
      if (environment.verbose) console.log("IDENTIFICADO")
      this.lanzarTimer();
    }
    if (this.storageService.getStatus()) {
      let aux = this.storageService.getStatus();

      if (aux != null)
        this.status = parseInt(aux, 10);
    }
    else {
      this.status = 2;
    }

    if (this.storageService.getDate()) {
      let storedDate = this.storageService.getDate();
      if (storedDate !== null) {
        this.date = storedDate;
      }
    }
    else {
      this.date = '';
    }

    this.readStorage();
    this.translate.use(this.activeLang);
    if (!this.authService.isAuthenticated()) {
      this.token2 = '';
    }
  }

  ngOnDestroy() {
    if (this.temp1 != null)
      clearTimeout(this.temp1);
    if (this.temp2 != null)
      clearTimeout(this.temp2);
    if (this.temp3 != null)
      clearTimeout(this.temp3);
    if (this.temp4 != null)
      clearTimeout(this.temp4);
    if (this.temp5 != null)
      clearTimeout(this.temp5);
    if (this.temp6 != null)
      clearTimeout(this.temp6);
    if (this.temp7 != null)
      clearTimeout(this.temp7);
  }

  togglePasswordType() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  togglePasswordType1() {
    this.passwordFieldType1 = this.passwordFieldType1 === 'password' ? 'text' : 'password';
  }

  ngAfterViewInit() {
    this.temp1 = setTimeout(() => {
      if (this.change_password) {
        this.openModal();
      }
    });
  }

  openModal() {
    if (this.openModalButton != null) {
      this.renderer.selectRootElement(this.openModalButton.nativeElement).click();
    }
  }

  clouseModal() {
    if (this.clouseModalButton != null) {
      this.renderer.selectRootElement(this.clouseModalButton.nativeElement).click();
    }
  }

  clouseModalUser() {
    if (this.clouseModalButton != null) {
      this.renderer.selectRootElement(this.clouseModalButton.nativeElement).click();
    }
  }

  setBackdropAttribute(): void {
    const modal = document.getElementById('confirmDeleteModal2');
    if (modal) {
      if (this.change_password) {
        modal.setAttribute('data-bs-backdrop', 'static');

        //modal.classList.add('show');
        //const modalInstance = new bootstrap.Modal(modal);
        //modalInstance.show();
      }
      else {
        modal.removeAttribute('data-bs-backdrop');

        //modal.classList.remove('show');
        //const modalInstance = new bootstrap.Modal(modal);
        //modalInstance.hide();
      }
    }
  }

  isActiveOption(option: boolean): boolean {
    return option;
  }

  changeLanguage() { // Cambia lenguaje
    this.saveStorage();
    this.translate.use(this.activeLang);
  }

  onOptionSelected(event: any): void {
    const selectedOption = event.target.value;
    if (selectedOption === '1') {

    }
    if (selectedOption === '2') {
      this.router.navigate(['/login']);
    }
  }

  changeUser(form: any) { // Editar perfil
    this.formuserdata.id = this.id;

    this.http.put(this.postUser, JSON.stringify(this.formuserdata), this.httpOptionsService.getHttpOptions())
      .subscribe(
        (data: any) => {
          this.alertUserOk = true;
          //this.clouseModalUser();
          if (environment.verbose) console.log(data.user)
          this.setCookie('refresh_token', data.refresh_token);
          this.storageService.setUsername(data.user);

          this.temp2 = setTimeout(() => {
            this.alertUserOk = false;
          }, 2000);
        },
        (error) => {
          if (environment.verbose_error) console.error("Error:", error);
          this.alertUserNot = true;
          this.temp3 = setTimeout(() => {
            this.alertUserNot = false;
          }, 2000);
        }
      );
    this.change1 = false;
    //}
  }

  changePassword(form: any) { // Cambiar contraseña  
    if (form.valid) {
      this.formapassword.id = this.id;

      this.http.put(this.postUser, JSON.stringify(this.formapassword), this.httpOptionsService.getHttpOptions())
        .subscribe(
          (data: any) => {
            this.alertPassOk = true;
            this.temp3 = setTimeout(() => {
              this.alertPassOk = false;
            }, 2000);
            this.change_password = false;

            this.storageService.setChange("0");
            //this.clouseModal();


          },
          (error) => {
            this.change_password = false;
            this.storageService.setChange("0");

            if (environment.verbose_error) console.error("Error:", error);

            this.alertPassNot = true;
            this.temp5 = setTimeout(() => {
              this.alertPassNot = false;
            }, 2000);
          }
        );
      this.change1 = false;
    }
  }


  saveStorage() { // Guarda datos en el local storage
    this.storageService.setLang(this.activeLang);
  }

  readStorage() { // Recupera datos del local storage
    const idString: string | null = this.storageService.getId();
    const id: number = idString !== null ? parseInt(idString) : 1;
    this.id = id;
    this.username = this.storageService.getUsername() ?? '';
    this.activeLang = this.storageService.getLang() ?? 'es';
    this.token = this.storageService.getToken() ?? '';
    this.token2 = this.storageService.getToken() ?? '';
    const storedValue = this.storageService.getChange();
    this.change_password = storedValue !== null ? this.parseBool(storedValue) : false;
    if (this.change_password) {
      this.setBackdropAttribute();
    }
    this.formuserdata.user = this.username;
  }

  parseBool(str: any): boolean {
    let dev = false;
    if (str == 1) {
      dev = true;
    }
    if (str == 0) {
      dev = false;
    }
    return dev;
  }

  removeSpaces(event: any) {
    event.target.value = event.target.value.replace(/\s/g, '');
  }


  lanzarTimer() { // Timer para actualizar el estado del script
    if (environment.verbose) console.log("LANZAR TIMER")
    this.consecutivoFallos1 = 0;
    const bucle = (t: number) => {
      if (this.consecutivoFallos1 < environment.script_status_times) {
        this.temp6 = setTimeout(() => {
          this.statusScript().then(() => {
            this.consecutivoFallos1 = 0;
          }).catch(() => {
            this.consecutivoFallos1++;
          }).finally(() => {
            if (this.consecutivoFallos1 > 0) {
              bucle(0);
            }
            else {
              bucle(environment.script_status_timeout);
            }
          });
        }, t);
      }
      else {
        this.status = 2;
      }
    };
    bucle(0);
  }


  async statusScript(): Promise<void> {
    try {
      const data = await this.http.get<any>(this.getScriptStatus, this.httpOptionsService.getHttpOptions()).toPromise();
      this.contador = 0;
      this.date = data.date;

      // Fecha actual es +5 se, el estado es 1
      this.status = (new Date(this.date).getTime() + environment.script_status_timeout + 1000) >= Date.now() ? 1 : 0;

      this.storageService.setStatus(this.status.toString());
      this.storageService.setDate(this.date.toString());
    }
    catch (error) {
      if (environment.verbose_error) console.error("Error al obtener el estado:", error);
      throw error;
    }
  }


  setCookie(name: string, value: string, days: number = 7): void {  // Guardar cookie
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    const cookieString = `${name}=${value};expires=${expirationDate.toUTCString()};path=/`;
    document.cookie = cookieString;
  }

}
