import { Component } from '@angular/core';
import { environment } from "../environments/environment";

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['../app.component.css']
})

export class DeviceComponent {
  constructor() { }
  AppVersion = environment.AppVersion;
}
