import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TimelineComponent, TimelineEvent } from './timeline.component';
import { TimelineService } from 'src/app/core/services/timeline.service';

@Component({
  selector: 'app-timeline-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, TimelineComponent],
  template: `
    <h2 mat-dialog-title>Timeline</h2>
    <mat-dialog-content style="min-width:400px;">
      <ng-container *ngIf="loading">Cargando...</ng-container>
      <app-timeline *ngIf="!loading" [events]="events"></app-timeline>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="close()">Cerrar</button>
    </mat-dialog-actions>
  `,
})
export class TimelineDialogComponent implements OnInit {
  events: TimelineEvent[] = [];
  loading = true;

  constructor(
    private svc: TimelineService,
    private dialogRef: MatDialogRef<TimelineDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { animalId: string }
  ) {}

  ngOnInit(): void {
    this.svc.getTimeline(this.data.animalId).subscribe({
      next: (res) => {
        this.events = res.items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  close() {
    this.dialogRef.close();
  }
}
