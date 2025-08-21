import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'ui:fontZoom';
const MIN = 0.85;   // 85%
const MAX = 1.50;   // 150%
const STEP = 0.05;  // 5%

@Injectable({ providedIn: 'root' })
export class FontZoomService {
  private _zoom$ = new BehaviorSubject<number>(1);
  zoom$ = this._zoom$.asObservable();

  constructor() { this.load(); }

  private clamp(x: number) { return Math.min(MAX, Math.max(MIN, Number(x.toFixed(2)))); }
  private apply(v: number) {
    document.documentElement.style.setProperty('--font-zoom', String(v));
    localStorage.setItem(STORAGE_KEY, String(v));
    this._zoom$.next(v);
  }

  load()  { const s = Number(localStorage.getItem(STORAGE_KEY)); this.apply(isFinite(s)&&s>0?this.clamp(s):1); }
  set(v: number) { this.apply(this.clamp(v)); }
  inc() { this.set(this._zoom$.value + STEP); }
  dec() { this.set(this._zoom$.value - STEP); }
  reset() { this.set(1); }
}
