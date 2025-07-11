import { Controller, Get, UnauthorizedException } from '@nestjs/common'

import { SellerDetailsPresenter } from '../presenters/seller-deteils-presenter'

import { GetSellerProfileUseCase } from '@/domain/marketplace/application/use-cases/get-seller-profile'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

@Controller('/sellers/me')
export class GetSellerProfileController {
  constructor(private getSellerProfile: GetSellerProfileUseCase) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    const userId = user.sub

    const result = await this.getSellerProfile.execute({ sellerId: userId })

    if (result.isLeft()) {
      throw new UnauthorizedException()
    }

    return {
      seller: SellerDetailsPresenter.toHTTP(result.value.seller),
    }
  }
}
