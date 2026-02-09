import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { RecriaHembrasService } from 'src/app/core/services/recrias-hembras.service';
import { FincaService } from 'src/app/core/services/finca.service';
import { ParidaService } from 'src/app/core/services/parida.service';

// Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSort, MatSortModule } from '@angular/material/sort';

// PDF
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CriaHembra } from '../crias-hembras/crias-hembras.component';
import { CriaHembrasService } from 'src/app/core/services/cria-hembras.service';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Tipos locales (ajústalos si ya los exportas desde el servicio) */
interface RecriaResumen {
  id: string;
  numero: number;
  nombre: string;
}
interface RecriaDetalle {
  id: string;
  numero: number;
  nombre: string;
  fechaNac?: string | Date | null;
  pesoKg?: number | null;
  color?: string | null;
  propietario?: string | null;
  fincaId?: string | null;
  madreNumero?: number | string | null;
  madreNombre?: string | null;
  detalles?: string | null;
  fechaDestete?: string | Date | null;
}

@Component({
  selector: 'app-recrias-hembras',
  standalone: true,
  templateUrl: './recrias-hembras.component.html',
  styleUrls: ['./recrias-hembras.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Material
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatTooltipModule,
    MatDividerModule,
    MatSortModule,
  ],
})
export class RecriasHembrasComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private recriasService = inject(RecriaHembrasService);
  private fincaService = inject(FincaService);
  private paridaService = inject(ParidaService);

  constructor(private criaService: CriaHembrasService, private snack: MatSnackBar) {}
  selectCriaHembra: any[] = [];

  /** UI state */
  dense = false;
  loading = false;
  consultMode = false;

  /** Select de recrías */
  recrias: RecriaResumen[] = [];
  selectedId: string | null = null;
  private editingId: string | null = null;
  totalRecrias = 0;
  get totalCrias() {
    return this.totalRecrias;
  } // alias usado por el HTML

  /** Catálogos desde API */
  fincas: any[] = [];
  madres: any[] = [];

  /** Form principal */
  form!: FormGroup;

  /** Tabla */
  dataSource = new MatTableDataSource<RecriaDetalle>([]);
  displayedColumns: string[] = [
    'idx',
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
  allColumns = [
    { key: 'idx', label: '#' },
    { key: 'numero', label: 'Nº' },
    { key: 'nombre', label: 'NOMBRE' },
    { key: 'fechaNac', label: 'F. NACIMIENTO' },
    { key: 'color', label: 'COLOR' },
    { key: 'pesoKg', label: 'PESO' },
    { key: 'propietario', label: 'PROPIETARIO' },
    { key: 'madreNumero', label: 'N° MADRE' },
    { key: 'madreNombre', label: 'MADRE' },
    { key: 'detalles', label: 'DETALLES' },
    { key: 'acciones', label: 'ACCIONES' },
  ];
  private visible = new Set(this.displayedColumns);

  /** Filtros de tabla */
  qCtrl = new FormControl<string>('', { nonNullable: true });
  fincaCtrl = new FormControl<string>('', { nonNullable: true });

  /** ViewChilds tabla */
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  /** ===== Ciclo de vida ===== */
  ngOnInit(): void {
    this.form = this.fb.group({
      numero: [null, Validators.required],
      nombre: [null, Validators.required],
      fechaNac: [null],
      pesoKg: [null],
      color: [null],
      propietario: [null],
      fincaId: [null, Validators.required],
      madreNumero: [null],
      detalles: [null],
      fechaDestete: [null, Validators.required],
    });
    this.cargarSelectRecrias();
    this.cargarFincas();
    this.cargarMadres();
    this.cargarCrias();
    this.cargarRecrias();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Filtro compuesto (texto + finca)
    this.dataSource.filterPredicate = (row, filterJson) => {
      const f = JSON.parse(filterJson) as { q: string; fincaId: string };
      const q = (f.q || '').toLowerCase();
      const finca = f.fincaId || '';
      const matchTexto = String(row.numero || '').includes(q) || (row.nombre || '').toLowerCase().includes(q);
      const matchFinca = !finca || row.fincaId === finca;
      return matchTexto && matchFinca;
    };

    this.qCtrl.valueChanges.subscribe(() => this.applyFilter());
    this.fincaCtrl.valueChanges.subscribe(() => this.applyFilter());
  }

  /** ===== Utilidades de form usadas por el template ===== */
  has(ctrl: string, err: string) {
    const c = this.form.get(ctrl);
    return !!c && (c.touched || c.dirty) && c.hasError(err);
  }
  formOk() {
    return this.form.valid;
  }
  isSaving() {
    return this.loading;
  }

  /** ===== Data ===== */
  private applyFilter() {
    this.dataSource.filter = JSON.stringify({
      q: this.qCtrl.value || '',
      fincaId: this.fincaCtrl.value || '',
    });
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  private cargarSelectRecrias() {
    this.recriasService.getAll().subscribe({
      next: (res) => {
        this.recrias = res.map((item: any) => ({
          id: item.id,
          numero: item.numero,
          nombre: item.nombre,
        }));
        this.totalRecrias = res.length;
      },
      error: () => {
        // Mantiene los datos por defecto si falla
      },
    });
  }

  private cargarFincas() {
    this.fincaService.listar().subscribe({
      next: (res) => {
        this.fincas = res.map((f: any) => ({ id: f.id, nombre: f.nombre }));
      },
      error: () => {
        // Mantiene las fincas por defecto si falla
      },
    });
  }

  private cargarCrias() {
    this.criaService.getAll().subscribe({
      next: (res) => {
        this.selectCriaHembra = res.map((item: any) => ({
          id: item.id,
          numero: item.numero,
          nombre: item.nombre,
        }));
      },
      error: () => {
        this.snack.open('No se pudo cargar el listado', 'OK', { duration: 3000 });
      },
    });
  }

  private cargarMadres() {
    this.paridaService.getAll().subscribe({
      next: (res) => {
        this.madres = res.map((p: any) => ({ numero: p.numero, nombre: p.nombre }));
      },
      error: () => {
        // Mantiene las madres por defecto si falla
      },
    });
  }

  async onSelectCria(id: string | null) {
    if (!id) {
      this.onNuevo();
      return;
    }
    this.loading = true;
    try {
      const det: any = await firstValueFrom(this.criaService.getById(id));
      if (!det) return;
      //this.editingId = id;

      this.form.patchValue({
        numero: det.numero,
        nombre: det.nombre,
        fechaNac: det.fechaNac ? new Date(det.fechaNac) : null,
        pesoKg: det.pesoKg ?? null,
        color: det.color ?? null,
        propietario: det.propietario ?? null,
        fincaId: det.fincaId ?? null,
        madreNumero: det.madreNumero ?? null,
        detalles: det.detalles ?? null,
        fechaDestete: det.fechaDestete ? new Date(det.fechaDestete) : null,
      });

      this.consultMode = false;
      this.form.enable({ emitEvent: false });
    } finally {
      this.loading = false;
    }
  }

  async cargarRecrias() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.recriasService.getAll());
      this.recrias = (res || []).map((item: any) => ({
        id: item.id,
        numero: item.numero,
        nombre: item.nombre,
      }));
      this.totalRecrias = this.recrias.length;

      const rows: RecriaDetalle[] = (res || []).map((it: any) => ({
        id: it.id,
        numero: it.numero,
        nombre: it.nombre,
        fechaNac: it.fechaNac || null,
        pesoKg: it.pesoKg || null,
        color: it.color || null,
        propietario: it.propietario || null,
        fincaId: it.fincaId || null,
        madreNumero: it.madreNumero || null,
        madreNombre: it.madreNombre || null,
        detalles: it.detalles || null,
        fechaDestete: it.fechaDestete || null,
      }));
      this.dataSource.data = rows;
      this.applyFilter();
    } finally {
      this.loading = false;
    }
  }

  async onConsultar() {
    if (!this.selectedId) return;
    this.loading = true;
    try {
      const det: any = await firstValueFrom(this.recriasService.getById(this.selectedId));
      if (!det) return;

      this.form.patchValue({
        numero: det.numero,
        nombre: det.nombre,
        fechaNac: det.fechaNac ? new Date(det.fechaNac) : null,
        pesoKg: det.pesoKg ?? null,
        color: det.color ?? null,
        propietario: det.propietario ?? null,
        fincaId: det.fincaId ?? null,
        madreNumero: det.madreNumero ?? null,
        detalles: det.detalles ?? null,
        fechaDestete: det.fechaDestete ? new Date(det.fechaDestete) : null,
      });

      // Mostrar la consultada en la tabla (solo esta recría)
      this.dataSource.data = [
        {
          ...det,
          madreNombre: det.madreNombre ?? null,
        },
      ];

      // Bloquear form salvo fechaDestete
      this.consultMode = true;
      this.form.disable({ emitEvent: false });
      this.form.get('fechaDestete')?.enable({ emitEvent: false });

      this.applyFilter();
    } finally {
      this.loading = false;
    }
  }

  onNuevo() {
    this.selectedId = null;
    this.consultMode = false;
    this.editingId = null;
    this.form.reset();
    this.form.enable({ emitEvent: false });
  }

  guardarDestete() {
    if (!this.consultMode || !this.selectedId) return;
    const fd = this.form.get('fechaDestete')?.value;
    if (!fd) {
      this.form.get('fechaDestete')?.markAsTouched();
      this.snack.open('La fecha de destete es obligatoria', 'OK', { duration: 3000 });
      return;
    }
    const valor = fd instanceof Date ? fd.toISOString().substring(0, 10) : fd;

    this.loading = true;
    const updateDto = { ...this.form.getRawValue(), fechaDestete: valor };
    this.recriasService.update(this.selectedId, updateDto).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Fecha de destete guardada', 'OK', { duration: 3000 });
        this.cargarRecrias();
      },
      error: () => {
        this.loading = false;
        this.snack.open('No se pudo guardar', 'OK', { duration: 3000 });
      },
    });
  }

  /** ===== Tabla: columnas y acciones ===== */
  get allSelected() {
    return this.visible.size === this.allColumns.length;
  }
  get someSelected() {
    return this.visible.size > 0 && !this.allSelected;
  }

  isColumnVisible(key: string) {
    return this.visible.has(key);
  }
  toggleColumn(key: string, on: boolean) {
    if (on) this.visible.add(key);
    else this.visible.delete(key);
    this.displayedColumns = this.allColumns.map((c) => c.key).filter((k) => this.visible.has(k));
  }
  toggleAll(on: boolean) {
    if (on) this.visible = new Set(this.allColumns.map((c) => c.key));
    else this.visible.clear();
    this.displayedColumns = this.allColumns.map((c) => c.key).filter((k) => this.visible.has(k));
  }

  editar(row: RecriaDetalle) {
    this.editingId = row.id;
    this.consultMode = false;
    this.form.enable({ emitEvent: false });
    this.form.patchValue({
      numero: row.numero,
      nombre: row.nombre,
      fechaNac: row.fechaNac ? new Date(row.fechaNac) : null,
      pesoKg: row.pesoKg ?? null,
      color: row.color ?? null,
      propietario: row.propietario ?? null,
      fincaId: row.fincaId ?? null,
      madreNumero: row.madreNumero ?? null,
      detalles: row.detalles ?? null,
      fechaDestete: row.fechaDestete ? new Date(row.fechaDestete) : null,
    });
  }

  eliminar(row: RecriaDetalle) {
    if (!row?.id) return;
    const ok = confirm('¿Eliminar esta recría hembra?');
    if (!ok) return;
    this.loading = true;
    this.recriasService.delete(row.id).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Registro eliminado', 'OK', { duration: 3000 });
        this.cargarRecrias();
      },
      error: () => {
        this.loading = false;
        this.snack.open('No se pudo eliminar', 'OK', { duration: 3000 });
      },
    });
  }

  /** ===== Exportación PDF real ===== */
  exportPdf() {
    // Columnas exportables = visibles menos 'acciones'
    const exportKeys = this.displayedColumns.filter((k) => this.visible.has(k) && k !== 'acciones');
    const headers = exportKeys.map((k) => this.allColumns.find((c) => c.key === k)?.label ?? k.toUpperCase());

    // Datos (filtrados si aplica)
    const data = this.dataSource.filteredData?.length ? this.dataSource.filteredData : this.dataSource.data;

    // Construir filas en el orden de exportKeys
    const rows = data.map((r, idx) =>
      exportKeys.map((k) => {
        switch (k) {
          case 'idx':
            return String(idx + 1);
          case 'fechaNac':
            return r.fechaNac ? this.formatDate(r.fechaNac) : '';
          default:
            return (r as any)[k] ?? '';
        }
      }),
    );

    const orientation = exportKeys.length > 6 ? 'l' : 'p';
    const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });

    const title = 'Recrías Hembra';
    const subtitle = `Generado: ${this.formatDateTime(new Date())}   Registros: ${rows.length}`;

    doc.setFontSize(14);
    doc.text(title, 40, 40);
    doc.setFontSize(10);
    doc.text(subtitle, 40, 58);

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 72,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [31, 59, 87], textColor: 255 }, // tu azul de cabecera
      margin: { left: 40, right: 40 },
      didDrawPage: (dataCtx) => {
        // Footer simple con número de página
        const page = doc.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 20);
      },
    });

    doc.save(`recrias_${this.timestamp()}.pdf`);
  }

  /** Utilidades de formato/filename */
  private formatDate(d: string | Date) {
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dt.getTime())) return '';
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  private formatDateTime(d: Date) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${this.formatDate(d)} ${hh}:${mi}`;
  }
  private timestamp() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}${mm}${dd}_${hh}${mi}`;
  }

  /** trackBy para mat-table */
  trackById = (_: number, r: RecriaDetalle) => r?.id ?? r?.numero ?? _;

  submit() {
    // En modo consulta no se guarda (el guardado ahí es guardarDestete)
    if (this.consultMode) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const toYMD = (d: any) => (d instanceof Date ? d.toISOString().slice(0, 10) : d || null);

    const payload = {
      numero: v.numero,
      nombre: v.nombre,
      fechaNac: toYMD(v.fechaNac),
      pesoKg: v.pesoKg ?? null,
      color: v.color ?? null,
      propietario: v.propietario ?? null,
      fincaId: v.fincaId,
      madreNumero: v.madreNumero ?? null,
      detalles: v.detalles ?? null,
      fechaDestete: toYMD(v.fechaDestete),
    };

    this.loading = true;
    const req$ = this.editingId
      ? this.recriasService.update(this.editingId, payload)
      : this.recriasService.create(payload);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.snack.open(this.editingId ? 'Registro actualizado' : 'Registro creado', 'OK', { duration: 3000 });
        this.onNuevo();
        this.cargarRecrias();
      },
      error: () => {
        this.loading = false;
        this.snack.open('No se pudo guardar', 'OK', { duration: 3000 });
      },
    });
  }
}
