import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AnimalService, AnimalDto } from 'src/app/core/services/animal.service';
import { TimelineService, TimelineEvent, PagedResult } from 'src/app/core/services/timeline.service';
import { TimelineComponent } from 'src/app/shared/components/timeline/timeline.component';

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
    MatTooltipModule,
  ],
  templateUrl: './historico.component.html',
  styleUrls: ['./historico.component.css'],
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

  // tabla de información
  infoRows: Array<{ label: string; value: any }> = [];
  infoDisplayedColumns = ['label', 'value'];

  // paginación
  page = 1;
  pageSize = 50;
  pageSizeOptions = [10, 25, 50, 100];

  // ir a página
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
    // búsqueda local; se puede añadir debounce si hace falta
  }

  get filteredAnimals() {
    const q = (this.qSearch || '').trim().toLowerCase();
    if (!q) return this.animals;
    return this.animals.filter(
      (a) =>
        (a.numeroArete || '').toLowerCase().includes(q) ||
        (a.nombre || '').toLowerCase().includes(q)
    );
  }

  onSelect(id: string | null) {
    this.selectedId = id;
    this.selected = this.animals.find((a) => a.id === id) ?? null;

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

    this.page = 1;
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
    const target = this.jumpPage && this.jumpPage > 0 ? Math.floor(this.jumpPage) : 1;
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
