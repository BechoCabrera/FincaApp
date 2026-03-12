import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from '../services/session.service';

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  constructor(private sessionService: SessionService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const tenantId = this.sessionService.tenantId;

    if (!tenantId) {
      return next.handle(req);
    }

    const tenantReq = req.clone({
      setHeaders: {
        'X-Tenant-Id': tenantId,
      },
    });

    return next.handle(tenantReq);
  }
}
