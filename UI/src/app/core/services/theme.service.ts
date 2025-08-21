import { Injectable, signal, effect } from '@angular/core';

export type ThemeMode  = 'light' | 'dark';
export type ThemeColor = 'base' | 'yellow' | 'green' | 'blue' | 'orange' | 'red' | 'violet';
export type ThemeDir   = 'ltr' | 'rtl';

export interface AppTheme {
  mode: ThemeMode;
  color: ThemeColor;
  direction: ThemeDir;
}

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  // Estado inicial (oscuro + base); cámbialo si quieres otro por defecto
  public theme = signal<AppTheme>({ mode: 'dark', color: 'base', direction: 'ltr' } as const);

  constructor() {
    this.loadTheme();                     // lee localStorage si existe
    effect(() => this.apply(this.theme())); // aplica al <html> cada vez que cambie
  }

  // API cómoda para la UI
  get isDark() { return this.theme().mode === 'dark'; }
  setMode(mode: ThemeMode)            { this.theme.update(t => ({ ...t, mode })); }
  setColor(color: ThemeColor)         { this.theme.update(t => ({ ...t, color })); }
  setDirection(dir: ThemeDir)         { this.theme.update(t => ({ ...t, direction: dir })); }

  // Escribir en el DOM + persistir
  private apply(t: AppTheme) {
    const root = document.documentElement;
    root.classList.toggle('dark', t.mode === 'dark'); // modo
    root.setAttribute('dir', t.direction);            // LTR/RTL
    root.setAttribute('data-theme', t.color);         // color → --primary
    localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
  }

  private loadTheme() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as Partial<AppTheme>;
      this.theme.set({
        mode: coerceMode(p.mode),
        color: coerceColor(p.color),
        direction: coerceDir(p.direction),
      });
    } catch { /* noop */ }
  }
}

// Helpers para asegurar valores válidos
function coerceMode(x: any): ThemeMode { return x === 'dark' ? 'dark' : 'light'; }
function coerceDir(x: any): ThemeDir   { return x === 'rtl' ? 'rtl' : 'ltr'; }
function coerceColor(x: any): ThemeColor {
  const ok: ThemeColor[] = ['base','yellow','green','blue','orange','red','violet'];
  return ok.includes(x) ? x : 'base';
}
