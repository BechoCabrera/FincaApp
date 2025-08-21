import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
// import { CardModule } from 'primeng/card';
// Angular Material
import { MatFormFieldModule }   from '@angular/material/form-field';
import { MatInputModule }       from '@angular/material/input';
import { MatRadioModule }       from '@angular/material/radio';
import { MatCheckboxModule }    from '@angular/material/checkbox';
import { MatSelectModule }      from '@angular/material/select';
import { MatButtonModule }      from '@angular/material/button';
import { MatDatepickerModule }  from '@angular/material/datepicker';
import { MatNativeDateModule }  from '@angular/material/core';
import { MatIconModule }        from '@angular/material/icon';
import { MatDividerModule }     from '@angular/material/divider';
import { MatCardModule }        from '@angular/material/card';

type SexoCria = 'Hembra' | 'Macho';
type TipoParto = 'Normal' | 'Asistido' | 'Cesárea';
type Servicio = 'Monta Natural' | 'Inseminación';

@Component({
  selector: 'app-paridas',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatIconModule, MatButtonModule,
    MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule, MatDividerModule,
    MatCardModule, MatRadioModule, MatCheckboxModule, MatSelectModule
  ],
  templateUrl: './paridas.component.html',
  styleUrls: ['./paridas.component.css'],
})
export class ParidasComponent {
  private fb = inject(FormBuilder);

  /** Formulario de Vacas Paridas */
  paridasForm = this.fb.group({
    // Identificación de la vaca
    cowId:         ['', [Validators.required]],              // ID interno
    earTag:        ['', [Validators.required]],              // Arete / chapeta
    breed:         [''],                                     // Raza
    lactationNo:   [1,  [Validators.required, Validators.min(1)]], // Nº lactancia/paridad
    paddock:       [''],                                     // Potrero/Ubicación

    // Evento de parto
    calvingDate:   [null as Date | null, [Validators.required]],
    typeOfCalving: ['Normal' as TipoParto, Validators.required],
    twins:         [false],
    retainedPlacenta: [false],
    complications: [''],           // Texto libre (metritis, mastitis periparto, etc.)

    // Cría
    calfSex:       ['Hembra' as SexoCria, Validators.required],
    calfAlive:     [true, Validators.required],
    calfWeightKg:  [null as number | null, [Validators.min(10), Validators.max(60)]],

    // Salud / atención
    vetAttention:  [false],
    bcs:           [3, [Validators.min(1), Validators.max(5)]], // Condición corporal (1–5)

    // Producción y reproducción
    startMilkLiters:        [null as number | null, [Validators.min(0)]],
    serviceType:            ['Inseminación' as Servicio],
    bullOrSireId:           [''], // toro ó pajilla
    postpartumServiceDate:  [null as Date | null],

    // Otros
    notes:         [''],
  });

  isSaving = signal(false);
  canSubmit = computed(() => this.paridasForm.valid && !this.isSaving());

  submit() {
    if (this.paridasForm.invalid) { this.paridasForm.markAllAsTouched(); return; }
    this.isSaving.set(true);
    // Aquí llamarías a tu servicio HTTP
    setTimeout(() => this.isSaving.set(false), 600);
  }

  // Helpers para mostrar errores
  hasError(ctrl: string, err: string) {
    const c = this.paridasForm.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }
}
