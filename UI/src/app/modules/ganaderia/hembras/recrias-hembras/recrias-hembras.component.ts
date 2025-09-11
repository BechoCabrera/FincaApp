import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { RecriasService } from './recrias.service';

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
  // private svc = inject(RecriasService);
  private svc: any = null;

  /** UI state */
  dense = false;
  loading = false;
  consultMode = false;

  /** Select de recrías */
  recrias: RecriaResumen[] = [];
  selectedId: string | null = null;
  totalRecrias = 0;
  get totalCrias() {
    return this.totalRecrias;
  } // alias usado por el HTML

  /** Catálogos (dummy; reemplaza por servicio si aplica) */
  fincas = [
    { id: 'F1', nombre: 'Tierra Nueva' },
    { id: 'F2', nombre: 'La Más Nueva' },
    { id: 'F3', nombre: 'San Antonio' },
  ];
  madres = [
    { numero: '42', nombre: 'Reina' },
    { numero: '382', nombre: 'Brisa' },
    { numero: '309', nombre: 'Luna' },
  ];

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
      fechaDestete: [null],
    });
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

  async cargarRecrias() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.svc.listarRecrias());
      this.recrias = res.items;
      this.totalRecrias = res.total;

      // Si tu endpoint de listado no trae todos los campos de la tabla,
      // mapea con valores por defecto para que renderice sin errores.
      const rows: RecriaDetalle[] = res.items.map((it: any) => ({
        id: it.id,
        numero: it.numero,
        nombre: it.nombre,
        fechaNac: null,
        pesoKg: null,
        color: null,
        propietario: null,
        fincaId: null,
        madreNumero: null,
        madreNombre: null,
        detalles: null,
        fechaDestete: null,
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
      const det: any = await firstValueFrom(this.svc.obtenerRecriaPorId(this.selectedId));
      if (!det) return;

      this.form.patchValue({
        numero: det.numero,
        nombre: det.nombre,
        fechaNac: det.fechaNac ?? null,
        pesoKg: det.pesoKg ?? null,
        color: det.color ?? null,
        propietario: det.propietario ?? null,
        fincaId: det.fincaId ?? null,
        madreNumero: det.madreNumero ?? null,
        detalles: det.detalles ?? null,
        fechaDestete: det.fechaDestete ?? null,
      });

      // Mostrar la consultada en la tabla (opcional)
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
    this.form.reset();
    this.form.enable({ emitEvent: false });
  }

  guardarDestete() {
    if (!this.consultMode || !this.selectedId) return;
    const fd = this.form.get('fechaDestete')?.value;
    if (!fd) return;
    const valor = fd instanceof Date ? fd.toISOString().substring(0, 10) : fd;

    this.loading = true;
    this.svc.actualizarDestete(this.selectedId, valor).subscribe({
      next: () => (this.loading = false),
      error: () => (this.loading = false),
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
    // TODO: abre modal/route edición
    console.log('editar()', row);
  }

  eliminar(row: RecriaDetalle) {
    // TODO: confirma y elimina
    console.log('eliminar()', row);
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

    // TODO: llama a tu servicio de crear/actualizar aquí
    // this.loading = true;
    // this.svc.guardarRecria(payload).subscribe({ next: () => this.loading = false, error: () => this.loading = false });

    console.log('submit()', payload);
  }
}
