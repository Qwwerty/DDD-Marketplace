import { BadRequestException, Controller, Get, NotFoundException } from '@nestjs/common'

import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { CountSellerSoldUseCase } from '@/domain/marketplace/application/use-cases/count-seller-sold-products';
import { UserPayload } from '@/infra/auth/jwt.strategy';
import { ResourceNotFoundError } from '@/domain/marketplace/application/use-cases/errors/resource-not-found-error';

@Controller('/sellers/metrics/products/sold')
export class CountSellerSoldProductsController {
  constructor(private countSellerSold: CountSellerSoldUseCase) { }

  @Get()
  async handle(@CurrentUser() user: UserPayload,) {
    const sellerId = user.sub

    const result = await this.countSellerSold.execute({
      sellerId
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
