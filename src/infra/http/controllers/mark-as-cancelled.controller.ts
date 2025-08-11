import {
  BadRequestException,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'

import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found'
import { MarkSellAsCancelledUseCase } from '@/domain/marketplace/application/use-cases/mark-sell-as-cancelled'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

@Controller('/products/:id/cancelled')
export class MarkAsCancelledController {
  constructor(private markAsCancelled: MarkSellAsCancelledUseCase) {}

  @Patch()
  @HttpCode(200)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param('id') productId: string,
  ) {
    const ownerId = user.sub

    const result = await this.markAsCancelled.execute({
      ownerId,
      productId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }
  }
}
