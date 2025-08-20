import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'

import { ResourceNotFoundError } from '@/domain/marketplace/application/use-cases/errors/resource-not-found-error'
import { GetProductUseCase } from '@/domain/marketplace/application/use-cases/get-product'
import { ProductDetailsPresenter } from '@/infra/http/presenters/product-details-presenter'

@Controller('/products/:id')
export class GetProductController {
  constructor(private getProduct: GetProductUseCase) {}

  @Get()
  async handle(@Param('id') productId: string) {
    const result = await this.getProduct.execute({
      productId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return {
      product: ProductDetailsPresenter.toHTTP(result.value.product),
    }
  }
}
