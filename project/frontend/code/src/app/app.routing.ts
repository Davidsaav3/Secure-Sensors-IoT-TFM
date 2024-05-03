import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeviceComponent } from './pages/device.component';
import { SensorsComponent } from './pages/sensors/sensors.component';
import { StructureComponent } from './pages/structure/structure.component';
import { VariableStructureComponent } from './pages/variable-structure/variable-structure.component';
import { environment } from '../app/environments/environment';

const routes: Routes = [
  {
    path: environment.rute.deviceConfigurations, component: DeviceComponent
  },
  {
    path: environment.rute.sensorsTypes, component: SensorsComponent
  },
  {
    path: environment.rute.dataStructure, component: StructureComponent
  },
  {
    path: environment.rute.variableDataStructure, component: VariableStructureComponent
  },
  {
    path: '**',
    redirectTo: environment.rute.deviceConfigurations
  },
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
