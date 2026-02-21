import { Component, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TableFiltersComponent } from 'src/app/shared/components/table-filters/table-filters.component';
// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';

import { debounceTime, startWith } from 'rxjs';
import { MatCardAvatar } from "@angular/material/card";
import { CriaHembrasService, CreateCriaHembraDto, CriaHembraDto } from 'src/app/core/services/cria-hembras.service';
import { FincaService } from 'src/app/core/services/finca.service';
import { ParidaService } from 'src/app/core/services/parida.service';

export interface CriaHembra {
  id?: string;
  numero: string;
  nombre: string;
  fechaNac?: Date | null;
  color?: string | null;
  propietario?: string | null;
  pesoKg?: number | null;

  // relaciones
  fincaId: string | null;
  madreNumero?: string | null;
  madreNombre?: string | null;

  detalles?: string | null;
}

@Component({
  selector: 'app-crias-hembras',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    // Material
    MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule, MatDividerModule, MatSelectModule,
    MatTableModule, MatPaginatorModule, MatSortModule, MatTooltipModule,
    MatMenuModule, MatCheckboxModule,
    // shared
    TableFiltersComponent,
],
  providers: [DatePipe],
  templateUrl: './crias-hembras.component.html',
  styleUrls: ['./crias-hembras.component.css'],
})
export class CriasHembrasComponent {
  private fb = inject(FormBuilder);
  private date = inject(DatePipe);
  constructor(
    private criaService: CriaHembrasService,
    private fincaService: FincaService,
    private paridaService: ParidaService,
    private snack: MatSnackBar
  ) {}

  // ===== fincas desde API =====
  fincas = [
    { id: 'F1', nombre: 'Tierra Nueva' },
    { id: 'F2', nombre: 'La Más Nueva' },
    { id: 'F3', nombre: 'San Antonio' },
  ];

  // catálogo de madres (solo de ejemplo)
  madres = [
    { numero: '101', nombre: 'Estrella' },
    { numero: '205', nombre: 'Canela' },
    { numero: '309', nombre: 'Luna' },
  ];

  // ===== formulario =====
  form = this.fb.group({
    numero: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    fechaNac: [null as Date | null],
    color: [''],
    propietario: [''],
    pesoKg: [null as number | null],
    fincaId: [null as string | null, [Validators.required]],
    madreNumero: [null as string | null],
    detalles: [''],
  });

  isSaving = signal(false);
  formOk = signal(false);
  canSubmit = computed(() => this.form.valid && !this.isSaving());
  private editingId: string | null = null;

  has(ctrl: string, err: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }

  // ===== tabla =====
  displayedColumns: string[] = [
    'numero',
    'nombre',
    'fechaNac',
    'color',
    'pesoKg',
    'propietario',
    'madreNumero',
    'madreNombre',
    'detalles',
    'acciones',
  ];

  dataSource = new MatTableDataSource<CriaHembra>([]);

  allColumns = [
    { key: 'idx', label: 'N°' },
    { key: 'numero', label: 'Nº' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'fechaNac', label: 'F. Nacimiento' },
    { key: 'color', label: 'Color' },
    { key: 'pesoKg', label: 'Peso (kg)' },
    { key: 'propietario', label: 'Propietario' },
    { key: 'madreNumero', label: 'N° Madre' },
    { key: 'madreNombre', label: 'Madre' },
    { key: 'detalles', label: 'Detalles' },
    { key: 'acciones', label: 'Acciones' },

  ];

  private colLabel(key: string) {
    return this.allColumns.find(c => c.key === key)?.label ?? key;
  }
  // filtros
  qCtrl = new FormControl<string>('', { nonNullable: true });
  fincaCtrl = new FormControl<string>('', { nonNullable: true });

  dense = false;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  ngOnInit() {
    this.form.statusChanges.subscribe(() => {
      this.formOk.set(this.form.valid);
    });
    this.cargarCrias();
    this.cargarFincas();
    this.cargarMadres();
  }

  // === init ===
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // accessor para números y fechas (null al final)
    this.dataSource.sortingDataAccessor = (item: CriaHembra, prop: string) => {
      const v = (item as any)[prop];
      if (prop === 'fechaNac') return v ? new Date(v).getTime() : null;
      if (prop === 'pesoKg') return typeof v === 'number' ? v : null;
      return typeof v === 'string' ? v.toLowerCase() : v;
    };
    this.dataSource.sortData = (data, sort) => {
      if (!sort.active || sort.direction === '') return data.slice();
      const isAsc = sort.direction === 'asc';
      return data.slice().sort((a, b) => {
        const av = this.dataSource.sortingDataAccessor(a, sort.active);
        const bv = this.dataSource.sortingDataAccessor(b, sort.active);
        const aNull = av === null || av === undefined;
        const bNull = bv === null || bv === undefined;
        if (aNull && bNull) return 0;
        if (aNull) return 1;
        if (bNull) return -1;
        return (av < bv ? -1 : av > bv ? 1 : 0) * (isAsc ? 1 : -1);
      });
    };

