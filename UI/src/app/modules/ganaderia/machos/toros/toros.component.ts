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

import { debounceTime, startWith } from 'rxjs';
import { CreateToroDto, ToroService } from 'src/app/core/services/toro.service';
import { FincaService } from 'src/app/core/services/finca.service';
import { ParidaService } from 'src/app/core/services/parida.service';
import { CriaMachosService } from 'src/app/core/services/cria-machos.service';
import { RecriasMachosService } from 'src/app/core/services/recrias-machos.service';
import { ToretesService, ToreteDetalle } from 'src/app/core/services/toretes.service';

interface Toro {
  id?: string;
  numero: string;
  nombre: string;
  fechaNacimiento?: Date | null;
  color?: string | null;
  propietario?: string | null;
  pesoKg?: number | null;
  fechaDestete?: Date | null;
  detalles?: string | null;
  madreNumero?: string | null;
  fincaId?: string | null;
}

@Component({
  selector: 'app-toros',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Material
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatMenuModule,
    MatCheckboxModule,
  ],
  providers: [DatePipe],
  templateUrl: './toros.component.html',
  styleUrls: ['./toros.component.css'],
})
export class TorosComponent {

  constructor(private toroService: ToroService, private fincaService: FincaService) { }


  private fb = inject(FormBuilder);
  private date = inject(DatePipe);
  private paridaService = inject(ParidaService);
  private criaMachosService = inject(CriaMachosService);
  private recriasMachosService = inject(RecriasMachosService);
  private toretesService = inject(ToretesService);

  // ===== mock (cámbialo por tu API) =====
  fincas: any[] = [];
  madres: any[] = [];

  sourceTypeCtrl = new FormControl<string>('', { nonNullable: true });
  sourceIdCtrl = new FormControl<string>('', { nonNullable: true });
  sourceTypes = [
    { key: 'toretes', label: 'Torete' },
    { key: 'recrias', label: 'Recrias Macho' },
    { key: 'crias', label: 'Crias Macho' },
  ];
  sourceItems: Array<{ id: string; nombre: string }> = [];
  isLoadingSourceList = false;
  isLoadingSourceDetail = false;

  // ===== Form =====
  form = this.fb.group({
    numero: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    fechaNacimiento: [null as Date | null],
    color: [''],
    propietario: [''],
    pesoKg: [null as number | null],
    fincaId: [null as string | null, [Validators.required]],
    madreNumero: [null as string | null],
    fechaDestete: [null as Date | null],
    detalles: [''],
  });

  isSaving = signal(false);
  formOk = signal(false);
  canSubmit = computed(() => this.form.valid && !this.isSaving());

  has(ctrl: string, err: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }

  // ===== Tabla =====
  displayedColumns: string[] = [
    'numero',
    'nombre',
    'fechaNacimiento',
    'color',
    'pesoKg',
    'propietario',
    'madreNumero',

    'detalles',
    'acciones',
  ];
  dataSource = new MatTableDataSource<Toro>([]);

  allColumns = [
    { key: 'idx', label: 'N°' },
    { key: 'numero', label: 'Nº' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'fechaNacimiento', label: 'F. Nacimiento' },
    { key: 'color', label: 'Color' },
    { key: 'pesoKg', label: 'PesoKg' },
    { key: 'madreNumero', label: 'N° Madre' },
    { key: 'fechaDestete', label: 'Fec. Destete' },
    { key: 'detalles', label: 'Detalles' },
    { key: 'acciones', label: 'Acciones' },
  ];

  private colLabel = (k: string) => this.allColumns.find((c) => c.key === k)?.label ?? k;

  // Filtros
  qCtrl = new FormControl<string>('', { nonNullable: true });
  fincaCtrl = new FormControl<string>('', { nonNullable: true });

