import { Module } from '@nestjs/common'

import { CryptographyModule } from '../criptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { RegisterSellerController } from './controllers/register-seller.controller'
import { UpdateSellerController } from './controllers/update-seller.controller'
import { UploadAttachmentsController } from './controllers/upload-attachments.controller'
import { StorageModule } from '../storage/storage.module'

import { AuthenticateSellerUseCase } from '@/domain/marketplace/application/use-cases/authenticate-seller'
import { RegisterSellerUseCase } from '@/domain/marketplace/application/use-cases/register-seller'
import { UpdateSellerUseCase } from '@/domain/marketplace/application/use-cases/update-seller'
import { UploadAttachmentsUseCase } from '@/domain/marketplace/application/use-cases/upload-attachments'

@Module({
  imports: [DatabaseModule, CryptographyModule, StorageModule],
  controllers: [
    RegisterSellerController,
    AuthenticateController,
    UpdateSellerController,
    UploadAttachmentsController,
  ],
  providers: [
    RegisterSellerUseCase,
    AuthenticateSellerUseCase,
    UpdateSellerUseCase,
    UploadAttachmentsUseCase,
  ],
})
export class HttpModule {}
