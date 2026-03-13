import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface TimelineEvent {
  eventType: string;
  date: string;
  description: string;
  source?: string | null;
  relatedId?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private readonly apiUrl = `${environment.apiUrl}/api/animals`;

  constructor(private http: HttpClient) {}

  getTimeline(animalId: string, page = 1, pageSize = 50): Observable<PagedResult<TimelineEvent>> {
    let params = new HttpParams().set('page', String(page)).set('pageSize', String(pageSize));
    return this.http.get<PagedResult<TimelineEvent>>(`${this.apiUrl}/${animalId}/timeline`, { params });
  }
}
