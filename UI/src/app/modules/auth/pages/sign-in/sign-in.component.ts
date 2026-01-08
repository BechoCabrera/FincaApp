import { NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { AuthService } from '../../services/auth.service';
import { SessionService } from 'src/app/core/services/session.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    AngularSvgIconModule,
    NgIf,
    NgClass,
    ButtonComponent,
  ],
})
export class SignInComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  loading = false;
  error?: string;
  passwordTextType = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  // Para usar f['email'], f['password'] en el HTML
  get f() {
    return this.form.controls;
  }

  togglePasswordTextType(): void {
    this.passwordTextType = !this.passwordTextType;
  }

  onSubmit(): void {
    debugger;
    this.submitted = true;
    this.error = undefined;

    if (this.form.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(this.form.value).subscribe({
      next: (res) => {
        // Guardar sesión (token + tenant)
        this.sessionService.setSession({
          userId: res.userId,
          tenantId: res.tenantId,
          token: res.token,
        });

        // Redirigir al dashboard
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.error = 'Credenciales inválidas';
        this.loading = false;
      },
    });
  }
}
