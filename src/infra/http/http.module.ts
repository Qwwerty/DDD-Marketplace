import { Module } from '@nestjs/common'

import { RegisterSellerUseCase } from '@/domain/marketplace/application/use-cases/register-seller'
import { RegisterSellerController } from './controllers/register-seller.controller'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../criptography/cryptography.module'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [RegisterSellerController],
  providers: [RegisterSellerUseCase],
})
export class HttpModule {}
