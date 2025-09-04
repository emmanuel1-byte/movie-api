import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

export interface ResponseFormat<T> {
  success: boolean;
  message: string;
  data: T | null;
}
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<{ message: string; data: T }, ResponseFormat<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<{ message: string; data: T }>,
  ): Observable<ResponseFormat<T>> {
    return next.handle().pipe(
      map((response) => ({
        success: true,
        message: response.message,
        data: response.data,
      })),
    );
  }
}
