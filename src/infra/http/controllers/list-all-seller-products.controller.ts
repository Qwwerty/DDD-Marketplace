import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Query,
} from '@nestjs/common'
import { z } from 'zod'

import { ProductDetailsPresenter } from '../presenters/product-details-presenter'

import { ResourceNotFoundError } from '@/domain/marketplace/application/use-cases/errors/resource-not-found-error'
import { ListAllSellerProductsUseCase } from '@/domain/marketplace/application/use-cases/list-all-seller-products'
import { ProductStatus } from '@/domain/marketplace/enterprise/entities/product'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

const querySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['available', 'cancelled', 'sold']).optional(),
})

const queryValidationPipe = new ZodValidationPipe(querySchema)

type QuerySchema = z.infer<typeof querySchema>

@Controller('/products/me')
export class ListAllSellerProductsController {
  constructor(private listAll: ListAllSellerProductsUseCase) {}

  @Get()
  async handle(
    @Query(queryValidationPipe) query: QuerySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { search, status } = query
    const sellerId = user.sub

    const result = await this.listAll.execute({
      sellerId,
      search,
      status: ProductStatus[String(status)] ?? undefined,
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
      products: result.value.products.map((product) =>
        ProductDetailsPresenter.toHTTP(product),
      ),
    }
  }
}
