// import { NgModule } from '@angular/core';
// import { RouterModule, Routes } from '@angular/router';
// import { DashboardComponent } from './dashboard.component';
// import { NftComponent } from './pages/nft/nft.component';

// const routes: Routes = [
//   {
//     path: '',
//     component: DashboardComponent,
//     children: [
//       { path: '', redirectTo: 'nfts', pathMatch: 'full' },
//       { path: 'nfts', component: NftComponent },
//       { path: '**', redirectTo: 'errors/404' },
//     ],
//   },
// ];

// @NgModule({
//   imports: [RouterModule.forChild(routes)],
//   exports: [RouterModule],
// })
// export class DashboardRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./dashboard.component').then(m => m.DashboardComponent),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
