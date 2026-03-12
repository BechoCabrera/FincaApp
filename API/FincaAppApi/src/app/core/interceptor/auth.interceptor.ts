import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from '../services/session.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private sessionService: SessionService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = this.sessionService.token;
    const tenantId = this.sessionService.tenantId;

    let headers = req.headers;

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (tenantId) {
      headers = headers.set('X-Tenant-Id', tenantId);
    }

    const authReq = req.clone({ headers });
    return next.handle(authReq);
  }
}
