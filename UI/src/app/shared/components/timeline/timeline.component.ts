import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

export interface TimelineEvent {
  eventType: string;
  date: string;
  description: string;
  source?: string | null;
  relatedId?: string | null;
}

@Component({
  selector: 'app-timeline',
  template: `
    <div class="timeline">
      <ng-container *ngFor="let e of events">
        <div class="timeline-item">
          <div class="timeline-item-date">{{ e.date | date: 'short' }}</div>
          <div class="timeline-item-body">
            <div class="timeline-item-type">{{ e.eventType }}</div>
            <div class="timeline-item-desc">{{ e.description }}</div>
            <div class="timeline-item-source" *ngIf="e.source">{{ e.source }}</div>
          </div>
        </div>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .timeline { display: flex; flex-direction: column; gap: 12px; }
      .timeline-item { display:flex; gap:12px; align-items:flex-start }
      .timeline-item-date { width:140px; color:rgba(0,0,0,0.6); font-size:12px }
      .timeline-item-body { background:#fff; border-radius:6px; padding:8px 12px; box-shadow:0 1px 3px rgba(0,0,0,0.04) }
      .timeline-item-type { font-weight:600; font-size:13px }
      .timeline-item-desc { font-size:13px }
    `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export class TimelineComponent implements OnInit {
  @Input() events: TimelineEvent[] = [];

  constructor() {}

  ngOnInit(): void {}
}
