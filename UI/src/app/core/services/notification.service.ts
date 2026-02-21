import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly defaultDurationMs = 3000;

  constructor(private snack: MatSnackBar) {}

  success(message: string, durationMs = 2500) {
    this.open(message, durationMs);
  }

  error(message: string, durationMs = this.defaultDurationMs) {
    this.open(message, durationMs);
  }

  info(message: string, durationMs = this.defaultDurationMs) {
    this.open(message, durationMs);
  }

  private open(message: string, durationMs: number) {
    this.snack.open(message, 'OK', { duration: durationMs });
  }
}
