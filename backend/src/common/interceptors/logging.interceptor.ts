import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common'
import { Request, Response } from 'express'
import { Observable, tap } from 'rxjs'

type AuthenticatedRequest = Request & { user?: { sub?: string } }

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
    const { method, url } = request
    const userId = request.user?.sub
    const startTime = Date.now()

    return next.handle().pipe(
      tap(() => {
        const status = context.switchToHttp().getResponse<Response>().statusCode
        const duration = Date.now() - startTime
        const uid = userId ? ` [uid:${userId.slice(0, 6)}]` : ''
        this.logger.log(`${method} ${url} → ${status} (${duration}ms)${uid}`)
      }),
    )
  }
}
