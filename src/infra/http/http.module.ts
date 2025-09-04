import { Module } from '@nestjs/common'

import { CryptographyModule } from '../criptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { AuthenticateController } from './controllers/authenticate.controller'
import { CountSellerAvailableProductsController } from './controllers/count-seller-available-products.controller'
import { EditProductController } from './controllers/edit-product.controller'
import { ListAllCategoriesController } from './controllers/list-all-categories.controller'
import { ListAllProductsController } from './controllers/list-all-products.controller'
import { ListAllSellerProductsController } from './controllers/list-all-seller-products.controller'
import { MarkAsSoldController } from './controllers/mark-as-sold.controller'
import { RegisterSellerController } from './controllers/register-seller.controller'
import { UpdateSellerController } from './controllers/update-seller.controller'
import { UploadAttachmentsController } from './controllers/upload-attachments.controller'
import { StorageModule } from '../storage/storage.module'
import { GetSellerProfileController } from './controllers/get-seller-profile.controller'
import { SellProductController } from './controllers/sell-product.controller'
import { SignOutController } from './controllers/sign-out.controller'
import { CacheModule } from '../cache/cache.module'
import { CountSellerSoldProductsController } from './controllers/count-seller-sold-products.controller'
import { RegisterViewController } from './controllers/register-view.controller'

import { AuthenticateSellerUseCase } from '@/domain/marketplace/application/use-cases/authenticate-seller'
import { CountSellerAvailableUseCase } from '@/domain/marketplace/application/use-cases/count-seller-available-products'
import { CountSellerSoldUseCase } from '@/domain/marketplace/application/use-cases/count-seller-sold-products'
import { EditProductUseCase } from '@/domain/marketplace/application/use-cases/edit-product'
import { GetProductUseCase } from '@/domain/marketplace/application/use-cases/get-product'
import { GetSellerProfileUseCase } from '@/domain/marketplace/application/use-cases/get-seller-profile'
import { ListAllCategoriesUseCase } from '@/domain/marketplace/application/use-cases/list-all-categories'
import { ListAllProductsUseCase } from '@/domain/marketplace/application/use-cases/list-all-products'
import { ListAllSellerProductsUseCase } from '@/domain/marketplace/application/use-cases/list-all-seller-products'
import { MarkSellAsAvailableUseCase } from '@/domain/marketplace/application/use-cases/mark-sell-as-available'
import { MarkSellAsCancelledUseCase } from '@/domain/marketplace/application/use-cases/mark-sell-as-cancelled'
import { MarkSellAsSolddUseCase } from '@/domain/marketplace/application/use-cases/mark-sell-as-sold'
import { RegisterSellerUseCase } from '@/domain/marketplace/application/use-cases/register-seller'
import { RegisterViewUseCase } from '@/domain/marketplace/application/use-cases/register-view'
import { SellProductUseCase } from '@/domain/marketplace/application/use-cases/sell-product'
import { UpdateSellerUseCase } from '@/domain/marketplace/application/use-cases/update-seller'
import { UploadAttachmentsUseCase } from '@/domain/marketplace/application/use-cases/upload-attachments'
import { GetProductController } from '@/infra/http/controllers/get-product.controller'
import { MarkAsAvailableController } from '@/infra/http/controllers/mark-as-available.controller'
import { MarkAsCancelledController } from '@/infra/http/controllers/mark-as-cancelled.controller'
import { CountSellerViewsController } from './controllers/count-seller-views.controller'
import { CountSellerViewsUseCase } from '@/domain/marketplace/application/use-cases/count-seller-views'

@Module({
  imports: [DatabaseModule, CryptographyModule, StorageModule, CacheModule],
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
    ListAllSellerProductsController,
    ListAllProductsController,
    GetProductController,
    SignOutController,
    CountSellerSoldProductsController,
    CountSellerAvailableProductsController,
    RegisterViewController,
    CountSellerViewsController
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
    ListAllSellerProductsUseCase,
    ListAllProductsUseCase,
    GetProductUseCase,
    CountSellerSoldUseCase,
    CountSellerAvailableUseCase,
    RegisterViewUseCase,
    CountSellerViewsUseCase
  ],
})
export class HttpModule {}
