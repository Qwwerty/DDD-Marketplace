import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
} from '@nestjs/common'

import { CountSellerAvailableUseCase } from '@/domain/marketplace/application/use-cases/count-seller-available-products'
import { ResourceNotFoundError } from '@/domain/marketplace/application/use-cases/errors/resource-not-found-error'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

@Controller('/sellers/metrics/products/available')
export class CountSellerAvailableProductsController {
  constructor(private countSellerAvailable: CountSellerAvailableUseCase) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    const sellerId = user.sub

    const result = await this.countSellerAvailable.execute({
      sellerId,
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
