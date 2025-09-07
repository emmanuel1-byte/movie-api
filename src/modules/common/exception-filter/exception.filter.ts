import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from './types/error-response.type';
import { Prisma } from '../../../../generated/prisma';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // constructor(private readonly configService: ConfigService) {}
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const isProd = true;

    let status: number;
    let code: string;
    let message: string;
    let description: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as ErrorResponse;

      code = res.code || 'INVALID_INPUT';
      message = res.message;
      description = res.description || '';
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'SERVER_ERROR';
      message = isProd ? 'Internal server error' : exception.message;
      description = isProd ? '' : exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'SERVER_ERROR';
      message = 'Unknown error';
    }

    // Prisma known errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          code = 'DUPLICATE_ENTRY';
          message = 'Duplicate entry';
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          description = `A record with this ${exception.meta?.target} already exists.`;
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          code = 'RESOURCE_NOT_FOUND';
          message = 'Resource not found';
          description = 'The requested resource does not exist';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          code = 'INVALID_INPUT';
          message = 'Invalid input parameters';
          description = 'A related resource could not be found';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          code = 'SERVER_ERROR';
          message = 'Database error';
          description = exception.message ?? 'Unexpected database error';
          break;
      }
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