  dense = false;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  ngOnInit() {
    this.form.statusChanges.subscribe(() => this.formOk.set(this.form.valid));
    this.setData();
    this.cargarFincas();
    this.cargarMadres();
    this.sourceIdCtrl.disable({ emitEvent: false });

    this.sourceTypeCtrl.valueChanges.subscribe((tipo) => {
      this.sourceIdCtrl.setValue('');
      this.sourceItems = [];
      this.limpiarFormulario();
      if (!tipo) {
        this.sourceIdCtrl.disable({ emitEvent: false });
        return;
      }
      this.cargarSourceList(tipo);
    });

    this.sourceIdCtrl.valueChanges.subscribe((id) => {
      const tipo = this.sourceTypeCtrl.value;
      if (!tipo || !id) return;
      this.cargarSourceDetalle(tipo, id);
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // sort: fechas/números correctos y nulos al final
    this.dataSource.sortingDataAccessor = (item: Toro, prop: string) => {
      const v = (item as any)[prop];
      if (prop === 'fechaNacimiento' || prop === 'fechaDestete') return v ? new Date(v).getTime() : null;
      if (prop === 'pesoKg') return typeof v === 'number' ? v : null;
      return typeof v === 'string' ? v.toLowerCase() : v;
    };

    this.dataSource.sortData = (data, sort) => {
      if (!sort.active || sort.direction === '') return data.slice();
      const asc = sort.direction === 'asc';
      return data.slice().sort((a, b) => {
        const av = this.dataSource.sortingDataAccessor(a, sort.active);
        const bv = this.dataSource.sortingDataAccessor(b, sort.active);
        const an = av == null,
          bn = bv == null;
        if (an && bn) return 0;
        if (an) return 1;
        if (bn) return -1;
        return (av < bv ? -1 : av > bv ? 1 : 0) * (asc ? 1 : -1);
      });
    };

    // filtro compuesto (texto + finca)
    this.dataSource.filterPredicate = (row: Toro, raw: string) => {
      const f = JSON.parse(raw || '{}') as { q: string; fincaId: string };
      const q = (f.q || '').trim().toLowerCase();
      const byText =
        !q ||
        (row.numero || '').toLowerCase().includes(q) ||
        (row.nombre || '').toLowerCase().includes(q) ||
        (row.madreNumero || '').toLowerCase().includes(q);
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
    const showables = this.allColumns.map((c) => c.key);
    return showables.every((k) => this.displayedColumns.includes(k));
  }
  get someSelected() {
    const showables = this.allColumns.map((c) => c.key);
    const count = showables.filter((k) => this.displayedColumns.includes(k)).length;
    return count > 0 && count < showables.length;
  }
  toggleAll(checked: boolean) {
    const showables = this.allColumns.map((c) => c.key);
    this.displayedColumns = checked ? [...showables] : [];
  }
  toggleColumn(key: string, show: boolean) {
    this.displayedColumns = show
      ? Array.from(new Set([...this.displayedColumns, key]))
      : this.displayedColumns.filter((k) => k !== key);
  }

  // ===== Datos =====
  setData() {
    this.toroService.getToros().subscribe({
      next: (res: any) => {
        this.dataSource.data = res;
      },
      error: (err: any) => {
        console.error('Error cargando toros', err);
        this.dataSource.data = [];
      },
    });
  }

  get totalToros() {
    return this.dataSource.data.length;
  }

  mockRows(n = 10): Toro[] {
    const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
    const randDate = (from: Date, to: Date) =>
      new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));

    const today = new Date();
    const start = new Date(today.getFullYear() - 5, 0, 1); // 5 años atrás
    const colores = ['Bayo', 'Negro', 'Castaño'];
    const nombres = ['Censio', 'Rayo', 'Tornado', 'Lluvia', 'Trueno'];

    const rows: Toro[] = [];
    for (let i = 0; i < n; i++) {
      const m = pick(this.madres);
      rows.push({
        id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        numero: String(273 + i),
        nombre: pick(nombres),
        fechaNacimiento: randDate(start, today), // Corregido aquí
        color: pick(colores),
        propietario: 'MC',
        pesoKg: Math.round(200 + Math.random() * 500),
        fincaId: pick(this.fincas).id,
        fechaDestete: randDate(today, new Date(today.getFullYear() + 1, 0, 1)),
        detalles: Math.random() < 0.25 ? 'Sin observaciones' : '',
      });
    }
    return rows;
  }

  private limpiarFormulario() {
    this.form.reset({
      numero: null,
      nombre: null,
      fechaNacimiento: null,
      color: null,
      propietario: null,
      pesoKg: null,
      fincaId: null,
      madreNumero: null,
      fechaDestete: null,
      detalles: null,
    });
  }

  private asDate(v: any): Date | null {
    if (!v) return null;
    return v instanceof Date ? v : new Date(v);
  }

  private cargarSourceList(tipo: string) {
    this.isLoadingSourceList = true;
    this.sourceIdCtrl.disable({ emitEvent: false });

    if (tipo === 'toretes') {
      this.toretesService.listarToretes().subscribe({
        next: (res) => {
          this.sourceItems = res.items.map((it) => ({ id: it.id, nombre: it.nombre }));
          this.isLoadingSourceList = false;
          this.sourceIdCtrl.enable({ emitEvent: false });
        },
        error: () => {
          this.sourceItems = [];
          this.isLoadingSourceList = false;
          this.sourceIdCtrl.enable({ emitEvent: false });
        },
      });
      return;
    }

    if (tipo === 'recrias') {
      this.recriasMachosService.listarRecrias().subscribe({
        next: (res) => {
          this.sourceItems = res.items.map((it) => ({ id: it.id, nombre: it.nombre }));
          this.isLoadingSourceList = false;
          this.sourceIdCtrl.enable({ emitEvent: false });
        },
        error: () => {
          this.sourceItems = [];
          this.isLoadingSourceList = false;
          this.sourceIdCtrl.enable({ emitEvent: false });
        },
      });
      return;
    }

    if (tipo === 'crias') {
      this.criaMachosService.getAll().subscribe({
        next: (res) => {
          this.sourceItems = res.map((it) => ({ id: it.id, nombre: it.nombre }));
          this.isLoadingSourceList = false;
          this.sourceIdCtrl.enable({ emitEvent: false });
        },
        error: () => {
          this.sourceItems = [];
          this.isLoadingSourceList = false;
          this.sourceIdCtrl.enable({ emitEvent: false });
        },
      });
    }
  }

  private cargarSourceDetalle(tipo: string, id: string) {
    this.isLoadingSourceDetail = true;

    const applyDetail = (det: any) => {
      const fechaNac = det?.fechaNac ?? det?.fechaNacimiento ?? null;
      this.form.patchValue({
        numero: det?.numero ?? null,
        nombre: det?.nombre ?? null,
        fechaNacimiento: this.asDate(fechaNac),
        pesoKg: det?.pesoKg ?? null,
        color: det?.color ?? null,
        propietario: det?.propietario ?? null,
        fincaId: det?.fincaId ?? null,
        madreNumero: det?.madreNumero ?? null,
        fechaDestete: this.asDate(det?.fechaDestete ?? null),
        detalles: det?.detalles ?? null,
      });
      this.isLoadingSourceDetail = false;
    };

    if (tipo === 'toretes') {
      this.toretesService.obtenerToretePorId(id).subscribe({
        next: (det: ToreteDetalle) => applyDetail(det),
        error: () => { this.isLoadingSourceDetail = false; },
      });
      return;
    }

    if (tipo === 'recrias') {
      this.recriasMachosService.obtenerRecriaPorId(id).subscribe({
        next: (det) => applyDetail(det),
        error: () => { this.isLoadingSourceDetail = false; },
      });
      return;
    }

    if (tipo === 'crias') {
      this.criaMachosService.getById(id).subscribe({
        next: (det) => applyDetail(det),
        error: () => { this.isLoadingSourceDetail = false; },
      });
    }
  }

  // ===== Acciones =====
  guardarToro() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const v = this.form.getRawValue();
    const m = this.madres.find(x => x.numero === v.madreNumero);

    const payload: CreateToroDto = {
      numero: String(v.numero),
      nombre: String(v.nombre),
      fechaNacimiento: v.fechaNacimiento,
      pesoKg: v.pesoKg,
      color: v.color,
      propietario: v.propietario,
      fincaId: v.fincaId,
      madreNumero: m?.numero ?? null,
      detalles: v.detalles,
      fechaDestete: v.fechaDestete,
    };

    this.toroService.createToro(payload).subscribe({
      next: (res: any) => {
        // opcional: agregar lo devuelto por la API
        this.dataSource.data = [res, ...this.dataSource.data];
        this.form.reset({ fincaId: null, madreNumero: null, pesoKg: null });
        this.isSaving.set(false);
        this.setData();
      },
      error: (err: any) => {
        console.error('Error guardando toro', err);
        this.isSaving.set(false);
      },
    });
  }

