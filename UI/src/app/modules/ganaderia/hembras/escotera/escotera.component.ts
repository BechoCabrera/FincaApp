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
import { TableFiltersComponent } from 'src/app/shared/components/table-filters/table-filters.component';
// Use ParidaService (provides ParidaView adapter) and Escotera service
import { ParidaService } from 'src/app/core/services/parida.service';
import { FincaDto, FincaService } from 'src/app/core/services/finca.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CreateEscoteraDto, EscoteraService } from 'src/app/core/services/escotera.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ParidaView, EscoteraView } from 'src/app/core/models/animal-view.models';

// ===== Tipos =====

interface EscoteraDetalle {
  id: string;
  numeroArete: string | null;
  nombre: string;
  color?: string | null;
  procedencia?: string | null;
  propietario?: string | null;
  nroMama?: number | string | null;
  fechaNacimiento?: string | Date | null;
  tipoLeche?: string | null;
  fPalpacion?: string | Date | null;
  dPrenez?: number | null; // días de preñez
  detalles?: string | null;
  fechaDestete?: string | Date | null;
  fincaActualId?: string | null; // opcional, por si filtras por finca
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
    // shared
    TableFiltersComponent,
    MatAutocompleteModule,
  ],
})
export class EscoteraComponent implements OnInit, AfterViewInit {
  constructor(
    private paridaService: ParidaService,
    private fincaService: FincaService,
    private escoteraService: EscoteraService,
    private snack: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
  ) {}
  private fb = inject(FormBuilder);
  // UI state
  dense = false;
  loading = false;
  isEdit = false;
  escoteraId!: string;
  // selector
  vacas: ParidaView[] = [];
  totalRegistros = 0;
  get totalCrias() {
    return this.totalRegistros;
  }

  // catálogos dummy (si usas fincas/lo necesitas)
  fincas: FincaDto[] = [];

