import { BadRequestException, Controller, Get, Query } from '@nestjs/common'
import { z } from 'zod'

import { ZodValidationPipe } from '../pipes/zod-validation-pipe'

import { ListAllProductsUseCase } from '@/domain/marketplace/application/use-cases/list-all-products'
import { ProductStatus } from '@/domain/marketplace/enterprise/entities/product'
import { Public } from '@/infra/auth/public'
import { ProductDetailsPresenter } from '@/infra/http/presenters/product-details-presenter'

const querySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['available', 'cancelled', 'sold']).optional(),
  page: z.coerce.number().default(1),
})

const queryValidationPipe = new ZodValidationPipe(querySchema)

type QuerySchema = z.infer<typeof querySchema>

@Controller('/products')
@Public()
export class ListAllProductsController {
  constructor(private listAll: ListAllProductsUseCase) {}

  @Get()
  async handle(@Query(queryValidationPipe) query: QuerySchema) {
    const { search, status, page } = query

    const result = await this.listAll.execute({
      search,
      page,
      status: ProductStatus[String(status)] ?? undefined,
    })

    if (result.isLeft()) {
      throw new BadRequestException()
    }

    return {
      products: result.value.products.map((product) =>
        ProductDetailsPresenter.toHTTP(product),
      ),
    }
  }
}
