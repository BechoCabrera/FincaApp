import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { AuthRoutingModule } from './auth-routing.module';

// 👇 TODOS SON STANDALONE
import { AuthComponent } from './auth.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { NewPasswordComponent } from './pages/new-password/new-password.component';
import { TwoStepsComponent } from './pages/two-steps/two-steps.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    AngularSvgIconModule.forRoot(),

    // ✅ standalone components SE IMPORTAN
    AuthComponent,
    SignInComponent,
    SignUpComponent,
    ForgotPasswordComponent,
    NewPasswordComponent,
    TwoStepsComponent,
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi())
  ]
})
export class AuthModule {}
