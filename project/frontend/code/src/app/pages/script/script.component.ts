import { Component, OnInit } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: "app-script",
  templateUrl: "./script.component.html",
  styleUrls: ["../../app.component.css"],
})

export class ScriptComponent implements OnInit {
  backendStatus: boolean = false; 
  backendURL: string = "http://localhost:5172/api/script";
  date= '';
  status= '';
  postSensors: string = environment.baseUrl+environment.script;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {

  }

  toggleBackend(status: any): void {
    let status1 = {
      status: status,
    };
    let token = localStorage.getItem('token') ?? ''; 
    const httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json; charset=UTF-8', 'Authorization': `${token}`})};
    this.http.post(this.backendURL+"/script", JSON.stringify(status1), httpOptions).subscribe(
      () => {
        console.log("Solicitud POST enviada exitosamente.");
      },
      (error) => {
        console.error("Error al enviar la solicitud POST:", error);
      }
    );
  }
  
  
}
