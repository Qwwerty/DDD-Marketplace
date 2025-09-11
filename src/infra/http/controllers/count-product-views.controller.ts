import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
} from '@nestjs/common'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found'
import { CountProductViewsUseCase } from '@/domain/marketplace/application/use-cases/count-product-views'

@Controller('/products/:id/metrics/views')
export class CountProductViewsController {
  constructor(private countProductViews: CountProductViewsUseCase) {}

  @Get()
  async handle(@Param('id') productId: string) {
    const result = await this.countProductViews.execute({
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

    return result.value
  }
}
