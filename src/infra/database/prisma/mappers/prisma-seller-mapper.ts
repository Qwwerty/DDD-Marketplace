import { User as PrismaUser, Prisma } from '@prisma/client'

import { Seller } from '@/domain/marketplace/enterprise/entities/seller'
import { UniqueEntityId } from '@/core/entities/unique-entidy-id'

export class PrismaSellerMapper {
  static toDomain(raw: PrismaUser): Seller {
    return Seller.create(
      {
        name: raw.name,
        phone: raw.phone,
        email: raw.email,
        password: raw.password,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(seller: Seller): Prisma.UserUncheckedCreateInput {
    return {
      id: seller.id.toString(),
      name: seller.name,
      phone: seller.phone,
      email: seller.email,
      password: seller.password,
      avatarId: seller.avatar?.attachmentId.toString() ?? null,
    }
  }
}
