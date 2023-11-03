import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeviceComponent } from './pages/device.component';
import { SensorsComponent } from './pages/sensors/sensors.component';
import { StructureComponent } from './pages/structure/structure.component';
import { VariableStructureComponent } from './pages/variable-structure/variable-structure.component';

const routes: Routes = [
  {
    path:'devices', component: DeviceComponent
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
    path:'**',
    redirectTo: 'devices'
  },
]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})

export class AppRoutingModule { }
