import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DeviceComponent } from './pages/device.component';
import { DevicesNewEditComponent } from './pages/devices-new-edit/devices-new-edit.component';
import { DevicesComponent } from './pages/devices/devices.component';
import { SensorsComponent } from './pages/sensors/sensors.component';
import { StructureComponent } from './pages/structure/structure.component';
import { VariableStructureComponent } from './pages/variable-structure/variable-structure.component';

import { UsersComponent } from './pages/users/users.component';
import { CredentialsComponent } from './pages/credentials/credentials.component';
import { ScriptComponent } from './pages/script/script.component';
import { MonitoringComponent } from './pages/monitoring/monitoring.component';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  {
    path:'devices', component: DeviceComponent,
    children: [
      {
        path: '',
        component: DevicesComponent
      },
      {
        path: 'duplicate',
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
    path:'structure', component: StructureComponent
  },
  { 
    path:'variable-structure', component: VariableStructureComponent
  },
  { 
    path:'login', component: LoginComponent
  },
  { 
    path:'users', component: UsersComponent
  },
  { 
    path:'credentials', component: CredentialsComponent
  },
  { 
    path:'script', component: ScriptComponent
  },
  { 
    path:'monitoring', component: MonitoringComponent
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
