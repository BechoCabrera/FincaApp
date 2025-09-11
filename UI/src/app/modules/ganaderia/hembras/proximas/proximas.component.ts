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

// Servicio (te lo paso si lo pides)
import { ProximasService } from './proximas.service';

type TipoOrigen = 'escotera' | 'novilla';

interface OpcionAnimal { id: string; numero: number | string; nombre: string; }

interface ProximaDetalle {
  id: string;
  tipo: TipoOrigen;            // de dónde viene (escotera/novilla)
  numero: number | string;
  nombre: string;
  fechaNac?: string | Date | null;
  color?: string | null;
  nroMama?: number | string | null;
  procedencia?: string | null;
  propietario?: string | null;
  fechaDestete?: string | Date | null;
  fPalpacion?: string | Date | null;
  dPrenes?: number | null;
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
  private svc = inject(ProximasService);

  // ===== UI State
  loading = false;
  dense = false;
  consultMode = false;

  // ===== Selectores
  tipo: TipoOrigen = 'escotera';
  opciones: OpcionAnimal[] = [];   // opciones del select según tipo
  selectedId: string | null = null;

  total = 0;
  get totalCrias() { return this.total; }

  // ===== Form
  form!: FormGroup;

  // ===== Tabla
  dataSource = new MatTableDataSource<ProximaDetalle>([]);
  displayedColumns: string[] = [
    'idx','tipo','numero','nombre','fechaNac','color','nroMama','procedencia',
    'propietario','fechaDestete','fPalpacion','dPrenes','detalles','acciones'
  ];
  allColumns = [
    { key: 'idx',           label: '#' },
    { key: 'tipo',          label: 'ORIGEN' },
    { key: 'numero',        label: 'Nº' },
    { key: 'nombre',        label: 'NOMBRE' },
    { key: 'fechaNac',      label: 'F. NACIO' },
    { key: 'color',         label: 'COLOR' },
    { key: 'nroMama',       label: 'N° MAMA' },
    { key: 'procedencia',   label: 'PROCEDENCIA' },
    { key: 'propietario',   label: 'PROPIETARIO' },
    { key: 'fechaDestete',  label: 'F. DESTETE' },
    { key: 'fPalpacion',    label: 'F. PALPACIÓN' },
    { key: 'dPrenes',       label: 'D. PREÑES' },
    { key: 'detalles',      label: 'DETALLES' },
    { key: 'acciones',      label: 'ACCIONES' },
  ];
  private visible = new Set(this.displayedColumns);

  // Filtros
  qCtrl = new FormControl<string>('', { nonNullable: true });

