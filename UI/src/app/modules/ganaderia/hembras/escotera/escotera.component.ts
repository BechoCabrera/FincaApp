import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { firstValueFrom, startWith } from 'rxjs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
// Si aún no lo tienes, luego te paso el servicio.
// Cambia el nombre si tu servicio usa otra ruta/archivo.
import { ParidaDto, ParidaService } from 'src/app/core/services/parida.service';
import { FincaDto, FincaService } from 'src/app/core/services/finca.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CreateEscoteraDto, EscoteraService } from '../../../../core/services/escotera.service';

// ===== Tipos =====

interface EscoteraDetalle {
  id: string;
  numero: number;
  nombre: string;
  color?: string | null;
  procedencia?: string | null;
  propietario?: string | null;
  nroMama?: number | string | null;
  fechaNacida?: string | Date | null;
  tipoLeche?: string | null;
  fPalpacion?: string | Date | null;
  dPrenez?: number | null; // días de preñez
  detalles?: string | null;
  fechaDestete?: string | Date | null;
  fincaId?: string | null; // opcional, por si filtras por finca
  madreNombre?: string | null; // opcional (tabla)
}

@Component({
  selector: 'app-escotera',
  standalone: true,
  templateUrl: './escotera.component.html',
  styleUrls: ['./escotera.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatAutocompleteModule,
  ],
})

export class EscoteraComponent implements OnInit, AfterViewInit {
  constructor(
    private paridaService: ParidaService,
    private fincaService: FincaService,
    private escoteraService: EscoteraService,
  ) {}
  private fb = inject(FormBuilder);
  // UI state
  dense = false;
  loading = false;

  // selector
  vacas: ParidaDto[] = [];
  totalRegistros = 0;
  get totalCrias() {
    return this.totalRegistros;
  }

  // catálogos dummy (si usas fincas/lo necesitas)
  fincas: FincaDto[] = [];

  // form
  form!: FormGroup;

  // tabla
  dataSource = new MatTableDataSource<EscoteraDetalle>([]);
  displayedColumns: string[] = [
    'idx',
    'numero',
    'nombre',
    'color',
    'procedencia',
    'propietario',
    'nroMama',
    'fechaNacida',
    'tipoLeche',
    'fPalpacion',
    'dPrenez',
    'detalles',
    'acciones',
  ];
  allColumns = [
    { key: 'idx', label: '#' },
    { key: 'numero', label: 'Nº ESCOTERA' },
    { key: 'nombre', label: 'NOMBRE' },
    { key: 'color', label: 'COLOR' },
    { key: 'procedencia', label: 'PROCEDENCIA' },
    { key: 'propietario', label: 'PROPIETARIO' },
    { key: 'nroMama', label: 'N° MAMA' },
    { key: 'fechaNacida', label: 'F. NACIDA' },
    { key: 'tipoLeche', label: 'TIPO LECHE' },
    { key: 'fPalpacion', label: 'F. PALPACIÓN' },
    { key: 'dPrenez', label: 'D. PREÑEZ' },
    { key: 'detalles', label: 'DETALLES' },
    { key: 'acciones', label: 'ACCIONES' },
  ];
  private visible = new Set(this.displayedColumns);

  // filtros
  qCtrl = new FormControl<string>('', { nonNullable: true });
  fincaCtrl = new FormControl<string>('', { nonNullable: true });

  vacaCtrl = new FormControl<string | ParidaDto | null>(null);
  vacasFiltradas: ParidaDto[] = [];

  // mat table hooks
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayVaca = (v: ParidaDto | string | null): string => {
    if (!v) return '';

    if (typeof v === 'string') {
      return v;
    }

    return `${v.numero} — ${v.nombre}`;
  };

  // ========= lifecycle =========
  ngOnInit(): void {
    this.cargarFincas();
    this.form = this.fb.group({
      vacaId: [null],
      fincaId:[null],
      numero: [null, Validators.required],
      nombre: [null, Validators.required],
      color: [null],
      procedencia: [null],
      propietario: [null],
      nroMama: [null],
      fechaNacida: [null],
      tipoLeche: [null],
      fPalpacion: [null],
      dPrenez: [null],
      detalles: [null],
      fechaDestete: [null],
    });
  }

