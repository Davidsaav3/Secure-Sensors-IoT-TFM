import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgSelectModule } from "@ng-select/ng-select";

import { NavbarComponent } from './common/navbar.component';
import { DevicesComponent } from './pages/devices/devices.component';
import { DevicesMapComponent } from './pages/devices-new-edit/devices-map/devices-map.component';
import { DeviceComponent } from './pages/device.component';
import { StructureComponent } from './pages/structure/structure.component';
import { VariableStructureComponent } from './pages/variable-structure/variable-structure.component';
import { DevicesNewEditComponent } from './pages/devices-new-edit/devices-new-edit.component';
import { SensorsComponent } from './pages/sensors/sensors.component';
import { DataSharingService } from './services/data_sharing.service';

import { UsersComponent } from './pages/users/users.component';
import { CredentialsComponent } from './pages/credentials/credentials.component';
import { ScriptComponent } from './pages/script/script.component';
import { MonitoringComponent } from './pages/monitoring/monitoring.component';
import { LoginComponent } from './pages/login/login.component';


@NgModule({
  declarations: [
    DevicesMapComponent,
    AppComponent,
    NavbarComponent,
    DevicesComponent,
    SensorsComponent,
    DevicesNewEditComponent,
    DeviceComponent,
    StructureComponent,
    VariableStructureComponent,
    UsersComponent,
    CredentialsComponent,
    ScriptComponent,
    MonitoringComponent,
    LoginComponent
  ],
  imports: [
    NgSelectModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => {
          return new TranslateHttpLoader(http);
        },
        deps: [ HttpClient ]
      }
    })
  ],
  providers: [DataSharingService,],
  bootstrap: [AppComponent]
})

export class AppModule { }
