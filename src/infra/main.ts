import { NestFactory } from '@nestjs/core'
import fastifyCookie from '@fastify/cookie'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { AppModule } from './app.module'
import { EnvService } from './env/env.service'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  const envService = app.get(EnvService)
  const frontHost = envService.get('FRONT_HOST')
  const frontCookieSecret = envService.get('FRONT_COOKIE_SECRET')
  const port = envService.get('PORT')

  // @TODO - eneble cors only AWS.
  app.enableCors({
    origin: frontHost,
    credentials: true,
  })

  await (app as any).register(fastifyCookie, {
    secret: frontCookieSecret,
  });

  await app.listen(port)
}
bootstrap()
