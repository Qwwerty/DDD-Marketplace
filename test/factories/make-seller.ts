import { faker } from '@faker-js/faker'

import {
  Seller,
  SellerProps,
} from '@/domain/marketplace/enterprise/entities/seller'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

export function makeSeller(
  override: Partial<SellerProps> = {},
  id?: UniqueEntityId,
) {
  return Seller.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      password: faker.internet.password(),
      ...override,
    },
    id,
  )
}
