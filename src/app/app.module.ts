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
import { EstructureComponent } from './pages/estructure/estructure.component';
import { VariableEstructureComponent } from './pages/variable-structure/variable-estructure.component';
import { DevicesNewEditComponent } from './pages/devices-new-edit/devices-new-edit.component';
import { SensorsComponent } from './pages/sensors/sensors.component';
import { SensorsListComponent } from './pages/devices-new-edit/sensors-list/sensors-list.component';
import { DataSharingService } from './services/data_sharing.service';

@NgModule({
  declarations: [
    DevicesMapComponent,
    AppComponent,
    NavbarComponent,
    DevicesComponent,
    SensorsListComponent,
    SensorsComponent,
    DevicesNewEditComponent,
    DeviceComponent,
    EstructureComponent,
    VariableEstructureComponent,
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