  // Mat table hooks
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // ====== Lifecycle
  ngOnInit(): void {
    this.form = this.fb.group({
      numero:        [null, Validators.required],
      nombre:        [null, Validators.required],
      fechaNac:      [null],
      color:         [null],
      nroMama:       [null],
      procedencia:   [null],
      propietario:   [null],
      fechaDestete:  [null],
      fPalpacion:    [null],
      dPrenes:       [null],
      detalles:      [null],
    });

    this.cargarOpciones();      // carga opciones para el tipo inicial
    this.cargarTabla();         // carga tabla (ambos tipos o el que decidas mostrar)
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
  formOk() { return this.form.valid; }
  isSaving() { return this.loading; }

  // ====== Data
  private applyFilter() {
    this.dataSource.filter = this.qCtrl.value || '';
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  async cargarOpciones() {
    // carga opciones para el tipo seleccionado
    const res = await firstValueFrom(this.svc.listarOpciones(this.tipo));
    this.opciones = res.items; // [{id, numero, nombre}]
    this.selectedId = null;
  }

  async cargarTabla() {
    this.loading = true;
    try {
      // Puedes cargar ambos tipos concatenados para mostrar un padrón general
      const [esc, nov] = await Promise.all([
        firstValueFrom(this.svc.listar('escotera')),
        firstValueFrom(this.svc.listar('novilla')),
      ]);
      const a: ProximaDetalle[] = [
        ...esc.items.map((x: any) => ({ ...x, tipo: 'escotera' as const })),
        ...nov.items.map((x: any) => ({ ...x, tipo: 'novilla'  as const })),
      ];
      this.dataSource.data = a;
      this.total = esc.total + nov.total;
      this.applyFilter();
    } finally {
      this.loading = false;
    }
  }

  async onConsultar() {
    if (!this.selectedId) return;
    this.loading = true;
    try {
      const det = await firstValueFrom(this.svc.obtenerPorId(this.tipo, this.selectedId));
      if (!det) return;

      this.form.patchValue({
        numero:       det.numero,
        nombre:       det.nombre,
        fechaNac:     det.fechaNac ?? null,
        color:        det.color ?? null,
        nroMama:      det.nroMama ?? null,
        procedencia:  det.procedencia ?? null,
        propietario:  det.propietario ?? null,
        fechaDestete: det.fechaDestete ?? null,
        fPalpacion:   det.fPalpacion ?? null,
        dPrenes:      det.dPrenes ?? null,
        detalles:     det.detalles ?? null,
      });

      // Mostrar sólo lo consultado (opcional)
      this.dataSource.data = [{ ...det, tipo: this.tipo }];

      // Bloquear salvo fechaDestete (igual que antes)
      this.consultMode = true;
      this.form.disable({ emitEvent: false });
      this.form.get('fechaDestete')?.enable({ emitEvent: false });
      this.applyFilter();
    } finally {
      this.loading = false;
    }
  }

  onNuevo() {
    this.consultMode = false;
    this.selectedId = null;
    this.form.reset();
    this.form.enable({ emitEvent: false });
  }

  guardarDestete() {
    if (!this.consultMode || !this.selectedId) return;
    const fd = this.form.get('fechaDestete')?.value;
    if (!fd) return;
    const yyyyMmDd = fd instanceof Date ? fd.toISOString().slice(0, 10) : fd;

    this.loading = true;
    this.svc.actualizarDestete(this.tipo, this.selectedId, yyyyMmDd).subscribe({
      next: () => (this.loading = false),
      error: () => (this.loading = false),
    });
  }

  // ====== Tabla: columnas
  get allSelected() { return this.visible.size === this.allColumns.length; }
  get someSelected() { return this.visible.size > 0 && !this.allSelected; }
  isColumnVisible(key: string) { return this.visible.has(key); }
  toggleColumn(key: string, on: boolean) {
    if (on) this.visible.add(key); else this.visible.delete(key);
    this.displayedColumns = this.allColumns.map(c => c.key).filter(k => this.visible.has(k));
  }
  toggleAll(on: boolean) {
    if (on) this.visible = new Set(this.allColumns.map(c => c.key));
    else this.visible.clear();
    this.displayedColumns = this.allColumns.map(c => c.key).filter(k => this.visible.has(k));
  }

  editar(row: ProximaDetalle) { console.log('editar()', row); }
  eliminar(row: ProximaDetalle) { console.log('eliminar()', row); }

  // ====== Exportación PDF
  exportPdf() {
    const exportKeys = this.displayedColumns.filter(k => this.visible.has(k) && k !== 'acciones');
    const headers = exportKeys.map(k => this.allColumns.find(c => c.key === k)?.label ?? k.toUpperCase());
    const data = this.dataSource.filteredData?.length ? this.dataSource.filteredData : this.dataSource.data;

    const rows = data.map((r, idx) => exportKeys.map(k => {
      switch (k) {
        case 'idx':           return String(idx + 1);
        case 'fechaNac':      return r.fechaNac ? this.formatDate(r.fechaNac) : '';
        case 'fechaDestete':  return r.fechaDestete ? this.formatDate(r.fechaDestete) : '';
        case 'fPalpacion':    return r.fPalpacion ? this.formatDate(r.fPalpacion) : '';
        default:              return (r as any)[k] ?? '';
      }
    }));

    const orientation = exportKeys.length > 7 ? 'l' : 'p';
    const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });

    const title = 'Vacas Próximas';
    const subtitle = `Tipo: ${this.tipo.toUpperCase()} / Generado: ${this.formatDateTime(new Date())} / Registros: ${rows.length}`;

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
      }
    });

    doc.save(`proximas_${this.timestamp()}.pdf`);
  }

  // ====== utils
  private formatDate(d: string | Date) {
    const dt = (typeof d === 'string') ? new Date(d) : d;
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
