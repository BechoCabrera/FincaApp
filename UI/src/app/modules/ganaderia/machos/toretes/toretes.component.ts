import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { RecriasMachosService, RecriaResumen, RecriaDetalle } from 'src/app/core/services/recrias-machos.service';

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
import { ToroService } from 'src/app/core/services/toro.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { FincaService } from 'src/app/core/services/finca.service';
import { ParidaService } from 'src/app/core/services/parida.service';

@Component({
  selector: 'app-toretes',
  standalone: true,
  templateUrl: './toretes.component.html',
  styleUrls: ['./toretes.component.css'],
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
export class ToretesComponent implements OnInit, AfterViewInit {
  constructor(private toroService: ToroService) {}

  private fb = inject(FormBuilder);
  private svc = inject(RecriasMachosService);
  private notify = inject(NotificationService);
  private fincaService = inject(FincaService);
  private paridaService = inject(ParidaService);

  dense = false;
  loading = false;
  consultMode = false;

  toretes: RecriaResumen[] = [];
  selectedId: string | null = null;
  totalToretes = 0;
  get totalCrias() {
    return this.totalToretes;
  }

  fincas: any[] = [];
  madres: any[] = [];

  form!: FormGroup;
  private editingId: string | null = null;

  dataSource: any = new MatTableDataSource<RecriaDetalle>([]);
  displayedColumns: string[] = [
    'idx',
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
      nombre: [null, Validators.required],
      fechaNac: [null as Date | null],
      pesoKg: [null],
      color: [null],
      propietario: [null],
      fincaId: [null, Validators.required],
      madreNumero: [null],
      detalles: [null],
      fechaDestete: [null as Date | null],
    });
    // Ahora que el formulario existe, cargamos datos dependientes
    this.cargarFincas();
    this.cargarMadres();
    this.cargarToretes();
  }

 private cargarMadres() {
    // El formulario usa `madreNumero` como control para seleccionar la madre
    this.form.get('madreNumero')?.disable({ emitEvent: false });
    this.paridaService.getAll().subscribe({
      next: (res) => {
        this.madres = res.map((p) => ({ id: p.id, numero: p.numero, nombre: p.nombre }));
        if (this.form.enabled) this.form.get('madreNumero')?.enable({ emitEvent: false });
      },
      error: () => {
        if (this.form.enabled) this.form.get('madreNumero')?.enable({ emitEvent: false });
        this.notify.error('No se pudo cargar las madres', 3000);
      },
    });
  }

  private cargarFincas() {
    this.form.get('fincaId')?.disable({ emitEvent: false });
    this.fincaCtrl.disable({ emitEvent: false });
    this.fincaService.listar().subscribe({
      next: (res) => {
        this.fincas = res.filter((f) => f.isActive).map((f) => ({ id: f.id, nombre: f.nombre }));

        if (this.form.enabled) this.form.get('fincaId')?.enable({ emitEvent: false });
        this.fincaCtrl.enable({ emitEvent: false });
      },
      error: () => {
        if (this.form.enabled) this.form.get('fincaId')?.enable({ emitEvent: false });
        this.fincaCtrl.enable({ emitEvent: false });
        this.notify.error('No se pudo cargar las fincas', 3000);
      },
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Filtro compuesto (texto + finca) — buscar solo por nombre ahora
    this.dataSource.filterPredicate = (row: { nombre: any; fincaId: string }, filterJson: string) => {
      const f = JSON.parse(filterJson) as { q: string; fincaId: string };
      const q = (f.q || '').toLowerCase();
      const finca = f.fincaId || '';
      const matchTexto = (row.nombre || '').toLowerCase().includes(q);
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

  async cargarToretes() {
    this.loading = true;
    try {
      const res: any = await firstValueFrom(this.svc.listarRecrias());

      // soporto formato { total, items } o array directo
      const items = Array.isArray(res) ? res : res?.items || [];
      this.toretes = items;
      this.totalToretes = Array.isArray(res) ? items.length : res?.total || items.length || 0;

      // Mapeo básico para la tabla si el listado no trae todos los campos
      const rows: RecriaDetalle[] = items.map((it: any) => ({
        id: it.id,
        numero: it.numero,
        nombre: it.nombre,
        fechaNac: it.fechaNac ?? null,
        pesoKg: it.pesoKg ?? null,
        color: it.color ?? null,
        propietario: it.propietario ?? null,
        fincaId: it.fincaId ?? null,
        madreNumero: it.madreNumero ?? null,
        madreNombre: it.madreNombre ?? null,
        detalles: it.detalles ?? null,
        fechaDestete: it.fechaDestete ?? null,
      }));
      this.dataSource.data = rows;
      this.applyFilter();
    } catch {
      this.toretes = [];
      this.totalToretes = 0;
      this.dataSource.data = [];
      this.notify.error('No se pudo cargar los toretes');
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

      // Mostrar consultada en la tabla (opcional)
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
    } catch {
      this.notify.error('No se pudo consultar');
    } finally {
      this.loading = false;
    }
  }

  onSelectRecria(id: string | null) {
    this.selectedId = id;
    if (!id) return;
    this.onConsultar();
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
    const valor = fd instanceof Date ? fd.toISOString().slice(0, 10) : fd;

    this.loading = true;
    this.svc.actualizarDestete(this.selectedId, valor).subscribe({
      next: () => {
        this.loading = false;
        this.notify.success('Destete actualizado');
      },
      error: () => {
        this.loading = false;
        this.notify.error('No se pudo actualizar destete');
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
    if (!row?.id) return;
    this.loading = true;
    this.svc.obtenerRecriaPorId(row.id).subscribe({
      next: (det) => {
        this.editingId = det.id;
        this.consultMode = false;
        this.form.enable({ emitEvent: false });
        this.form.patchValue({
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
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.notify.error('No se pudo cargar para editar', 3000);
      },
    });
  }

  eliminar(row: RecriaDetalle) {
    if (!row?.id) return;
    if (!confirm(`¿Eliminar torete ${row.nombre}?`)) return;
    this.loading = true;
    this.svc.eliminar(row.id).subscribe({
      next: () => {
        this.loading = false;
        this.cargarToretes();
        this.notify.success('Torete eliminado');
      },
      error: () => {
        this.loading = false;
        this.notify.error('No se pudo eliminar');
      },
    });
  }

  /** ===== Exportación PDF ===== */
  exportPdf() {
    const exportKeys = this.displayedColumns.filter((k) => this.visible.has(k) && k !== 'acciones');
    const headers = exportKeys.map((k) => this.allColumns.find((c) => c.key === k)?.label ?? k.toUpperCase());
    const data = this.dataSource.filteredData?.length ? this.dataSource.filteredData : this.dataSource.data;

    const rows = data.map((r: any, idx: any) =>
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

    const title = 'Toretes';
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
      didDrawPage: () => {
        const page = doc.getNumberOfPages();
        doc.setFontSize(9);
        doc.text(`Página ${page}`, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 20);
      },
    });

    doc.save(`toretes_${this.timestamp()}.pdf`);
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
  trackById = (_: number, r: RecriaDetalle) => r?.id ?? _;

  /** Submit (modo creación/edición normal) */
  submit() {
    if (this.consultMode) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const toYMD = (d: any) => (d instanceof Date ? d.toISOString().slice(0, 10) : d || null);

    const payload = {
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
    const isEdit = !!this.editingId;
    const req$ = isEdit
      ? this.svc.actualizarRecria(this.editingId as string, payload)
      : this.svc.crearRecria(payload as any);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.editingId = null;
        this.form.reset();
        this.form.enable({ emitEvent: false });
        this.cargarToretes();
        this.notify.success(isEdit ? 'Torete actualizado' : 'Torete creado');
      },
      error: () => {
        this.loading = false;
        this.notify.error('No se pudo guardar');
      },
    });
  }
}
