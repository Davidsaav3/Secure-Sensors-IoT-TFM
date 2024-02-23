import { Component, ElementRef, OnInit, HostListener } from "@angular/core";
import { environment } from "../../environments/environment";
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: "app-sensors",
  templateUrl: "./login.component.html",
  styleUrls: ["../../app.component.css"],
})

export class LoginComponent {
  
  registerForm2: FormGroup = this.formBuilder.group({
    fa: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });
  registerForm: FormGroup = this.formBuilder.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  cont: any= 0;
  mostrar: any= false;
  mostrar2: any= false;
  mostrar3: any= false;
  mostrar4: any= false;
  mostrar5: any= false;
  fa: string | undefined;
  username= '';

  constructor(private authService:AuthService, private formBuilder: FormBuilder, private router: Router, private http: HttpClient) { }

  get registerFormControl() {
    return this.registerForm.controls;
  }

  login() {
    if (this.registerForm.valid) {
      console
      const url = 'https://proteccloud.000webhostapp.com/login.php';
      const body = { 
        username: this.registerForm.get('username')?.value, 
        password: this.registerForm.get('password')?.value 
      };
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      };
      this.http.post(url, JSON.stringify(body), httpOptions)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            //console.error('Error del lado del cliente:', error.error.message);
          } 
          else {
            if(error.status==200){
              this.username = this.registerForm.get('username')?.value;
              this.mostrar= true;
            }
          }
          return throwError('Algo salió mal; inténtalo de nuevo más tarde.');
        })
      )
      .subscribe(
        (response: any) => {
          if(response.code==100 || response.code==200){
            this.username = this.registerForm.get('username')?.value;
            this.mostrar= true;
          }
          if(response.code==400){
            this.mostrar2= true;
          }
          if(response.code==401){
            this.mostrar4= true;
          }
        },
        (error: any) => {
          //console.error('Error de solicitud:', error);
        }
      );
    }
    else{
      this.registerForm.markAllAsTouched();
    }
}

  comp() {
    this.cont++;
    if (this.registerForm2.valid && this.cont<3) {
      console
      const url = 'https://proteccloud.000webhostapp.com/code.php';
      const body = { 
        username: this.registerForm.get('username')?.value, 
        fa: this.registerForm2.get('fa')?.value, 
      };
      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/x-www-form-urlencoded'
        })
      };
      this.http.post(url, JSON.stringify(body), httpOptions)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {

          } 
          else {
            if(error.status==200){
              localStorage.setItem('username', this.username);
              this.authService.setAuthenticated(true);
              this.router.navigate(['/home']);
            }
          }
          return throwError('Algo salió mal; inténtalo de nuevo más tarde.');
        })
      )
      .subscribe(
          (response: any) => {
              if(response.code==100){
                localStorage.setItem('username', this.username);
                this.authService.setAuthenticated(true);
                this.router.navigate(['/home']);
              }
              if(response.code==400){
                this.mostrar3= true;
              }
          },
          (error: any) => {
              //console.error('Error de solicitud:', error);
          }
      );
    }
    else{
      this.registerForm.markAllAsTouched();
    }
    if(this.cont>=3){
      this.mostrar5= true;
      this.mostrar3= false;
      setTimeout(() => {
        this.router.navigate(['/register']);
      }, 2000);
      this.cont= 0;
    }
  }
}