  // tipos de leche (igual que en Paridas)
  tiposLeche: string[] = ['Buena', 'Regular', 'Mala'];

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
    'fechaNacimiento',
    'fechaDestete',
    'tipoLeche',
    'fPalpacion',
    'dPrenez',
    'detalles',
    'acciones',
  ];
  allColumns = [
    { key: 'idx', label: '#' },
    { key: 'numeroArete', label: 'Nº ESCOTERA' },
    { key: 'nombre', label: 'NOMBRE' },
    { key: 'color', label: 'COLOR' },
    { key: 'procedencia', label: 'PROCEDENCIA' },
    { key: 'propietario', label: 'PROPIETARIO' },
    { key: 'nroMama', label: 'N° MAMA' },
    { key: 'fechaNacida', label: 'F. NACIDA' },
    { key: 'tipoLeche', label: 'TIPO LECHE' },
    { key: 'fPalpacion', label: 'F. PALPACIÓN' },
    { key: 'dPrenez', label: 'D. PREÑEZ' },
    { key: 'fechaDestete', label: 'F. DESTETE' },
    { key: 'detalles', label: 'DETALLES' },
    { key: 'acciones', label: 'ACCIONES' },
  ];
  private visible = new Set(this.displayedColumns);

  // filtros
  qCtrl = new FormControl<string>('', { nonNullable: true });
  fincaCtrl = new FormControl<string>('', { nonNullable: true });

  vacaCtrl = new FormControl<string | ParidaView | null>(null);
  vacasFiltradas: ParidaView[] = [];

  // mat table hooks
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayVaca = (v: ParidaView | string | null): string => {
    if (!v) return '';

    if (typeof v === 'string') {
      return v;
    }

    return `${v.numeroArete} — ${v.nombre}`;
  };

  // ========= lifecycle =========
  ngOnInit(): void {
    // 1️⃣ PRIMERO crear el form
    this.form = this.fb.group({
      vacaId: [null],
      fincaActualId: [null, Validators.required],
      numeroArete: [null, Validators.required],
      nombre: [null, Validators.required],
      color: [null],
      procedencia: [null],
      propietario: [null],
      nroMama: [null],
      fechaNacimiento: [null],
      tipoLeche: [null],
      fPalpacion: [null],
      dPrenez: [null],
      detalles: [null],
      fechaDestete: [null, Validators.required],
    });

    // 2️⃣ LUEGO leer la ruta
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.escoteraId = id;
        this.cargarEscoteraById(id);
      }
    });

    // 3️⃣ resto normal
    this.cargarFincas();
    this.loadEscotera();
  }
  ngAfterViewInit(): void {
    this.loadParidas();

    this.vacaCtrl.valueChanges.pipe(startWith('')).subscribe((value) => {
      const texto = typeof value === 'string' ? value.toLowerCase() : '';

      this.vacasFiltradas = !texto
        ? this.vacas.slice() // 👈 TODAS al inicio
        : this.vacas.filter((v) => v.numeroArete?.toLowerCase().includes(texto) || v.nombre?.toLowerCase().includes(texto));
    });

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.dataSource.filterPredicate = (row, filterJson) => {
      const f = JSON.parse(filterJson) as { q: string; fincaId: string };
      const q = (f.q || '').toLowerCase();
      const finca = f.fincaId || '';

      const matchTexto = String(row.numeroArete || '').includes(q) || (row.nombre || '').toLowerCase().includes(q);
      const matchFinca = !finca || row.fincaActualId === finca;
      return matchTexto && matchFinca;
    };

    this.qCtrl.valueChanges.subscribe(() => this.applyFilter());
    this.fincaCtrl.valueChanges.subscribe(() => this.applyFilter());
  }

  cargarEscoteraById(id: string) {
    this.escoteraService.getByIdAsView(id).subscribe((e: EscoteraView) => {
      this.form.patchValue({
        vacaId: e.vacaId ?? e.id ?? null,
        numeroArete: e.numeroArete ?? null,
        nombre: e.nombre ?? null,
        color: e.color ?? null,
        procedencia: e.procedencia ?? null,
        propietario: e.propietario ?? null,
        fechaNacimiento: e.fechaNacimiento ?? null,
        tipoLeche: e.tipoLeche ?? null,
        fPalpacion: e.fPalpacion ?? null,
        dPrenez: e.dPrenez ?? null,
        detalles: e.detalles ?? null,
        fechaDestete: e.fechaDestete ?? null,
        fincaActualId: e.fincaActualId ?? null,
      });
    });
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
    this.paridaService.getAllAsView().subscribe((paridas) => {
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

  onVacaSelected(vaca: ParidaView | null) {
    if (!vaca) {
      this.form.patchValue({ vacaId: null });
      return;
    }

    // Calcular días de preñez si hay fecha de palpación
    let dPrenez: number | null = null;
    if (vaca.fechaPalpacion) {
      const fechaPalpacion = new Date(vaca.fechaPalpacion);
      const today = new Date();
      dPrenez = Math.floor((today.getTime() - fechaPalpacion.getTime()) / (1000 * 60 * 60 * 24));
    }

    this.form.patchValue({
      numeroArete: vaca.numeroArete,
      vacaId: vaca.id,
      nombre: vaca.nombre ?? null,
      color: vaca.color ?? null,
      procedencia: vaca.procedencia ?? null,
      propietario: vaca.propietario ?? null,
      fechaNacimiento: vaca.fechaNacimiento ? new Date(vaca.fechaNacimiento) : null,
      tipoLeche: vaca.tipoLeche ?? null,
      fPalpacion: vaca.fechaPalpacion ? new Date(vaca.fechaPalpacion) : null,
      dPrenez: dPrenez,
      detalles: vaca.observaciones ?? null,
      fincaActualId: vaca.fincaActualId ?? null,
    });
  }

  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading = true;

    const v = this.form.getRawValue();

    const toYMD = (d: any) => (d instanceof Date ? d.toISOString().slice(0, 10) : d || null);

    const payload: CreateEscoteraDto = {
      numeroArete: Number(v.numeroArete),
      nombre: v.nombre,
      color: v.color ?? null,
      procedencia: v.procedencia ?? null,
      propietario: v.propietario ?? null,
      nroMama: v.nroMama ?? null,
      fechaNacimiento: toYMD(v.fechaNacimiento),
      tipoLeche: v.tipoLeche ?? null,
      fPalpacion: toYMD(v.fPalpacion),
      dPrenez: v.dPrenez ?? null,
      detalles: v.detalles ?? null,
      fechaDestete: toYMD(v.fechaDestete),
      vacaId: v.vacaId ?? null,
      fincaActualId: v.fincaActualId ?? null,
    };

    const request$ = this.isEdit
      ? this.escoteraService.update(this.escoteraId, payload)
      : this.escoteraService.create(payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.snack.open(this.isEdit ? 'Escotera actualizada' : 'Escotera registrada', 'OK', { duration: 3000 });
        this.form.reset();
        this.loadEscotera();
      },
      error: (err: any) => {
        this.loading = false;
        this.snack.open(err.error?.message ?? 'Número de escotera duplicado', 'Cerrar', { duration: 4000 });
      },
    });
  }

  loadEscotera() {
    this.escoteraService.getAllAsView().subscribe((data: EscoteraView[]) => {
      // map EscoteraView -> EscoteraDetalle
      const rows = (data || []).map((e) => {
        return {
          id: e.id,
          numeroArete: e.numeroArete ?? null,
          nombre: e.nombre ?? null,
          color: e.color ?? null,
          procedencia: e.procedencia ?? null,
          propietario: e.propietario ?? null,
          nroMama: e.nroMama ?? null,
          fechaNacimiento: e.fechaNacimiento ?? null,
          tipoLeche: e.tipoLeche ?? null,
          fPalpacion: e.fPalpacion ?? null,
          dPrenez: e.dPrenez ?? null,
          detalles: e.detalles ?? null,
          fechaDestete: e.fechaDestete ?? null,
          fincaActualId: e.fincaActualId ?? null,
        } as EscoteraDetalle;
      });
      this.dataSource.data = rows;
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

  editar(esc: EscoteraDetalle) {
    this.isEdit = true;
    this.form.patchValue({
      numeroArete: esc.numeroArete,
      vacaId: esc.id,
      nombre: esc.nombre ?? null,
      color: esc.color ?? null,
      procedencia: esc.procedencia ?? null,
      propietario: esc.propietario ?? null,
      fechaNacimiento: esc.fechaNacimiento ? new Date(esc.fechaNacimiento as any) : null,
      tipoLeche: esc.tipoLeche ?? null,
      fincaActualId: esc.fincaActualId ?? null,
      dPrenez: esc.dPrenez ?? null,
      detalles: esc.detalles ?? null,
      fPalpacion: esc.fPalpacion ? new Date(esc.fPalpacion as any) : null,
      nroMama: esc.nroMama ?? null,
      fechaDestete: esc.fechaDestete ? new Date(esc.fechaDestete as any) : null,
      id: esc.id,
    });
    this.escoteraId = esc.id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.vacaCtrl.setValue(null);
  }

  eliminar(row: EscoteraDetalle) {
    const confirmacion = confirm(`¿Deseas eliminar la escotera Nº ${row.numeroArete}?`);

    if (!confirmacion) return;

    this.escoteraService.delete(row.id).subscribe(() => {
      this.snack.open('Escotera eliminada', 'OK', { duration: 3000 });
      this.loadEscotera();
    });
  }

  trackById(index: number, item: EscoteraDetalle): string {
    return item.id ?? index.toString();
  }

  // ========= export / helpers =========
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
