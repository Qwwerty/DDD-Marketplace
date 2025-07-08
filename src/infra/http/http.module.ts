import { Module } from '@nestjs/common'

import { CryptographyModule } from '../criptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { RegisterSellerController } from './controllers/register-seller.controller'
import { UpdateSellerController } from './controllers/update-seller.controller'

import { AuthenticateSellerUseCase } from '@/domain/marketplace/application/use-cases/authenticate-seller'
import { RegisterSellerUseCase } from '@/domain/marketplace/application/use-cases/register-seller'
import { UpdateSellerUseCase } from '@/domain/marketplace/application/use-cases/update-seller'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    RegisterSellerController,
    AuthenticateController,
    UpdateSellerController,
  ],
  providers: [
    RegisterSellerUseCase,
    AuthenticateSellerUseCase,
    UpdateSellerUseCase,
  ],
})
export class HttpModule {}
