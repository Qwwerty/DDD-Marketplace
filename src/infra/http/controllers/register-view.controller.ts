import {
  BadRequestException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common'

import { ViewDetailsPresenter } from '../presenters/view-details-presenter'

import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { ResourceNotFoundError } from '@/domain/marketplace/application/use-cases/errors/resource-not-found-error'
import { RegisterViewUseCase } from '@/domain/marketplace/application/use-cases/register-view'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

@Controller('/products/:id/views')
export class RegisterViewController {
  constructor(private registerView: RegisterViewUseCase) {}

  @Post()
  async handle(
    @Param('id') productId: string,
    @CurrentUser() user: UserPayload,
  ) {
    const viewerId = user.sub

    const result = await this.registerView.execute({
      viewerId,
      productId,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message)
        case NotAllowedError:
          throw new ForbiddenException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    return ViewDetailsPresenter.toHTTP(result.value.view)
  }
}
