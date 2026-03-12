import { Injectable } from '@angular/core';
import { Session } from '../models/session.model';

const SESSION_KEY = 'fincaapp_session';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  session?: Session;

  constructor() {
    this.restore();
  }

  setSession(session: Session): void {
    this.session = session;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  clear(): void {
    this.session = undefined;
    localStorage.removeItem(SESSION_KEY);
  }

  restore(): void {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      this.session = JSON.parse(stored) as Session;
    }
  }

  get tenantId(): string | null {
    return this.session?.tenantId ?? null;
  }

  get token(): string | null {
    return this.session?.token ?? null;
  }

  get isAuthenticated(): boolean {
    return !!this.session?.token;
  }
}
