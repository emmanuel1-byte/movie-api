export class ErrorResponse {
  status: number;
  code: string;
  message: string;
  description?: string;
}

export type HttpErrorResponse =
  | string
  | {
      code?: string;
      message?: string | string[];
      description?: string;
    };
