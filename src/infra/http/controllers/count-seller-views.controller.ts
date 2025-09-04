import { BadRequestException, Controller, Get, NotFoundException } from "@nestjs/common";

import { CountSellerViewsUseCase } from "@/domain/marketplace/application/use-cases/count-seller-views";
import { ResourceNotFoundError } from "@/domain/marketplace/application/use-cases/errors/resource-not-found-error";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";

@Controller('/sellers/metrics/views')
export class CountSellerViewsController {
  constructor(private countSellerViews: CountSellerViewsUseCase) { }

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    const sellerId = user.sub

    const result = await this.countSellerViews.execute({
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