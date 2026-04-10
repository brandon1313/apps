import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { ThrottlerException } from '@nestjs/throttler'
import { Request, Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter')

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()
    const label = `${request.method} ${request.url}`

    if (exception instanceof ThrottlerException) {
      this.logger.warn(`[ThrottlerException] 429 ${label}`)
      response.status(HttpStatus.TOO_MANY_REQUESTS).json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Demasiados intentos. Por favor espera unos minutos antes de volver a intentarlo.',
        error: 'Too Many Requests',
      })
      return
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus()
      const raw = exception.getResponse()
      const message =
        typeof raw === 'string'
          ? raw
          : typeof (raw as { message?: unknown }).message === 'string'
            ? (raw as { message: string }).message
            : Array.isArray((raw as { message?: unknown[] }).message)
              ? (raw as { message: string[] }).message[0]
              : exception.message

      if (status >= 500) {
        this.logger.error(`${label} → ${status}: ${message}`, exception.stack)
      } else {
        this.logger.warn(`${label} → ${status}: ${message}`)
      }

      response.status(status).json({
        statusCode: status,
        message,
        error: exception.name,
      })
      return
    }

    const message = exception instanceof Error ? exception.message : 'Unknown error'
    this.logger.error(`${label} → 500: ${message}`, exception instanceof Error ? exception.stack : undefined)

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    })
  }
}
