import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeviceComponent } from './pages/device.component';
import { SensorsComponent } from './pages/sensors/sensors.component';
import { EstructureComponent } from './pages/estructure/estructure.component';

const routes: Routes = [
  {
    path:'devices', component: DeviceComponent
  },
  { 
    path:'sensors', component: SensorsComponent
  },
  { 
    path:'estructure', component: EstructureComponent
  },
  {
    path:'**',
    redirectTo: 'devices'
  },
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }
