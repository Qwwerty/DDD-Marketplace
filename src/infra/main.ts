import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module'
import { EnvService } from './env/env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const envService = app.get(EnvService)
  const frontHost = envService.get('FRONT_HOST')
  const frontCookieSecret = envService.get('FRONT_COOKIE_SECRET')
  const port = envService.get('PORT')

  // @TODO - eneble cors only AWS.
  app.enableCors({
    origin: frontHost,
    credentials: true,
  })

  app.use(cookieParser(frontCookieSecret));

  await app.listen(port)
}
bootstrap()
