import { faker } from '@faker-js/faker'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import {
  Category,
  CategoryProps,
} from '@/domain/marketplace/enterprise/entities/category'

export function makeCategory(
  override: Partial<CategoryProps> = {},
  id?: UniqueEntityId,
) {
  return Category.create(
    {
      title: faker.commerce.department(),
      slug: faker.commerce.department().toLowerCase(),
      ...override,
    },
    id,
  )
}
