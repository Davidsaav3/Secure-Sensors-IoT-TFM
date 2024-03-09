import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

import { DeviceComponent } from './pages/device.component';
import { DevicesNewEditComponent } from './pages/devices-new-edit/devices-new-edit.component';
import { DevicesComponent } from './pages/devices/devices.component';
import { SensorsComponent } from './pages/sensors/sensors.component';
import { StructureComponent } from './pages/structure/structure.component';
import { VariableStructureComponent } from './pages/variable-structure/variable-structure.component';

import { UsersComponent } from './pages/users/users.component';
import { ConecctionWriteComponent } from './pages/conecction-write/conecction-write.component';
import { ConecctionReadComponent } from './pages/conecction-read/conecction-read.component';
import { ScriptComponent } from './pages/script/script.component';
import { MonitoringComponent } from './pages/monitoring/monitoring.component';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  {
    path:'devices', component: DeviceComponent, canActivate: [AuthGuard] ,
    children: [
      {
        path: '',
        component: DevicesComponent, canActivate: [AuthGuard] 
      },
      {
        path: 'duplicate',
        children: [
          {
            path: ':id',
            component: DevicesNewEditComponent, canActivate: [AuthGuard] 
          },
          {
            path: '**',
            component: DevicesNewEditComponent, canActivate: [AuthGuard] 
          }
        ]
      },
      {
        path: 'new',
        children: [
          {
            path: ':id',
            component: DevicesNewEditComponent, canActivate: [AuthGuard] 
          },
          {
            path: '**',
            component: DevicesNewEditComponent, canActivate: [AuthGuard] 
          }
        ]
      },
      {
        path: 'edit',
        children: [
          {
            path: ':id',
            component: DevicesNewEditComponent, canActivate: [AuthGuard] 
          },
          {
            path: '**',
            component: DeviceComponent, canActivate: [AuthGuard] 
          }
        ]
      },
      {
        path: '**',
        component: DeviceComponent, canActivate: [AuthGuard] 
      },
    ]
  },
  { 
    path:'sensors', component: SensorsComponent, canActivate: [AuthGuard] 
  },
  { 
    path:'structure', component: StructureComponent, canActivate: [AuthGuard] 
  },
  { 
    path:'variable-structure', component: VariableStructureComponent, canActivate: [AuthGuard] 
  },
  { 
    path:'login', component: LoginComponent
  },
  { 
    path:'users', component: UsersComponent, canActivate: [AuthGuard] 
  },
  { 
    path:'conecction-read', component: ConecctionReadComponent, canActivate: [AuthGuard] 
  },
  { 
    path:'conecction-write', component: ConecctionWriteComponent, canActivate: [AuthGuard] 
  },
  { 
    path:'script', component: ScriptComponent, canActivate: [AuthGuard] 
  },
  { 
    path:'monitoring', component: MonitoringComponent, canActivate: [AuthGuard] 
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
