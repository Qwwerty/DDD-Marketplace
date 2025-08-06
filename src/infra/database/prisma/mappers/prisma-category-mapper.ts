import { Category as PrismaCategory } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Category } from '@/domain/marketplace/enterprise/entities/category'

export class PrismaCategoryMapper {
  static toDomain(raw: PrismaCategory): Category {
    return Category.create(
      {
        title: raw.title,
        slug: raw.slug,
      },
      new UniqueEntityId(raw.id),
    )
  }
}
