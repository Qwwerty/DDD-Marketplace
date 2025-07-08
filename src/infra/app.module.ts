import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { envSchema } from './env/env'
import { EnvService } from './env/env.service'
import { HttpModule } from './http/http.module'
import { EnvModule } from './env/env.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
    EnvModule,
    HttpModule,
  ],
  providers: [EnvService],
})
export class AppModule {}
