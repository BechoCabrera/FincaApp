import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { FincaService, FincaDto, UpdateFincaDto } from 'src/app/core/services/finca.service';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { signal, computed } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-fincas',
  templateUrl: './fincas.component.html',
  styleUrls: ['./fincas.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Angular Material
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class FincasComponent implements OnInit {
  constructor(private fb: FormBuilder, private fincaService: FincaService) {}

  isSaving = false;
  formOk() {
    return this.form.valid;
  }
  form = this.fb.group({
    codigo: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
  });

  dataSource = new MatTableDataSource<FincaDto>([]);
  displayedColumns = ['idx', 'codigo', 'nombre', 'descripcion', 'acciones'];

  editingId: string | null = null;

  ngOnInit() {
    this.cargarFincas();
    this.form = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
    });
  }

  has(ctrl: string, err: string): boolean {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }

  cargarFincas() {
    this.fincaService.listar().subscribe({
      next: (res) => (this.dataSource.data = res),
    });
  }

  guardarFinca() {
  this.form.markAllAsTouched();
  if (this.form.invalid) return;

  const v = this.form.getRawValue();

  const payload = {
    codigo: v.codigo!,
    nombre: v.nombre!,
    descripcion: v.descripcion || null,
  };

  this.isSaving = true;

  const request$ = this.editingId
    ? this.fincaService.actualizar(this.editingId, payload)
    : this.fincaService.crear(payload);

  request$.subscribe({
    next: (finca) => {
      this.isSaving = false;

      // refrescar tabla
      this.cargarFincas();

      // reset
      this.form.reset();
      this.editingId = null;
    },
    error: (err) => {
      this.isSaving = false;
      console.error('Error guardando finca', err);
    },
  });
}

  editar(f: FincaDto) {
    this.editingId = f.id;
    this.form.patchValue(f);
  }

  actualizar() {
    if (!this.editingId || this.form.invalid) return;

    const v = this.form.getRawValue();

    this.fincaService
      .actualizar(this.editingId, {
        codigo: v.codigo!,
        nombre: v.nombre!,
        descripcion: v.descripcion ?? null,
        isActive: true,
      })
      .subscribe({
        next: (res) => {
          this.dataSource.data = this.dataSource.data.map((x) => (x.id === res.id ? res : x));
          this.editingId = null;
          this.form.reset();
        },
      });
  }

  eliminar(f: FincaDto) {
    if (!confirm(`¿Eliminar finca ${f.nombre}?`)) return;

    this.fincaService.eliminar(f.id).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter((x) => x.id !== f.id);
      },
    });
  }
}
