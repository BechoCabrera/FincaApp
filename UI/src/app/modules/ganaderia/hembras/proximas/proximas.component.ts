import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

// Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

// PDF
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EscoteraService } from 'src/app/core/services/escotera.service';
import { ProximaService, CreateProximaDto, UpdateProximaDto, ProximaDto } from 'src/app/core/services/proxima.service';
import { MatSnackBar } from '@angular/material/snack-bar';

// Servicio (te lo paso si lo pides)
// import { ProximasService } from './proximas.service';

type TipoOrigen = 'escotera' | 'novilla';

interface ProximaDetalle {
  id: string;
  tipo: TipoOrigen; // de dónde viene (escotera/novilla)
  numero: number | string;
  nombre: string;
  fechaNacida?: string | Date | null;
  color?: string | null;
  nroMama?: number | string | null;
  procedencia?: string | null;
  propietario?: string | null;
  fechaDestete?: string | Date | null;
  fPalpacion?: string | Date | null;
  dPrenez?: number | null;
  detalles?: string | null;
  fincaId?: string | null;
}

@Component({
  selector: 'app-proximas',
  standalone: true,
  templateUrl: './proximas.component.html',
  styleUrls: ['./proximas.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatDividerModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class ProximasComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private currentDetail?: ProximaDto;
  private editingId: string | null = null;

  // ===== UI State
  valueAnimalSelect = null;
  loading = false;
  dense = false;
  consultMode = false;

  // ===== Selectores
  tipo: TipoOrigen = 'escotera';
  opciones: any[] = []; // opciones del select según tipo
  selectedId: string | null = null;

  total = 0;
  get totalCrias() {
    return this.total;
  }

  // ===== Form
  form!: FormGroup;

  // ===== Tabla
  dataSource = new MatTableDataSource<ProximaDetalle>([]);
  displayedColumns: string[] = [
    'idx',
    'tipo',
    'numero',
    'nombre',
    'fechaNacida',
    'color',
    'nroMama',
    'procedencia',
    'propietario',
    'fechaDestete',
    'fPalpacion',
    'dPrenez',
    'detalles',
    'acciones',
  ];
  allColumns = [
    { key: 'idx', label: '#' },
    { key: 'tipo', label: 'ORIGEN' },
    { key: 'numero', label: 'Nº' },
    { key: 'nombre', label: 'NOMBRE' },
    { key: 'fechaNacida', label: 'F. NACIO' },
    { key: 'color', label: 'COLOR' },
    { key: 'nroMama', label: 'N° MAMA' },
    { key: 'procedencia', label: 'PROCEDENCIA' },
    { key: 'propietario', label: 'PROPIETARIO' },
    { key: 'fechaDestete', label: 'F. DESTETE' },
    { key: 'fPalpacion', label: 'F. PALPACIÓN' },
    { key: 'dPrenez', label: 'D. PREÑES' },
    { key: 'detalles', label: 'DETALLES' },
    { key: 'acciones', label: 'ACCIONES' },
  ];
  private visible = new Set(this.displayedColumns);

  // Filtros
  qCtrl = new FormControl<string>('', { nonNullable: true });

  // Mat table hooks
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  detalles?: string | null;
  fechaDestete?: string | null;

  vacaId?: string | null;
  fincaId?: string | null;
  constructor(
    private snack: MatSnackBar,
    private escoteraService: EscoteraService,
    private proximaService: ProximaService,
  ) {}

  // ====== Lifecycle
  ngOnInit(): void {
    this.form = this.fb.group({
      numero: [null, Validators.required],
      nombre: [null, Validators.required],
      fechaNacida: [null],
      color: [null],
      nroMama: [null],
      procedencia: [null],
      propietario: [null],
      fechaDestete: [null],
      fPalpacion: [null],
      dPrenez: [null],
      detalles: [null],
      fincaId: [null],
    });

    this.cargarOpciones(); // carga opciones para el tipo inicial
    this.cargarTabla(); // carga tabla (ambos tipos o el que decidas mostrar)
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Filtro por texto libre
    this.dataSource.filterPredicate = (row, filterText) => {
      const q = (filterText || '').toLowerCase();
      return (
        String(row.numero).toLowerCase().includes(q) ||
        (row.nombre || '').toLowerCase().includes(q) ||
        (row.tipo || '').toLowerCase().includes(q)
      );
    };
    this.qCtrl.valueChanges.subscribe(() => this.applyFilter());
  }

  // ====== Template helpers
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

  // ====== Data
  private applyFilter() {
    this.dataSource.filter = this.qCtrl.value || '';
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  async cargarOpciones() {
    this.opciones = [];
    switch (this.tipo) {
      case 'escotera':
        this.escoteraService.getAll().subscribe((res) => {
          this.opciones = res.map((e) => ({
            id: e.id,
            numero: e.numero,
            nombre: e.nombre,
            fincaId: e.fincaId,
            color: e.color,
            propietario: e.propietario,
            procedencia: e.procedencia,
            nroMama: e.nroMama,
            fechaNacida: e.fechaNacida,
            fechaDestete: e.fechaDestete,
            detalles: e.detalles,
            tipoLeche: e.tipoLeche,
            fPalpacion: e.fPalpacion,
            dPrenez: e.dPrenez,
          }));
        });
        break;
      case 'novilla':
        break;
    }
    this.selectedId = null;
  }

  onSelectAnimal(arg: any) {
    switch (this.tipo) {
      case 'escotera':
        const esc = this.opciones.find((e) => e.id === arg.value);
        if (esc == null) {
          this.snack.open('Error, no en contrado, intente nuevamente', 'OK', { duration: 3000 });
          this.form.reset();

          return;
        } else {
          this.form = this.fb.group({
            numero: esc.numero,
            nombre: esc.nombre,
            fechaNacida: esc.fechaNacida || null,
            color: esc.color,
            nroMama: esc.nroMama,
            procedencia: esc.procedencia || null,
            propietario: esc.propietario || null,
            fechaDestete: esc.fechaDestete || null,
            fPalpacion: esc.fPalpacion || null,
            dPrenez: esc.dPrenez || null,
            detalles: esc.detalles || null,
            fincaId: esc.fincaId,
          });
        }
        break;
      case 'novilla':
        break;
    }
  }
  async cargarTabla() {
    this.loading = true;
    try {
      const items = await firstValueFrom(this.proximaService.search());
      this.dataSource.data = items.map((i) => ({
        ...i,
        tipo: (i as any).tipo ?? 'escotera',
      }));
      this.total = this.dataSource.data.length;
      this.applyFilter();
    } finally {
      this.loading = false;
    }
  }

  async onConsultar() {
    if (!this.selectedId) return;
    this.loading = true;
    try {
      const det = await firstValueFrom(this.proximaService.getById(this.selectedId));
      if (!det) return;
      this.currentDetail = det;

      this.form.patchValue({
        numero: det.numero,
        nombre: det.nombre,
        fechaNacida: det.fechaNacida ?? null,
        color: det.color ?? null,
        nroMama: det.nroMama ?? null,
        procedencia: det.procedencia ?? null,
        propietario: det.propietario ?? null,
        fechaDestete: det.fechaDestete ?? null,
        fPalpacion: det.fPalpacion ?? null,
        dPrenez: det.dPrenez ?? null,
        detalles: det.detalles ?? null,
        fincaId: det.fincaId ?? null,
      });

      // Mostrar sólo lo consultado (opcional)
      this.dataSource.data = [{ ...det, tipo: this.tipo } as ProximaDetalle];

      // Bloquear salvo fechaDestete (igual que antes)
      this.consultMode = true;
      this.form.disable({ emitEvent: false });
      this.form.get('fechaDestete')?.enable({ emitEvent: false });
      this.applyFilter();
    } finally {
      this.loading = false;
    }
  }

  submit() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const toYmd = (d: any) => (d instanceof Date ? d.toISOString().slice(0, 10) : d || null);

    const payload: CreateProximaDto = {
      numero: v.numero,
      nombre: v.nombre,
      fechaNacida: toYmd(v.fechaNacida),
      color: v.color ?? null,
      nroMama: v.nroMama ?? null,
      procedencia: v.procedencia ?? null,
      propietario: v.propietario ?? null,
      fechaDestete: toYmd(v.fechaDestete),
      fPalpacion: toYmd(v.fPalpacion),
      dPrenez: v.dPrenez ?? null,
      detalles: v.detalles ?? null,
      fincaId: v.fincaId ?? null,
    };

    this.loading = true;
    if (this.editingId) {
      const update: UpdateProximaDto = { ...payload, id: this.editingId };
      this.proximaService.update(update).subscribe({
        next: () => {
          this.snack.open('Registro actualizado', 'OK', { duration: 2500 });
          this.onNuevo();
          this.cargarTabla();
          this.loading = false;
        },
        error: () => {
          this.snack.open('No se pudo actualizar', 'OK', { duration: 3000 });
          this.loading = false;
        },
      });
      return;
    }

    this.proximaService.create(payload).subscribe({
      next: () => {
        this.snack.open('Registro creado', 'OK', { duration: 2500 });
        this.onNuevo();
        this.cargarTabla();
        this.loading = false;
      },
      error: () => {
        this.snack.open('No se pudo crear', 'OK', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  onNuevo() {
    this.consultMode = false;
    this.selectedId = null;
    this.editingId = null;
    this.currentDetail = undefined;
    this.form.reset();
    this.form.enable({ emitEvent: false });
  }

  guardarDestete() {
    if (!this.consultMode || !this.selectedId) return;
    const fd = this.form.get('fechaDestete')?.value;
    if (!fd) return;
    const toYmd = (d: any) => (d instanceof Date ? d.toISOString().slice(0, 10) : d || null);
    const v = this.form.getRawValue();
    const update: UpdateProximaDto = {
      id: this.selectedId,
      numero: v.numero,
      nombre: v.nombre,
      fechaNacida: toYmd(v.fechaNacida),
      color: v.color ?? null,
      nroMama: v.nroMama ?? null,
      procedencia: v.procedencia ?? null,
      propietario: v.propietario ?? null,
      fechaDestete: toYmd(v.fechaDestete),
      fPalpacion: toYmd(v.fPalpacion),
      dPrenez: v.dPrenez ?? null,
      detalles: v.detalles ?? null,
      fincaId: v.fincaId ?? null,
    };

    this.loading = true;
    this.proximaService.update(update).subscribe({
      next: () => {
        this.snack.open('Destete actualizado', 'OK', { duration: 2500 });
        this.loading = false;
        this.cargarTabla();
      },
      error: () => {
        this.snack.open('No se pudo actualizar destete', 'OK', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  // ====== Tabla: columnas
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

  editar(row: ProximaDetalle) {
    this.consultMode = false;
    this.editingId = row.id;
    this.selectedId = row.id;
    this.form.enable({ emitEvent: false });
    this.form.patchValue({
      numero: row.numero,
      nombre: row.nombre,
      fechaNacida: row.fechaNacida ?? null,
      color: row.color ?? null,
      nroMama: row.nroMama ?? null,
      procedencia: row.procedencia ?? null,
      propietario: row.propietario ?? null,
      fechaDestete: row.fechaDestete ?? null,
      fPalpacion: row.fPalpacion ?? null,
      dPrenez: row.dPrenez ?? null,
      detalles: row.detalles ?? null,
      fincaId: row.fincaId ?? null,
    });
  }
  eliminar(row: ProximaDetalle) {
    const ok = confirm(`¿Eliminar registro ${row.numero} - ${row.nombre}?`);
    if (!ok) return;
    this.loading = true;
    this.proximaService.delete(row.id).subscribe({
      next: () => {
        this.snack.open('Registro eliminado', 'OK', { duration: 2500 });
        this.loading = false;
        this.cargarTabla();
      },
      error: () => {
        this.snack.open('No se pudo eliminar', 'OK', { duration: 3000 });
        this.loading = false;
      },
    });
  }

  // ====== Exportación PDF
  exportPdf() {
    const exportKeys = this.displayedColumns.filter((k) => this.visible.has(k) && k !== 'acciones');
    const headers = exportKeys.map((k) => this.allColumns.find((c) => c.key === k)?.label ?? k.toUpperCase());
    const data = this.dataSource.filteredData?.length ? this.dataSource.filteredData : this.dataSource.data;

    const rows = data.map((r, idx) =>
      exportKeys.map((k) => {
        switch (k) {
          case 'idx':
            return String(idx + 1);
          case 'fechaNacida':
            return r.fechaNacida ? this.formatDate(r.fechaNacida) : '';
          case 'fechaDestete':
            return r.fechaDestete ? this.formatDate(r.fechaDestete) : '';
          case 'fPalpacion':
            return r.fPalpacion ? this.formatDate(r.fPalpacion) : '';
          default:
            return (r as any)[k] ?? '';
        }
      }),
    );

    const orientation = exportKeys.length > 7 ? 'l' : 'p';
    const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });

    const title = 'Vacas Próximas';
    const subtitle = `Tipo: ${this.tipo.toUpperCase()} / Generado: ${this.formatDateTime(new Date())} / Registros: ${
      rows.length
    }`;

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

    doc.save(`proximas_${this.timestamp()}.pdf`);
  }

  // ====== utils
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

  trackById = (_: number, r: ProximaDetalle) => r?.id ?? r?.numero ?? _;
}
