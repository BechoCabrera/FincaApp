import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { NovillasVientreService } from 'src/app/core/services/novillas-vientre.service';
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
import { TableFiltersComponent } from 'src/app/shared/components/table-filters/table-filters.component';

// PDF
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatSnackBar } from '@angular/material/snack-bar';

interface NovillaResumen {
  id: string;
  numero: number;
  nombre: string;
}
interface NovillaDetalle {
  id: string;
  numero: number;
  nombre: string;
  fechaNac?: string | Date | null;
  fechaDestete?: string | Date | null;
  color?: string | null;
  propietario?: string | null;
  pesoKg?: number | null;
  fincaId?: string | null;
  madreNumero?: number | string | null;
  madreNombre?: string | null;
  procedencia?: string | null;
  detalles?: string | null;
}

@Component({
  selector: 'app-novillas-vientre',
  standalone: true,
  templateUrl: './novillas-vientre.component.html',
  styleUrls: ['./novillas-vientre.component.css'],
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
    // shared
    TableFiltersComponent,
  ],
})
export class NovillasVientreComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private novillasService = inject(NovillasVientreService);
  private fincaService = inject(FincaService);
  private paridaService = inject(ParidaService);
  private recriasService = inject(RecriaHembrasService);

  constructor(private snack: MatSnackBar) {}

  /** UI state */
  dense = false;
  loading = false;
  consultMode = false;

  /** Select de recrias */
  recrias: any[] = [];
  selectedId: string | null = null;
  private editingId: string | null = null;
  totalNovillas = 0;

  /** Catálogos desde API */
  fincas: any[] = [];
  madres: any[] = [];

  /** Form principal */
  form!: FormGroup;

  /** Tabla */
  dataSource = new MatTableDataSource<NovillaDetalle>([]);
  displayedColumns: string[] = [
    'idx',
    'numero',
    'nombre',
    'fechaNac',
    'fechaDestete',
    'color',
    'pesoKg',
    'propietario',
    'madreNumero',
    'madreNombre',
    'procedencia',
    'detalles',
    'acciones',
  ];
  allColumns = [
    { key: 'idx', label: '#' },
    {key: 'numero', label: 'Nº' },
    { key: 'nombre', label: 'NOMBRE' },
    { key: 'fechaNac', label: 'F. NACIMIENTO' },
    { key: 'fechaDestete', label: 'F. DESTETE' },
    { key: 'color', label: 'COLOR' },
    { key: 'pesoKg', label: 'PESO' },
    { key: 'propietario', label: 'PROPIETARIO' },
    { key: 'madreNumero', label: 'N° MADRE' },
    { key: 'madreNombre', label: 'MADRE' },
    { key: 'procedencia', label: 'PROCEDENCIA' },
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

  ngOnInit(): void {
    this.form = this.fb.group({
      numero: [null, Validators.required],
      nombre: [null, Validators.required],
      fechaNac: [null],
      fechaDestete: [null],
      color: [null],
      propietario: [null],
      pesoKg: [null],
      fincaId: [null, Validators.required],
      madreNumero: [null],
      procedencia: [null],
      detalles: [null],
    });
    this.cargarRecrias();
    this.cargarFincas();
    this.cargarMadres();
    this.cargarNovillas();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

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

  private applyFilter() {
    this.dataSource.filter = JSON.stringify({
      q: this.qCtrl.value || '',
      fincaId: this.fincaCtrl.value || '',
    });
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  private cargarRecrias() {
    this.recriasService.getAll().subscribe({
      next: (res) => {
        this.recrias = res.map((item: any) => ({
          id: item.id,
          numero: item.numero,
          nombre: item.nombre,
        }));
      },
      error: () => {},
    });
  }

  private cargarFincas() {
    this.fincaService.listar().subscribe({
      next: (res) => {
        this.fincas = res.map((f: any) => ({ id: f.id, nombre: f.nombre }));
      },
      error: () => {},
    });
  }

  private cargarMadres() {
    this.paridaService.getAll().subscribe({
      next: (res) => {
        this.madres = res.map((p: any) => ({ numero: p.numero, nombre: p.nombre }));
      },
      error: () => {},
    });
  }

  async onSelectRecria(id: string | null) {
    console.error('🔴 EVENTO DISPUESTO', id);
    if (!id) {
      this.onNuevo();
      return;
    }
    this.loading = true;
    try {
      const det: any = await firstValueFrom(this.recriasService.getById(id));
      if (!det) return;

      this.form.patchValue({
        numero: det.numero,
        nombre: det.nombre,
        fechaNac: det.fechaNac ? new Date(det.fechaNac) : null,
        fechaDestete: det.fechaDestete ? new Date(det.fechaDestete) : null,
        color: det.color ?? null,
        propietario: det.propietario ?? null,
        pesoKg: det.pesoKg ?? null,
        fincaId: det.fincaId ?? null,
        madreNumero: det.madreNumero ?? null,
        procedencia: det.numero ?? null,
        detalles: det.detalles ?? null,
      });

      this.consultMode = false;
      this.form.enable({ emitEvent: false });
    } finally {
      this.loading = false;
    }
  }

  async cargarNovillas() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.novillasService.getAll());
      const rows: NovillaDetalle[] = (res || []).map((it: any) => ({
        id: it.id,
        numero: it.numero,
        nombre: it.nombre,
        fechaNac: it.fechaNac || null,
        fechaDestete: it.fechaDestete || null,
        color: it.color || null,
        propietario: it.propietario || null,
        pesoKg: it.pesoKg || null,
        fincaId: it.fincaId || null,
        madreNumero: it.madreNumero || null,
        madreNombre: it.madreNombre || null,
        procedencia: it.procedencia || null,
        detalles: it.detalles || null,
      }));
      this.dataSource.data = rows;
      this.totalNovillas = rows.length;
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

  editar(row: NovillaDetalle) {
    this.editingId = row.id;
    this.consultMode = false;
    this.form.enable({ emitEvent: false });
    this.form.patchValue({
      numero: row.numero,
      nombre: row.nombre,
      fechaNac: row.fechaNac ? new Date(row.fechaNac) : null,
      fechaDestete: row.fechaDestete ? new Date(row.fechaDestete) : null,
      color: row.color ?? null,
      propietario: row.propietario ?? null,
      pesoKg: row.pesoKg ?? null,
      fincaId: row.fincaId ?? null,
      madreNumero: row.madreNumero ?? null,
      procedencia: row.procedencia ?? null,
      detalles: row.detalles ?? null,
    });
  }

  eliminar(row: NovillaDetalle) {
    if (!row?.id) return;
    const ok = confirm('¿Eliminar esta novilla de vientre?');
    if (!ok) return;
    this.loading = true;
    this.novillasService.delete(row.id).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Registro eliminado', 'OK', { duration: 3000 });
        this.cargarNovillas();
      },
      error: () => {
        this.loading = false;
        this.snack.open('No se pudo eliminar', 'OK', { duration: 3000 });
      },
    });
  }

  exportPdf() {
    const exportKeys = this.displayedColumns.filter((k) => this.visible.has(k) && k !== 'acciones');
    const headers = exportKeys.map((k) => this.allColumns.find((c) => c.key === k)?.label ?? k.toUpperCase());
    const data = this.dataSource.filteredData?.length ? this.dataSource.filteredData : this.dataSource.data;

    const rows = data.map((r, idx) =>
      exportKeys.map((k) => {
        switch (k) {
          case 'idx':
            return String(idx + 1);
          case 'fechaNac':
          case 'fechaDestete':
            return r[k] ? this.formatDate(r[k]) : '';
          default:
            return (r as any)[k] ?? '';
        }
      }),
    );

    const orientation = exportKeys.length > 6 ? 'l' : 'p';
    const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });

    const title = 'Novillas de Vientre';
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
      headStyles: { fillColor: [31, 59, 87], textColor: 255 },
      margin: { left: 40, right: 40 },
      didDrawPage: (dataCtx) => {
        const page = doc.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 20);
      },
    });

    doc.save(`novillas-vientre_${this.timestamp()}.pdf`);
  }

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

  trackById = (_: number, r: NovillaDetalle) => r?.id ?? r?.numero ?? _;

  submit() {
    if (this.consultMode) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const toYMD = (d: any) => (d instanceof Date ? d.toISOString().slice(0, 10) : d || null);

    const payload = {
      numero: v.numero,
      nombre: v.nombre,
      fechaNac: toYMD(v.fechaNac),
      fechaDestete: toYMD(v.fechaDestete),
      color: v.color ?? null,
      propietario: v.propietario ?? null,
      pesoKg: v.pesoKg ?? null,
      fincaId: v.fincaId,
      madreNumero: v.madreNumero ?? null,
      procedencia: v.procedencia ?? null,
      detalles: v.detalles ?? null,
    };

    this.loading = true;
    const req$ = this.editingId
      ? this.novillasService.update(this.editingId, payload)
      : this.novillasService.create(payload);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.snack.open(this.editingId ? 'Registro actualizado' : 'Registro creado', 'OK', { duration: 3000 });
        this.onNuevo();
        this.cargarNovillas();
      },
      error: () => {
        this.loading = false;
        this.snack.open('No se pudo guardar', 'OK', { duration: 3000 });
      },
    });
  }
}
