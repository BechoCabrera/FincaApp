import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ParidasComponent } from './hembras/paridas/paridas.component';
import { EscoteraComponent } from './hembras/escotera/escotera.component';
import { CriasHembrasComponent } from './hembras/crias-hembras/crias-hembras.component';
import { TorosComponent } from './machos/toros/toros.component';
import { CriasMachosComponent } from './machos/crias-machos/crias-machos.component';

const routes: Routes = [
  { path: 'hembras/paridas', component: ParidasComponent },
  { path: 'hembras/escotera', component: EscoteraComponent },
  { path: 'hembras/crias', component: CriasHembrasComponent },
  { path: 'machos/toros', component: TorosComponent },
  { path: 'machos/crias', component: CriasMachosComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GanaderiaRoutingModule {}
