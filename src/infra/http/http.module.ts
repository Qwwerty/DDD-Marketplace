import { Module } from '@nestjs/common'

import { CryptographyModule } from '../criptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { EditProductController } from './controllers/edit-product.controller'
import { ListAllCategoriesController } from './controllers/list-all-categories.controller'
import { MarkAsSoldController } from './controllers/mark-as-sold.controller'
import { RegisterSellerController } from './controllers/register-seller.controller'
import { UpdateSellerController } from './controllers/update-seller.controller'
import { UploadAttachmentsController } from './controllers/upload-attachments.controller'
import { StorageModule } from '../storage/storage.module'
import { GetSellerProfileController } from './controllers/get-seller-profile.controller'
import { SellProductController } from './controllers/sell-product.controller'

import { AuthenticateSellerUseCase } from '@/domain/marketplace/application/use-cases/authenticate-seller'
import { EditProductUseCase } from '@/domain/marketplace/application/use-cases/edit-product'
import { GetSellerProfileUseCase } from '@/domain/marketplace/application/use-cases/get-seller-profile'
import { ListAllCategoriesUseCase } from '@/domain/marketplace/application/use-cases/list-all-categories'
import { MarkSellAsAvailableUseCase } from '@/domain/marketplace/application/use-cases/mark-sell-as-available'
import { MarkSellAsCancelledUseCase } from '@/domain/marketplace/application/use-cases/mark-sell-as-cancelled'
import { MarkSellAsSolddUseCase } from '@/domain/marketplace/application/use-cases/mark-sell-as-sold'
import { RegisterSellerUseCase } from '@/domain/marketplace/application/use-cases/register-seller'
import { SellProductUseCase } from '@/domain/marketplace/application/use-cases/sell-product'
import { UpdateSellerUseCase } from '@/domain/marketplace/application/use-cases/update-seller'
import { UploadAttachmentsUseCase } from '@/domain/marketplace/application/use-cases/upload-attachments'
import { MarkAsAvailableController } from '@/infra/http/controllers/mark-as-available.controller'
import { MarkAsCancelledController } from '@/infra/http/controllers/mark-as-cancelled.controller'

@Module({
  imports: [DatabaseModule, CryptographyModule, StorageModule],
  controllers: [
    RegisterSellerController,
    AuthenticateController,
    UpdateSellerController,
    UploadAttachmentsController,
    GetSellerProfileController,
    SellProductController,
    EditProductController,
    ListAllCategoriesController,
    MarkAsSoldController,
    MarkAsCancelledController,
    MarkAsAvailableController,
  ],
  providers: [
    RegisterSellerUseCase,
    AuthenticateSellerUseCase,
    UpdateSellerUseCase,
    UploadAttachmentsUseCase,
    GetSellerProfileUseCase,
    SellProductUseCase,
    EditProductUseCase,
    ListAllCategoriesUseCase,
    MarkSellAsSolddUseCase,
    MarkSellAsCancelledUseCase,
    MarkSellAsAvailableUseCase,
  ],
})
export class HttpModule {}
