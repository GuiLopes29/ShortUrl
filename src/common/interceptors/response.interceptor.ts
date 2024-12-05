import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ status: boolean; data: unknown[] } | object> {
    return next.handle().pipe(
      map((data) => {
        const request = context.switchToHttp().getRequest();
        const method = request.method;

        if (method === 'GET') {
          return {
            status: true,
            data: Array.isArray(data) ? data : [data],
          };
        } else if (method === 'POST' || method === 'PUT') {
          return data;
        }
      }),
    );
  }
}
