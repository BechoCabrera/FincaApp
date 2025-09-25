import { Component, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
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

export interface NovillaVientre {
  id?: string;
  numero: string;
  nombre: string;
  fechaNac?: Date | null;
  fechaDestete?: Date | null;
  color?: string | null;
  propietario?: string | null;
  pesoKg?: number | null;

  // relaciones
  fincaId: string | null;
  madreNumero?: string | null;
  madreNombre?: string | null;
  procedencia?: string | null;
  detalles?: string | null;
}

@Component({
  selector: 'app-novillas-vientre',
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
    FormsModule,
  ],
  providers: [DatePipe],
  templateUrl: './novillas-vientre.component.html',
  styleUrls: ['./novillas-vientre.component.css'],
})
export class NovillasVientreComponent {
  selectedId: string | null = null; // Para seleccionar la novilla o escotera
  recrias: any[] = []; // Lista de recrías
  private fb = inject(FormBuilder);
  private date = inject(DatePipe);

  // Fincas y novillas (mock data, puedes cambiar por tu API)
  fincas = [
    { id: 'F1', nombre: 'Tierra Nueva' },
    { id: 'F2', nombre: 'La Más Nueva' },
    { id: 'F3', nombre: 'San Antonio' },
  ];

  // Lista de madres (ejemplo)
  madres = [
    { numero: '101', nombre: 'Estrella' },
    { numero: '205', nombre: 'Canela' },
    { numero: '309', nombre: 'Luna' },
  ];

  // Formulario
  form = this.fb.group({
    tipo: ['escotera', [Validators.required]], // Define tipo: escotera o novilla
    numero: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    fechaNac: [null as Date | null],
    fechaDestete: [null as Date | null],
    color: [''],
    propietario: [''],
    pesoKg: [null as number | null],
    fincaId: [null as string | null, [Validators.required]],
    madreNumero: [null as string | null],
    madreNombre: [null as string | null],
    procedencia: [''],
    detalles: [''],
  });
  totalNovillas = 0;
  novillas: any;
  selectedNovillaId = [];
  isSaving = signal(false);
  formOk = signal(false);
  canSubmit = computed(() => this.form.valid && !this.isSaving());

  has(ctrl: string, err: string) {
    const c = this.form.get(ctrl);
    return !!(c && c.touched && c.hasError(err));
  }

  // Tabla
  displayedColumns: string[] = [
    'numero',
    'nombre',
    'fechaNac',
    'fechaDestete',
    'color',
    'pesoKg',
    'propietario',
    'madreNumero',
    'madreNombre',
    'detalles',
    'procedencia',
    'acciones',
  ];

  dataSource = new MatTableDataSource<NovillaVientre>([]);

  allColumns = [
    { key: 'numero', label: 'Nº' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'fechaNac', label: 'F. Nacimiento' },
    { key: 'fechaDestete', label: 'F. Destete' },
    { key: 'color', label: 'Color' },
    { key: 'pesoKg', label: 'Peso (kg)' },
    { key: 'propietario', label: 'Propietario' },
    { key: 'madreNumero', label: 'N° Madre' },
    { key: 'madreNombre', label: 'Madre' },
    { key: 'detalles', label: 'Detalles' },
    { key: 'procedencia', label: 'Procedencia' },
    { key: 'acciones', label: 'Acciones' },
  ];
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
    if (show) {
      if (!this.displayedColumns.includes(key)) this.displayedColumns.push(key);
    } else {
      this.displayedColumns = this.displayedColumns.filter((c) => c !== key);
    }
  }

  colLabel(key: string): string {
    const column = this.allColumns.find((col) => col.key === key);
    return column ? column.label : key; // Retorna el label si lo encuentra, de lo contrario retorna el key
  }
  // Filtros
  qCtrl = new FormControl<string>('', { nonNullable: true });
  fincaCtrl = new FormControl<string>('', { nonNullable: true });
  isColumnVisible = (k: string) => this.displayedColumns.includes(k);

  dense = false;

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  ngOnInit() {
    this.form.statusChanges.subscribe(() => {
      this.formOk.set(this.form.valid);
    });
    this.setData(this.mockRows(12));
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  setData(rows: NovillaVientre[]) {
    this.dataSource.data = rows ?? [];
  }

  get totalCrias() {
    return this.dataSource.data.length;
  }

  mockRows(n = 8): NovillaVientre[] {
    const pick = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
    const randDate = (from: Date, to: Date) =>
      new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));

    const today = new Date();
    const start = new Date(today.getFullYear() - 3, 0, 1);
    const colores = ['Blanca', 'Roja', 'Pintada', 'Negra', 'Baya'];
    const nombres = ['Flor', 'Nieve', 'Estelita', 'Arena', 'Menta', 'Lluvia'];

    const rows: NovillaVientre[] = [];
    for (let i = 0; i < n; i++) {
      const madre = pick(this.madres);
      rows.push({
        id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
        numero: String(200 + i),
        nombre: pick(nombres),
        fechaNac: randDate(start, today),
        fechaDestete: randDate(start, today),
        color: pick(colores),
        propietario: 'MC',
        pesoKg: Math.round(20 + Math.random() * 140),
        fincaId: pick(this.fincas).id,
        madreNumero: madre.numero,
        madreNombre: madre.nombre,
        detalles: Math.random() < 0.25 ? 'Sin observaciones' : '',
        procedencia: String(200 + i),
      });
    }
    return rows;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const nueva: NovillaVientre = {
      id: crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
      numero: String(v.numero ?? ''),
      nombre: String(v.nombre ?? ''),
      fechaNac: v.fechaNac ?? null,
      fechaDestete: v.fechaDestete ?? null,
      color: v.color ?? null,
      propietario: v.propietario ?? null,
      pesoKg: v.pesoKg ?? null,
      fincaId: v.fincaId ?? null,
      madreNumero: v.madreNumero ?? null,
      madreNombre: v.madreNombre ?? null,
      detalles: v.detalles ?? null,
      procedencia: v.procedencia ?? null,
    };

    this.dataSource.data = [nueva, ...this.dataSource.data];
    this.form.reset({ fincaId: null, madreNumero: null, pesoKg: null });
  }

  editar(row: NovillaVientre) {
    this.form.patchValue({
      numero: row.numero,
      nombre: row.nombre,
      fechaNac: row.fechaNac,
      fechaDestete: row.fechaDestete,
      color: row.color,
      propietario: row.propietario,
      pesoKg: row.pesoKg ?? null,
      fincaId: row.fincaId,
      madreNumero: row.madreNumero ?? null,
      madreNombre: row.madreNombre ?? null,
      detalles: row.detalles,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  eliminar(row: NovillaVientre) {
    const ok = confirm(`¿Eliminar novilla ${row.numero} - ${row.nombre}?`);
    if (!ok) return;
    this.dataSource.data = this.dataSource.data.filter((r) => r !== row);
  }
  private visible = new Set(this.displayedColumns);
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
          case 'fechaDestete':
            return r.fechaDestete ? this.formatDate(r.fechaDestete) : '';
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

  private timestamp() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}${mm}${dd}_${hh}${mi}`;
  }

  private formatDateTime(d: Date) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${this.formatDate(d)} ${hh}:${mi}`;
  }
  private formatDate(d: string | Date) {
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dt.getTime())) return '';
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  onConsultar() {}
  onNuevo() {}
}
