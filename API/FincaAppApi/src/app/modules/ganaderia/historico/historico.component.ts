import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { AnimalService, AnimalDto } from 'src/app/core/services/animal.service';
import { TimelineService, TimelineEvent, PagedResult } from 'src/app/core/services/timeline.service';
import { TimelineComponent } from 'src/app/shared/components/timeline/timeline.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatInputModule,
    TimelineComponent,
    MatTableModule,
    MatIconModule,
  ],
  template: `
    <mat-card>
      <mat-card-title>Histórico de animales</mat-card-title>
      <mat-card-content>
        <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">

          <!-- Search input to filter animals -->
          <mat-form-field appearance="outline" style="min-width:320px;">
            <mat-label>Buscar animal</mat-label>
            <input matInput placeholder="Buscar por número o nombre" [(ngModel)]="qSearch" (keyup)="onSearch()" />
          </mat-form-field>

          <!-- Select of animals (filtered) -->
          <mat-form-field appearance="outline" style="min-width:420px;">
            <mat-label>Seleccionar animal</mat-label>
            <mat-select [(value)]="selectedId" (selectionChange)="onSelect($event.value)">
              <mat-option *ngFor="let a of filteredAnimals" [value]="a.id">
                {{ a.numeroArete }} - {{ a.nombre || '(sin nombre)' }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button color="primary" (click)="refresh()" [disabled]="!selectedId">Consultar</button>

          <div style="display:flex; align-items:center; gap:8px; margin-left:8px;">
            <button mat-icon-button (click)="prevPage()" [disabled]="page <= 1 || loading || !selectedId" aria-label="Anterior">
              <mat-icon>chevron_left</mat-icon>
            </button>
            <div>Pagina {{ page }} / {{ totalPages }}</div>
            <button mat-icon-button (click)="nextPage()" [disabled]="page >= totalPages || loading || !selectedId" aria-label="Siguiente">
              <mat-icon>chevron_right</mat-icon>
            </button>

            <mat-form-field appearance="outline" style="width:120px; margin-left:12px;">
              <mat-label>Filas</mat-label>
              <mat-select [(value)]="pageSize" (selectionChange)="onPageSizeChange($event.value)">
                <mat-option *ngFor="let s of pageSizeOptions" [value]="s">{{ s }}</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- jump to page -->
            <mat-form-field appearance="outline" style="width:120px; margin-left:8px;">
              <mat-label>Ir a página</mat-label>
              <input matInput type="number" min="1" [(ngModel)]="jumpPage" (keyup.enter)="jumpToPage()" />
            </mat-form-field>
            <button mat-mini-fab color="primary" (click)="jumpToPage()" [disabled]="!selectedId || loading" aria-label="Ir">
              <mat-icon>keyboard_return</mat-icon>
            </button>
          </div>

          <mat-progress-spinner *ngIf="loading" diameter="24" mode="indeterminate"></mat-progress-spinner>
        </div>

        <div *ngIf="!selectedId && !loading">Seleccione un animal para ver su histórico.</div>

        <!-- Animal info table (styled like other mat-tables) -->
        <div *ngIf="selected && !loading" style="margin-bottom:12px;">
          <table mat-table [dataSource]="infoRows" class="mat-elevation-z1" style="width:100%;">
            <ng-container matColumnDef="label">
              <th mat-header-cell *matHeaderCellDef>Campo</th>
              <td mat-cell *matCellDef="let row">{{row.label}}</td>
            </ng-container>

            <ng-container matColumnDef="value">
              <th mat-header-cell *matHeaderCellDef>Valor</th>
              <td mat-cell *matCellDef="let row">{{row.value}}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="infoDisplayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: infoDisplayedColumns;"></tr>
          </table>
        </div>

        <div *ngIf="events?.length">
          <app-timeline [events]="events"></app-timeline>
        </div>
        <div *ngIf="selectedId && !loading && (!events || events.length === 0)">No hay eventos para el animal seleccionado.</div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [``],
})
export class HistoricoComponent implements OnInit {
  private animalSvc = inject(AnimalService);
  private timelineSvc = inject(TimelineService);

  animals: AnimalDto[] = [];
  qSearch = '';
  selectedId: string | null = null;
  selected: AnimalDto | null = null;
  events: TimelineEvent[] = [];
  loading = false;

  // info table
  infoRows: Array<{ label: string; value: any }> = [];
  infoDisplayedColumns = ['label', 'value'];

  // pagination
  page = 1;
  pageSize = 50;
  pageSizeOptions = [10, 25, 50, 100];

  // jump
  jumpPage: number | null = 1;

  totalCount: number | null = null;
  totalPages = 1;

  ngOnInit(): void {
    this.loadAnimals();
  }

  loadAnimals() {
    this.animalSvc.list().subscribe({
      next: (res) => (this.animals = res || []),
      error: () => (this.animals = []),
    });
  }

  onSearch() {
    // simple local search; could debounce if needed
  }

  get filteredAnimals() {
    const q = (this.qSearch || '').trim().toLowerCase();
    if (!q) return this.animals;
    return this.animals.filter(a => (a.numeroArete || '').toLowerCase().includes(q) || (a.nombre || '').toLowerCase().includes(q));
  }

  onSelect(id: string | null) {
    this.selectedId = id;
    this.selected = this.animals.find(a => a.id === id) ?? null;

    // populate infoRows similar to other tables layout
    if (this.selected) {
      this.infoRows = [
        { label: 'Número', value: this.selected.numeroArete },
        { label: 'Nombre', value: this.selected.nombre ?? '-' },
        { label: 'Finca', value: this.selected.fincaActualId ?? '-' },
        { label: 'Propietario', value: this.selected.propietario ?? '-' },
        { label: 'Estado', value: this.selected.estadoActualHembra ?? this.selected.estadoActualMacho ?? '-' },
        { label: 'Peso (kg)', value: this.selected.pesoKg ?? '-' },
      ];
    } else {
      this.infoRows = [];
    }

    this.page = 1; // reset page on new selection
    this.jumpPage = 1;
    if (id) this.fetchTimeline(id);
    else this.events = [];
  }

  refresh() {
    if (this.selectedId) this.fetchTimeline(this.selectedId);
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.page = 1;
    this.jumpPage = 1;
    if (this.selectedId) this.fetchTimeline(this.selectedId);
  }

  prevPage() {
    if (this.page <= 1) return;
    this.page--;
    this.jumpPage = this.page;
    if (this.selectedId) this.fetchTimeline(this.selectedId);
  }

  nextPage() {
    if (this.page >= this.totalPages) return;
    this.page++;
    this.jumpPage = this.page;
    if (this.selectedId) this.fetchTimeline(this.selectedId);
  }

  jumpToPage() {
    if (!this.selectedId) return;
    const target = (this.jumpPage && this.jumpPage > 0) ? Math.floor(this.jumpPage) : 1;
    if (target === this.page) return;
    this.page = Math.min(Math.max(1, target), this.totalPages);
    if (this.selectedId) this.fetchTimeline(this.selectedId);
  }

  fetchTimeline(id: string) {
    this.loading = true;
    this.timelineSvc.getTimeline(id, this.page, this.pageSize).subscribe({
      next: (res: PagedResult<TimelineEvent>) => {
        this.events = res.items || [];
        this.totalCount = res.total;
        this.totalPages = Math.max(1, Math.ceil((res.total || 0) / res.pageSize));
        this.loading = false;
        this.jumpPage = this.page;
      },
      error: () => {
        this.events = [];
        this.totalCount = null;
        this.totalPages = 1;
        this.loading = false;
      },
    });
  }
}
