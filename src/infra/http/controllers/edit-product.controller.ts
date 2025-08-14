import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { z } from 'zod'

import { ZodValidationPipe } from '../pipes/zod-validation-pipe'
import { ProductDetailsPresenter } from '../presenters/product-details-presenter'

import { NotAllowedError } from '@/core/errors/errors/not-allowed-error'
import { EditProductUseCase } from '@/domain/marketplace/application/use-cases/edit-product'
import { ResourceNotFoundError } from '@/domain/marketplace/application/use-cases/errors/resource-not-found-error'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'

const editProductBodySchema = z.object({
  title: z.string().min(2),
  categoryId: z.string(),
  description: z.string(),
  priceInCents: z.number(),
  attachmentsIds: z.array(z.string()),
})

const bodyValidationPipe = new ZodValidationPipe(editProductBodySchema)

type EditProductBodySchema = z.infer<typeof editProductBodySchema>

@Controller('/products/:id')
export class EditProductController {
  constructor(private editProduct: EditProductUseCase) {}

  @Put()
  @HttpCode(200)
  async handle(
    @Body(bodyValidationPipe) body: EditProductBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('id') productId: string,
  ) {
    const { title, description, priceInCents, categoryId, attachmentsIds } =
      body

    const ownerId = user.sub

    const result = await this.editProduct.execute({
      productId,
      ownerId,
      title,
      description,
      priceInCents,
      categoryId,
      attachmentsIds,
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

    return {
      product: ProductDetailsPresenter.toHTTP(result.value.product),
    }
  }
}
