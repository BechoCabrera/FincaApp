import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

// import { CardModule } from 'primeng/card';
// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

type Genero = 'Hembra' | 'Macho';
type TipoLeche = 'Cría' | 'Venta' | 'Autoconsumo';

@Component({
  selector: 'app-paridas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatCardModule,
    MatRadioModule,
    MatCheckboxModule,
    MatSelectModule,
  ],
  templateUrl: './paridas.component.html',
  styleUrls: ['./paridas.component.css'],
})
export class ParidasComponent {
  private fb = inject(FormBuilder);
  submitted = false;
  // Opciones (ejemplo; luego las cargarás desde tu API)
  fincas = [
    { id: 'F1', nombre: 'Finca La Esperanza' },
    { id: 'F2', nombre: 'Finca San Miguel' },
    { id: 'F3', nombre: 'Finca El Progreso' },
  ];
  tiposLeche: TipoLeche[] = ['Cría', 'Venta', 'Autoconsumo'];

  form = this.fb.group({
    numero: ['', [Validators.required]], // Número (ID/Arete)
    nombre: ['', [Validators.required]],
    fechaNac: [null as Date | null], // opcional si no lo tienes
    color: [''],
    procedencia: [''],
    propietario: [''],

    fechaParto: [null as Date | null, [Validators.required]],
    fincaId: [null as string | null, [Validators.required]],
    genero: ['Hembra' as Genero, [Validators.required]],

    detalles: [''],
    tipoLeche: [null as TipoLeche | null], // opcional
  });

  isSaving = signal(false);
  canSubmit = computed(() => this.form.valid && !this.isSaving());

  has(ctrl: string, err: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);

    // TODO: reemplazar por tu servicio HTTP
    const payload = this.form.value;
    console.log('Guardar vaca parida:', payload);

    setTimeout(() => this.isSaving.set(false), 600);
  }
}
