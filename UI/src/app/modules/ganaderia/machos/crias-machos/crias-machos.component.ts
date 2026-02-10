import { Component, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { debounceTime, startWith } from 'rxjs';
import { CriaMachosService, CriaMachoDto, CreateCriaMachoDto } from 'src/app/core/services/cria-machos.service';
import { FincaService } from 'src/app/core/services/finca.service';
import { ParidaService } from 'src/app/core/services/parida.service';

export interface CriaMacho {
  id?: string;
  nombre: string;
  fechaNac?: Date | null;
  color?: string | null;
  propietario?: string | null;
  pesoKg?: number | null;
  fincaId: string | null;
  madreId?: string | null;
  madreNumero?: string | null;
  madreNombre?: string | null;
  detalles?: string | null;
}

@Component({
  selector: 'app-crias-machos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    // Material
    MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule, MatDividerModule, MatSelectModule,
    MatTableModule, MatPaginatorModule, MatSortModule, MatTooltipModule,
    MatMenuModule, MatCheckboxModule, MatSnackBarModule,
  ],
  providers: [DatePipe],
  templateUrl: './crias-machos.component.html',
  styleUrls: ['./crias-machos.component.css'],
})
export class CriasMachosComponent {
  private fb = inject(FormBuilder);
  private date = inject(DatePipe);
  private criaService = inject(CriaMachosService);
  private fincaService = inject(FincaService);
  private paridaService = inject(ParidaService);
  private snack = inject(MatSnackBar);

  // ===== mock (reemplaza por tu API) =====
  fincas: any[] = [];
  madres: any[] = [];

  // ===== Form =====
  form = this.fb.group({
    nombre: ['', [Validators.required]],
    fechaNac: [null as Date | null],
    color: [''],
    propietario: [''],
    pesoKg: [null as number | null],
    fincaId: [null as string | null, [Validators.required]],
    madreId: [null as string | null],
    detalles: [''],
  });

  isSaving = signal(false);
  isLoadingCrias = signal(false);
  isLoadingFincas = signal(false);
  isLoadingMadres = signal(false);
  formOk = signal(false);
  editingId = signal<string | null>(null);
  canSubmit = computed(() => this.form.valid && !this.isSaving());
  isEditing = computed(() => this.editingId() !== null);

  has(ctrl: string, err: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }

  // ===== Tabla =====
  displayedColumns: string[] = [
    'nombre', 'fechaNac', 'color', 'pesoKg', 'propietario',
    'madreNumero', 'madreNombre', 'detalles', 'acciones',
  ];
  dataSource = new MatTableDataSource<CriaMacho>([]);

  allColumns = [
    { key: 'idx',          label: 'N°' },
    { key: 'nombre',       label: 'Nombre' },
    { key: 'fechaNac',     label: 'F. Nacimiento' },
    { key: 'color',        label: 'Color' },
    { key: 'pesoKg',       label: 'Peso (kg)' },
    { key: 'propietario',  label: 'Propietario' },
    { key: 'madreNumero',  label: 'N° Madre' },
    { key: 'madreNombre',  label: 'Madre' },
    { key: 'detalles',     label: 'Detalles' },
    { key: 'acciones',     label: 'Acciones' },
  ];
  private colLabel = (k: string) => this.allColumns.find(c => c.key === k)?.label ?? k;

  // Filtros
  qCtrl = new FormControl<string>('', { nonNullable: true });
  fincaCtrl = new FormControl<string>('', { nonNullable: true });