  cargarFincas() {
    this.form.get('fincaId')?.disable({ emitEvent: false });
    this.fincaCtrl.disable({ emitEvent: false });
    this.fincaService.listar().subscribe({
      next: (res) => {
        this.fincas = res.filter((f) => f.isActive !== false);
        this.form.get('fincaId')?.enable({ emitEvent: false });
        this.fincaCtrl.enable({ emitEvent: false });
      },
      error: () => {
        this.form.get('fincaId')?.enable({ emitEvent: false });
        this.fincaCtrl.enable({ emitEvent: false });
      },
    });
  }

  cargarMadres() {
    this.form.get('madreNumero')?.disable({ emitEvent: false });
    this.paridaService.getAll().subscribe({
      next: (res) => {
        this.madres = res
          .filter((p) => p.generoCria === 'Macho')
          .map((p) => ({ id: p.id, numero: p.numero, nombre: p.nombre }));
        this.form.get('madreNumero')?.enable({ emitEvent: false });
      },
      error: () => {
        this.form.get('madreNumero')?.enable({ emitEvent: false });
      },
    });
  }

  editar(r: Toro) {
    this.form.patchValue({
      numero: r.numero,
      nombre: r.nombre,
      fechaNacimiento: r.fechaNacimiento ?? null,
      color: r.color,
      propietario: r.propietario,
      pesoKg: r.pesoKg ?? null,
      fincaId: r.fincaId,
      madreNumero: r.madreNumero ?? null,
      fechaDestete: r.fechaDestete,
      detalles: r.detalles,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(r: Toro) {
    if (!confirm(`¿Eliminar toro ${r.numero}?`)) return;
    this.dataSource.data = this.dataSource.data.filter((x) => x !== r);
  }

  trackById = (_: number, it: Toro) => it.id ?? `${it.numero}-${it.nombre}`;

  // ===== Exportar PDF =====
  exportPdf() {
    const visibleKeys = this.displayedColumns.filter((k) => k !== 'acciones' && k !== 'idx');

    const head = [visibleKeys.map((k) => this.colLabel(k).toUpperCase())];
    const body = this.dataSource.filteredData.map((row) =>
      visibleKeys.map((key) => {
        const v: any = (row as any)[key];
        if (key === 'fechaNacimiento' || key === 'fechaDestete') return v ? this.date.transform(v, 'yyyy-MM-dd') : '';
        return v ?? '';
      }),
    );

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
    const marginX = 36,
      startY = 64;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Registro de Toros', marginX, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Generado: ${this.date.transform(new Date(), 'yyyy-MM-dd HH:mm')}`, marginX, 46);

    autoTable(doc, {
      head,
      body,
      startY,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
      headStyles: { fillColor: [250, 204, 21], textColor: 20 },
      margin: { left: marginX, right: marginX },
      didDrawPage: () => {
        const ps = doc.internal.pageSize;
        const n = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.text(`Página ${n}`, ps.getWidth() - marginX, ps.getHeight() - 12, { align: 'right' });
      },
    });

    doc.save(`registro_toros_${this.date.transform(new Date(), 'yyyy-MM-dd')}.pdf`);
  }
}
