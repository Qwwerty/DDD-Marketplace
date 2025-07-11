import {
  User as PrismaUser,
  Attachment as PrismaAttachment,
} from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import { SellerDetails } from '@/domain/marketplace/enterprise/entities/value-objects/seller-details'

type PrismaSellerDetails = PrismaUser & {
  attachments: PrismaAttachment[]
}

export class PrismaSellerDetailsMapper {
  static toDomain(raw: PrismaSellerDetails): SellerDetails {
    return SellerDetails.create({
      userId: new UniqueEntityId(raw.id),
      name: raw.name,
      phone: raw.phone,
      email: raw.email,
      avatar: raw.avatarId
        ? {
            id: new UniqueEntityId(raw.attachments[0].id),
            path: raw.attachments[0].path,
          }
        : null,
    })
  }
}
