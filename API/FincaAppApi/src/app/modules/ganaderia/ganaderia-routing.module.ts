import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ParidasComponent } from './hembras/paridas/paridas.component';
import { EscoteraComponent } from './hembras/escotera/escotera.component';
import { CriasHembrasComponent } from './hembras/crias-hembras/crias-hembras.component';
import { TorosComponent } from './machos/toros/toros.component';
import { CriasMachosComponent } from './machos/crias-machos/crias-machos.component';
import { ProximasComponent } from './hembras/proximas/proximas.component';
import { RecriasHembrasComponent } from './hembras/recrias-hembras/recrias-hembras.component';
import { ToretesComponent } from './machos/toretes/toretes.component';
import { RecriasMachosComponent } from './machos/recrias-machos/recrias-machos.component';
import { NovillasVientreComponent } from './hembras/novillas-vientre/novillas-vientre.component';
import { VendidaComponent } from './vendida/vendida.component';
import { FallecidaComponent } from './fallecida/fallecida.component';

const routes: Routes = [
  { path: 'hembras/paridas', component: ParidasComponent },
  { path: 'hembras/escotera', component: EscoteraComponent },
  { path: 'hembras/proximas', component: ProximasComponent },
  { path: 'hembras/crias-hembra', component: CriasHembrasComponent },
  { path: 'hembras/recrias-hembras', component: RecriasHembrasComponent },
  { path: 'hembras/novillas-vientre', component: NovillasVientreComponent },
  { path: 'machos/toros', component: TorosComponent },
  { path: 'machos/crias-macho', component: CriasMachosComponent },
  { path: 'machos/toretes', component: ToretesComponent },
  { path: 'machos/recrias-macho', component: RecriasMachosComponent },
  { path: 'vendida', component: VendidaComponent },
  { path: 'fallecida', component: FallecidaComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GanaderiaRoutingModule {}
