import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

import { makeSeller } from './make-seller'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Category } from '@/domain/marketplace/enterprise/entities/category'
import {
  Product,
  ProductProps,
} from '@/domain/marketplace/enterprise/entities/product'
import { Seller } from '@/domain/marketplace/enterprise/entities/seller'
import { PrismaProductMapper } from '@/infra/database/prisma/mappers/prisma-product-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

export function makeProduct(
  override: Partial<ProductProps> = {},
  owner?: Seller,
  id?: UniqueEntityId,
) {
  return Product.create(
    {
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      priceInCents: Number(faker.commerce.price({ min: 1000, max: 100000 })),
      owner: owner || makeSeller(),
      category: Category.create({
        title: faker.commerce.department(),
        slug: faker.commerce.department().toLowerCase(),
      }),
      ...override,
    },
    id,
  )
}

@Injectable()
export class ProductFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaProduct(data: Partial<ProductProps> = {}): Promise<Product> {
    const product = makeProduct(data)

    await this.prisma.product.create({
      data: PrismaProductMapper.toPrisma(product),
    })

    return product
  }
}
