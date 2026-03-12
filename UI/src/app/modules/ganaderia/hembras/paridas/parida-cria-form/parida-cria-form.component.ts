import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FincaDto } from 'src/app/core/services/finca.service';

type Genero = 'Hembra' | 'Macho';

export interface CriaDraftDto {
  numero: string | null;
  nombre: string | null;
  fechaNac: string | null;
  color: string | null;
  propietario: string | null;
  pesoKg: number | null;
  fincaId: string | null;
  madreNumero: string | null;
  madreNombre: string | null;
  detalles: string | null;
}

@Component({
  selector: 'app-parida-cria-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './parida-cria-form.component.html',
  styleUrls: ['./parida-cria-form.component.css'],
})
export class ParidaCriaFormComponent implements OnChanges {
  @Input() generoCria!: Genero;
  @Input() madreNumero!: string;
  @Input() madreNombre!: string;
  @Input() madreId: string | null = null;
  @Input() fincaId: string | null = null;
  @Input() fincas: FincaDto[] = [];

  @Output() saved = new EventEmitter<CriaDraftDto>();

  private fb = inject(FormBuilder);

  isSaving = false;

  form = this.fb.group({
    numero: [''],
    nombre: ['', [Validators.required]],
    fechaNac: [null as Date | null],
    color: [''],
    propietario: [''],
    pesoKg: [null as number | null],
    fincaId: [null as string | null, [Validators.required]],
    detalles: [''],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['generoCria']) {
      this.applyGeneroValidators();
    }

    const defaultFincaId = this.fincaId ?? null;
    this.form.patchValue({ fincaId: defaultFincaId }, { emitEvent: false });
  }

  private applyGeneroValidators() {
    const numeroCtrl = this.form.get('numero');
    if (!numeroCtrl) return;

    if (this.generoCria === 'Hembra') {
      numeroCtrl.setValidators([Validators.required]);
    } else {
      numeroCtrl.clearValidators();
      numeroCtrl.setValue('', { emitEvent: false });
    }
    numeroCtrl.updateValueAndValidity({ emitEvent: false });
  }

  private toYmd(date: Date | string | null | undefined) {
    if (!date) return null;
    return date instanceof Date ? date.toISOString().slice(0, 10) : date;
  }

  guardarCria() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    this.isSaving = true;

    // Emit cria data to parent instead of saving separately
    const criaData: CriaDraftDto = {
      numero: values.numero ?? null,
      nombre: values.nombre ?? null,
      fechaNac: this.toYmd(values.fechaNac),
      color: values.color ?? null,
      propietario: values.propietario ?? null,
      pesoKg: values.pesoKg ?? null,
      fincaId: values.fincaId ?? null,
      madreNumero: this.madreNumero ?? null,
      madreNombre: this.madreNombre ?? null,
      detalles: values.detalles ?? null,
    };

    this.isSaving = false;
    this.form.reset({ fincaId: this.fincaId ?? null, numero: '', nombre: '', pesoKg: null, fechaNac: null, color: '', propietario: '', detalles: '' });
    this.saved.emit(criaData);
  }
}
