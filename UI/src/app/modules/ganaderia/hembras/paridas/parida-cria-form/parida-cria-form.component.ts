import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CriaHembrasService, CreateCriaHembraDto } from 'src/app/core/services/cria-hembras.service';
import { CriaMachosService, CreateCriaMachoDto } from 'src/app/core/services/cria-machos.service';
import { FincaDto } from 'src/app/core/services/finca.service';
import { NotificationService } from 'src/app/core/services/notification.service';

type Genero = 'Hembra' | 'Macho';

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

  @Output() saved = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private criaHembrasService = inject(CriaHembrasService);
  private criaMachosService = inject(CriaMachosService);
  private notify = inject(NotificationService);

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

    if (this.generoCria === 'Hembra') {
      const payload: CreateCriaHembraDto = {
        numero: String(values.numero ?? ''),
        nombre: String(values.nombre ?? ''),
        fechaNac: this.toYmd(values.fechaNac),
        color: values.color ?? null,
        propietario: values.propietario ?? null,
        pesoKg: values.pesoKg ?? null,
        fincaId: values.fincaId ?? null,
        madreNumero: this.madreNumero ?? null,
        madreNombre: this.madreNombre ?? null,
        detalles: values.detalles ?? null,
      };

      this.criaHembrasService.create(payload).subscribe({
        next: () => {
          this.isSaving = false;
          this.form.reset({ fincaId: this.fincaId ?? null, numero: '', nombre: '', pesoKg: null, fechaNac: null, color: '', propietario: '', detalles: '' });
          this.saved.emit();
        },
        error: (err) => {
          this.isSaving = false;
          this.notify.error(err?.error?.message ?? 'No se pudo guardar la cría hembra');
        },
      });
      return;
    }

    const payload: CreateCriaMachoDto = {
      nombre: String(values.nombre ?? ''),
      fechaNac: this.toYmd(values.fechaNac),
      color: values.color ?? null,
      propietario: values.propietario ?? null,
      pesoKg: values.pesoKg ?? null,
      fincaId: values.fincaId ?? null,
      madreId: this.madreId ?? null,
      madreNumero: this.madreNumero ?? null,
      madreNombre: this.madreNombre ?? null,
      detalles: values.detalles ?? null,
    };

    this.criaMachosService.create(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.form.reset({ fincaId: this.fincaId ?? null, numero: '', nombre: '', pesoKg: null, fechaNac: null, color: '', propietario: '', detalles: '' });
        this.saved.emit();
      },
      error: (err) => {
        this.isSaving = false;
        this.notify.error(err?.error?.message ?? 'No se pudo guardar la cría macho');
      },
    });
  }
}
