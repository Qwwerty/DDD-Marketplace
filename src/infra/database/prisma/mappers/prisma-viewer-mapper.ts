import { User as PrismaUser } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { Viewer } from '@/domain/marketplace/enterprise/entities/viewer'

export class PrismaViewerMapper {
  static toDomain(raw: PrismaUser): Viewer {
    return Viewer.create(
      {
        name: raw.name,
        phone: raw.phone,
        email: raw.email,
        password: raw.password,
      },
      new UniqueEntityId(raw.id),
    )
  }
}
