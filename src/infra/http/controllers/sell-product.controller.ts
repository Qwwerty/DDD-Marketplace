import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Post,
} from '@nestjs/common'
import { z } from 'zod'

import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { ProductDetailsPresenter } from '../presenters/product-details-presenter'

import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found'
import { SellProductUseCase } from '@/domain/marketplace/application/use-cases/sell-product'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

const sellProductBodySchema = z.object({
  title: z.string().min(2),
  categoryId: z.string(),
  description: z.string(),
  priceInCents: z.number(),
  attachmentsIds: z.array(z.string()),
})

const bodyValidationPipe = new ZodValidationPipe(sellProductBodySchema)

type SellProductBodySchema = z.infer<typeof sellProductBodySchema>

@Controller('/products')
export class SellProductController {
  constructor(private sellProduct: SellProductUseCase) {}

  @Post()
  @HttpCode(200)
  async execute(
    @Body(bodyValidationPipe) body: SellProductBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { title, categoryId, description, priceInCents, attachmentsIds } =
      body

    const ownerId = user.sub

    const result = await this.sellProduct.execute({
      ownerId,
      title,
      categoryId,
      description,
      priceInCents,
      attachmentsIds,
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
