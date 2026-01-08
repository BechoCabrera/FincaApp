import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('../dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'components',
        loadChildren: () =>
          import('../uikit/uikit.module').then(m => m.UikitModule),
      },
      {
        path: 'ganaderia',
        loadChildren: () =>
          import('../ganaderia/ganaderia.module').then(m => m.GanaderiaModule),
      },
      {
        path: 'fincas',
        loadChildren: () =>
          import('../fincas/fincas.module').then(m => m.FincasModule),
      },
    ],
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LayoutRoutingModule {}
