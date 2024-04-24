import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-script",
  templateUrl: "./script.component.html",
  styleUrls: ["../../app.component.css"],
})

export class ScriptComponent implements OnInit {
  backendStatus: boolean = false; 
  backendURL: string = "http://localhost:3000";

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.checkBackendStatus();
  }

  toggleBackend(status: boolean): void { // ON // OFF //
    this.backendStatus = status;

    if (status) {
      console.log("Encendiendo el backend...");
      this.http.post(this.backendURL + "/on", {}).subscribe(
        () => {
          console.log("Backend encendido exitosamente.");
        },
        (error) => {
          console.error("Error al encender el backend:", error);
        }
      );
    } 
    else {
      console.log("Apagando el backend...");
      this.http.post(this.backendURL + "/off", {}).subscribe(
        () => {
          console.log("Backend apagado exitosamente.");
        },
        (error) => {
          console.error("Error al apagar el backend:", error);
        }
      );
    }
  }

  checkBackendStatus(): void { // STATUS //
    this.http.get<any>(this.backendURL + "/status").subscribe(
      (data) => {
        this.backendStatus = data.enEjecucion;
        console.log("Estado del backend:", this.backendStatus);
      },
      (error) => {
        console.error("Error al obtener el estado del backend:", error);
      }
    );
  }
  
}
