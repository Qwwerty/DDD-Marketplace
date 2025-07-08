import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'

import { UniqueEntityId } from '@/core/entities/unique-entidy-id'
import {
  Seller,
  SellerProps,
} from '@/domain/marketplace/enterprise/entities/seller'
import { PrismaSellerMapper } from '@/infra/database/prisma/mappers/prisma-seller-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

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

@Injectable()
export class SellerFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaSeller(data: Partial<SellerProps> = {}): Promise<Seller> {
    const seller = makeSeller(data)

    await this.prisma.user.create({
      data: PrismaSellerMapper.toPrisma(seller),
    })

    return seller
  }
}
