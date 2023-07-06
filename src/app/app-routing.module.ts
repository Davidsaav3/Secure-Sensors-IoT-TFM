import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DeviceComponent } from './pages/device.component';
import { DevicesNewEditComponent } from './pages/devices/devices-new-edit/devices-new-edit.component';
import { DevicesComponent } from './pages/devices/devices.component';
import { SensorsComponent } from './pages/sensors/sensors.component';

const routes: Routes = [
  {
    path:'devices', component: DeviceComponent,
    children: [
      {
        path: '',
        component: DevicesComponent
      },
      {
        path: 'new',
        children: [
          {
            path: ':id',
            component: DevicesNewEditComponent
          },
          {
            path: '**',
            component: DevicesNewEditComponent
          }
        ]
      },
      {
        path: 'edit',
        children: [
          {
            path: ':id',
            component: DevicesNewEditComponent
          },
          {
            path: '**',
            component: DeviceComponent
          }
        ]
      },
      {
        path: '**',
        component: DeviceComponent
      },
    ]
  },
  { 
    path:'sensors', component: SensorsComponent
  },
  {
    path:'**',
    redirectTo: 'devices'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