  ngAfterViewInit(): void {
    this.loadParidas();

    this.vacaCtrl.valueChanges.pipe(startWith('')).subscribe((value) => {
      const texto = typeof value === 'string' ? value.toLowerCase() : '';

      this.vacasFiltradas = !texto
        ? this.vacas.slice() // 👈 TODAS al inicio
        : this.vacas.filter((v) => v.numero.toLowerCase().includes(texto) || v.nombre.toLowerCase().includes(texto));
    });

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

  // ========= helpers template =========
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

  cargarFincas() {
    this.fincaService.listar().subscribe({
      next: (res) => (this.fincas = res),
    });
  }

  loadParidas() {
    this.paridaService.getAll().subscribe((paridas) => {
      this.vacas = paridas;
    });
  }
  // ========= data =========
  private applyFilter() {
    this.dataSource.filter = JSON.stringify({
      q: this.qCtrl.value || '',
      fincaId: this.fincaCtrl.value || '',
    });
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  onVacaSelected(vaca: ParidaDto | null) {
    if (!vaca) {
      this.form.patchValue({ vacaId: null });
      return;
    }

    this.form.patchValue({
      numero: vaca.numero,
      vacaId: vaca.id,
      nombre: vaca.nombre ?? null,
      color: vaca.color ?? null,
      procedencia: vaca.procedencia ?? null,
      propietario: vaca.propietario ?? null,
      fechaNacida: vaca.fechaNacimiento ? new Date(vaca.fechaNacimiento) : null,
      tipoLeche: vaca.tipoLeche ?? null,
      fincaId: vaca.fincaId,
    });
  }

  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading = true;

    const v = this.form.getRawValue();

    const toYMD = (d: any) => (d instanceof Date ? d.toISOString().slice(0, 10) : d || null);

    const payload:CreateEscoteraDto = {
      vacaId: v.vacaId ?? null,
      numero: v.numero,
      nombre: v.nombre,

      color: v.color ?? null,
      procedencia: v.procedencia ?? null,
      propietario: v.propietario ?? null,
      nroMama: v.nroMama ?? null,
      fincaId:v.fincaId,
      fechaNacida: toYMD(v.fechaNacida),
      tipoLeche: v.tipoLeche ?? null,
      fPalpacion: toYMD(v.fPalpacion),
      dPrenez: v.dPrenez ?? null,

      detalles: v.detalles ?? null,
      fechaDestete: toYMD(v.fechaDestete),
    };

    console.log('ESCOTERA SAVE PAYLOAD', payload);

    this.escoteraService.create(payload).subscribe({
      next: () => {
        this.form.reset();
        this.loadEscotera();
      },
      error: (err) => alert(err.error?.message ?? 'Número duplicado'),
    });

    this.loading = false;
  }

  loadEscotera() {
    this.escoteraService.getAll().subscribe((data) => {
      this.dataSource.data = data;
    });
  }
  onNuevo() {
    this.form.reset();
    this.form.enable({ emitEvent: false });
  }

  // ========= tabla: columnas / acciones =========
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

  editar(row: EscoteraDetalle) {
    console.log('editar()', row);
  }
  eliminar(row: EscoteraDetalle) {
    console.log('eliminar()', row);
  }

  trackById = (_: number, r: EscoteraDetalle) => r?.id ?? r?.numero ?? _;

  // submit normal (si decides permitir crear/editar fuera de consulta)
  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.getRawValue();
    const toYMD = (d: any) => (d instanceof Date ? d.toISOString().slice(0, 10) : d || null);

    const payload = {
      numero: v.numero,
      nombre: v.nombre,
      color: v.color ?? null,
      procedencia: v.procedencia ?? null,
      propietario: v.propietario ?? null,
      nroMama: v.nroMama ?? null,
      fechaNacida: toYMD(v.fechaNacida),
      tipoLeche: v.tipoLeche ?? null,
      fPalpacion: toYMD(v.fPalpacion),
      dPrenez: v.dPrenez ?? null,
      detalles: v.detalles ?? null,
      fechaDestete: toYMD(v.fechaDestete),
    };

    console.log('submit()', payload);
    // this.svc.crearEscotera(payload).subscribe(...)
  }

  exportPdf() {
    // Columnas exportables = visibles menos 'acciones'
    const exportKeys = this.displayedColumns.filter((k) => this.visible.has(k) && k !== 'acciones');
    const headers = exportKeys.map((k) => this.allColumns.find((c) => c.key === k)?.label ?? k.toUpperCase());

    // Datos (usa filtrados si hay filtro activo)
    const data = this.dataSource.filteredData?.length ? this.dataSource.filteredData : this.dataSource.data;

    // Construir filas
    const rows = data.map((r: any, idx: number) =>
      exportKeys.map((k) => {
        switch (k) {
          case 'idx':
            return String(idx + 1);
          case 'fechaNacida':
            return r.fechaNacida ? this.formatDate(r.fechaNacida) : '';
          case 'fPalpacion':
            return r.fPalpacion ? this.formatDate(r.fPalpacion) : '';
          default:
            return r[k] ?? '';
        }
      }),
    );

    const orientation = exportKeys.length > 6 ? 'l' : 'p';
    const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });

    const title = 'Registro Escotera';
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

    doc.save(`escotera_${this.timestamp()}.pdf`);
  }

  /* ===== helpers ===== */
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
}