  dense = false;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort,      { static: true }) sort!: MatSort;

  ngOnInit() {
    this.form.statusChanges.subscribe(() => this.formOk.set(this.form.valid));
    this.cargarCrias();
    this.cargarFincas();
    this.cargarMadres();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort      = this.sort;

    // sort: fechas/números correctos y nulos al final
    this.dataSource.sortingDataAccessor = (item: CriaMacho, prop: string) => {
      const v = (item as any)[prop];
      if (prop === 'fechaNac') return v ? new Date(v).getTime() : null;
      if (prop === 'pesoKg')  return typeof v === 'number' ? v : null;
      return typeof v === 'string' ? v.toLowerCase() : v;
    };
    this.dataSource.sortData = (data, sort) => {
      if (!sort.active || sort.direction === '') return data.slice();
      const asc = sort.direction === 'asc';
      return data.slice().sort((a, b) => {
        const av = this.dataSource.sortingDataAccessor(a, sort.active);
        const bv = this.dataSource.sortingDataAccessor(b, sort.active);
        const an = av == null, bn = bv == null;
        if (an && bn) return 0;
        if (an) return 1;
        if (bn) return -1;
        return (av < bv ? -1 : av > bv ? 1 : 0) * (asc ? 1 : -1);
      });
    };

    // filtro compuesto (texto + finca)
    this.dataSource.filterPredicate = (row: CriaMacho, raw: string) => {
      const f = JSON.parse(raw || '{}') as { q: string; fincaId: string };
      const q = (f.q || '').trim().toLowerCase();
      const byText =
        !q ||
        (row.nombre || '').toLowerCase().includes(q) ||
        (row.propietario || '').toLowerCase().includes(q) ||
        (row.madreNumero || '').toLowerCase().includes(q) ||
        (row.madreNombre || '').toLowerCase().includes(q);
      const byFinca = !f.fincaId || f.fincaId === (row.fincaId || '');
      return byText && byFinca;
    };

    const pushFilter = () => {
      const payload = { q: this.qCtrl.value, fincaId: this.fincaCtrl.value };
      this.dataSource.filter = JSON.stringify(payload);
      if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
    };
    this.qCtrl.valueChanges.pipe(debounceTime(120), startWith(this.qCtrl.value)).subscribe(pushFilter);
    this.fincaCtrl.valueChanges.pipe(startWith(this.fincaCtrl.value)).subscribe(pushFilter);
  }

  // ===== Columnas: helpers (seleccionar todo) =====
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
    this.displayedColumns = show
      ? Array.from(new Set([...this.displayedColumns, key]))
      : this.displayedColumns.filter(k => k !== key);
  }

  // ===== Datos =====
  setData(rows: CriaMacho[]) { this.dataSource.data = rows ?? []; }
  get totalCrias()           { return this.dataSource.data.length; }

  private mapDtoToModel(dto: CriaMachoDto): CriaMacho {
    return {
      id: dto.id,
      nombre: dto.nombre,
      fechaNac: dto.fechaNac ? new Date(dto.fechaNac) : null,
      color: dto.color ?? null,
      propietario: dto.propietario ?? null,
      pesoKg: dto.pesoKg ?? null,
      fincaId: dto.fincaId ?? null,
      madreId: dto.madreId ?? null,
      madreNumero: dto.madreNumero ?? null,
      madreNombre: dto.madreNombre ?? null,
      detalles: dto.detalles ?? null,
    };
  }

  private toYmd(d: Date | string | null | undefined) {
    if (!d) return null;
    return d instanceof Date ? d.toISOString().slice(0, 10) : d;
  }

  private cargarCrias() {
    this.isLoadingCrias.set(true);
    this.criaService.getAll().subscribe({
      next: (res) => {
        this.setData(res.map((r) => this.mapDtoToModel(r)));
        this.isLoadingCrias.set(false);
      },
      error: () => {
        this.setData([]);
        this.isLoadingCrias.set(false);
        this.snack.open('No se pudo cargar las crias', 'OK', { duration: 3000 });
      },
    });
  }

  private cargarFincas() {
    this.isLoadingFincas.set(true);
    this.form.get('fincaId')?.disable({ emitEvent: false });
    this.fincaCtrl.disable({ emitEvent: false });
    this.fincaService.listar().subscribe({
      next: (res) => {
        this.fincas = res
          .filter((f) => f.isActive !== false)
          .map((f) => ({ id: f.id, nombre: f.nombre }));
        this.isLoadingFincas.set(false);
        this.form.get('fincaId')?.enable({ emitEvent: false });
        this.fincaCtrl.enable({ emitEvent: false });
      },
      error: () => {
        // Mantiene las fincas por defecto si falla
        this.isLoadingFincas.set(false);
        this.form.get('fincaId')?.enable({ emitEvent: false });
        this.fincaCtrl.enable({ emitEvent: false });
        this.snack.open('No se pudo cargar las fincas', 'OK', { duration: 3000 });
      },
    });
  }

  private cargarMadres() {
    this.isLoadingMadres.set(true);
    this.form.get('madreId')?.disable({ emitEvent: false });
    this.paridaService.getAll().subscribe({
      next: (res) => {
        this.madres = res.map((p) => ({ id: p.id, numero: p.numero, nombre: p.nombre }));
        this.isLoadingMadres.set(false);
        this.form.get('madreId')?.enable({ emitEvent: false });
      },
      error: () => {
        // Mantiene las madres por defecto si falla
        this.isLoadingMadres.set(false);
        this.form.get('madreId')?.enable({ emitEvent: false });
        this.snack.open('No se pudo cargar las madres', 'OK', { duration: 3000 });
      },
    });
  }

  // ===== Acciones =====
  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const m = this.madres.find(x => x.id === v.madreId);

    const payload: CreateCriaMachoDto = {
      nombre: String(v.nombre ?? ''),
      fechaNac: this.toYmd(v.fechaNac),
      color: v.color ?? null,
      propietario: v.propietario ?? null,
      pesoKg: v.pesoKg ?? null,
      fincaId: v.fincaId ?? null,
      madreId: m?.id ?? v.madreId ?? null,
      madreNumero: m?.numero ?? null,
      madreNombre: m?.nombre ?? null,
      detalles: v.detalles ?? null,
    };

    this.isSaving.set(true);
    const editId = this.editingId();
    const request = editId
      ? this.criaService.update(editId, payload)
      : this.criaService.create(payload);

    request.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.editingId.set(null);
        this.form.reset({ fincaId: null, madreId: null, pesoKg: null });
        this.cargarCrias();
        this.snack.open(editId ? 'Cria actualizada' : 'Cria guardada', 'OK', { duration: 2500 });
      },
      error: () => {
        this.isSaving.set(false);
        this.snack.open('No se pudo guardar', 'OK', { duration: 3000 });
      },
    });
  }

  editar(r: CriaMacho) {
    if (!r.id) {
      this.snack.open('Error: No se puede editar este registro', 'OK', { duration: 3000 });
      return;
    }
    this.editingId.set(r.id);
    this.form.patchValue({
      nombre: r.nombre,
      fechaNac: r.fechaNac,
      color: r.color,
      propietario: r.propietario,
      pesoKg: r.pesoKg ?? null,
      fincaId: r.fincaId,
      madreId: r.madreId ?? null,
      detalles: r.detalles,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion() {
    this.editingId.set(null);
    this.form.reset({ fincaId: null, madreId: null, pesoKg: null });
  }

  eliminar(r: CriaMacho) {
    if (!confirm(`¿Eliminar cría ${r.nombre}?`)) return;
    this.dataSource.data = this.dataSource.data.filter(x => x !== r);
    this.snack.open('Cria eliminada', 'OK', { duration: 2500 });
  }

  trackById = (_: number, it: CriaMacho) => it.id ?? `${it.nombre}-${it.fechaNac ?? ''}`;

  // ===== Exportar PDF =====
  exportPdf() {
    const visibleKeys = this.displayedColumns.filter(k => k !== 'acciones' && k !== 'idx');

    const head = [visibleKeys.map(k => this.colLabel(k).toUpperCase())];
    const body = this.dataSource.filteredData.map(row =>
      visibleKeys.map(key => {
        const v: any = (row as any)[key];
        if (key === 'fechaNac') return v ? this.date.transform(v, 'yyyy-MM-dd') : '';
        return v ?? '';
      })
    );

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
    const marginX = 36, startY = 64;

    doc.setFont('helvetica', 'bold');   doc.setFontSize(14);
    doc.text('Crías Macho', marginX, 32);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text(`Generado: ${this.date.transform(new Date(), 'yyyy-MM-dd HH:mm')}`, marginX, 46);

    autoTable(doc, {
      head, body, startY, theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
      headStyles: { fillColor: [250, 204, 21], textColor: 20 },
      margin: { left: marginX, right: marginX },
      didDrawPage: () => {
        const ps = doc.internal.pageSize;
        const n  = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(`Página ${n}`, ps.getWidth() - marginX, ps.getHeight() - 12, { align: 'right' });
      },
    });

    doc.save(`crias-macho_${this.date.transform(new Date(), 'yyyy-MM-dd')}.pdf`);
  }
}
