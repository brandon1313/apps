import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import * as cookieParser from 'cookie-parser'
import { json, urlencoded } from 'express'
import { AppModule } from './app.module'

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bodyParser: false })
  app.use(json({ limit: '5mb' }))
  app.use(urlencoded({ extended: true, limit: '5mb' }))
  const config = app.get(ConfigService)

  app.use(cookieParser())
  app.setGlobalPrefix('api')
  app.enableCors({
    origin: config.getOrThrow<string>('FRONTEND_URL'),
    credentials: true,
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000)
}

void bootstrap()
