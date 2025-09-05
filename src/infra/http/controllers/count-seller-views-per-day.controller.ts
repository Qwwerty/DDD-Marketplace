import { BadRequestException, Controller, Get, NotFoundException } from "@nestjs/common";

import { CountSellerViewsPerDayUseCase } from "@/domain/marketplace/application/use-cases/count-seller-views-per-day";
import { CurrentUser } from "@/infra/auth/current-user-decorator";
import { UserPayload } from "@/infra/auth/jwt.strategy";
import { ResourceNotFoundError } from "@/domain/marketplace/application/use-cases/errors/resource-not-found-error";
import { ViewPerDayPresenter } from "../presenters/view-per-day-presenter";

@Controller('/sellers/metrics/views/days')
export class CountSellerViewsPerDayController {
  constructor(private countSellerViews: CountSellerViewsPerDayUseCase) { }

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

    return {
      viewsPerDay: result.value.viewsPerDay.map(view => ViewPerDayPresenter.toHTTP(view))
    }
  }
}