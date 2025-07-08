import { faker } from '@faker-js/faker'

import { makeSeller } from './make-seller'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Category } from '@/domain/marketplace/enterprise/entities/category'
import {
  Product,
  ProductProps,
} from '@/domain/marketplace/enterprise/entities/product'
import { Seller } from '@/domain/marketplace/enterprise/entities/seller'

export function makeProduct(
  override: Partial<ProductProps> = {},
  onwer?: Seller,
  id?: UniqueEntityId,
) {
  return Product.create(
    {
      title: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      priceInCents: Number(faker.commerce.price({ min: 1000, max: 100000 })),
      onwer: onwer || makeSeller(),
      category: Category.create({
        title: faker.commerce.department(),
        slug: faker.commerce.department().toLowerCase(),
      }),
      ...override,
    },
    id,
  )
}
