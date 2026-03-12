import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GanaderiaRoutingModule } from './ganaderia-routing.module';

import { ParidasComponent } from './hembras/paridas/paridas.component';
import { EscoteraComponent } from './hembras/escotera/escotera.component';
import { CriasHembrasComponent } from './hembras/crias-hembras/crias-hembras.component';
import { TorosComponent } from './machos/toros/toros.component';
import { CriasMachosComponent } from './machos/crias-machos/crias-machos.component';
import { VendidaComponent } from './vendida/vendida.component';
import { FallecidaComponent } from './fallecida/fallecida.component';

@NgModule({
  imports: [
    CommonModule,
    GanaderiaRoutingModule,

    // Importar componentes standalone aquí:
    ParidasComponent,
    EscoteraComponent,
    CriasHembrasComponent,
    TorosComponent,
    CriasMachosComponent
    ,VendidaComponent,
    FallecidaComponent
  ]
})
export class GanaderiaModule {}
