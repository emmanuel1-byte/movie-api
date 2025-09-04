import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

export class ErrorResponse {
  status: number;
  code: string;
  message: string;
  description?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number;
    let code: string;
    let message: string;
    let description: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as ErrorResponse;

      code = res.code;
      message = res.message;
      description = res.description || '';
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'SERVER_ERROR';
      message = exception.stack || 'Internal server error';
      description = exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'SERVER_ERROR';
      message = 'Unknown error';
    }

    const errorResponse: ErrorResponse = {
      status,
      code,
      message,
      description,
    };

    response.status(status).json(errorResponse);
  }
}
