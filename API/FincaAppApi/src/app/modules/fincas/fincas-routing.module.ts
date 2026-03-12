import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FincasComponent } from './pages/fincas/fincas.component';

const routes: Routes = [
  {
    path: '',
    component: FincasComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FincasRoutingModule {}