    // filtro compuesto
    this.dataSource.filterPredicate = (data: CriaHembra, raw: string) => {
      const f = JSON.parse(raw || '{}') as { q: string; fincaId: string };
      const q = (f.q || '').trim().toLowerCase();

      const byText =
        !q ||
        (data.numero || '').toLowerCase().includes(q) ||
        (data.nombre || '').toLowerCase().includes(q) ||
        (data.propietario || '').toLowerCase().includes(q) ||
        (data.madreNumero || '').toLowerCase().includes(q) ||
        (data.madreNombre || '').toLowerCase().includes(q);

      const byFinca = !f.fincaId || f.fincaId === (data.fincaId || '');
      return byText && byFinca;
    };

    const pushFilter = () => {
      const payload = { q: this.qCtrl.value, fincaId: this.fincaCtrl.value };
      this.dataSource.filter = JSON.stringify(payload);
      if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
      this.buscarCrias(payload);
    };

    this.qCtrl.valueChanges
      .pipe(debounceTime(120), startWith(this.qCtrl.value))
      .subscribe(() => pushFilter());
    this.fincaCtrl.valueChanges
      .pipe(startWith(this.fincaCtrl.value))
      .subscribe(() => pushFilter());
  }

  // ===== columnas: helpers (select all) =====
  isColumnVisible = (k: string) => this.displayedColumns.includes(k);
  get allSelected() {
    const showables = this.allColumns.map(c => c.key);
    return showables.every(k => this.displayedColumns.includes(k));
  }
  get someSelected() {
    const showables = this.allColumns.map(c => c.key);
    const count = showables.filter(k => this.displayedColumns.includes(k)).length;
    return count > 0 && count < showables.length;
  }
  toggleAll(checked: boolean) {
    const showables = this.allColumns.map(c => c.key);
    this.displayedColumns = checked ? [...showables] : [];
  }
  toggleColumn(key: string, show: boolean) {
    if (show) {
      if (!this.displayedColumns.includes(key)) this.displayedColumns.push(key);
    } else {
      this.displayedColumns = this.displayedColumns.filter(c => c !== key);
    }
  }

  // ===== datos =====
  setData(rows: CriaHembra[]) {
    this.dataSource.data = rows ?? [];
  }
  get totalCrias() {
    return this.dataSource.data.length;
  }

  private toYmd(d: any) {
    return d instanceof Date ? d.toISOString().slice(0, 10) : d || null;
  }

  private mapDtoToModel(dto: CriaHembraDto): CriaHembra {
    return {
      id: dto.id,
      numero: dto.numero,
      nombre: dto.nombre,
      fechaNac: dto.fechaNac ? new Date(dto.fechaNac) : null,
      color: dto.color ?? null,
      propietario: dto.propietario ?? null,
      pesoKg: dto.pesoKg ?? null,
      fincaId: dto.fincaId ?? null,
      madreNumero: dto.madreNumero ?? null,
      madreNombre: dto.madreNombre ?? null,
      detalles: dto.detalles ?? null,
    };
  }

  cargarCrias() {
    this.criaService.getAll().subscribe({
      next: (res) => this.setData(res.map((r) => this.mapDtoToModel(r))),
      error: () => {
        this.setData([]);
        this.snack.open('No se pudo cargar el listado', 'OK', { duration: 3000 });
      },
    });
  }

  private cargarFincas() {
    this.fincaService.listar().subscribe({
      next: (res) => {
        this.fincas = res.map((f) => ({ id: f.id, nombre: f.nombre }));
      },
      error: () => {
        // Mantiene las fincas por defecto si falla
      },
    });
  }

  private cargarMadres() {
    this.paridaService.getAll().subscribe({
      next: (res) => {
        this.madres = res.map((p) => ({ numero: p.numero, nombre: p.nombre }));
      },
      error: () => {
        // Mantiene las madres por defecto si falla
      },
    });
  }

  private buscarCrias(opts: { q?: string; fincaId?: string }) {
    this.criaService.search(opts).subscribe({
      next: (res) => this.setData(res.map((r) => this.mapDtoToModel(r))),
      error: () => {
        this.snack.open('No se pudo filtrar en el servidor', 'OK', { duration: 2500 });
        // Si el backend no soporta search, mantenemos el filtrado local
      },
    });
  }

  // ===== acciones =====
  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();

    // si seleccionó madre por número, resolvemos nombre
    const madre = this.madres.find(m => m.numero === v.madreNumero || m.nombre === v.madreNumero);

    const payload: CreateCriaHembraDto = {
      numero: String(v.numero ?? ''),
      nombre: String(v.nombre ?? ''),
      fechaNac: this.toYmd(v.fechaNac),
      color: v.color ?? null,
      propietario: v.propietario ?? null,
      pesoKg: v.pesoKg ?? null,
      fincaId: v.fincaId ?? null,
      madreNumero: madre?.numero ?? v.madreNumero ?? null,
      madreNombre: madre?.nombre ?? null,
      detalles: v.detalles ?? null,
    };

    this.isSaving.set(true);
    if (this.editingId) {
      this.criaService.update(this.editingId, payload).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.editingId = null;
          this.form.reset({ fincaId: null, madreNumero: null, pesoKg: null });
          this.cargarCrias();
          this.snack.open('Cría actualizada', 'OK', { duration: 2500 });
        },
        error: () => {
          this.isSaving.set(false);
          this.snack.open('No se pudo actualizar', 'OK', { duration: 3000 });
        },
      });
      return;
    }

    this.criaService.create(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.form.reset({ fincaId: null, madreNumero: null, pesoKg: null });
        this.cargarCrias();
        this.snack.open('Cría guardada', 'OK', { duration: 2500 });
      },
      error: () => {
        this.isSaving.set(false);
        this.snack.open('No se pudo guardar', 'OK', { duration: 3000 });
      },
    });
  }

  editar(row: CriaHembra) {
    this.editingId = row.id ?? null;
    this.form.patchValue({
      numero: row.numero,
      nombre: row.nombre,
      fechaNac: row.fechaNac,
      color: row.color,
      propietario: row.propietario,
      pesoKg: row.pesoKg ?? null,
      fincaId: row.fincaId,
      madreNumero: row.madreNumero ?? null,
      detalles: row.detalles,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(row: CriaHembra) {
    const ok = confirm(`¿Eliminar cría ${row.numero} - ${row.nombre}?`);
    if (!ok) return;
    if (!row.id) {
      this.dataSource.data = this.dataSource.data.filter(r => r !== row);
      this.snack.open('Cría eliminada', 'OK', { duration: 2500 });
      return;
    }
    this.isSaving.set(true);
    this.criaService.delete(row.id).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.dataSource.data = this.dataSource.data.filter(r => r.id !== row.id);
        this.snack.open('Cría eliminada', 'OK', { duration: 2500 });
      },
      error: () => {
        this.isSaving.set(false);
        this.snack.open('No se pudo eliminar', 'OK', { duration: 3000 });
      },
    });
  }

  trackById = (_: number, item: CriaHembra) =>
    item.id ?? `${item.numero}-${item.nombre}`;

  exportPdf() {
  // Ajusta aquí qué columnas NO quieres exportar
  const visibleKeys = this.displayedColumns.filter(
    k => k !== 'acciones' && k !== 'idx' && k !== 'eliminar'
  );

  // Cabecera (labels)
  const head = [visibleKeys.map(k => this.colLabel(k).toUpperCase())];

  // Filas: usa los datos FILTRADOS (lo que el usuario está viendo)
  const rows = this.dataSource.filteredData.map(row =>
    visibleKeys.map(key => {
      const v: any = (row as any)[key];
      // Formatea fechas
      if (key === 'fechaNac') {
        return v ? this.date.transform(v, 'yyyy-MM-dd') : '';
      }
      return v ?? '';
    })
  );

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
  const marginX = 36;
  const startY = 64;

  // Título y fecha
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Crías Hembra', marginX, 32);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Generado: ${this.date.transform(new Date(), 'yyyy-MM-dd HH:mm')}`, marginX, 46);

  // Tabla
  autoTable(doc, {
    head,
    body: rows,
    startY,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
    headStyles: { fillColor: [250, 204, 21], textColor: 20 }, // FACC15 aprox
    margin: { left: marginX, right: marginX },
    didDrawPage: () => {
      const pageSize = doc.internal.pageSize;
      const pageNum = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(`Página ${pageNum}`, pageSize.getWidth() - marginX, pageSize.getHeight() - 12, { align: 'right' });
    },
  });

  const file = `crias-hembra_${this.date.transform(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(file);
}
}
