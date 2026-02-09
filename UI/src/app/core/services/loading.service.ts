import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, defer } from 'rxjs';
import { distinctUntilChanged, finalize, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private counter$ = new BehaviorSubject<number>(0);

  readonly loading$: Observable<boolean> = this.counter$.pipe(
    map((count) => count > 0),
    distinctUntilChanged(),
  );

  show(): void {
    this.counter$.next(this.counter$.value + 1);
  }

  hide(): void {
    const next = Math.max(0, this.counter$.value - 1);
    this.counter$.next(next);
  }

  reset(): void {
    this.counter$.next(0);
  }

  track<T>(source$: Observable<T>): Observable<T> {
    return defer(() => {
      this.show();
      return source$.pipe(finalize(() => this.hide()));
    });
  }
}
